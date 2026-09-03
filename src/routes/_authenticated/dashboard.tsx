import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Files, HardDrive, Star, Bell, ArrowRight, FolderOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { UploadPanel } from "@/components/UploadPanel";
import { DocCard } from "@/components/DocCard";
import { useDocuments, useNotifications } from "@/lib/data";
import { formatBytes } from "@/lib/docs-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Portail documents" },
      { name: "description", content: "Vue d'ensemble de vos documents et statistiques." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: docs = [], isLoading } = useDocuments();
  const { data: notifications = [] } = useNotifications();

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

  const recentDocs = useMemo(() => {
    return [...docs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [docs]);

  return (
    <AppShell title="Tableau de bord" subtitle="Vue d'ensemble et accès rapide">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Fichiers</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Files className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stats.totalDocs}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Stockage</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <HardDrive className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stats.totalSize}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Favoris</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Star className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stats.favoritesCount}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Alertes</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Bell className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stats.unreadNotifications}</p>
          </div>
        </div>

        {/* Upload Panel */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-foreground">Ajouter un document</h2>
          <UploadPanel />
        </div>

        {/* Recent Documents */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Documents récents</h2>
            {docs.length > 4 && (
              <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                <Link to="/documents">
                  Voir tout <ArrowRight className="size-3" />
                </Link>
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n} className="h-32 animate-pulse rounded-2xl bg-card/60" />
              ))}
            </div>
          ) : recentDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
              <FolderOpen className="size-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium text-foreground">Aucun document pour le moment</p>
              <p className="text-xs text-muted-foreground">Envoyez votre premier fichier ci-dessus</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentDocs.map((doc) => (
                <DocCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
