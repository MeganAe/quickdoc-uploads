import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, Search, FolderOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DocCard } from "@/components/DocCard";
import { useDocuments } from "@/lib/data";
import { CATEGORIES } from "@/lib/docs-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({
    meta: [
      { title: "Favoris — Portail documents" },
      { name: "description", content: "Retrouvez rapidement tous vos documents mis en favori." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { data: docs = [], isLoading } = useDocuments();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("Tous");

  const favorites = useMemo(() => {
    return docs.filter((d) => d.is_favorite);
  }, [docs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return favorites
      .filter((d) => (filter === "Tous" ? true : d.category === filter))
      .filter((d) => (q ? d.title.toLowerCase().includes(q) : true))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [favorites, query, filter]);

  return (
    <AppShell title="Favoris" subtitle="Accès rapide à vos documents prioritaires">
      <div className="space-y-4">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 shadow-float">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans vos favoris..."
            aria-label="Rechercher dans vos favoris"
            className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {/* Category Pills */}
        {favorites.length > 0 && (
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
        )}

        {/* Favorites Grid */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-36 animate-pulse rounded-2xl bg-card/60" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Star className="size-7" />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">
              {favorites.length === 0 ? "Aucun favori pour le moment" : "Aucun résultat trouvé"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {favorites.length === 0
                ? "Cliquez sur l'icône étoile d'un document pour l'épingler et le retrouver ici en un clic."
                : "Essayez de modifier vos critères de recherche."}
            </p>
            {favorites.length === 0 && (
              <Button asChild className="mt-4 rounded-full font-semibold" size="sm">
                <Link to="/documents">
                  <FolderOpen className="size-4" /> Parcourir mes documents
                </Link>
              </Button>
            )}
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
