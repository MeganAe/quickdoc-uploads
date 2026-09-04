import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  User,
  Shield,
  Zap,
  Globe,
  Monitor,
  Smartphone,
  CheckCircle,
  FileCheck,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/about")({
  head: () => ({
    meta: [
      { title: "À propos — Portail documents" },
      {
        name: "description",
        content: "Découvrez l'histoire, les fonctionnalités et le créateur de Portail documents.",
      },
    ],
  }),
  component: AboutPage,
});

export function AboutPage() {
  return (
    <AppShell title="À propos" subtitle="Conçu et développé par Metoushela Walker">
      <div className="space-y-6 pb-6">
        {/* Creator Highlight Card */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-float">
          <div className="pointer-events-none absolute -right-10 -bottom-10 size-48 rounded-full bg-primary/10 blur-2xl" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative flex size-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-blue-600 shadow-xl shadow-primary/25 text-white ring-4 ring-primary/20">
              <User className="size-12" />
              <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-card shadow-sm">
                <Sparkles className="size-3.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3" />
                Fondateur & Développeur
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Metoushela Walker
              </h2>

              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Créateur et architecte principal de la plateforme{" "}
                <span className="font-semibold text-foreground">Portail Documents</span>. Conçu
                pour offrir une expérience moderne, fluide et sécurisée de gestion et de
                visualisation documentaire sur mobile, tablette et ordinateur.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  <CheckCircle className="size-3.5 text-emerald-500" />
                  Développement Fullstack
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  <CheckCircle className="size-3.5 text-emerald-500" />
                  UI/UX & Mobile Native
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  <CheckCircle className="size-3.5 text-emerald-500" />
                  Cloud & Sécurité
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Presentation */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/30">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Zap className="size-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">Rapide & Tout-en-un</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Prévisualisation immédiate des fichiers Word, Excel, PowerPoint, PDF et images sans
              nécessiter d'application externe.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/30">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Shield className="size-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">Sécurité Renforcée</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Authentification Supabase chiffrée, isolation stricte par utilisateur et stockage CDN
              mondial ultra-sécurisé.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/30">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <FileCheck className="size-5" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">Organisation par Dossiers</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Classement automatique de vos cours, diplômes, projets et papiers administratifs avec
              recherche instantanée.
            </p>
          </div>
        </div>

        {/* Multi-platform Availability */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Disponibilité Multiplateforme
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/40 p-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Web Cloud</p>
                <p className="text-xs text-muted-foreground">Accessible partout via navigateur</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/40 p-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Monitor className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Windows (.exe)</p>
                <p className="text-xs text-muted-foreground">Application logicielle de bureau</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/40 p-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Smartphone className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Android (.apk)</p>
                <p className="text-xs text-muted-foreground">Application mobile tactile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical specs & Version */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500" />
            <span>Portail documents · Version 1.0.0</span>
          </div>
          <div className="flex items-center gap-1 text-center">
            <span>Fait avec passion</span>
            <Heart className="size-3.5 fill-rose-500 text-rose-500" />
            <span>par <strong className="text-foreground">Metoushela Walker</strong></span>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link to="/dashboard">
              <ArrowLeft className="size-3.5" />
              Retour au tableau de bord
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
