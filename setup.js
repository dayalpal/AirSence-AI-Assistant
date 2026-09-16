/**
 * AirSense Setup Script
 * Run: node setup.js
 * Creates server/.env with your Gemini API key
 */
const fs   = require("fs");
const path = require("path");
const readline = require("readline");

const envPath = path.join(__dirname, "server", ".env");

if (fs.existsSync(envPath)) {
  const existing = fs.readFileSync(envPath, "utf8");
  const hasKey = existing.includes("GEMINI_API_KEY=") &&
                 !existing.includes("your_gemini_api_key_here");
  if (hasKey) {
    console.log("✅ server/.env already exists with an API key.\n");
    console.log("To update it, delete server/.env and run this script again.\n");
    process.exit(0);
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log("\n╔══════════════════════════════════════════╗");
console.log("║   AirSense — First-time Setup            ║");
console.log("╚══════════════════════════════════════════╝\n");
console.log("Get a FREE Gemini API key at:");
console.log("  → https://aistudio.google.com/app/apikey\n");

rl.question("Paste your Gemini API key (AIzaSy…): ", (apiKey) => {
  rl.close();
  const key = apiKey.trim();

  if (!key || key === "your_gemini_api_key_here" || !key.startsWith("AI")) {
    console.log("\n⚠️  Invalid key. Please run setup.js again with a real key.\n");
    process.exit(1);
  }

  const envContent = `GEMINI_API_KEY=${key}\nPORT=5000\n`;
  fs.writeFileSync(envPath, envContent, "utf8");

  console.log("\n✅ server/.env created!\n");
  console.log("Next steps:");
  console.log("  Terminal 1 → cd server && npm run dev");
  console.log("  Terminal 2 → cd client && npm run dev");
  console.log("  Open       → http://localhost:5173\n");
});
