let update = async totalCount => {
  document.getElementById("test").innerHTML = "Total cookies blocked: " + totalCount;
};

// from https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

(async () => {
  let backgroundPage = await browser.runtime.getBackgroundPage();
  let totalCount = await backgroundPage.getTotalCount();
  await update(totalCount);
  document.getElementById("resetButton").addEventListener("click", async () => {
    await backgroundPage.resetCount();
    await update(0);
  });
  document.getElementById("downloadLog").addEventListener("click", async () => {
    let log = await backgroundPage.getCSVLines();
    download("trackingLog.txt", log);
  });
})();

