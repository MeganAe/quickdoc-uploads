import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DownloadCloud, File, FolderOpen, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/docs-store";
import { listLocalDocuments, openLocalDocument, type LocalDocument } from "@/lib/desktop";

export const Route = createFileRoute("/_authenticated/offline")({
  head: () => ({ meta: [{ title: "Hors ligne — Portail documents" }] }),
  component: OfflinePage,
});

function OfflinePage() {
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      setDocuments(await listLocalDocuments());
    } catch (error) {
      toast.error("Impossible de charger les fichiers hors ligne", {
        description: error instanceof Error ? error.message : "Erreur locale",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AppShell title="Hors ligne" subtitle="Vos fichiers disponibles sans connexion">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Téléchargements</h2>
            <p className="text-xs text-muted-foreground">{documents.length} fichier{documents.length === 1 ? "" : "s"} enregistré{documents.length === 1 ? "" : "s"}</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => void refresh()} disabled={loading} title="Actualiser">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-card/60" />
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <DownloadCloud className="size-12 text-muted-foreground/50" />
            <p className="mt-3 font-semibold">Aucun fichier hors ligne</p>
            <p className="mt-1 text-xs text-muted-foreground">Téléchargez un document pour le retrouver ici sans connexion.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {documents.map((document) => (
              <div key={document.path} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <File className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" title={document.fileName}>{document.fileName}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(document.bytes)}</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => void openLocalDocument(document)} title="Ouvrir">
                  <FolderOpen className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Supprimer" disabled>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}