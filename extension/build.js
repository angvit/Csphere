const fs = require("fs");
const path = require("path");

const browser = process.argv[2];

if (!browser) {
    console.error("Usage: node build.js <browser>");
    process.exit(1);
}

const manifestSrc = path.join(__dirname, "manifests", `manifest.${browser}.json`);
const manifestDest = path.join(__dirname, "manifest.json");

if (!fs.existsSync(manifestSrc)) {
    console.error(`Manifest file for ${browser} not found`);
    process.exit(1);
}

fs.copyFileSync(manifestSrc, manifestDest);

