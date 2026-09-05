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

export async function downloadDocument(url: string, fileName: string) {
  if (window.quickDocDesktop) {
    return window.quickDocDesktop.downloadDocument(url, fileName);
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