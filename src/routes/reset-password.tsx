import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Portail documents" },
      { name: "description", content: "Définissez un nouveau mot de passe pour votre compte." },
    ],
  }),
  component: ResetPasswordPage,
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = passwordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? "Saisie invalide");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error("Impossible de mettre à jour le mot de passe", {
        description: error.message,
      });
      return;
    }

    setSuccess(true);
    toast.success("Mot de passe mis à jour avec succès");
    setTimeout(() => {
      navigate({ to: "/dashboard", replace: true });
    }, 2000);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-float">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock className="size-5" />
        </div>
        <h1 className="mt-3 text-lg font-bold tracking-tight text-foreground">
          Nouveau mot de passe
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Choisissez un mot de passe sécurisé pour votre compte.
        </p>

        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
            <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-foreground">Mot de passe réinitialisé !</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Redirection automatique vers votre tableau de bord...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="password" className="text-xs font-medium">
                Nouveau mot de passe
              </Label>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-input bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
                <Lock className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-xs font-medium">
                Confirmer le mot de passe
              </Label>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-input bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
                <Lock className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full font-semibold gap-2"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              Valider le mot de passe
            </Button>

            <p className="pt-2 text-center text-xs text-muted-foreground">
              <Link to="/auth" className="underline-offset-4 hover:underline">
                Retour à la page de connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
