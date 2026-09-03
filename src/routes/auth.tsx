import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion et inscription — Portail documents" },
      {
        name: "description",
        content:
          "Créez votre compte ou connectez-vous pour envoyer, classer et retrouver vos documents en ligne.",
      },
      { property: "og:title", content: "Connexion — Portail documents" },
      {
        property: "og:description",
        content: "Créez votre compte ou connectez-vous pour gérer vos documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [loading, setLoading] = useState<null | "login" | "signup" | "google" | "reset">(null);
  const [checking, setChecking] = useState(true);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        setChecking(false);
      }
    });

    // Listen for auth changes, but only navigate if we're not in a "pendingConfirm" state
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        // Only auto-redirect if email was confirmed (session has access_token and user is confirmed)
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
    // navigation handled by onAuthStateChange
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

      // User already exists (identities empty) → ask to login
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

      // Email confirmation required
      if (!data.session) {
        setPendingConfirm(true);
        toast.success("Compte créé !", {
          description: "Vérifiez votre boîte mail et cliquez sur le lien de confirmation.",
          duration: 6000,
        });
      } else {
        // Auto-confirmed (e.g. local dev or disabled email confirmation)
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

  async function google() {
    setLoading("google");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(null);
      toast.error("Google indisponible", { description: result.error.message });
      return;
    }
    if (result.redirected) return;
    toast.success("Connexion réussie");
    navigate({ to: "/dashboard", replace: true });
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-float">
        <h1 className="text-lg font-bold tracking-tight">Portail documents</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Vos fichiers, classés et accessibles partout.
        </p>

        {pendingConfirm ? (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-foreground">Vérifiez votre boîte mail</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Un lien de confirmation a été envoyé à{" "}
                  <span className="font-medium text-foreground">{email}</span>. Cliquez dessus pour
                  activer votre compte.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="mt-4 h-10 w-full rounded-full text-sm font-semibold"
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
          <Tabs value={mode} onValueChange={setMode} className="mt-5">
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="login" className="rounded-full text-xs font-semibold">
                Connexion
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full text-xs font-semibold">
                Inscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={signIn} className="mt-4 space-y-3">
                <Field
                  id="login-email"
                  label="Adresse e-mail"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
                <Field
                  id="login-password"
                  label="Mot de passe"
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  disabled={loading !== null}
                  className="h-11 w-full rounded-full font-semibold"
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
                  className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  {loading === "reset" ? "Envoi…" : "Mot de passe oublié ?"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="mt-4 space-y-3">
                <Field
                  id="signup-name"
                  label="Nom complet"
                  icon={UserIcon}
                  type="text"
                  value={fullName}
                  onChange={setFullName}
                  autoComplete="name"
                />
                <Field
                  id="signup-email"
                  label="Adresse e-mail"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
                <Field
                  id="signup-password"
                  label="Mot de passe"
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  disabled={loading !== null}
                  className="h-11 w-full rounded-full font-semibold"
                >
                  {loading === "signup" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-muted-foreground">ou</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={loading !== null}
          onClick={google}
          className="h-11 w-full rounded-full font-semibold"
        >
          {loading === "google" ? <Loader2 className="size-4 animate-spin" /> : null}
          Continuer avec Google
        </Button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          <Link to="/reset-password" className="underline-offset-4 hover:underline">
            Changer mon mot de passe
          </Link>
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
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-input bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
