import { BACKEND_URL, FRONTEND_URL, DEPLOYED } from "./config.dev.js";
const backend_url = DEPLOYED ? BACKEND_URL : "http://127.0.0.1:8000";
const frontend_url = DEPLOYED ? FRONTEND_URL : "http://localhost:3000";

// Check if the script is running in the correct context

// Helper function to wrap chrome.cookies.get in a Promise
function getCookieAsync(details) {
  return new Promise((resolve, reject) => {
    chrome.cookies.get(details, (cookie) => {
      // Check for chrome.runtime.lastError, which indicates problems
      // like missing host permissions.
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(cookie); // Resolve with the cookie object (which might be null)
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("bookMarkBtn");
  console.log("Popup script loaded and running...");
  console.log("Button element: ", btn);

  if (btn) {
    // Make the main event listener async
    btn.addEventListener("click", async () => {
      try {
        // Use try...catch for async operations
        let [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab || !tab.url) {
          console.warn("No active tab found or tab has no URL.");
          return;
        }

        console.log("Attempting to get cookie for URL:", frontend_url);
        const cookie = await getCookieAsync({
          url: frontend_url,
          name: "token",
        });
        console.log("Cookie lookup finished. Cookie object:", cookie);
        alert("Cookie lookup finished. Cookie object: " + cookie);

        if (cookie && cookie.value) {
          const cookieVal = cookie.value;
          console.log("Retrieved token from cookie:", cookieVal);
          console.log("Proceeding with fetch using token:", cookieVal);
          const endpoint = `${backend_url}/content/save`;
          const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${cookieVal}`,
            },
            body: JSON.stringify({
              url: tab.url,
              title: tab.title,
              source: "chrome_extension",
            }),
          });

          console.log("Raw response from server: ", response);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Response data from server: ", data);
          alert("Bookmark saved successfully!");
        } else {
          console.warn("Token cookie not found or has no value.");
          alert("Could not find authentication token. Please log in.");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        // Display a user-friendly error message if needed
        alert(`An error occurred: ${error.message}`);
      }
    });
  } else {
    console.error("Button with ID 'bookMarkBtn' not found.");
  }
});
