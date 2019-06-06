let update = async totalCount => {
  document.getElementById("test").innerHTML = "Total cookies blocked: " + totalCount;
};

(async () => {
  let backgroundWindow = await browser.runtime.getBackgroundPage();
  let totalCount = await backgroundWindow.getTotalCount();
  await update(totalCount);
  document.getElementById("resetButton").addEventListener("click", async () => {
    await backgroundWindow.resetCount();
    await update(0);
  });
})();

