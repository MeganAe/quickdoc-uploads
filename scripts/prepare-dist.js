import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const publicDir = path.join(rootDir, "public");

// 1. Compile the real client-side React SPA with Vite
console.log("⚡ Compiling standalone client SPA bundle for mobile & desktop...");
execSync("npx vite build --config vite.config.spa.ts", {
  cwd: rootDir,
  stdio: "inherit",
});

// 2. Ensure all public assets (logos, icons, XML) are in dist
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
  console.log("✓ Copied public assets to dist/");
}

console.log("✓ Standalone client application successfully prepared in dist/!");
