const STATE_COOKIES_BLOCKED_TRACKER = 536870912;

var totalCount = null;
(async () => {
  let stored = await browser.storage.local.get("totalCount");
  totalCount = stored["totalCount"] || 0;
})();

loadedTabMap = new Map();

let countBlockedTrackingCookies = function (log) {
  let blockedCount = 0;
  for (let [origin, actions] of Object.entries(log)) {
    for (let [state, blocking] of actions) {
      if (blocking && state === STATE_COOKIES_BLOCKED_TRACKER) {
        blockedCount++;
      }
    }
  }
  return blockedCount;
};

let accumulate = async (count) => {
  totalCount += count;
  await browser.storage.local.set({"totalCount": count});
};

let countBlockedTrackingCookiesInTab = async tabId => {
  let log = await browser.contentBlocking.getContentBlockingLog(tabId);
  return countBlockedTrackingCookies(log);
};

let tallyCookiesBlockedInTab = async tabId => {
  let count = await countBlockedTrackingCookiesInTab(tabId);
  await accumulate(count);
};

browser.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  await accumulate(loadedTabMap.get(tabId));
  loadedTabMap.set(tabId, 0);
});

let navigationEndedHandler = async details => {
  if (details.parentFrameId == -1) {
    let count = await countBlockedTrackingCookiesInTab(details.tabId);
    loadedTabMap.set(details.tabId, count);
  }
};

browser.webNavigation.onCompleted.addListener(navigationEndedHandler);
browser.webNavigation.onDOMContentLoaded.addListener(navigationEndedHandler);
browser.webNavigation.onErrorOccurred.addListener(navigationEndedHandler);

browser.webNavigation.onBeforeNavigate.addListener(async details => {
  if (details.parentFrameId === -1) {
    await tallyCookiesBlockedInTab(details.tabId);
  }
});
