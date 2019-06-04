window.console.log("hi from background script")
browser.webNavigation.onCompleted.addListener(details => {
  console.log(details);
});
