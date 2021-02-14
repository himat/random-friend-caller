import {TimeRange, TimeRangeWithTZ, TimeOfDay, TZName} from "../contact_info";
import {DateTime} from "luxon";

function getTimeOfDayForCurrentDay(timeOfDay: TimeOfDay, tz: TZName) {
    if (timeOfDay.indexOf(":") === -1
    ) {
        throw new Error("invalid timeOfDay");
    }
    const [hour, minute] = timeOfDay.split(":");

    const dt = DateTime.fromObject({hour, minute, zone: tz});
    return dt;
}

export function isUTCTimeWithinTimeRange(desUTCTime: TimeOfDay, timeRange: TimeRangeWithTZ) {
    const desTime = getTimeOfDayForCurrentDay(desUTCTime, "UTC");
    const startingTime = getTimeOfDayForCurrentDay(timeRange.timeRange[0], timeRange.timezone);
    const endingTime = getTimeOfDayForCurrentDay(timeRange.timeRange[1], timeRange.timezone);

    return (startingTime <= desTime) && (desTime < endingTime);
}
