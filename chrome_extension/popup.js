document.getElementById("bookMarkBtn").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    console.log("Bookmarking URL: ", tab.url);
  }
});
