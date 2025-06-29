import { writeFile } from "fs/promises";
import { NEUQJWXTClient } from "./neuq-jwxt-client.js";
import path from "path";
import { BuildingId, CampusId, CycleTimeCycleType, RoomApplyTimeType } from "./type.js";
import { existsSync, readFileSync } from "fs";

function today() {
    const date = new Date()
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function getEnvJSON(): { username: string, password: string } | undefined {
    const envPath = ".env.json"
    if (existsSync(envPath)) {
        return JSON.parse(readFileSync(envPath, "utf-8"))
    }

    return undefined
}

async function main() {
    const client = new NEUQJWXTClient()

    const envJSON = getEnvJSON()
    if (!envJSON) {
        console.error(".env.json DOESN'T in root dir")
    }

    const succeed = await client.login(envJSON.username, envJSON.password)
    if (!succeed) {
        console.error("failed to login")
        return
    }
    console.info("login succeed")

    const date = today()

    for (let i = 1; i <= 1; i++) {
        console.info(`get ${today} gxg ${i}-${i} free classroom`)
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

        await writeFile(
            path.join("free-classroom-data", `gxg-${date}-${i}-${i}.json`),
            JSON.stringify(freeClassroom),
            "utf-8"
        )
    }
}

try {
    main()
} catch (err) {
    console.error(err)
}