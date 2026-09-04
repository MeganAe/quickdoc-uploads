import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// If deployed on Vercel/web server, base is "/". For local Electron/Capacitor, base is "./"
const isWeb = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.CI_WEB);

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    react(),
  ],
  base: isWeb ? "/" : "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  define: {
    "process.env": {},
  },
});
