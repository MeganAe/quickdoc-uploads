import { useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  Download,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBytes, type Doc } from "@/lib/docs-store";
import { downloadDocument } from "@/lib/desktop";

function getCategoryIcon(format: string) {
  const f = (format || "").toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "heic"].includes(f)) return FileImage;
  if (["mp4", "mov", "webm", "avi", "mkv"].includes(f)) return FileVideo;
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(f)) return FileAudio;
  if (["xls", "xlsx", "csv"].includes(f)) return FileSpreadsheet;
  if (["ppt", "pptx"].includes(f)) return Presentation;
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(f)) return FileText;
  return File;
}

export function DocPreviewDialog({
  doc,
  open,
  onOpenChange,
}: {
  doc: Doc;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [viewerType, setViewerType] = useState<"google" | "office">("google");
  const [iframeLoading, setIframeLoading] = useState(true);

  const f = (doc.format || "").toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "webp", "gif", "svg", "heic"].includes(f);
  const isVideo = ["mp4", "webm", "mov", "avi", "mkv"].includes(f);
  const isAudio = ["mp3", "wav", "ogg", "m4a", "flac"].includes(f);
  const isPdf = f === "pdf";
  const isOffice = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "rtf", "txt"].includes(f);

  const officeEmbedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.url)}`;
  const googleEmbedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.url)}&embedded=true`;

  const activeViewerUrl = viewerType === "office" ? officeEmbedUrl : googleEmbedUrl;
  const Icon = getCategoryIcon(f);

  async function handleDownload() {
    try {
      const extension = doc.format ? `.${doc.format}` : "";
      const result = await downloadDocument(doc.url, `${doc.title}${extension}`);
      if (result) toast.success("Document enregistré dans l'application", { description: result.fileName });
    } catch (error) {
      toast.error("Téléchargement impossible", { description: error instanceof Error ? error.message : "Erreur réseau" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] w-[95vw] p-4 sm:p-6 flex flex-col rounded-2xl gap-3 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between gap-4 pr-6 text-left">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-primary shrink-0" />
              <DialogTitle className="truncate text-base font-bold text-foreground">
                {doc.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {doc.category} · {f.toUpperCase()} · {formatBytes(doc.bytes)}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isOffice && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1 rounded-full hidden sm:flex"
                onClick={() => {
                  setIframeLoading(true);
                  setViewerType(viewerType === "google" ? "office" : "google");
                }}
              >
                <RefreshCw className="size-3" />
                {viewerType === "google" ? "Vue Office" : "Vue Google"}
              </Button>
            )}
            <Button size="sm" variant="secondary" className="h-8 rounded-full text-xs gap-1.5" onClick={() => void handleDownload()}>
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Télécharger</span>
            </Button>
            <Button asChild size="sm" className="h-8 rounded-full text-xs gap-1.5">
              <a href={doc.url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" />
                <span className="hidden sm:inline">Ouvrir</span>
              </a>
            </Button>
          </div>
        </DialogHeader>

        {/* Content Viewer */}
        <div className="relative flex-1 min-h-[50vh] max-h-[75vh] w-full rounded-xl border border-border bg-muted/20 overflow-auto flex items-center justify-center">
          {/* IMAGE */}
          {isImage && (
            <div className="flex items-center justify-center w-full h-full p-2">
              <img
                src={doc.url}
                alt={doc.title}
                className="max-h-[70vh] max-w-full w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* VIDEO */}
          {isVideo && (
            <div className="w-full h-full flex items-center justify-center p-2 bg-black/90 rounded-lg">
              <video
                controls
                autoPlay={false}
                className="max-h-[70vh] max-w-full rounded-lg shadow-md"
              >
                <source src={doc.url} />
                Votre navigateur ne supporte pas la lecture de cette vidéo.
              </video>
            </div>
          )}

          {/* AUDIO */}
          {isAudio && (
            <div className="p-8 text-center w-full max-w-md">
              <FileAudio className="size-16 mx-auto text-primary mb-4" />
              <p className="font-semibold mb-3">{doc.title}</p>
              <audio controls className="w-full">
                <source src={doc.url} />
                Votre navigateur ne supporte pas la lecture de ce fichier audio.
              </audio>
            </div>
          )}

          {/* PDF */}
          {isPdf && (
            <iframe
              src={`${doc.url}#toolbar=1`}
              className="w-full h-[72vh] rounded-lg border-0"
              title={doc.title}
            />
          )}

          {/* WORD, EXCEL, POWERPOINT, TEXT */}
          {isOffice && (
            <div className="relative w-full h-[72vh]">
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs">
                  <Loader2 className="size-7 animate-spin text-primary" />
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Chargement de la prévisualisation {viewerType === "google" ? "Google Docs" : "Office"}...
                  </p>
                </div>
              )}
              <iframe
                src={activeViewerUrl}
                className="w-full h-full rounded-lg border-0"
                title={doc.title}
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          )}

          {/* OTHER / GENERIC FALLBACK */}
          {!isImage && !isVideo && !isAudio && !isPdf && !isOffice && (
            <div className="p-8 text-center">
              <File className="size-16 mx-auto text-muted-foreground/60 mb-3" />
              <p className="text-sm font-semibold text-foreground">
                Aperçu non disponible directement pour le format {f.toUpperCase() || "inconnu"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Vous pouvez télécharger le document ou l'ouvrir avec votre application habituelle.
              </p>
              <Button className="mt-4 rounded-full gap-1.5" size="sm" onClick={() => void handleDownload()}>
                  <Download className="size-4" />
                  Télécharger le fichier
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
