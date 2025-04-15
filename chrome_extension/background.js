console.log("Background script loaded and running...");
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed and background script running...");
});
