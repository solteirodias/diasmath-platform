import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/Brand";
import { generatePin } from "@/lib/game";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Minhas atividades — DIASMATH Sprint · Professor" },
      { name: "description", content: "Crie, organize e aplique atividades de Matemática ao vivo." },
      { property: "og:title", content: "Minhas atividades — DIASMATH Sprint · Professor" },
      { property: "og:description", content: "Painel do professor no DIASMATH Sprint." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes").select("id, title, subject, description, scoring_enabled, updated_at, questions(count), games(count)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["quizzes"] });

  const create = async () => {
    const { data, error } = await supabase.from("quizzes").insert({ title: "Nova atividade", subject: "" }).select("id").single();
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/atividade/$id", params: { id: data.id } });
  };

  const duplicate = async (id: string) => {
    const { data: src } = await supabase.from("quizzes").select("*").eq("id", id).single();
    const { data: qs } = await supabase.from("questions").select("*").eq("quiz_id", id).order("position");
    if (!src) return;
    const { data: copy, error } = await supabase.from("quizzes")
      .insert({ title: `${src.title} (cópia)`, subject: src.subject, description: src.description, scoring_enabled: src.scoring_enabled })
      .select("id").single();
    if (error) { toast.error(error.message); return; }
    if (qs?.length) {
      const { error: e2 } = await supabase.from("questions").insert(qs.map((q) => ({
        quiz_id: copy.id, position: q.position, text: q.text, options: q.options, correct: q.correct,
        time_limit: q.time_limit, kind: q.kind, image_url: q.image_url, image_path: q.image_path, skill: q.skill,
      })));
      if (e2) { toast.error(e2.message); return; }
    }
    toast.success("Atividade duplicada");
    refresh();
  };

  const launch = async (quizId: string, count: number) => {
    if (!count) { toast.error("Adicione pelo menos uma questão antes de iniciar."); return; }
    for (let i = 0; i < 8; i++) {
      const { data, error } = await supabase.from("games").insert({ quiz_id: quizId, pin: generatePin() }).select("id").single();
      if (!error) { navigate({ to: "/sessao/$gameId", params: { gameId: data.id } }); return; }
      if (error.code !== "23505") { toast.error(error.message); return; }
    }
    toast.error("Não foi possível gerar um código. Tente novamente.");
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta atividade e todas as suas sessões e resultados?")) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) toast.error("Não foi possível excluir: " + error.message);
    else toast.success("Atividade excluída");
    refresh();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-ink text-paper grid-paper">
      <TopBar sub="Professor">
        <button onClick={logout} className="text-sm font-medium text-ash hover:text-paper">Sair</button>
        <Link to="/importar" className="btn-skew btn-outline"><span>Importar PDF/Word</span></Link>
        <button onClick={create} className="btn-skew btn-brand"><span>+ Criar atividade</span></button>
      </TopBar>
      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="text-xs uppercase tracking-[0.3em] text-brand mb-3 font-semibold">DIASMATH Sprint · Professor</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">Minhas atividades</h1>
        <p className="text-ash mt-2">Cada atividade pode ser aplicada em quantas sessões você quiser.</p>

        <div className="mt-10 grid gap-4">
          {isLoading && <div className="p-6 text-ash">Carregando…</div>}
          {!isLoading && quizzes.length === 0 && (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-paper/20">
              <p className="text-ash mb-6">Você ainda não tem atividades.</p>
              <button onClick={create} className="btn-skew btn-brand"><span>Criar minha primeira atividade</span></button>
            </div>
          )}
          {quizzes.map((q) => {
            const count = (q.questions as unknown as { count: number }[])?.[0]?.count ?? 0;
            const sessions = (q.games as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <div key={q.id} className="rounded-2xl bg-panel border border-paper/10 p-6 flex flex-wrap items-center gap-6">
                <div className="flex-1 min-w-[240px]">
                  <div className="font-display text-xl">{q.title}</div>
                  {q.description && <div className="text-sm text-ash mt-1 line-clamp-1">{q.description}</div>}
                  <div className="flex flex-wrap gap-2 mt-3 text-xs font-mono">
                    <span className="px-2 py-1 rounded-md bg-paper/10">{count} questões</span>
                    <span className="px-2 py-1 rounded-md bg-paper/10">{sessions} sessões</span>
                    {q.subject && <span className="px-2 py-1 rounded-md bg-paper/10">{q.subject}</span>}
                    <span className={`px-2 py-1 rounded-md ${q.scoring_enabled ? "bg-sun/20 text-sun" : "bg-brand/20 text-brand"}`}>
                      {q.scoring_enabled ? "Com ranking" : "Modo Aprendizagem"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link to="/atividade/$id" params={{ id: q.id }} className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-paper/10">Editar</Link>
                  <button onClick={() => duplicate(q.id)} className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-paper/10">Duplicar</button>
                  <button onClick={() => remove(q.id)} className="px-3 py-2 rounded-lg text-sm font-semibold text-danger hover:bg-danger/10">Excluir</button>
                  <button onClick={() => launch(q.id, count)} className="btn-skew btn-brand"><span>▶ Iniciar</span></button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}