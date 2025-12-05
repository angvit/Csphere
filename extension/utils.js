// polyfilling browser to ensure it exists in Chrome MV3

if (typeof browser == "undefined") {
    window.browser = chrome;
}

/*
cross-browser replacement for chrome.scripting.executeScript 
*/

function executeContentScript(tabId, file) {
    // firefox's mv2 path
    if (browser.tabs && browser.tabs.executeScript) {
        return browser.tabs.executeScript({
            tabId,
            files: [file]
        })
    }

    // chrome's mv3 path
    if (chrome.scripting && chrome.scripting.executeScript) {
        return chrome.scripting.executeScript({
            target: { tabId },
            files: [file]
        })
    }

    console.error("No comptabile executeScript API found");
}

/*
getting active tab across browsers
*/

async function getActiveTab() {
    if (browser.tabs && browser.tabs.query) {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        return tab;
    }

    if (chrome.tabs && chrome.tabs.query) {
        return new Promise(resolve => {
            chrome.tabs.query({ active: true }, tabs => resolve(tabs[0]));
        });
    }

    console.error("No comptabile getActiveTab API found");
    return null;
}

// exposing the functions globally for all scripts

window.utils = {
    executeContentScript,
    getActiveTab
};