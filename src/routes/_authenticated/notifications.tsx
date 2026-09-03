import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bell, CheckCheck, Inbox, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useNotifications, useMarkNotificationsRead } from "@/lib/data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Portail documents" },
      { name: "description", content: "Historique de vos notifications et alertes." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationsRead();

  const unreadIds = useMemo(() => {
    return notifications.filter((n) => !n.is_read).map((n) => n.id);
  }, [notifications]);

  function handleMarkAll() {
    if (unreadIds.length > 0) {
      markReadMutation.mutate(unreadIds);
    }
  }

  function handleSingleMark(id: string) {
    markReadMutation.mutate([id]);
  }

  return (
    <AppShell title="Notifications" subtitle="Historique des alertes et activités">
      <div className="space-y-4">
        {/* Header Action */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {unreadIds.length > 0
              ? `${unreadIds.length} non lue${unreadIds.length > 1 ? "s" : ""}`
              : "Toutes les notifications sont lues"}
          </p>
          {unreadIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAll}
              disabled={markReadMutation.isPending}
              className="gap-1.5 rounded-full text-xs font-semibold"
            >
              <CheckCheck className="size-3.5" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-2xl bg-card/60" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Inbox className="size-7" />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">Aucune notification</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Les mises à jour, ajouts de documents et alertes apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <article
                key={n.id}
                onClick={() => !n.is_read && handleSingleMark(n.id)}
                className={`group flex items-start gap-3 rounded-2xl border border-border p-4 transition-all ${
                  n.is_read
                    ? "bg-card/70 opacity-80 hover:opacity-100"
                    : "cursor-pointer bg-card shadow-card ring-1 ring-primary/20 hover:border-primary/40"
                }`}
              >
                <div
                  className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    n.is_read
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Bell className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm ${n.is_read ? "font-medium text-foreground/80" : "font-semibold text-foreground"}`}>
                      {n.title}
                    </h3>
                    <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      {new Date(n.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {n.body && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  )}
                </div>
                {!n.is_read && (
                  <span className="size-2 shrink-0 rounded-full bg-primary mt-1.5" />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
