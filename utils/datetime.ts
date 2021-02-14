import { DateTime } from "luxon";
const { zones } = require("tzdata");

export const DaysOfWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
export type DayOfWeek = typeof DaysOfWeek[number];

const tzNames = Object.entries(zones)
  .filter(([_zoneName, v]) => Array.isArray(v))
  .map(([zoneName, _v]) => zoneName)
  .filter((tz) => DateTime.local().setZone(tz).isValid);
export type TZName = typeof tzNames[number];

export type TimeOfDay = string; // Ex. 17:00
export type TimeRange = [TimeOfDay, TimeOfDay];
export type TimeRangeWithTZ = {
  timezone: TZName;
  timeRange: [TimeOfDay, TimeOfDay];
};
function getTimeOfDayForCurrentDay(timeOfDay: TimeOfDay, tz: TZName) {
  if (timeOfDay.indexOf(":") === -1) {
    throw new Error("invalid timeOfDay");
  }
  const [hour, minute] = timeOfDay.split(":");

  const dt = DateTime.fromObject({ hour, minute, zone: tz });
  return dt;
}

/**
 * Returns if the des time is within the time range
 * Passing an end buffer means that it checks if the des time is within (end range minus endBuffer minute)
 *   So that you won't call someone if they're only free for less than 10 more minutes, you can pass an endBuffer of 10
 */
export function isUTCTimeWithinTimeRange(
  desUTCTime: TimeOfDay,
  timeRange: TimeRangeWithTZ,
  endBufferMins: number = 0
): boolean {
  const desTime = getTimeOfDayForCurrentDay(desUTCTime, "UTC");
  const startingTime = getTimeOfDayForCurrentDay(
    timeRange.timeRange[0],
    timeRange.timezone
  );
  const endingTime = getTimeOfDayForCurrentDay(
    timeRange.timeRange[1],
    timeRange.timezone
  );

  const endingTimeBufferAdjusted = endingTime.minus({ minutes: endBufferMins });

  return startingTime <= desTime && desTime < endingTimeBufferAdjusted;
}
