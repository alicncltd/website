import fs from "fs";
import path from "path";

const __dirname = path.resolve();
const searchDir = path.join(__dirname, "node_modules/whatsapp-web.js/src");

function searchFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes("pairingcode")) {
      console.log(`Match in ${filePath}:${idx + 1} - "${line.trim()}"`);
    }
  });
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith(".js")) {
      searchFile(fullPath);
    }
  });
}

console.log("Searching in:", searchDir);
walk(searchDir);
