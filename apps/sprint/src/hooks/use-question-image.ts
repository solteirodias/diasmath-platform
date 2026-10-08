import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QUESTION_IMAGE_BUCKET } from "@/lib/question-images";

export function useQuestionImage(
  path?: string | null,
  legacyUrl?: string | null,
  _playerId?: string,
  _questionId?: string,
) {
  const [result, setResult] = useState<{ path: string; url: string; error: string }>({
    path: "",
    url: "",
    error: "",
  });

  useEffect(() => {
    if (!path) return;
    const { data } = supabase.storage.from(QUESTION_IMAGE_BUCKET).getPublicUrl(path);
    setResult({
      path,
      url: data.publicUrl || "",
      error: data.publicUrl ? "" : "Não foi possível carregar a imagem.",
    });
  }, [path]);

  if (!path) return { url: legacyUrl ?? "", error: "" };
  return result.path === path ? result : { url: "", error: "" };
}