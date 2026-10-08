import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export function saveErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Não foi possível salvar. Verifique sua conexão e tente novamente.";
}

export function prepareQuestionRows(quizId: string, questions: TablesInsert<"questions">[]) {
  // Every row must have an ID: mixed existing/new rows otherwise serialize missing IDs as NULL.
  return questions.map((q, position) => ({ ...q, id: q.id || crypto.randomUUID(), quiz_id: quizId, position }));
}

export async function persistActivity(
  id: string,
  quiz: { title: string; description: string; subject: string; scoring_enabled: boolean },
  rows: ReturnType<typeof prepareQuestionRows>,
  removed: string[],
) {
  const { data: updated, error: quizError } = await supabase.from("quizzes")
    .update({ ...quiz, updated_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
  if (quizError) throw new Error(`Não foi possível salvar a atividade: ${saveErrorMessage(quizError)}`);
  if (!updated) throw new Error("A atividade não foi encontrada ou sua sessão expirou. Entre novamente; suas alterações continuam nesta tela.");
  if (rows.length) {
    const { data: saved, error } = await supabase.from("questions").upsert(rows).select("id");
    if (error) throw new Error(`Não foi possível salvar as questões: ${saveErrorMessage(error)}`);
    if (saved?.length !== rows.length || rows.some((row) => !saved.some((q) => q.id === row.id))) {
      throw new Error("Nem todas as questões foram gravadas. Suas alterações foram mantidas; tente salvar novamente.");
    }
  }
  if (removed.length) {
    const { error } = await supabase.from("questions").delete().eq("quiz_id", id).in("id", removed);
    if (error) throw new Error(`Não foi possível remover as questões: ${saveErrorMessage(error)}`);
  }
}