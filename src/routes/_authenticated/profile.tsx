import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Save,
  LogOut,
  Loader2,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useProfile, useSession } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { uploadToCloudinary } from "@/lib/docs-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Mon profil — Portail documents" },
      { name: "description", content: "Gérez vos informations de profil et votre compte." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useSession();
  const { data: profile, isLoading } = useProfile();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
    } else if (user) {
      // Access user_metadata via index signature to satisfy TS4111
      const meta = user.user_metadata as Record<string, string | undefined>;
      if (meta?.["full_name"]) {
        setFullName(meta["full_name"] ?? "");
      }
      if (meta?.["avatar_url"]) {
        setAvatarUrl(meta["avatar_url"] ?? null);
      }
    }
  }, [profile, user]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop lourd", { description: "La photo doit faire moins de 5 Mo." });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Format invalide", { description: "Veuillez choisir une image." });
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadToCloudinary(file, () => {});
      const newAvatarUrl = res.secure_url;

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setAvatarUrl(newAvatarUrl);
      toast.success("Photo de profil mise à jour !");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur lors du téléchargement";
      toast.error("Erreur", { description: msg });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName.trim(),
      bio: bio.trim(),
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      toast.error("Erreur lors de la mise à jour", { description: error.message });
      return;
    }

    toast.success("Profil mis à jour");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (fullName || profile?.full_name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell title="Mon profil" subtitle="Gérez vos informations et préférences">
      <div className="space-y-6">
        {/* Avatar + User Info */}
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5 shadow-card">
          {/* Avatar with upload overlay */}
          <div className="relative shrink-0">
            <Avatar className="size-20 ring-2 ring-primary/20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={fullName || "Avatar"} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {uploadingAvatar ? (
                  <Loader2 className="size-6 animate-spin text-primary" />
                ) : (
                  initials
                )}
              </AvatarFallback>
            </Avatar>

            {/* Camera button overlay */}
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Changer la photo de profil"
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Camera className="size-3.5" />
            </button>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-foreground">
              {fullName || profile?.full_name || "Utilisateur"}
            </h2>
            <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground mt-0.5">
              <Mail className="size-3.5" />
              {user?.email ?? "—"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                <Calendar className="size-3" />
                Membre depuis {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("fr-FR", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                <Shield className="size-3" />
                Compte sécurisé
              </span>
            </div>
            {uploadingAvatar && (
              <p className="mt-1.5 text-xs text-primary animate-pulse">
                Envoi de la photo en cours...
              </p>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground">Modifier les informations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ces informations sont associées à votre espace personnel.
          </p>

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-xs font-medium">
                Nom complet
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="mt-1.5 h-10"
                disabled={isLoading || saving}
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-xs font-medium">
                Description / Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Quelques mots sur vous ou votre organisation..."
                className="mt-1.5 resize-none min-h-[90px]"
                disabled={isLoading || saving}
              />
            </div>

            <Button
              type="submit"
              disabled={saving || isLoading}
              className="gap-2 rounded-full font-semibold"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Enregistrer les modifications
            </Button>
          </form>
        </div>

        {/* Account Actions */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
          <h3 className="text-sm font-semibold text-destructive">Session et déconnexion</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fermez votre session actuelle sur cet appareil.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOut}
            className="mt-4 gap-2 rounded-full font-semibold"
          >
            <LogOut className="size-4" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
