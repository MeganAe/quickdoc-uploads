const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("quickDocDesktop", {
  downloadDocument: (url, fileName) => ipcRenderer.invoke("download-document", { url, fileName }),
});