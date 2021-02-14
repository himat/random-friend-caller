const puppeteer = require("puppeteer");
const fsProm = require("fs").promises;
const fs = require("fs");

import {
  allContactInfo,
  contactsAvailableByDatetimes,
  ContactInfoBasic,
  DaysOfWeek,
  timeRangeWithContactInfoToTimeRangeWithTZ,
} from "./contact_info";
import { isUTCTimeWithinTimeRange } from "./utils/datetime";
import { DateTime } from "luxon";

const cookiesPath = "./cookies.json";

async function openBrowserAndCallContact(url: string) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  console.log("started");

  const previousSessionExists = fs.existsSync(cookiesPath);
  if (previousSessionExists) {
    const cookiesString = await fsProm.readFile(cookiesPath);
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
  }

  await page.goto("https://messenger.com");

  if (!previousSessionExists) {
    console.log("waiting for nav");
    await page.waitForNavigation();
    const cookies = await page.cookies();
    await fsProm.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log("wrote cookies!");
  }
}

function getRandomContact(availableContacts: ContactInfoBasic[]) {
  // console.log(allContactInfo);

  const randomContactIdx = Math.floor(Math.random() * availableContacts.length);

  return availableContacts[randomContactIdx];
}

DateTime.now();

function findContactsAvailableNow() {
  const currDay = DaysOfWeek[new Date().getDay()];
  // const currTimeOfDay = new Date().getTime();
  const currTimeOfDay = DateTime.now().toUTC().toFormat("HH:mm");

  const currDayAvailabilities = contactsAvailableByDatetimes[currDay];
  console.log("curr day avails: ", currDayAvailabilities);

  const availableContacts: ContactInfoBasic[] = [];

  currDayAvailabilities.forEach((timeRangeWithContactInfo) => {
    if (
      isUTCTimeWithinTimeRange(
        currTimeOfDay,
        timeRangeWithContactInfoToTimeRangeWithTZ(timeRangeWithContactInfo)
      )
    )
      availableContacts.push(timeRangeWithContactInfo.contactInfo);
  });

  return availableContacts;
}

const availableContacts = findContactsAvailableNow();
const availableRandomContact = getRandomContact(availableContacts);
console.log("avails: ", availableContacts);
console.log("rand contact: ", availableRandomContact);
// openBrowserAndCallContact(availableRandomContact.url);
//
