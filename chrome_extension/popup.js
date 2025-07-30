import { BACKEND_URL, DEPLOYED } from "./config.dev.js";
const backend_url = DEPLOYED ? BACKEND_URL : "http://127.0.0.1:8000";
const app = document.getElementById("app");

let selectedFolder = "default";

chrome.storage.local.get(["csphere_user_token"], (result) => {
  const token = result.csphere_user_token;
  if (token === null || token === undefined) {
    renderLoginInterface();
  } else {
    renderInterface();
  }
});

/**
 * =========================
 * HTML Extraction Logic
 * =========================
 */
function extractHTMLFromPage() {
  return new Promise(async (resolve) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const listener = (request) => {
      if (request.action === "htmlExtracted") {
        chrome.runtime.onMessage.removeListener(listener);
        resolve({ html: request.html, tab });
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    // Inject content script directly (no content.js file needed)
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const htmlContent = document.documentElement.outerHTML;
        chrome.runtime.sendMessage({
          action: "htmlExtracted",
          html: htmlContent,
        });
      },
    });
  });
}

/**
 * =========================
 * Render Interfaces
 * =========================
 */
function renderInterface() {
  app.innerHTML = `
    <header>
      <a target="_blank" href="https://csphere-nly9.vercel.app/" rel="noopener noreferrer">
        <img class="logo" src="/images/Logo.png" />
      </a>
      <button class="logout-btn"> logout </button>
    </header>

    <div class="notes-container">
      <textarea id="notesTextarea" class="notes-textarea" placeholder="Add any notes here..."></textarea>
      <div class="character-counter"><span id="charCount">0</span>/280</div>
    </div>

    <h3>Folders</h3>
    <div class="user-folders"></div>

    <div class="action-bar">
      <button id="bookMarkBtn" class="primary-button">
        Bookmark Page
      </button>
    </div>
    <p class="message-p"></p>
  `;

  getRecentFolders();
  setupBookmarkHandler();
}

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

      <p class="message-p"></p>
    </div>
  `;

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const LOGIN_URL = `${backend_url}/api/chrome/login`;

      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data?.detail?.trim() === "Incorrect password") {
        insertMessage("Incorrect password", "error");
        return;
      }
      if (data?.detail?.trim() === "User not found") {
        insertMessage("User not found", "error");
        return;
      }
      if (data?.detail?.trim() === "sucessful login") {
        chrome.storage.local.set({ csphere_user_token: data.token }, () => {
          renderInterface();
        });
      }
    } catch (error) {
      console.log("error logging in: ", error);
    }
  });

  document.getElementById("googleAuthBtn").addEventListener("click", () => {
    chrome.identity.launchWebAuthFlow(
      {
        url: `${backend_url}/auth/google`,
        interactive: true,
      },
      function (redirectUrl) {
        if (chrome.runtime.lastError || !redirectUrl) {
          console.error("Google login failed", chrome.runtime.lastError);
          return;
        }

        const url = new URL(redirectUrl);
        const code = url.searchParams.get("code");
        if (!code) {
          console.error("Token missing from redirect");
          return;
        }

        fetch(`${backend_url}/auth/google/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.token) {
              console.error("Token missing from backend response");
              return;
            }
            chrome.storage.local.set({ csphere_user_token: data.token }, () => {
              renderInterface();
            });
          })
          .catch((err) => {
            console.error("Error fetching token from backend", err);
          });
      }
    );
  });
}

/**
 * =========================
 * Utility Functions
 * =========================
 */
function getNotes() {
  const textarea = document.getElementById("notesTextarea");
  return textarea.value;
}

function insertMessage(message, type) {
  const message_p = document.querySelector(".message-p");
  if (!message_p) return;
  message_p.textContent = message;
  message_p.style.color = type === "error" ? "red" : "green";

  setTimeout(() => {
    message_p.textContent = "";
    message_p.style.color = "";
  }, 5000);
}

function fetchToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["csphere_user_token"], (result) => {
      resolve(result.csphere_user_token);
    });
  });
}

async function getRecentFolders() {
  try {
    const API_URL = `${backend_url}/folder`;
    let token = await fetchToken();

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const folders = data.data;

    const folderContainer = document.querySelector(".user-folders");
    folderContainer.innerHTML = `<select class="folder-grid"></select>`;
    const folderGrid = folderContainer.querySelector(".folder-grid");

    // Default option
    const folderOption = document.createElement("option");
    folderOption.textContent = "none selected";
    folderOption.value = "default";
    folderGrid.appendChild(folderOption);

    folders.forEach((folder) => {
      const option = document.createElement("option");
      option.textContent = folder.folderName;
      option.value = folder.folderId;
      folderGrid.appendChild(option);
    });

    folderGrid.addEventListener("change", (event) => {
      selectedFolder = event.target.value;
    });
  } catch (error) {
    console.log(error);
  }
}

function logout() {
  chrome.storage.local.remove("csphere_user_token", () => {
    console.log("csphere_user_token removed from local storage");
  });
}

/**
 * =========================
 * Bookmark Handler
 * =========================
 */
function setupBookmarkHandler() {
  const btn = document.getElementById("bookMarkBtn");
  const logoutBtn = document.getElementsByClassName("logout-btn")[0];
  if (!btn) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;

    try {
      const { html, tab } = await extractHTMLFromPage();
      console.log("Extracted HTML:", html);

      const notes = getNotes();
      let token = await fetchToken();

      const tabData = {
        url: tab.url,
        title: tab.title,
        notes: notes,
        html: html,
      };

      if (selectedFolder !== "default") {
        tabData.folder_id = selectedFolder;
      }

      const endpoint = `${backend_url}/content/save`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tabData),
      });

      const data = await response.json();
      if (data.status !== "Success") {
        throw new Error(`Server returned error: ${data.status}`);
      }

      insertMessage("Bookmark successfully saved", "success");
    } catch (err) {
      console.error(err);
      insertMessage("Failed to save bookmark", "error");
    } finally {
      btn.disabled = false;
    }
  });

  logoutBtn.addEventListener("click", () => {
    logout();
    renderLoginInterface();
  });
}
