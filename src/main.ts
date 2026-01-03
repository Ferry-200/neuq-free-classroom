import { writeFile } from "fs/promises";
import { NEUQJWXTClient } from "./neuq-jwxt-client.js";
import path from "path";
import { BuildingId, CampusId, CycleTimeCycleType, RoomApplyTimeType } from "./type.js";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { DateTime } from 'luxon'

interface NetworkError extends Error {
    code?: string
}

const NETWORK_ERROR_CODES = ["ETIMEDOUT", "ENETUNREACH", "ECONNRESET"] as const

function isNetworkError(error: Error): boolean {
    const errorCode = (error as NetworkError).code
    return errorCode !== undefined && NETWORK_ERROR_CODES.includes(errorCode as "ETIMEDOUT" | "ENETUNREACH" | "ECONNRESET")
}

function handleNetworkError(error: unknown, context: string): never {
    console.error(`\n❌ Error ${context}`)
    
    if (error instanceof Error) {
        // Log full error details for debugging
        console.error("Error name:", error.name)
        console.error("Error message:", error.message)
        console.error("Error code:", (error as NetworkError).code)
        console.error("Error stack:", error.stack)
        
        if (isNetworkError(error)) {
            console.error("\n🔌 This is a network connectivity error.")
            console.error("Possible causes:")
            console.error("  - The NEUQ JWXT server (jwxt.neuq.edu.cn) is unreachable")
            console.error("  - Network connectivity issues from GitHub Actions")
            console.error("  - Server firewall blocking external connections")
        } else if (error.message.includes("timeout")) {
            console.error("\n⏱️  Request timed out after 60 seconds")
        }
    } else {
        console.error("Unknown error type:", typeof error)
        console.error("Error value:", error)
    }
    
    // Re-throw to ensure the process exits with error code
    throw error
}

function today(): string {
    return DateTime.now()
        .setZone('Asia/Shanghai')
        .toFormat('yyyy-MM-dd')
}

function parseArgs(): { username: string, password: string } | undefined {
    const args = process.argv.slice(2);
    let username = "", password = "";

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "-u" && args[i + 1]) {
            username = args[i + 1];
        } else if (args[i] === "-p" && args[i + 1]) {
            password = args[i + 1];
        }
    }

    if (username && password) {
        return { username, password };
    }

    return undefined;
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

    const user = parseArgs() ?? getEnvJSON()
    if (!user) {
        console.error("pass -u username -p password or provide them in `.env.json`")
        return
    }

    let succeed = false
    try {
        succeed = await client.login(user.username, user.password)
    } catch (error) {
        handleNetworkError(error, "during login")
        // handleNetworkError now throws, so no return needed
    }

    if (!succeed) {
        console.error("Authentication failed: Invalid username or password")
        return
    }
    console.info("login succeed")

    const date = today()

    if (!existsSync("free-classroom-data")) {
        mkdirSync("free-classroom-data")
    }

    for (let i = 1; i <= 12; i++) {
        console.info(`requesting ${date} gxg ${i}-${i} free classroom`)
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
            console.info(`got ${date} gxg ${i}-${i} free classroom`)

            const filePath = path.join("free-classroom-data", `gxg-${date}-${i}-${i}.json`)
            await writeFile(
                filePath,
                JSON.stringify(freeClassroom),
                "utf-8"
            )
            console.info(`path: ${filePath}`)
        } catch (error) {
            console.error(`\n❌ Failed to fetch classroom period ${i} after all retries`)
            handleNetworkError(error, `while fetching ${date} gxg ${i}-${i}`)
            // This will now throw and fail the workflow
        }
    }
}

try {
    await main()  // Add await here
} catch (err) {
    console.error("Fatal error:", err)
    throw err  // Re-throw to ensure non-zero exit code
}
