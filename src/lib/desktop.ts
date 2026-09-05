import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";

export type DesktopDownloadResult = {
  path: string;
  fileName: string;
};

type DesktopApi = {
  downloadDocument: (url: string, fileName: string) => Promise<DesktopDownloadResult>;
};

declare global {
  interface Window {
    quickDocDesktop?: DesktopApi;
  }
}

export function isDesktopApp() {
  return typeof window !== "undefined" && Boolean(window.quickDocDesktop);
}

function safeFileName(fileName: string) {
  const cleaned = fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim();
  return cleaned || "document";
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

async function downloadOnAndroid(url: string, fileName: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Téléchargement impossible (${response.status})`);

  const safeName = safeFileName(fileName);
  const extension = safeName.includes(".") ? safeName.slice(safeName.lastIndexOf(".")) : "";
  const baseName = extension ? safeName.slice(0, -extension.length) : safeName;
  let outputName = safeName;
  let suffix = 1;

  while (true) {
    try {
      await Filesystem.stat({ path: `documents/${outputName}`, directory: Directory.Data });
      outputName = `${baseName} (${suffix++})${extension}`;
    } catch {
      break;
    }
  }

  const result = await Filesystem.writeFile({
    path: `documents/${outputName}`,
    data: toBase64(await response.arrayBuffer()),
    directory: Directory.Data,
    recursive: true,
  });

  return { path: result.uri, fileName: outputName };
}

export async function downloadDocument(url: string, fileName: string) {
  if (window.quickDocDesktop) {
    return window.quickDocDesktop.downloadDocument(url, fileName);
  }

  if (Capacitor.isNativePlatform()) {
    return downloadOnAndroid(url, fileName);
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
  return null;
}