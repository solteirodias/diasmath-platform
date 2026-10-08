import { useId, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuestionImage } from "@/components/QuestionImage";
import { supabase } from "@/integrations/supabase/client";
import { QUESTION_IMAGE_ACCEPT, QUESTION_IMAGE_BUCKET, questionImagePath, validateQuestionImage } from "@/lib/question-images";

export function QuestionImageField({ path, legacyUrl, onChange, onBusyChange, disabled }: {
  path: string; legacyUrl: string;
  onChange: (path: string) => void;
  onBusyChange: (busy: boolean) => void;
  disabled: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const labelId = useId();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const [error, setError] = useState("");
  const hasImage = Boolean(path || legacyUrl);
  const upload = async (file: File) => {
    if (disabled || lock.current) return;
    const invalid = validateQuestionImage(file);
    setError(invalid ?? "");
    if (invalid) return;
    lock.current = true;
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setUploading(true);
    onBusyChange(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Entre novamente como professor para adicionar a imagem.");
      const newPath = questionImagePath(auth.user.id, file.name, crypto.randomUUID());
      const { error: uploadError } = await supabase.storage.from(QUESTION_IMAGE_BUCKET).upload(newPath, file, {
        contentType: file.type, upsert: false, cacheControl: "3600",
      });
      if (uploadError) throw new Error("Não foi possível enviar a imagem. Tente novamente. A imagem anterior foi mantida.");
      onChange(newPath);
      toast.success("Imagem inserida. Salve a atividade para confirmar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setLocalPreview("");
      URL.revokeObjectURL(preview);
      setUploading(false);
      lock.current = false;
      onBusyChange(false);
    }
  };
  return (
    <section aria-labelledby={labelId} tabIndex={0} className="space-y-3 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
      onPaste={(event) => {
        const file = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"))?.getAsFile();
        if (file) { event.preventDefault(); void upload(file); }
      }}
      onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) void upload(file); }}>
      <h3 id={labelId} className="text-base font-semibold">Inserir imagem na questão (opcional)</h3>
      <input ref={input} type="file" accept={QUESTION_IMAGE_ACCEPT} className="hidden" aria-label="Selecionar imagem da questão"
        disabled={disabled || uploading} onChange={(event) => {
          const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (file) void upload(file);
        }} />
      {localPreview ? <img src={localPreview} alt="Imagem da questão" className="w-full max-h-[60vh] object-contain rounded-lg" />
        : hasImage ? <QuestionImage path={path} legacyUrl={legacyUrl} large />
        : <Button type="button" variant="outline" disabled={disabled || uploading} onClick={() => input.current?.click()}
          className={`w-full min-h-48 h-auto py-10 flex-col whitespace-normal border-2 border-dashed ${dragging ? "border-brand bg-brand/10" : "border-ink/25 bg-ink/5"}`}>
          <ImagePlus className="!size-10 text-brand" /><span className="text-lg">Inserir imagem</span>
        </Button>}
      <div className="flex flex-wrap gap-2">
        {(hasImage || uploading) && <Button type="button" variant="outline" disabled={disabled || uploading} onClick={() => input.current?.click()}>
          {uploading ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <RefreshCw />}{uploading ? "Enviando…" : "Trocar imagem"}
        </Button>}
        {hasImage && <Button type="button" variant="ghost" className="text-danger" disabled={disabled || uploading}
          onClick={() => { onChange(""); setError(""); }}><Trash2 />Remover imagem</Button>}
      </div>
      <p className="text-xs text-ash">JPG, JPEG, PNG, WEBP ou GIF · até 5 MB</p>
      {error && <p role="alert" className="text-sm text-danger break-words">{error}</p>}
    </section>
  );
}