import { useState } from "react";
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

const TINTS: Record<string, string> = {
  Cours: "bg-[#F3E8FF] text-[#7C3AED]",
  "Relevés de notes": "bg-[#FEF3C7] text-[#D97706]",
  Projets: "bg-[#E0F2FE] text-[#0284C7]",
  Administratif: "bg-[#D1FAE5] text-[#059669]",
  Autre: "bg-[#FFE4E6] text-[#E11D48]",
};

function iconFor(format: string) {
  const f = (format || "").toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "heic"].includes(f)) return FileImage;
  if (["mp4", "mov", "webm", "avi", "mkv"].includes(f)) return FileVideo;
  if (["zip", "rar", "7z", "tar", "gz"].includes(f)) return FileArchive;
  if (["pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx"].includes(f)) return FileText;
  return File;
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
  const tint = TINTS[doc.category] ?? TINTS["Autre"];

  // Support both snake_case (Supabase) and camelCase (legacy local store)
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

  return (
    <>
      <article className="group relative flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:border-primary/30 hover:shadow-float">
        {/* Top row: Icon + Info + Favorite toggle */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            aria-label="Prévisualiser le document"
            className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-transform hover:scale-105 ${tint}`}
          >
            <Icon className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h3
              onClick={() => setPreviewOpen(true)}
              className="cursor-pointer truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
              title={doc.title}
            >
              {doc.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {doc.category} · {doc.format ? doc.format.toUpperCase() + " · " : ""}
              {formatBytes(doc.bytes)}
            </p>
            {createdDate && (
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                {new Date(createdDate).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Favorite Star Button */}
          <Button
            size="icon"
            variant="ghost"
            aria-label={doc.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            disabled={isFavoriting}
            onClick={handleToggleStar}
            className="size-8 shrink-0 rounded-full transition-transform active:scale-90"
          >
            {isFavoriting ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Star
                className={`size-4 transition-colors ${
                  doc.is_favorite
                    ? "fill-amber-400 text-amber-500"
                    : "text-muted-foreground/60 hover:text-amber-500"
                }`}
              />
            )}
          </Button>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-border/60">
          <Button
            size="sm"
            className="rounded-full font-semibold gap-1.5 h-8 text-xs"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-3.5" />
            Aperçu
          </Button>

          <Button
            size="sm"
            variant="secondary"
            className="rounded-full h-8 text-xs gap-1.5"
            onClick={async (e) => {
              e.stopPropagation();
              await navigator.clipboard.writeText(doc.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copié" : "Copier"}
          </Button>

          {/* Delete with confirmation dialog */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Supprimer le document"
                disabled={isDeleting}
                className="ml-auto size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                {isDeleting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </Button>
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
                <AlertDialogCancel className="rounded-full">Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
