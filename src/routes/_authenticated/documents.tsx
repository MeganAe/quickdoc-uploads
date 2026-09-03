import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, X, FolderOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { UploadPanel } from "@/components/UploadPanel";
import { DocCard } from "@/components/DocCard";
import { useDocuments } from "@/lib/data";
import { CATEGORIES } from "@/lib/docs-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Mes documents — Portail documents" },
      { name: "description", content: "Consultez, recherchez et gérez tous vos documents." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data: docs = [], isLoading } = useDocuments();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("Tous");
  const [showUpload, setShowUpload] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs
      .filter((d) => (filter === "Tous" ? true : d.category === filter))
      .filter((d) => (q ? d.title.toLowerCase().includes(q) : true))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [docs, query, filter]);

  return (
    <AppShell title="Mes documents" subtitle="Consultez, filtrez et organisez vos fichiers">
      <div className="space-y-4">
        {/* Search and Upload Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 shadow-float">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre..."
              aria-label="Rechercher par titre"
              className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="h-11 shrink-0 rounded-full font-semibold gap-1.5"
            variant={showUpload ? "secondary" : "default"}
          >
            {showUpload ? <X className="size-4" /> : <Plus className="size-4" />}
            {showUpload ? "Fermer" : "Ajouter"}
          </Button>
        </div>

        {/* Collapsible Upload Panel */}
        {showUpload && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <UploadPanel onDone={() => setShowUpload(false)} />
          </div>
        )}

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {["Tous", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 animate-pulse rounded-2xl bg-card/60" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <FolderOpen className="size-12 text-muted-foreground/50" />
            <p className="mt-3 text-base font-semibold text-foreground">
              {docs.length === 0 ? "Aucun document enregistré" : "Aucun résultat trouvé"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {docs.length === 0
                ? "Cliquez sur 'Ajouter' pour envoyer votre premier document."
                : "Essayez de modifier votre recherche ou vos filtres de catégorie."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
