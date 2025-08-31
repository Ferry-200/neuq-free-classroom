import { writeFile } from "fs/promises";
import { NEUQJWXTClient } from "./neuq-jwxt-client.js";
import path from "path";
import { BuildingId, CampusId, CycleTimeCycleType, RoomApplyTimeType } from "./type.js";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { DateTime } from 'luxon';
import { ImageGenerator } from "./image-generator.js";

function today(): string {
    return DateTime.now()
        .setZone('Asia/Shanghai')
        .toFormat('yyyy-MM-dd')
}

/**
 * 导出格式类型
 */
type ExportFormat = 'json' | 'image' | 'both';

/**
 * 命令行参数解析结果
 */
interface ParsedArgs {
    username: string;
    password: string;
    format: ExportFormat;
}

/**
 * 解析命令行参数
 * 支持的参数:
 * -u, --username: 用户名
 * -p, --password: 密码  
 * -f, --format: 导出格式 (json|image|both)，默认为 json
 */
function parseArgs(): ParsedArgs | undefined {
    const args = process.argv.slice(2);
    let username = "", password = "";
    let format: ExportFormat = 'json';

    for (let i = 0; i < args.length; i++) {
        if ((args[i] === "-u" || args[i] === "--username") && args[i + 1]) {
            username = args[i + 1];
        } else if ((args[i] === "-p" || args[i] === "--password") && args[i + 1]) {
            password = args[i + 1];
        } else if ((args[i] === "-f" || args[i] === "--format") && args[i + 1]) {
            const formatArg = args[i + 1].toLowerCase();
            if (formatArg === 'json' || formatArg === 'image' || formatArg === 'both') {
                format = formatArg as ExportFormat;
            } else {
                console.error(`无效的导出格式: ${formatArg}. 支持的格式: json, image, both`);
                return undefined;
            }
        }
    }

    if (username && password) {
        return { username, password, format };
    }

    return undefined;
}

/**
 * 从环境变量文件获取登录信息
 * 文件格式: .env.json
 * 内容示例: {"username": "学号", "password": "密码", "format": "json"}
 */
function getEnvJSON(): ParsedArgs | undefined {
    const envPath = ".env.json"
    if (existsSync(envPath)) {
        const envData = JSON.parse(readFileSync(envPath, "utf-8"));
        return {
            username: envData.username,
            password: envData.password,
            format: envData.format || 'json'
        };
    }

    return undefined
}

/**
 * 主函数 - 获取空教室数据并按指定格式导出
 * 支持导出为 JSON 文件和/或图片文件
 */
async function main() {
    const client = new NEUQJWXTClient()

    // 解析命令行参数或环境变量
    const config = parseArgs() ?? getEnvJSON()
    if (!config) {
        console.error("请通过命令行参数传入用户名密码: -u 用户名 -p 密码 [-f 格式]")
        console.error("或在 .env.json 文件中提供用户名密码信息")
        console.error("支持的导出格式: json (默认), image, both")
        return
    }

    const succeed = await client.login(config.username, config.password)
    if (!succeed) {
        console.error("登录失败，请检查用户名和密码")
        return
    }
    console.info("登录成功")

    const date = today()
    console.info(`开始获取 ${date} 的空教室数据，导出格式: ${config.format}`)

    // 创建输出目录
    if (!existsSync("free-classroom-data")) {
        mkdirSync("free-classroom-data")
    }

    // 循环获取12个时段的空教室数据
    for (let i = 1; i <= 12; i++) {
        console.info(`正在请求 ${date} 工学馆 第${i}节 的空教室数据`)
        
        try {
            const freeClassroom = await client.getFreeClassroom({
                "classroom.campus.id": CampusId.本部,
                "classroom.building.id": BuildingId.工学馆,
                "classroom.name": "",
                "cycleTime.cycleCount": 1,
                "cycleTime.cycleType": CycleTimeCycleType.天,
                "cycleTime.dateBegin": date,
                "cycleTime.dateEnd": date,
                roomApplyTimeType: RoomApplyTimeType.小节,
                timeBegin: i,
                timeEnd: i,
                pageSize: 500
            })
            
            console.info(`成功获取 ${date} 工学馆 第${i}节 空教室数据，共 ${freeClassroom.length} 间`)

            // 生成文件名（不包含扩展名）
            const baseFileName = `gxg-${date}-${i}-${i}`;

            // 根据配置的导出格式进行相应的文件导出
            if (config.format === 'json' || config.format === 'both') {
                // 导出 JSON 文件
                const jsonFilePath = path.join("free-classroom-data", `${baseFileName}.json`)
                await writeFile(
                    jsonFilePath,
                    JSON.stringify(freeClassroom, null, 2),
                    "utf-8"
                )
                console.info(`JSON 文件已保存: ${jsonFilePath}`)
            }

            if (config.format === 'image' || config.format === 'both') {
                // 导出图片文件
                const imageFilePath = path.join("free-classroom-data", `${baseFileName}.png`)
                await ImageGenerator.generateImage(freeClassroom, imageFilePath, date, i)
                console.info(`图片文件已保存: ${imageFilePath}`)
            }

        } catch (error) {
            console.error(`获取第${i}节空教室数据时发生错误:`, error)
            // 继续处理下一个时段，不中断整个流程
        }
    }

    console.info(`所有数据处理完成！导出格式: ${config.format}`)
}

// 启动主程序
try {
    main()
} catch (err) {
    console.error("程序执行过程中发生严重错误:", err)
    process.exit(1)
}
