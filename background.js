// see https://searchfox.org/mozilla-central/rev/7088fc958db5935eba24b413b1f16d6ab7bd13ea/uriloader/base/nsIWebProgressListener.idl#259
const STATE = {
  0x00001000: "BLOCKED_TRACKING_CONTENT",
  0x00002000: "LOADED_TRACKING_CONTENT",
  0x00000040: "BLOCKED_FINGERPRINTING_CONTENT",
  0x00000400: "LOADED_FINGERPRINTING_CONTENT",
  0x00000800: "BLOCKED_CRYPTOMINING_CONTENT",
  0x00200000: "LOADED_CRYPTOMINING_CONTENT",
  0x00004000: "BLOCKED_UNSAFE_CONTENT",
  0x00008000: "COOKIES_LOADED",
  0x00040000: "COOKIES_LOADED_TRACKER",
  0x00080000: "COOKIES_LOADED_SOCIAL_TRACKER",
  0x10000000: "COOKIES_BLOCKED_BY_PERMISSION",
  0x20000000: "COOKIES_BLOCKED_TRACKER",
  0x40000000: "COOKIES_BLOCKED_ALL",
  0x80000000: "COOKIES_PARTITIONED_FOREIGN",
  0x00000080: "COOKIES_BLOCKED_FOREIGN",
  0x00010000: "BLOCKED_SOCIALTRACKING_CONTENT",
  0x00020000: "LOADED_SOCIALTRACKING_CONTENT",
};

browser.contentBlocking.useBasicList();

// see also examples at
// https://searchfox.org/mozilla-central/rev/7088fc958db5935eba24b413b1f16d6ab7bd13ea/toolkit/components/antitracking/test/browser/browser_subResources.js
let countBlockedTrackingCookies = function (log) {
  let blockedCount = 0;
  for (let [origin, actions] of Object.entries(JSON.parse(log))) {
    for (let [state, blocking] of actions) {
      if (blocking && STATE[state] === "COOKIES_BLOCKED_TRACKER") {
        blockedCount++;
      }
    }
  }
  return blockedCount;
};

let blockingLogToCSV = function (time, tabAddress, log) {
  let csvLines = [];
  for (let [origin, actions] of Object.entries(JSON.parse(log))) {
    for (let [state, blocking, num] of actions) {
      if (blocking) {
        let tag = STATE[state] || `undefined_${state}`;
        let timeISO = time.toISOString();
        csvLines.push(`${timeISO}\t${tabAddress}\t${origin}\t${tag}\n`);
      }
    }
  }
  return csvLines.join("");
};

var getTotalCount = async () => {
  let stored = await browser.storage.local.get("totalCount");
  return stored["totalCount"] || 0;
};

var getCSVLines = async () => {
  let stored = await browser.storage.local.get("csv");
  return stored["csv"] || "";
};

let accumulate = async ({count, csv}) => {
  let totalCount = await getTotalCount();
  totalCount += count;
  await browser.storage.local.set({"totalCount": totalCount});
  let csvLines = await getCSVLines();
  csvLines += csv;
  await browser.storage.local.set({"csv": csvLines});
};

var resetCount = async () => {
  await browser.storage.local.set({"totalCount": 0});
  await browser.storage.local.set({"csv": ""});
};

let trackingDataForTab = async tabId => {
  let url = (await browser.tabs.get(tabId)).url
  let log = await browser.contentBlocking.getContentBlockingLog(tabId);
  return {
    count: countBlockedTrackingCookies(log),
    csv: blockingLogToCSV(new Date(), url, log)
  };
};

let storeTrackingDataForTab = async tabId => {
  let {count, csv} = await trackingDataForTab(tabId);
  await accumulate({count, csv});
};

let navigationEndedHandler = async details => {
  if (details.parentFrameId === -1) {
    await storeTrackingDataForTab(details.tabId);
  }
};

browser.webNavigation.onCompleted.addListener(navigationEndedHandler);
