const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const fs = require('fs');
const https = require('https');
const path = require('path');

function safeFileName(fileName) {
  const cleaned = path.basename(fileName).replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim();
  return cleaned || "document";
}

function downloadFile(url, destination, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      reject(new Error("Trop de redirections"));
      return;
    }

    https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        downloadFile(response.headers.location, destination, redirects + 1).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Téléchargement impossible (${response.statusCode ?? "réseau"})`));
        return;
      }

      const output = fs.createWriteStream(destination);
      response.pipe(output);
      output.on("finish", () => output.close(resolve));
      output.on("error", (error) => {
        output.close();
        fs.rm(destination, { force: true }, () => reject(error));
      });
    }).on("error", reject);
  });
}

ipcMain.handle("download-document", async (_event, { url, fileName }) => {
  const parsedUrl = new URL(url);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error("Source de téléchargement non autorisée");
  }

  const documentsDir = path.join(app.getPath("userData"), "documents");
  await fs.promises.mkdir(documentsDir, { recursive: true });
  const originalName = safeFileName(fileName);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  let destination = path.join(documentsDir, originalName);
  let suffix = 1;
  while (fs.existsSync(destination)) {
    destination = path.join(documentsDir, `${baseName} (${suffix++})${extension}`);
  }

  await downloadFile(parsedUrl.toString(), destination);
  return { path: destination, fileName: path.basename(destination) };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.webContents.setVisualZoomLevelLimits(1, 1);
  win.webContents.setLayoutZoomLevelLimits(0, 0);
  win.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && ['+', '-', '=', '0'].includes(input.key)) event.preventDefault();
    if (input.control && input.type === 'mouseWheel') event.preventDefault();
  });

  const isDev = !app.isPackaged;

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // In production, serve the built web application
    const indexPath = path.join(__dirname, '../dist/index.html');
    win.loadFile(indexPath).catch(() => {
      // Fallback if client bundle is inside .output/public or dist/public
      const altPath = path.join(__dirname, '../.output/public/index.html');
      win.loadFile(altPath);
    });
  }

  // Open external links in default OS browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
