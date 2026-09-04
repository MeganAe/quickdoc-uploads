import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Portail documents" },
      {
        name: "description",
        content:
          "Créez votre compte ou connectez-vous pour envoyer, classer et retrouver vos documents en ligne.",
      },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Adresse e-mail invalide").max(255);
const passwordSchema = z.string().min(6, "6 caractères minimum").max(72);

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState<null | "login" | "signup" | "reset">(null);
  const [checking, setChecking] = useState(true);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        setChecking(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        const user = session.user;
        const isConfirmed =
          user.email_confirmed_at !== null || user.confirmed_at !== null;
        if (isConfirmed) {
          navigate({ to: "/dashboard", replace: true });
        }
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  function validate(withName: boolean) {
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      toast.error(parsedEmail.error.issues[0]!.message);
      return null;
    }
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) {
      toast.error("Mot de passe trop court", { description: "6 caractères minimum." });
      return null;
    }
    if (withName && fullName.trim().length < 2) {
      toast.error("Indiquez votre nom complet");
      return null;
    }
    return { email: parsedEmail.data, password: parsedPassword.data };
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const values = validate(false);
    if (!values) return;
    setLoading("login");
    const { error } = await supabase.auth.signInWithPassword(values);
    setLoading(null);
    if (error) {
      toast.error("Connexion refusée", { description: error.message });
      return;
    }
    toast.success("Connexion réussie");
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    const values = validate(true);
    if (!values) return;
    setLoading("signup");

    try {
      const { data, error } = await supabase.auth.signUp({
        ...values,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: fullName.trim() },
        },
      });

      if (error) {
        toast.error("Inscription impossible", { description: error.message });
        return;
      }

      if (
        data.user &&
        data.user.identities !== undefined &&
        data.user.identities.length === 0
      ) {
        toast.error("Compte déjà existant", {
          description: "Un compte avec cette adresse existe déjà. Veuillez vous connecter.",
        });
        setMode("login");
        return;
      }

      if (!data.session) {
        setPendingConfirm(true);
        toast.success("Compte créé !", {
          description: "Vérifiez votre boîte mail et cliquez sur le lien de confirmation.",
          duration: 6000,
        });
      } else {
        toast.success("Compte créé et connexion établie !");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Une erreur inattendue s'est produite.";
      toast.error("Erreur inattendue", { description: msg });
    } finally {
      setLoading(null);
    }
  }

  async function resetPassword() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Saisissez d'abord votre adresse e-mail");
      return;
    }
    setLoading("reset");
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(null);
    if (error) toast.error("Envoi impossible", { description: error.message });
    else
      toast.success("E-mail envoyé", {
        description: "Suivez le lien pour changer de mot de passe.",
      });
  }

  if (checking)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo + Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <FileText className="size-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Portail documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vos fichiers, classés et accessibles partout.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5">
          {pendingConfirm ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Vérifiez votre boîte mail</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Un lien de confirmation a été envoyé à{" "}
                    <span className="font-medium text-foreground">{email}</span>. Cliquez dessus
                    pour activer votre compte.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="mt-4 h-10 w-full rounded-xl text-sm font-semibold"
                onClick={() => {
                  setPendingConfirm(false);
                  setMode("login");
                  setPassword("");
                }}
              >
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <div>
              {/* Tab Switcher */}
              <div className="grid w-full grid-cols-2 rounded-xl bg-muted p-1 text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                    mode === "login"
                      ? "bg-background text-foreground shadow-sm"
                      : "hover:text-foreground"
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                    mode === "signup"
                      ? "bg-background text-foreground shadow-sm"
                      : "hover:text-foreground"
                  }`}
                >
                  Inscription
                </button>
              </div>

              {mode === "login" ? (
                <form onSubmit={signIn} className="mt-5 space-y-4">
                  <Field
                    id="login-email"
                    label="Adresse e-mail"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    placeholder="vous@example.com"
                  />
                  <Field
                    id="login-password"
                    label="Mot de passe"
                    icon={Lock}
                    type="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <Button
                    type="submit"
                    disabled={loading !== null}
                    className="h-11 w-full rounded-xl font-semibold"
                  >
                    {loading === "login" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                    Se connecter
                  </Button>
                  <button
                    type="button"
                    onClick={resetPassword}
                    disabled={loading !== null}
                    className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors"
                  >
                    {loading === "reset" ? "Envoi…" : "Mot de passe oublié ?"}
                  </button>
                </form>
              ) : (
                <form onSubmit={signUp} className="mt-5 space-y-4">
                  <Field
                    id="signup-name"
                    label="Nom complet"
                    icon={UserIcon}
                    type="text"
                    value={fullName}
                    onChange={setFullName}
                    autoComplete="name"
                    placeholder="Jean Dupont"
                  />
                  <Field
                    id="signup-email"
                    label="Adresse e-mail"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    placeholder="vous@example.com"
                  />
                  <Field
                    id="signup-password"
                    label="Mot de passe"
                    icon={Lock}
                    type="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    placeholder="6 caractères minimum"
                  />
                  <Button
                    type="submit"
                    disabled={loading !== null}
                    className="h-11 w-full rounded-xl font-semibold"
                  >
                    {loading === "signup" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                    Créer mon compte
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          En continuant, vous acceptez nos conditions d'utilisation.
        </p>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
        {label}
      </Label>
      <div className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize={type === "email" ? "none" : undefined}
          autoCorrect="off"
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm focus-visible:ring-2 focus-visible:ring-primary/50"
        />
      </div>
    </div>
  );
}
