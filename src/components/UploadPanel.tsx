import { useRef, useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, FileUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CATEGORIES,
  type Category,
  type Doc,
  uploadToCloudinary,
} from "@/lib/docs-store";
import { supabase } from "@/integrations/supabase/client";
import { pushNotification } from "@/lib/data";

export function UploadPanel({
  onAdd,
  onDone,
}: {
  onAdd?: (doc: Doc) => void;
  onDone?: () => void;
}) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Autre");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      toast.error("Veuillez vous connecter pour envoyer un fichier");
      return;
    }

    const fileList = Array.from(files);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]!;
      setCurrentFileName(file.name);
      try {
        setProgress(5);
        // Upload to Cloudinary with progress
        const res = await uploadToCloudinary(file, (p) => {
          setProgress(Math.max(5, Math.min(90, p)));
        });

        setProgress(95);
        setIsSavingDb(true);

        const docTitle = (title.trim() || file.name).slice(0, 120);
        const format = res.format ?? file.name.split(".").pop()?.toLowerCase() ?? "";
        const bytes = res.bytes ?? file.size;

        // Save into Supabase Database
        const { data: inserted, error: dbError } = await supabase
          .from("documents")
          .insert({
            user_id: user.id,
            title: docTitle,
            category,
            url: res.secure_url,
            format,
            bytes,
            is_favorite: false,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Push notification
        await pushNotification(
          "Nouveau document ajouté",
          `Le document "${docTitle}" a été importé avec succès.`
        );

        toast.success(`"${docTitle}" importé avec succès !`);

        if (inserted && onAdd) {
          onAdd(inserted as Doc);
        }

        setTitle("");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Échec de l'envoi";
        setError(msg);
        toast.error("Erreur lors de l'import", { description: msg });
      } finally {
        setProgress(null);
        setIsSavingDb(false);
        setCurrentFileName("");
      }
    }

    // Invalidate react-query cache to refresh lists
    qc.invalidateQueries({ queryKey: ["documents"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });

    if (inputRef.current) inputRef.current.value = "";
    if (onDone) onDone();
  }

  const isUploading = progress !== null || isSavingDb;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre personnalisé (optionnel)"
          aria-label="Titre du document"
          disabled={isUploading}
          className="h-10 rounded-md"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          aria-label="Catégorie"
          disabled={isUploading}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isUploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!isUploading) handleFiles(e.dataTransfer.files);
        }}
        className={`mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition-all ${
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-muted/30 hover:border-border/80"
        } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UploadCloud className="size-6 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Glissez-déposez vos fichiers ici
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            PDF, Word, Excel, Images, Vidéos, Archives (Cloudinary & Base de données)
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          disabled={isUploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="secondary"
          className="mt-1 rounded-full font-semibold gap-2"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <FileUp className="size-4" />
          Parcourir les fichiers
        </Button>
      </div>

      {isUploading && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs font-medium text-foreground">
            <span className="flex items-center gap-2 truncate">
              <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />
              {isSavingDb
                ? "Enregistrement en base de données..."
                : `Upload de "${currentFileName}"...`}
            </span>
            <span className="font-bold text-primary">{progress ?? 95}%</span>
          </div>
          <Progress value={progress ?? 95} className="mt-2 h-2" />
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
          {error}
        </div>
      )}
    </section>
  );
}
