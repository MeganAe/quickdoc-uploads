export const CLOUD_NAME = "xgittjcg";
export const UPLOAD_PRESET = "portail_preset";
export const CLOUDINARY_ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

export const CATEGORIES = [
  "Cours",
  "Relevés de notes",
  "Projets",
  "Administratif",
  "Autre",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Doc = {
  id: string;
  title: string;
  category: string;
  url: string;
  format: string;
  bytes: number;
  is_favorite: boolean;
  created_at: string;
};

export function formatBytes(bytes: number) {
  if (!bytes) return "—";
  const units = ["o", "Ko", "Mo", "Go"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function uploadToCloudinary(
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ secure_url: string; format?: string; bytes?: number }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", CLOUDINARY_ENDPOINT);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(res);
        else reject(new Error(res?.error?.message ?? "Échec de l'envoi"));
      } catch {
        reject(new Error("Réponse invalide du service de stockage"));
      }
    };
    xhr.onerror = () => reject(new Error("Erreur réseau"));
    xhr.send(form);
  });
}
