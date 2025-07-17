import { BACKEND_URL, DEPLOYED } from "./config.dev.js";
const backend_url = DEPLOYED ? BACKEND_URL : "http://127.0.0.1:8000";
const app = document.getElementById("app");

let selectedFolder = "default";

chrome.storage.local.get(["csphere_user_token"], (result) => {
  console.log("Value is", result.csphere_user_token);
  const token = result.csphere_user_token;
  if (token === null || token === undefined) {
    renderLoginInterface();
  } else {
    renderInterface();
  }
});

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

        <button class="logout-btn"> logout </button>
      </header>

      <div class="notes-container">
        <textarea
          id="notesTextarea"
          class="notes-textarea"
          placeholder="Add any notes here..."
        ></textarea>
        <div class="character-counter"><span id="charCount">0</span>/280</div>
      </div>

      <h3>Folders</h3>
      <div  class="user-folders"></div >

      <div class="action-bar">
        <button id="bookMarkBtn"   class="primary-button">
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("current data: ", data);
      if (data && data.detail.trim() === "Incorrect password") {
        console.log("here in incorrect password");
        insertMessage("Incorrect password", "error");
        return;
      }

      if (data && data.detail.trim() === "User not found") {
        console.log("User not found");
        insertMessage("User not found", "error");
        return;
      }

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
        url: `${backend_url}/auth/google`,
        interactive: true,
      },
      function (redirectUrl) {
        console.log("redriect url: ", redirectUrl);

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
            const token = data.token;

            if (!token) {
              console.error("Token missing from backend response");
              return;
            }

            chrome.storage.local.set({ csphere_user_token: token }, () => {
              console.log("Token stored successfully");
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

function getNotes() {
  const textarea = document.getElementById("notesTextarea");
  const content = textarea.value;

  return content;
}

function insertMessage(message, messageType) {
  const message_p = document.querySelector(".message-p");

  if (!message_p) return;

  message_p.textContent = message;
  message_p.style.color = messageType === "error" ? "red" : "green";

  setTimeout(() => {
    message_p.textContent = "";
    message_p.style.color = "";
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

async function getRecentFolders() {
  try {
    const API_URL = `${backend_url}/user/folder`;
    let token = await fetchToken();

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("data here for folders: ", data);
    const folders = data.data;

    const folderContainer = document.querySelector(".user-folders");
    folderContainer.innerHTML = `<select class="folder-grid"></select>`;

    const folderGrid = folderContainer.querySelector(".folder-grid");

    //Create a default one
    const folderOption = document.createElement("option");
    folderOption.className = "folder-card";
    folderOption.innerText = "none selected";
    folderOption.value = "default";
    folderOption.addEventListener("change", () => {
      selectedFolder = "default";
    });
    folderGrid.appendChild(folderOption);

    folders.forEach((folder) => {
      const folderOption = document.createElement("option");
      folderOption.className = "folder-card";
      folderOption.textContent = folder.folderName;
      folderOption.innerText = folder.folderName;
      folderOption.value = folder.folderId;

      folderGrid.appendChild(folderOption);
    });

    folderGrid.addEventListener("change", (event) => {
      const selectedValue = event.target.value;
      console.log("Selected folder:", selectedValue);
      selectedFolder = selectedValue;
    });
  } catch (error) {
    console.log(error);
  }
}

function logout() {
  chrome.storage.local.remove("csphere_user_token", function () {
    // Callback function (optional)
    // This will be executed once the item is removed.
    console.log("csphere_user_token removed from local storage");
  });
}

function setupBookmarkHandler() {
  const btn = document.getElementById("bookMarkBtn");
  const logoutBtn = document.getElementsByClassName("logout-btn")[0];
  console.log("Setting up bookmark handler. Button: ", btn);

  if (!btn) {
    console.error("Button with ID 'bookMarkBtn' not found.");
    return;
  }

  if (!logoutBtn) {
    console.error("logout button is not found");
  }

  logoutBtn.addEventListener("click", () => {
    try {
      logout();
      renderLoginInterface();
    } catch (error) {
      console.log("error ocucred in logout: ", error);
    }
  });

  btn.addEventListener("click", async () => {
    btn.disabled = true;

    try {
      let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab || !tab.url) {
        throw new Error("No active tab found or tab has no URL.");
      }

      const notes = getNotes();
      const endpoint = `${backend_url}/content/save`;
      let token = await fetchToken();
      console.log("auth token: ", token);

      let tabData = {
        url: tab.url,
        title: tab.title,
        notes: notes,
      };

      if (selectedFolder !== "default") {
        tabData.folder_id = selectedFolder;
      }
      console.log("console data: ", tabData);

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tabData),
      });

      const data = await response.json();

      if (data.status !== "Success") {
        throw new Error(`Server returned error status: ${data.status}`);
      }

      insertMessage("Bookmark successfully saved", "success");
    } catch (err) {
      console.error(err);
      alert("Error saving bookmark: " + err.message);
      insertMessage("Failed to save bookmark", "error");
    } finally {
      btn.disabled = false;
    }
  });
}
