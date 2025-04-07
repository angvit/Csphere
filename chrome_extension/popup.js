alert("Popup script loaded!");
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("bookMarkBtn");
  console.log("Popup script loaded and running...");
  console.log("Button element: ", btn);
  if (btn) {
    btn.addEventListener("click", async () => {
      let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      console.log("popup.js running...");
      if (tab && tab.url) {
        console.log("Bookmarking URL: ", tab.url);
      }
    });
  } else {
    console.error("Button with ID 'bookMarkBtn' not found.");
  }
});
