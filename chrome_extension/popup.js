import { BACKEND_URL, DEPLOYED } from "./config.dev.js";
const backend_url = DEPLOYED ? BACKEND_URL : "http://127.0.0.1:8000";
const app = document.getElementById("app");

chrome.storage.local.get(["csphere_user_token"], (result) => {
  console.log("Value is", result.csphere_user_token);
  const token = result.csphere_user_token;
  if (token === null || token === undefined) {
    renderLoginInterface();
  } else {
    renderInterface();
  }
});

function renderLoginInterface() {
  app.innerHTML = `
    <header>
      <img class="logo" src="/images/Logo.png" />
    </header>
    <div class="login-message">
      <p>Please log in to use CSphere Bookmarks</p>

      <form id="loginForm" class="login-form">
        <input type="text" id="username" placeholder="Username" required />
        <input type="password" id="password" placeholder="Password" required />
        <button type="submit" class="primary-button">Log In</button>
      </form>

      <div class="divider">OR</div>

      <button id="googleAuthBtn" class="google-button">
        <img src="/images/google.svg" class="google-icon" />
        Continue with Google
      </button>
    </div>
  `;

  // Local login form submit handler
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // TODO: Replace with your own login request

    try {
      const LOGIN_URL = `${backend_url}/api/chrome/login`;

      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (data) {
        chrome.storage.local.set({ csphere_user_token: data.token }, () => {
          console.log("Value stored");
        });

        renderInterface();
      }
    } catch (error) {
      console.log("error loggin in: ", error);
    }
  });

  // Google login handler
  document.getElementById("googleAuthBtn").addEventListener("click", () => {
    chrome.identity.launchWebAuthFlow(
      {
        url: "https://your-auth-server.com/oauth/google",
        interactive: true,
      },
      function (redirectUrl) {
        if (chrome.runtime.lastError || !redirectUrl) {
          console.error("Google login failed", chrome.runtime.lastError);
          return;
        }

        // Extract token from redirectUrl if needed and store
        chrome.storage.local.set({ userToken: "google_token" }, () => {
          renderBookmarkInterface();
        });
      }
    );
  });
}

function renderInterface() {
  app.innerHTML = `
    <header>
        <a
          target="_blank"
          href="https://csphere-nly9.vercel.app/"
          rel="noopener noreferrer"
        >
          <img class="logo" src="/images/Logo.png" />
        </a>
      </header>
      <textarea id="emailTextarea" class="EmailTextarea"></textarea>

      <div class="notes-container">
        <textarea
          id="notesTextarea"
          class="notes-textarea"
          placeholder="Add any notes here..."
        ></textarea>
        <div class="character-counter"><span id="charCount">0</span>/280</div>
      </div>

      <div class="user-folders"></div>

      <div class="action-bar">
        <button id="bookMarkBtn" class="primary-button">
          <i class="fas fa-bookmark"></i>
          Bookmark Page
        </button>
      </div>
      <p class="message-p"></p>
  `;

  setupBookmarkHandler();
}

function getUserEmail() {
  return new Promise((resolve) => {
    chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
      resolve(userInfo.email);
    });
  });
}

function getNotes() {
  const textarea = document.getElementById("notesTextarea");
  const content = textarea.value;

  return content;
}

function insertMessage(message, messageType) {
  // const parent = document.querySelector("app");
  const message_p = document.querySelector(".message-p");
  const submit_button = document.querySelector(".action-bar");

  submit_button.disabled = true;
  if (!message_p) return;

  message_p.textContent = message;
  message_p.style.color = messageType === "error" ? "red" : "green";

  setTimeout(() => {
    message_p.textContent = "";
    message_p.style.color = "";
    submit_button.disabled = false;
  }, 5000);
}

function fetchToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["csphere_user_token"], (result) => {
      console.log("Fetched token from storage:", result.csphere_user_token);
      resolve(result.csphere_user_token);
    });
  });
}

function setupBookmarkHandler() {
  const btn = document.getElementById("bookMarkBtn");
  console.log("Setting up bookmark handler. Button: ", btn);

  if (!btn) {
    console.error("Button with ID 'bookMarkBtn' not found.");
    return;
  }

  btn.addEventListener("click", async () => {
    try {
      let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab || !tab.url) {
        console.warn("No active tab found or tab has no URL.");
        return;
      }
      let userEmail = await getUserEmail();

      console.log("current user email: ", userEmail);

      if (userEmail) {
        try {
          const notes = getNotes();
          const endpoint = `${backend_url}/content/save`;
          let token = await fetchToken();
          console.log("auth token: ", token);

          const response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url: tab.url,
              title: tab.title,
              source: "chrome_extension",
              email: userEmail,
              notes: notes,
            }),
          });

          const data = await response.json();

          if (data.status !== "Success") {
            throw new Error(`Server returned error status: ${data.status}`);
          }

          insertMessage("Bookmark successfully saved", "success");
        } catch (err) {
          alert("Error saving bookmark: " + err);
          insertMessage("Failed to save bookmark", "error");
        }
      } else {
        alert("Could not find authentication token. Please log in.");
      }
    } catch (error) {
      insertMessage("An error occurred, please try again later", "error");
      alert(`An error occurred: ${error.message}`);
    }
  });
}

// chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
//   userEmail = userInfo.email;
// });

// function getNotes() {
//   const textarea = document.getElementById("notesTextarea");
//   const content = textarea.value;

//   return content;
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const btn = document.getElementById("bookMarkBtn");
//   console.log("Popup script loaded and running...");
//   console.log("Button element: ", btn);

//   if (btn) {
//     // Make the main event listener async
//     btn.addEventListener("click", async () => {
//       try {
//         // Use try...catch for async operations
//         let [tab] = await chrome.tabs.query({
//           active: true,
//           currentWindow: true,
//         });

//         if (!tab || !tab.url) {
//           console.warn("No active tab found or tab has no URL.");
//           return;
//         }

//         if (userEmail) {
//           try {
//             const notes = getNotes();
//             const endpoint = `${backend_url}/content/save`;
//             console.log("saving to encpoint: ", endpoint);

//             const response = await fetch(endpoint, {
//               method: "POST",
//               credentials: "include",
//               headers: {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//               },
//               body: JSON.stringify({
//                 url: tab.url,
//                 title: tab.title,
//                 source: "chrome_extension",
//                 email: userEmail,
//                 notes: notes,
//               }),
//             });

//             // Wait for JSON parsing
//             const data = await response.json();

//             console.log("Raw response from server:", response);
//             console.log("Parsed response data:", data);

//             // Check if server returned a successful status
//             if (data.status !== "Success") {
//               throw new Error(`Server returned error status: ${data.status}`);
//             }

//             insertMessage("Bookmark successfully saved", "success");
//           } catch (err) {
//             alert("Error saving bookmark:" + err);
//             insertMessage("Failed to save bookmark", "error");
//           }
//         } else {
//           console.warn("Token cookie not found or has no value.");
//           alert("Could not find authentication token. Please log in.");
//         }
//       } catch (error) {
//         insertMessage("An error occured, please try again later", "error");
//         // Display a user-friendly error message if needed
//         alert(`An error occurred: ${error.message}`);
//       }
//     });
//   } else {
//     console.error("Button with ID 'bookMarkBtn' not found.");
//   }
// });
