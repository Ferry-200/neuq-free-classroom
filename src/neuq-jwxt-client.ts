import axios, { AxiosInstance } from "axios"
import { wrapper as cookieSupportWrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"
import { FreeClassroomRequestOption } from "./type.js"
import crypto from "crypto-js"
import * as cheerio from "cheerio"
import { setTimeout as wait } from "timers/promises"

/**
 * 一个支持 cookie 的 axios client，
 * baseUrl 已经设置成 `https://jwxt.neuq.edu.cn/eams`
 */
export class NEUQJWXTClient {
    client: AxiosInstance

    constructor() {
        const jar = new CookieJar()
        const axiosClient = axios.create({ jar })
        axiosClient.defaults.baseURL = "https://jwxt.neuq.edu.cn/eams"

        this.client = cookieSupportWrapper(axiosClient)
    }

    private async avoidTooFastWarning() {
        console.info("wait for 3s to avoid warning for too fast clicking")
        await wait(3000)
    }

    private async getLoginPageHTML() {
        const res = await this.client.get("/loginExt.action")
        return res.data as string
    }

    private async getSaltFromLoginPage() {
        const html = await this.getLoginPageHTML()
        const $ = cheerio.load(html)
        const scripts = $("script").toArray()

        let salt: string | undefined

        for (const script of scripts) {
            const scriptText = $(script).html() || ""
            const match = scriptText.match(/CryptoJS\.SHA1\('([^']+)-' \+ form\[.*?password.*?\]\.value\)/)
            if (match) {
                salt = match[1]
                break
            }
        }

        console.info("salt:", salt)

        return salt
    }

    /**
     * @param username 学号
     * @param password 密码
     * @returns 是否登陆成功。根据重定向最后是否是 homeExt.action 来判断。
     */
    async login(username: string, password: string): Promise<boolean> {
        const salt = await this.getSaltFromLoginPage()

        await this.avoidTooFastWarning()

        const params = new URLSearchParams({
            username: username,
            password: crypto.SHA1(`${salt}-${password}`).toString()
        })

        const res = await this.client.post("/loginExt.action", params.toString())

        return res.request.res.responseUrl.includes("homeExt.action")
    }

    private async getDataFromFreeClassroomHTML(html: string) {
        const $ = cheerio.load(html);

        // 2. 提取数据行
        const rows: string[][] = [];

        $("table.gridtable tbody tr").each((_, tr) => {
            const row: string[] = [];
            $(tr)
                .find("td")
                .each((_, td) => {
                    row.push($(td).text().trim().replace(/\s+/g, " "));
                });
            rows.push(row);
        });

        return rows.map((line) => line[1])
    }

    async getFreeClassroom(options: FreeClassroomRequestOption) {
        await this.avoidTooFastWarning()

        const params = new URLSearchParams()
        const entries = Object.entries(options)
        for (const pair of entries) {
            params.append(pair[0], pair[1].toString())
        }

        const res = await this.client.post(
            "/classroom/apply/free!search.action",
            params.toString()
        )

        return this.getDataFromFreeClassroomHTML(res.data as string)
    }
}
