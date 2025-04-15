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

        fetch("http://localhost:8000/content/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            url: tab.url,
            title: tab.title,
            source: "chrome_extension",
          }),
        }).then((response) => {
          console.log("Response from server: ", response);
        });
      }
    });
  } else {
    console.error("Button with ID 'bookMarkBtn' not found.");
  }
});
