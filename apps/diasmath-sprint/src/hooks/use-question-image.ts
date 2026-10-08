import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStudentQuestionImage } from "@/lib/question-image.functions";
import { QUESTION_IMAGE_BUCKET } from "@/lib/question-images";

export function useQuestionImage(path?: string | null, legacyUrl?: string | null, playerId?: string, questionId?: string) {
  const [result, setResult] = useState<{ path: string; url: string; error: string }>({ path: "", url: "", error: "" });
  useEffect(() => {
    if (!path) return;
    let active = true;
    const resolve = async () => {
      try {
        let url: string;
        if (playerId && questionId) {
          url = (await getStudentQuestionImage({ data: { playerId, questionId } })).url;
        } else {
          const { data, error } = await supabase.storage.from(QUESTION_IMAGE_BUCKET).createSignedUrl(path, 600);
          if (error || !data) throw new Error("Imagem indisponível.");
          url = data.signedUrl;
        }
        if (active) setResult({ path, url, error: "" });
      } catch {
        if (active) setResult({ path, url: "", error: "Não foi possível carregar a imagem. Tentando novamente…" });
      }
    };
    void resolve();
    const refresh = setInterval(resolve, 240000);
    const retry = setInterval(() => { if (document.visibilityState === "visible") void resolve(); }, 60000);
    return () => { active = false; clearInterval(refresh); clearInterval(retry); };
  }, [path, playerId, questionId]);
  if (!path) return { url: legacyUrl ?? "", error: "" };
  return result.path === path ? result : { url: "", error: "" };
}