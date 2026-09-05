import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Eye,
  Trash2,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  File,
  Star,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatBytes, type Doc } from "@/lib/docs-store";
import { useDeleteDocument, useToggleFavorite } from "@/lib/data";
import { DocPreviewDialog } from "@/components/DocPreviewDialog";
import { downloadDocument } from "@/lib/desktop";

const DEFAULT_TINT = {
  bg: "bg-rose-100 dark:bg-rose-900/30",
  text: "text-rose-700 dark:text-rose-300",
  ring: "ring-rose-200 dark:ring-rose-800",
};

const TINTS: Record<string, { bg: string; text: string; ring: string }> = {
  Cours: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300", ring: "ring-violet-200 dark:ring-violet-800" },
  "Relevés de notes": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", ring: "ring-amber-200 dark:ring-amber-800" },
  Projets: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300", ring: "ring-sky-200 dark:ring-sky-800" },
  Administratif: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-200 dark:ring-emerald-800" },
  Autre: DEFAULT_TINT,
};

function iconFor(format: string) {
  const f = (format || "").toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "heic"].includes(f)) return FileImage;
  if (["mp4", "mov", "webm", "avi", "mkv"].includes(f)) return FileVideo;
  if (["zip", "rar", "7z", "tar", "gz"].includes(f)) return FileArchive;
  if (["pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx"].includes(f)) return FileText;
  return File;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DocCard({
  doc,
  onDelete,
  onToggleFavorite: customToggle,
}: {
  doc: Doc;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, value: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const deleteMutation = useDeleteDocument();
  const favoriteMutation = useToggleFavorite();

  const Icon = iconFor(doc.format);
  const tint = TINTS[doc.category] ?? DEFAULT_TINT;

  const docAny = doc as Record<string, unknown>;
  const createdDate = (docAny["created_at"] ?? docAny["createdAt"]) as string | undefined;

  function handleToggleStar(e: React.MouseEvent) {
    e.stopPropagation();
    const nextValue = !doc.is_favorite;
    if (customToggle) {
      customToggle(doc.id, nextValue);
    } else {
      favoriteMutation.mutate({ id: doc.id, value: nextValue });
    }
  }

  function handleConfirmDelete() {
    if (onDelete) {
      onDelete(doc.id);
    } else {
      deleteMutation.mutate(doc.id);
    }
    setDeleteOpen(false);
  }

  const isFavoriting = favoriteMutation.isPending && favoriteMutation.variables?.id === doc.id;
  const isDeleting = deleteMutation.isPending && deleteMutation.variables === doc.id;

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
    <>
      <article
        className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-card transition-all duration-200 hover:shadow-float hover:border-primary/20 hover:-translate-y-0.5"
      >
        {/* Color accent stripe */}
        <div className={`h-1 w-full ${tint.bg}`} />

        <div className="flex flex-col flex-1 p-4">
          {/* Top row: Icon + Info + Favorite toggle */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              aria-label="Prévisualiser le document"
              className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl ring-1 transition-transform hover:scale-105 ${tint.bg} ${tint.text} ${tint.ring}`}
            >
              <Icon className="size-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h3
                onClick={() => setPreviewOpen(true)}
                className="cursor-pointer truncate text-sm font-semibold text-foreground hover:text-primary transition-colors leading-tight"
                title={doc.title}
              >
                {doc.title}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${tint.bg} ${tint.text}`}>
                  {doc.category}
                </span>
                {doc.format && (
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    {doc.format}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {formatBytes(doc.bytes)}
                </span>
              </div>
              {createdDate && (
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {formatDate(createdDate)}
                </p>
              )}
            </div>

            {/* Favorite Star Button */}
            <button
              type="button"
              aria-label={doc.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              disabled={isFavoriting}
              onClick={handleToggleStar}
              className="shrink-0 p-1.5 rounded-full transition-transform active:scale-90 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              {isFavoriting ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <Star
                  className={`size-4 transition-colors ${
                    doc.is_favorite
                      ? "fill-amber-400 text-amber-500"
                      : "text-muted-foreground/40 hover:text-amber-400"
                  }`}
                />
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/50">
            <Button
              size="sm"
              className="rounded-xl font-semibold gap-1.5 h-8 text-xs flex-1"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="size-3.5" />
              Aperçu
            </Button>

            <button
              type="button"
              title="Copier le lien"
              onClick={async (e) => {
                e.stopPropagation();
                await navigator.clipboard.writeText(doc.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleDownload();
              }}
              title="Télécharger"
              className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
            >
              <Download className="size-3.5" />
            </button>

            {/* Delete with confirmation dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Supprimer le document"
                  disabled={isDeleting}
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive transition-colors"
                >
                  {isDeleting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent className="max-w-sm rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Le document{" "}
                    <span className="font-semibold text-foreground">« {doc.title} »</span> sera
                    définitivement supprimé. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </article>

      {/* In-app Document Preview Modal */}
      <DocPreviewDialog
        doc={doc}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
}
