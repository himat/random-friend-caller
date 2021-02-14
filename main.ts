const puppeteer = require("puppeteer");
const fsProm = require("fs").promises;
const fs = require("fs");

import {
  allContactInfo,
  contactsAvailableByDatetimes,
  ContactInfoBasic,
  timeRangeWithContactInfoToTimeRangeWithTZ,
} from "./contact_info";
import { DaysOfWeek, isUTCTimeWithinTimeRange } from "./utils/datetime";
import { DateTime } from "luxon";

const cookiesPath = "./cookies.json";

const END_BUFFER_MINS = 30;

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

  await page.goto(url, {
    waitUntil: "networkidle2",
  });

  if (!previousSessionExists) {
    console.log("waiting for nav");
    await page.waitForNavigation();
    const cookies = await page.cookies();
    await fsProm.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log("wrote cookies!");
  }

  console.log("calling");
  const startVideoCallBtn =
    "body > div:nth-child(1) > div > div:nth-child(1) > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.buofh1pr.dp1hu0rb > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div > div > div > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.ni8dbmo4.stjgntxs > div.bafdgad4.tkr6xdv7 > div > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.pfnyh3mw.d2edcug0.hpfvmrgz.p8fzw8mz.pcp91wgn.iuny7tx3.ipjc6fyt > div > div:nth-child(2) > span > div";
  await page.click(startVideoCallBtn);
}

function getRandomContact(availableContacts: ContactInfoBasic[]) {
  // console.log(allContactInfo);

  const randomContactIdx = Math.floor(Math.random() * availableContacts.length);

  return availableContacts[randomContactIdx];
}

DateTime.now();

function findContactsAvailableNow() {
  // const currTimeOfDay = new Date().getTime();
  const currTimeOfDay = DateTime.now().toUTC().toFormat("HH:mm");

  const currDay = DaysOfWeek[new Date().getDay()];
  const currDayAvailabilities = contactsAvailableByDatetimes[currDay];
  console.log("curr day avails: ", currDayAvailabilities);

  const availableContacts: ContactInfoBasic[] = [];

  currDayAvailabilities.forEach((timeRangeWithContactInfo) => {
    if (
      isUTCTimeWithinTimeRange(
        currTimeOfDay,
        timeRangeWithContactInfoToTimeRangeWithTZ(timeRangeWithContactInfo),
        END_BUFFER_MINS
      )
    )
      availableContacts.push(timeRangeWithContactInfo.contactInfo);
  });

  return availableContacts;
}

const availableContacts = findContactsAvailableNow();
const availableRandomContact = getRandomContact(availableContacts);
console.log("avails: ", availableContacts);
console.log("Chosen rand contact: ", availableRandomContact);
// openBrowserAndCallContact(availableRandomContact.url);
//
