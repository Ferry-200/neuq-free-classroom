/** 教室类型 */
export const ClassroomTypeId = {
  普通教室: 1,
  多媒体大教室: 2,
  多媒体小教室: 3,
  语音室: 4,
  不排课教室: 5,
  录播教室: 6,
  机房: 7,
  活动教室: 8,
  体育教学场地: 9,
  智慧教室: 10,
  实验室: 11,
  研讨室: 12,
  多功能: 21,
} as const;

type ClassroomTypeId = typeof ClassroomTypeId[keyof typeof ClassroomTypeId];

/** 校区 */
export const CampusId = {
  本部: 1,
  北戴河: 2,
  新校区: 3,
} as const;

type CampusId = typeof CampusId[keyof typeof CampusId];

/** 教学楼 */
export const BuildingId = {
  工学馆: 1,
  基础楼: 2,
  综合实验楼: 3,
  地质楼: 4,
  管理楼: 5,
  大学会馆: 6,
  旧实验楼: 7,
  人文楼: 8,
  科技楼: 9,
} as const;

type BuildingId = typeof BuildingId[keyof typeof BuildingId];

/** 时间周期类型 */
export const CycleTimeCycleType = {
  天: 1,
  周: 2,
} as const;

type CycleTimeCycleType = typeof CycleTimeCycleType[keyof typeof CycleTimeCycleType];

/** 使用时间类型 */
export const RoomApplyTimeType = {
  小节: 0,
  时间: 1,
} as const;

type RoomApplyTimeType = typeof RoomApplyTimeType[keyof typeof RoomApplyTimeType];


export type FreeClassroomRequestOption = {
    "classroom.type.id"?: ClassroomTypeId,
    "classroom.campus.id"?: CampusId,
    "classroom.building.id"?: BuildingId,
    seats?: number,
    "classroom.name": string,
    /** 常用 1 */
    "cycleTime.cycleCount": number,
    /** 常用“天” */
    "cycleTime.cycleType": CycleTimeCycleType,
    /** yyyy-mm-dd */
    "cycleTime.dateBegin": string,
    /** yyyy-mm-dd */
    "cycleTime.dateEnd": string,
    /** 常用“教室使用小节” */
    roomApplyTimeType: RoomApplyTimeType,
    /** 第几节开始 */
    timeBegin: number,
    /** 第几节结束 */
    timeEnd: number,
    /** >= 1 */
    pageNo?: number,
    /** <= 1000 */
    pageSize?: number
}