import { startOfToday, endOfToday } from "date-fns";

export class ClockPointerHelper {
  /** 获取当前时刻的时针、分针和秒针的弧度位置 */
  public static getCurrentPointerRadians(): {
    hoursRadian: number;
    minutesRadian: number;
    secondsRadian: number;
  } {
    const now = new Date();
    const dayStart = startOfToday();
    const dayEnd = endOfToday();
    const todayPassedRatio =
      (now.valueOf() - dayStart.valueOf()) /
      (dayEnd.valueOf() - dayStart.valueOf());

    const hoursPerDay = 24; // 每天有这么多小时
    const minutesPerDay = 24 * 60; // 每天有这么多分钟

    const hoursTotalCircles = 2; // 时针每天转 2 圈
    const hoursTotalRadians = hoursTotalCircles * 2 * Math.PI; // 时针每天转这么多弧度
    const minutesTotalCircles = hoursPerDay; // 分针每天转这么多圈
    const minutesTotalRadians = minutesTotalCircles * 2 * Math.PI; // 分针每天转这么多弧度
    const secondsTotalCircles = minutesPerDay; // 秒针每天转这么多圈
    const secondsTotalRadians = secondsTotalCircles * 2 * Math.PI; // 秒针每天总共转这么多弧度

    const currentHoursRadian = hoursTotalRadians * todayPassedRatio; // 当前时针位置（用弧度表示）
    const currentMinutesRadian = minutesTotalRadians * todayPassedRatio; // 当前分针位置（用弧度表示）
    const currentSecondsRadian = secondsTotalRadians * todayPassedRatio; // 当前秒针位置（用弧度表示）

    return {
      hoursRadian: currentHoursRadian,
      minutesRadian: currentMinutesRadian,
      secondsRadian: currentSecondsRadian,
    };
  }
}