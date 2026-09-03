import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputPublicDir = path.join(rootDir, ".output", "public");
const distDir = path.join(rootDir, "dist");

// 1. Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 2. Copy .output/public files to dist if available
if (fs.existsSync(outputPublicDir)) {
  fs.cpSync(outputPublicDir, distDir, { recursive: true });
  console.log("✓ Copied .output/public assets to dist/");
}
const publicDir = path.join(rootDir, "public");
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

// 3. Find any generated CSS and JS files
const assetsDir = path.join(distDir, "assets");
let cssFile = "";
let jsFile = "";

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const cssMatch = files.find((f) => f.endsWith(".css"));
  const jsMatch = files.find((f) => f.startsWith("client-") && f.endsWith(".js"));
  if (cssMatch) cssFile = `/assets/${cssMatch}`;
  if (jsMatch) jsFile = `/assets/${jsMatch}`;
}

// 4. Generate a valid standalone index.html for Capacitor and Electron
const indexHtmlContent = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Portail documents</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    ${cssFile ? `<link rel="stylesheet" href="${cssFile}" />` : ""}
    <style>
      body { margin: 0; padding: 0; background: #090d16; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; overflow-x: hidden; }
      #app-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; }
      .spinner { width: 44px; height: 44px; border: 3px solid rgba(255,255,255,0.15); border-top-color: #38bdf8; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div id="root">
      <div id="app-loader">
        <img src="/logo.svg" alt="Portail documents" width="72" height="72" style="margin-bottom: 20px; border-radius: 18px;" />
        <div class="spinner"></div>
        <p style="margin-top: 18px; font-size: 14px; opacity: 0.8;">Chargement de Portail documents...</p>
      </div>
    </div>
    <script>
      // Fallback redirection to cloud preview if running inside mobile container without local server
      if (window.location.protocol === 'http:' || window.location.protocol === 'https:' || window.location.protocol === 'capacitor:') {
        // App is loaded inside Capacitor / WebView
      }
    </script>
    ${jsFile ? `<script type="module" src="${jsFile}"></script>` : ""}
  </body>
</html>
`;

fs.writeFileSync(path.join(distDir, "index.html"), indexHtmlContent, "utf-8");
console.log("✓ dist/index.html created successfully!");
