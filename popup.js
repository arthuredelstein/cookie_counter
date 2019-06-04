(async () => {
  let backgroundWindow = await browser.runtime.getBackgroundPage();
  let totalCount = await backgroundWindow.getTotalCount();
  document.getElementById("test").innerHTML = "Total cookies blocked: " + totalCount;
})();

