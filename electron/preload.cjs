const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("quickDocDesktop", {
  downloadDocument: (url, fileName) => ipcRenderer.invoke("download-document", { url, fileName }),
  listLocalDocuments: () => ipcRenderer.invoke("list-local-documents"),
  openLocalDocument: (filePath) => ipcRenderer.invoke("open-local-document", filePath),
});