// document.addEventListener("DOMContentLoaded", () => {
//   const btn = document.getElementById("bookMarkBtn");
//   console.log("Popup script loaded and running...");
//   console.log("Button element: ", btn);

//   if (btn) {
//     btn.addEventListener("click", async () => {
//       let [tab] = await chrome.tabs.query({
//         active: true,
//         currentWindow: true,
//       });

//       console.log("popup.js running...");
//       if (tab && tab.url) {
//         console.log("Bookmarking URL: ", tab.url);

//         // Get the cookie named "token" for the backend's domain
//         chrome.cookies.get(
//           { url: "http://127.0.0.1:3000", name: "token" },
//           async function (cookie) {
//             if (cookie && cookie.value) {
//               console.log("Retrieved token from cookie:", cookie.value);

//               try {
//                 const res = await fetch("http://127.0.0.1:8000/content/save", {
//                   method: "POST",
//                   headers: {
//                     "Content-Type": "application/json",
//                     Accept: "application/json",
//                     Authorization: `Bearer ${cookie.value}`,
//                   },
//                   body: JSON.stringify({
//                     url: tab.url || "No URL",
//                     title: tab.title || "Untitled Page",
//                     source: "chrome_extension",
//                   }),
//                 });

//                 const data = await res.json();
//                 console.log("Response from server:", data);
//               } catch (error) {
//                 console.error("Error sending request:", error);
//               }
//             } else {
//               console.warn("Token cookie not found.");
//             }
//           }
//         );
//       }
//     });
//   } else {
//     console.error("Button with ID 'bookMarkBtn' not found.");
//   }
// });

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
        console.log("popup.js running...");

        if (!tab || !tab.url) {
          console.warn("No active tab found or tab has no URL.");
          return;
        }

        console.log(
          "Attempting to get cookie for URL:",
          "http://127.0.0.1:3000"
        );
        const cookie = await getCookieAsync({
          url: "http://localhost:3000",
          name: "token",
        });
        console.log("Cookie lookup finished. Cookie object:", cookie);
        alert("Cookie lookup finished. Cookie object: " + cookie);

        if (cookie && cookie.value) {
          const cookieVal = cookie.value;
          console.log("Retrieved token from cookie:", cookieVal);
          console.log("Proceeding with fetch using token:", cookieVal);

          const response = await fetch("http://127.0.0.1:8000/content/save", {
            method: "POST",
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
            // Handle HTTP errors (like 401, 403, 500)
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json(); // Or response.text() if not JSON
          console.log("Response data from server: ", data);
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
