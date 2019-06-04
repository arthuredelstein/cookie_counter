(async () => {
  console.log("hi from popup");
  let backgroundWindow = await browser.runtime.getBackgroundPage();
  console.log(backgroundWindow);
  document.getElementById("test").innerHTML = "Total cookies blocked: " + backgroundWindow.totalCount;
})();

