# NEUQ Free Classroom

[![Update Free Classroom Data](https://github.com/Ferry-200/neuq-free-classroom/actions/workflows/update-free-classroom.yml/badge.svg)](https://github.com/Ferry-200/neuq-free-classroom/actions/workflows/update-free-classroom.yml)

直接通过请求接口（**不是模拟点击**）获取工学馆等教学楼空教室的 Node 命令行工具。

一分钟内即可获取一天内十二节的空教室信息
（为了避免触发反爬限制，登陆前等待 3s，每次请求空教室接口前等待 3s，
总共是 3 + 3 * 12 = 39s）。

[**技术方案**](技术方案.md)

## 使用方法

1. clone this repo
2. `npm i`
3. `npm run build`
4. `node build/src/main.js -u username -p password`

该工具会把空教室表保存在 free-classroom-data/gxg-yyyy-mm-dd-lesson1-lesson2.json 中。

现在默认获取工学馆的空教室，修改部分代码后也可以获取到别的教学楼的。
```ts
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
```
如上，可以修改 src/main.ts line 64, line 76 里的 
`"classroom.building.id": BuildingId.工学馆, ` 一行。
BuildingId 中存有其他教学楼的 id，改成对应的即可。
```ts
/** 教学楼 */
export const BuildingId = {
  工学馆: 1, 基础楼: 2, 综合实验楼: 3, 地质楼: 4,
  管理楼: 5, 大学会馆: 6, 旧实验楼: 7, 人文楼: 8, 科技楼: 9,
} as const;
```

## 项目用途声明

本人为东北大学秦皇岛分校在读学生，开发本项目仅出于以下目的：

1. **学习目的**：提升对 Web 开发、自动化爬取、数据解析等技术的理解与实践能力；
2. **校园便利**：辅助快速获取教务系统中公开的空教室信息，以便更方便地安排自习与学习；
3. **非商业、非营利**：本项目**不会用于任何商业活动**，亦不会传播或销售由教务系统获取的数据；
4. **不用于违法用途**：承诺本项目及本人行为**不用于任何违法、违规、损害学校或他人利益的用途**；
5. **数据公开性**：本项目仅访问已授权用户在正常登录状态下可见的数据，不涉及攻击、绕过、干扰教务系统安全机制等行为。

如本项目或其技术手段存在对学校系统造成不适当影响的风险，本人将主动终止相关操作，并积极配合学校说明与整改。

本项目不代表东北大学秦皇岛分校官方立场，所有责任由本人承担。

黄宝焱
2025 年 6 月
