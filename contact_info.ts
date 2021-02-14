import {
  TimeRange,
  TZName,
  TimeRangeWithTZ,
  DayOfWeek,
} from "./utils/datetime";

const { DateTime } = require("luxon");
const fs = require("fs");

const contactAvailabilitiesPath = "./availabilities.json";

type AvailabilityRanges = {
  sunday?: TimeRange[];
  monday?: TimeRange[];
  tuesday?: TimeRange[];
  wednesday?: TimeRange[];
  thursday?: TimeRange[];
  friday?: TimeRange[];
  saturday?: TimeRange[];
};

type ContactInfoWithDatetimeRanges = {
  url: string;
  timezone: TZName;
  availableDatetimeRanges: AvailabilityRanges;
};

export type ContactInfoBasic = {
  name: string;
  url: string;
};

type ContactInfoRawCollection = Record<string, ContactInfoWithDatetimeRanges>;

// You should make sure all your availableDatetimeRanges are disjoint (for a given person on a given day, the array of ranges should all be non-overlapping). If you don't do this then the choosing of a person won't be uniformly random since a person with overlapping ranges can show up more than once in the random picker.
const contactAvailabilities = JSON.parse(
  fs.readFileSync(contactAvailabilitiesPath)
);
const ContactInfoRaw: ContactInfoRawCollection = contactAvailabilities;

// I want to only get the people available at the current time
// availabilities = { sunday: [TimeRangeWithContactInfo, TimeRangeWithContactInfo, TimeRangeWithContactInfo, ...]}
type TimeRangeWithContactInfo = {
  timezone: TZName;
  timeRange: TimeRange;
  contactInfo: ContactInfoBasic;
};
export function timeRangeWithContactInfoToTimeRangeWithTZ(
  t: TimeRangeWithContactInfo
): TimeRangeWithTZ {
  return {
    timezone: t.timezone,
    timeRange: t.timeRange,
  };
}
type ContactInfoByAvailabilitiesCollection = Record<
  DayOfWeek,
  TimeRangeWithContactInfo[]
>;

function buildContactAvailabilitiesByDatetimes(
  contactInfoRaw: ContactInfoRawCollection
) {
  const contactsAvailableByDatetimes: ContactInfoByAvailabilitiesCollection = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };

  Object.entries(contactInfoRaw).forEach(([name, contactInfo]) => {
    const contactInfoBasic = { name, url: contactInfo.url };

    Object.entries(contactInfo.availableDatetimeRanges).forEach(
      ([dayOfWeek, timeRangeList]) => {
        timeRangeList.forEach((timeRange) => {
          const availableRange: TimeRangeWithContactInfo = {
            timezone: contactInfo.timezone,
            timeRange: timeRange,
            contactInfo: contactInfoBasic,
          };
          contactsAvailableByDatetimes[dayOfWeek].push(availableRange);
        });
      }
    );
  });

  return contactsAvailableByDatetimes;
}

export const allContactInfo = new Map(Object.entries(ContactInfoRaw));
export const contactsAvailableByDatetimes = buildContactAvailabilitiesByDatetimes(
  ContactInfoRaw
);
