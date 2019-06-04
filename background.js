window.console.log("hi from background script")

const STATE_COOKIES_BLOCKED_TRACKER = 536870912;

var totalCount = 0;

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

browser.webNavigation.onBeforeNavigate.addListener(async details => {
  if (details.parentFrameId === -1) {
    let log = await browser.contentBlocking.getContentBlockingLog(details.tabId);
    let count = countBlockedTrackingCookies(log);
    totalCount += count;
    console.log(count);
  }
});
