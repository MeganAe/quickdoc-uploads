import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, FolderOpen, Bell, User, Star } from "lucide-react";
import { useNotifications, useProfile } from "@/lib/data";

const TABS = [
  { to: "/dashboard", label: "Accueil", icon: Home },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/favorites", label: "Favoris", icon: Star },
  { to: "/notifications", label: "Alertes", icon: Bell },
  { to: "/profile", label: "Profil", icon: User },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
  headerRight,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
}) {
  const { data: profile } = useProfile();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header avec dégradé amélioré */}
      <header className="relative overflow-hidden bg-masthead px-4 pt-8 pb-16">
        {/* Cercles décoratifs en arrière-plan */}
        <div className="pointer-events-none absolute -top-8 -right-8 size-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-4 -right-4 size-24 rounded-full bg-white/5" />

        <div className="relative mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary-foreground/60 uppercase tracking-wider mb-0.5">
              Portail documents
            </p>
            <h1 className="truncate text-2xl font-bold tracking-tight text-primary-foreground">
              {title}
            </h1>
            {(subtitle ?? profile?.full_name) && (
              <p className="mt-0.5 truncate text-sm text-primary-foreground/70">
                {subtitle ?? `Bonjour, ${profile?.full_name?.split(" ")[0] ?? ""}` }
              </p>
            )}
          </div>

          {/* Avatar ou slot droit */}
          {headerRight ?? (
            <Link
              to="/profile"
              className="flex shrink-0 size-10 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30 hover:bg-white/30 transition-colors overflow-hidden"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profil"
                  className="size-10 object-cover"
                />
              ) : (
                <User className="size-5 text-primary-foreground" />
              )}
            </Link>
          )}
        </div>
      </header>

      {/* Content zone (overlapping header) */}
      <main className="mx-auto -mt-8 max-w-4xl px-4">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl">
          {TABS.map(({ to, label, icon: Icon }) => {
            const isActive = currentPath === to || currentPath.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className="group relative flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors"
                style={{ color: isActive ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
                )}
                <span className="relative">
                  <Icon
                    className="size-5 transition-transform group-hover:-translate-y-0.5"
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {to === "/notifications" && unread > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
