import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Files,
  HardDrive,
  Star,
  Bell,
  ArrowRight,
  FolderOpen,
  ArrowLeft,
  LayoutGrid,
  List,
  Sparkles,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { UploadPanel } from "@/components/UploadPanel";
import { DocCard } from "@/components/DocCard";
import { MaterialFolderIcon, MaterialFileIcon } from "@/components/MaterialFileIcon";
import { useDocuments, useNotifications } from "@/lib/data";
import { formatBytes, CATEGORIES, type Doc } from "@/lib/docs-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Portail documents" },
      { name: "description", content: "Vue d'ensemble de vos documents et dossiers." },
    ],
  }),
  component: DashboardPage,
});

export function DashboardPage() {
  const { data: docs = [], isLoading } = useDocuments();
  const { data: notifications = [] } = useNotifications();

  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"folders" | "recent">("folders");
  const [searchFilter, setSearchFilter] = useState("");

  const stats = useMemo(() => {
    const totalBytes = docs.reduce((acc, doc) => acc + (doc.bytes || 0), 0);
    const favoritesCount = docs.filter((d) => d.is_favorite).length;
    const unreadNotifications = notifications.filter((n) => !n.is_read).length;

    return {
      totalDocs: docs.length,
      totalSize: formatBytes(totalBytes),
      favoritesCount,
      unreadNotifications,
    };
  }, [docs, notifications]);

  // Group documents by categories for folders view
  const foldersData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const catDocs = docs.filter((d) => d.category === cat);
      const totalBytes = catDocs.reduce((acc, d) => acc + (d.bytes || 0), 0);
      const recentFormats = Array.from(new Set(catDocs.map((d) => d.format).filter(Boolean))).slice(
        0,
        3
      );

      return {
        name: cat,
        count: catDocs.length,
        size: formatBytes(totalBytes),
        docs: catDocs,
        formats: recentFormats,
      };
    });
  }, [docs]);

  const recentDocs = useMemo(() => {
    return [...docs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
  }, [docs]);

  // Docs to show inside active folder
  const activeFolderDocs = useMemo(() => {
    if (!activeFolder) return [];
    let list = docs.filter((d) => d.category === activeFolder);
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q));
    }
    return list;
  }, [docs, activeFolder, searchFilter]);

  return (
    <AppShell title="Tableau de bord" subtitle="Organisé par dossiers & accès rapide">
      <div className="space-y-6">
        {/* KPI Cards avec micro-animations */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="group rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Fichiers</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Files className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{stats.totalDocs}</p>
          </div>

          <div className="group rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Stockage</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                <HardDrive className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{stats.totalSize}</p>
          </div>

          <Link
            to="/favorites"
            className="group rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-float"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Favoris</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110">
                <Star className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{stats.favoritesCount}</p>
          </Link>

          <Link
            to="/notifications"
            className="group rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-500/30 hover:shadow-float"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Alertes</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110">
                <Bell className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{stats.unreadNotifications}</p>
          </Link>
        </div>

        {/* Section Dossiers ou Fichiers Récents */}
        <div>
          {/* Header de la section avec sélecteur de vue */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {activeFolder ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFolder(null);
                    setSearchFilter("");
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <ArrowLeft className="size-3.5" />
                  Tous les dossiers
                </button>
              ) : (
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  {viewMode === "folders" ? "Mes Dossiers" : "Documents Récents"}
                </h2>
              )}

              {activeFolder && (
                <>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span className="text-sm font-semibold text-foreground">{activeFolder}</span>
                </>
              )}
            </div>

            {!activeFolder && (
              <div className="flex items-center rounded-xl bg-muted p-1 text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setViewMode("folders")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    viewMode === "folders"
                      ? "bg-card text-foreground shadow-sm"
                      : "hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="size-3.5" />
                  Dossiers
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("recent")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    viewMode === "recent"
                      ? "bg-card text-foreground shadow-sm"
                      : "hover:text-foreground"
                  }`}
                >
                  <List className="size-3.5" />
                  Récents
                </button>
              </div>
            )}
          </div>

          {/* VUE CONTENU D'UN DOSSIER SÉLECTIONNÉ */}
          {activeFolder ? (
            <div className="space-y-4">
              {/* Barre de recherche dans le dossier */}
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 shadow-sm">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={`Rechercher dans ${activeFolder}...`}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="h-10 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>

              {activeFolderDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
                  <FolderOpen className="size-10 text-muted-foreground/60" />
                  <p className="mt-2 text-sm font-medium text-foreground">Ce dossier est vide</p>
                  <p className="text-xs text-muted-foreground">
                    Ajoutez un document dans la catégorie « {activeFolder} » ci-dessous
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeFolderDocs.map((doc) => (
                    <DocCard key={doc.id} doc={doc} />
                  ))}
                </div>
              )}
            </div>
          ) : viewMode === "folders" ? (
            /* VUE GRILLE DES DOSSIERS MATERIAL */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {foldersData.map((folder) => (
                <div
                  key={folder.name}
                  onClick={() => setActiveFolder(folder.name)}
                  className="group relative flex cursor-pointer items-start gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-float"
                >
                  <MaterialFolderIcon category={folder.name} size="md" />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {folder.name}
                    </h3>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {folder.count} document{folder.count > 1 ? "s" : ""} · {folder.size}
                    </p>

                    {/* Format badges preview */}
                    {folder.formats.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        {folder.formats.map((fmt) => (
                          <span
                            key={fmt}
                            className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase text-muted-foreground"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              ))}
            </div>
          ) : (
            /* VUE DOCUMENTS RÉCENTS */
            <div>
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-32 animate-pulse rounded-2xl bg-card/60" />
                  ))}
                </div>
              ) : recentDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
                  <FolderOpen className="size-10 text-muted-foreground/60" />
                  <p className="mt-2 text-sm font-medium text-foreground">Aucun document pour le moment</p>
                  <p className="text-xs text-muted-foreground">Envoyez votre premier fichier ci-dessous</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {recentDocs.map((doc) => (
                    <DocCard key={doc.id} doc={doc} />
                  ))}
                </div>
              )}

              {docs.length > 6 && (
                <div className="mt-4 text-center">
                  <Button asChild variant="outline" size="sm" className="rounded-full gap-1.5 text-xs">
                    <Link to="/documents">
                      Voir tous les documents ({docs.length})
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panneau d'upload avec en-tête moderne */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Ajouter un document</h2>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Sparkles className="size-3 text-primary" />
              Formats Word, Excel, PPT, PDF, Images
            </span>
          </div>
          <UploadPanel defaultCategory={activeFolder || undefined} />
        </div>
      </div>
    </AppShell>
  );
}
