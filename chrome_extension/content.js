// content.js
// content.js
const htmlContent = document.documentElement.outerHTML;

chrome.runtime.sendMessage({
  action: "htmlExtracted",
  html: htmlContent,
});
