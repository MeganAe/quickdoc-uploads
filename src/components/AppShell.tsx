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
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { data: profile } = useProfile();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen pb-24">
      {/* En-tête avec arrondi d'origine et photo de profil */}
      <header className="bg-masthead rounded-b-3xl px-4 pt-6 pb-12">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-primary-foreground">
              {title}
            </h1>
            <p className="mt-0.5 truncate text-xs text-primary-foreground/75">
              {subtitle ?? profile?.full_name ?? "Espace personnel"}
            </p>
          </div>

          {/* Photo de profil dans l'en-tête */}
          <Link
            to="/profile"
            title="Mon profil"
            className="flex shrink-0 size-10 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30 hover:ring-white/60 transition-all hover:scale-105 overflow-hidden"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? "Profil"}
                className="size-10 object-cover"
              />
            ) : (
              <User className="size-5 text-primary-foreground" />
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto -mt-6 max-w-4xl px-4">{children}</main>

      {/* Barre de navigation avec animation d'onglet actif */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-4xl">
          {TABS.map(({ to, label, icon: Icon }) => {
            const isActive = currentPath === to || (to !== "/dashboard" && currentPath.startsWith(to));

            return (
              <Link
                key={to}
                to={to}
                className={`group relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-all duration-200 ${
                  isActive
                    ? "font-bold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {/* Barre indicatrice animée pour l'onglet actif */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-7 rounded-full bg-primary transition-all duration-300" />
                )}

                <span className="relative">
                  <Icon
                    className={`size-5 transition-transform duration-200 ${
                      isActive ? "scale-110 -translate-y-0.5" : "group-hover:-translate-y-0.5"
                    }`}
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
