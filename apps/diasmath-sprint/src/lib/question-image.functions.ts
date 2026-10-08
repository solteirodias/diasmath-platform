import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

// Player UUID is the existing session capability; never accept a storage path from guests.
export const getStudentQuestionImage = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ playerId: z.string().uuid(), questionId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) throw new Error("Imagem indisponível. Tente novamente.");
    const publicClient = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: path, error } = await publicClient.rpc("authorize_question_image", {
      _player_id: data.playerId, _question_id: data.questionId,
    });
    if (error || !path) throw new Error("Imagem indisponível nesta sessão.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signError } = await supabaseAdmin.storage.from("question-images").createSignedUrl(path, 600);
    if (signError || !signed) throw new Error("Não foi possível carregar a imagem.");
    return { url: signed.signedUrl };
  });