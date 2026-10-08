import { createFileRoute, Link, useBlocker } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/Brand";
import { DEFAULT_QUESTION_TIME, LETTERS, normalizeQuestionTime, QUESTION_TIMES, TF_OPTIONS, type QuestionKind } from "@/lib/game";
import { QuestionImageField } from "@/components/QuestionImageField";
import { validateQuestionContent } from "@/lib/question-images";
import { Button } from "@/components/ui/button";
import { persistActivity, prepareQuestionRows, saveErrorMessage } from "@/lib/activity-save";

export const Route = createFileRoute("/_authenticated/atividade/$id")({
  head: () => ({
    meta: [
      { title: "Editar atividade — DIASMATH Sprint · Professor" },
      { name: "description", content: "Monte as questões da sua atividade de Matemática." },
      { property: "og:title", content: "Criador de atividades — DIASMATH Sprint · Professor" },
      { property: "og:description", content: "Múltipla escolha, verdadeiro/falso, tempo e pontuação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Editor,
});

type Q = { id?: string; kind: QuestionKind; text: string; options: string[]; correct: number; time_limit: number; image_url: string; image_path: string; skill: string };

const blank = (): Q => ({ kind: "multiple", text: "", options: ["", "", "", ""], correct: 0, time_limit: DEFAULT_QUESTION_TIME, image_url: "", image_path: "", skill: "" });

function Editor() {
  const { id } = Route.useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [scoring, setScoring] = useState(true);
  const [qs, setQs] = useState<Q[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loadError, setLoadError] = useState("");
  const saveLock = useRef(false);
  const qc = useQueryClient();
  const snapshot = JSON.stringify({ title, description, subject, scoring, qs });
  const dirty = !loading && Boolean(savedSnapshot) && snapshot !== savedSnapshot;
  useBlocker({
    shouldBlockFn: () => (saving || imageBusy) || (dirty && !window.confirm("Há alterações não salvas. Sair sem salvar?")),
    enableBeforeUnload: dirty || saving || imageBusy,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
      const { data: quiz, error: quizError } = await supabase.from("quizzes").select("*").eq("id", id).single();
      if (quizError || !quiz) throw new Error(`Não foi possível carregar a atividade: ${saveErrorMessage(quizError)}`);
      const { data: questions, error: questionError } = await supabase.from("questions").select("*").eq("quiz_id", id).order("position").order("created_at");
      if (questionError) throw questionError;
      setTitle(quiz?.title ?? "");
      setDescription(quiz?.description ?? "");
      setSubject(quiz?.subject ?? "");
      setScoring(quiz?.scoring_enabled ?? true);
      const loaded = (questions ?? []).map((q) => ({
        id: q.id, kind: (q.kind as QuestionKind) ?? "multiple", text: q.text, options: q.options, correct: q.correct,
        time_limit: normalizeQuestionTime(q.time_limit), image_url: q.image_url ?? "", image_path: q.image_path ?? "", skill: q.skill ?? "",
      }));
      setQs(loaded);
      setRemoved([]);
      setSavedSnapshot(JSON.stringify({ title: quiz.title, description: quiz.description, subject: quiz.subject, scoring: quiz.scoring_enabled, qs: loaded }));
      } catch (error) {
        setLoadError(saveErrorMessage(error));
      } finally {
      setLoading(false);
      }
    })();
  }, [id]);

  const update = (i: number, patch: Partial<Q>) => setQs((p) => p.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const setKind = (i: number, kind: QuestionKind) =>
    update(i, kind === "truefalse" ? { kind, options: [...TF_OPTIONS], correct: 0 } : kind === "image" ? { kind, options: ["A", "B", "C", "D"], correct: 0 } : { kind, options: ["", "", "", ""], correct: 0 });
  const del = (i: number) => {
    const q = qs[i];
    const questionId = q?.id;
    if (questionId) setRemoved((r) => [...r, questionId]);
    setQs((p) => p.filter((_, j) => j !== i));
  };
  const move = (i: number, d: number) => setQs((p) => {
    const j = i + d; if (j < 0 || j >= p.length) return p;
    const from = p[i]; const to = p[j];
    if (!from || !to) return p;
    const c = [...p]; c[i] = to; c[j] = from; return c;
  });

  const save = async () => {
    const fail = (message: string) => { setFeedback(message); toast.error(message); };
    if (imageBusy) { fail("Aguarde o envio da imagem antes de salvar."); return; }
    if (saveLock.current) return;
    if (!title.trim()) { fail("Informe o título da atividade."); return; }
    const bad = qs.findIndex((q) => validateQuestionContent(q));
    const invalidQuestion = qs[bad];
    if (invalidQuestion) { fail(`Questão ${bad + 1}: ${validateQuestionContent(invalidQuestion)}`); return; }
    saveLock.current = true;
    setSaving(true);
    setFeedback("Salvando...");
    try {
      const rows = prepareQuestionRows(id, qs.map((q) => ({
        ...(q.id ? { id: q.id } : {}), quiz_id: id, kind: q.kind, text: q.text, options: q.options,
        correct: q.correct, time_limit: q.time_limit, image_url: q.image_url.trim() || null, image_path: q.image_path || null, skill: q.skill,
      })));
      // Retain generated IDs even after a failed request, so retries cannot create duplicate questions.
      const savedQs = qs.map((q, i) => {
        const row = rows[i];
        return row ? { ...q, id: row.id } : q;
      });
      setQs(savedQs);
      await persistActivity(id, { title, description, subject, scoring_enabled: scoring }, rows, removed);
      setRemoved([]);
      setSavedSnapshot(JSON.stringify({ title, description, subject, scoring, qs: savedQs }));
      void qc.invalidateQueries({ queryKey: ["quizzes"] });
      setFeedback("Atividade salva!");
      toast.success("Atividade salva!");
    } catch (err) {
      fail(saveErrorMessage(err));
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Carregando…</div>;
  if (loadError) return <div className="p-10 space-y-4"><p role="alert">{loadError}</p><Link to="/painel">Voltar ao painel</Link></div>;

  return (
    <div className="min-h-screen pb-24 bg-paper grid-paper-light">
      <TopBar sub="Professor">
        <Link to="/painel" className="text-sm font-medium text-ash hover:text-paper">← Minhas atividades</Link>
        <Button onClick={save} disabled={saving || imageBusy} className="btn-skew btn-brand"><span>{saving ? "Salvando..." : imageBusy ? "Enviando imagem..." : "Salvar"}</span></Button>
      </TopBar>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {feedback && <p role="status" aria-live="polite" className="font-semibold">{feedback}</p>}
        <div className="rounded-2xl bg-paper border-2 border-ink/10 p-6 space-y-4 shadow-sm">
          <label className="block text-xs font-semibold uppercase tracking-widest text-ash">Título</label>
          <input disabled={saving} className="w-full bg-transparent font-display text-3xl md:text-4xl outline-none border-b-2 border-ink/20 focus:border-brand pb-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Equações do 1º grau" />
          <label className="block text-xs font-semibold uppercase tracking-widest text-ash pt-2">Descrição (opcional)</label>
          <textarea className="field min-h-16" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Objetivo da atividade, turma, observações…" />
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ash mb-2">Conteúdo / turma</label>
              <input className="field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex.: Álgebra · 8º ano" />
            </div>
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-ink/10 cursor-pointer">
              <input type="checkbox" checked={scoring} onChange={(e) => setScoring(e.target.checked)} className="size-5 accent-[var(--brand)]" />
              <span><b>Pontuação e ranking</b><br /><span className="text-sm text-ash">{scoring ? "1000 por acerto + até 300 por rapidez" : "Modo Aprendizagem: sem pontos nem ranking"}</span></span>
            </label>
          </div>
        </div>

        {qs.map((q, i) => (
          <div key={q.id ?? `n${i}`} className="rounded-2xl bg-paper border-2 border-ink/10 overflow-hidden shadow-sm">
            <div className="bg-ink text-paper px-5 py-3 flex flex-wrap items-center justify-between gap-3">
              <span className="font-display text-lg">Questão {i + 1}</span>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <select value={q.kind} onChange={(e) => setKind(i, e.target.value as QuestionKind)} className="bg-panel rounded-md px-2 py-1">
                  <option value="multiple">Múltipla escolha</option>
                  <option value="truefalse">Verdadeiro ou falso</option>
                  <option value="image">Questão em imagem</option>
                </select>
                <label className="flex items-center gap-2">⏱
                  <select value={q.time_limit} onChange={(e) => update(i, { time_limit: Number(e.target.value) })} className="bg-panel rounded-md px-2 py-1">
                    {QUESTION_TIMES.map((t) => <option key={t} value={t}>{t === 30 ? "30 s" : `${t / 60} min`}</option>)}
                  </select>
                </label>
                <Button variant="ghost" size="icon" disabled={imageBusy || saving} onClick={() => move(i, -1)} aria-label="Mover para cima" className="px-2 hover:text-brand">↑</Button>
                <Button variant="ghost" size="icon" disabled={imageBusy || saving} onClick={() => move(i, 1)} aria-label="Mover para baixo" className="px-2 hover:text-brand">↓</Button>
                <Button variant="ghost" disabled={imageBusy || saving} onClick={() => del(i)} className="text-danger hover:underline">Remover</Button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <textarea className="field min-h-20 text-lg" value={q.text} onChange={(e) => update(i, { text: e.target.value })} aria-label="Enunciado da questão" placeholder="Enunciado (opcional quando houver imagem)" />
              <QuestionImageField path={q.image_path} legacyUrl={q.image_url} onChange={(image_path) => update(i, { image_path, image_url: "" })}
                disabled={saving || imageBusy} onBusyChange={setImageBusy} />
              <input className="field" value={q.skill} onChange={(e) => update(i, { skill: e.target.value })} placeholder="Habilidade (opcional, ex.: EF08MA06)" />
              {q.kind === "image" && <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-semibold">Alternativas na imagem
                  <select aria-label="Quantidade de alternativas na imagem" className="field mt-2" value={q.options.length} onChange={(e) => {
                    const count = Number(e.target.value); update(i, { options: LETTERS.slice(0, count), correct: Math.min(q.correct, count - 1) });
                  }}>{[2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}</select>
                </label>
                <span className="text-sm text-ash">Resposta correta</span>
              </div>}
              <div className="grid sm:grid-cols-2 gap-3">
                {q.options.map((o, k) => (
                  <div key={k} className={`flex items-stretch rounded-xl border-2 overflow-hidden ${q.correct === k ? "border-success" : "border-ink/15"}`}>
                    <span className="w-11 grid place-items-center font-mono font-bold bg-ink/5">{LETTERS[k]}</span>
                    <input className="flex-1 px-3 py-3 bg-paper outline-none min-w-0" value={o} placeholder={`Alternativa ${LETTERS[k]}`}
                      readOnly={q.kind === "truefalse" || q.kind === "image"}
                      onChange={(e) => update(i, { options: q.options.map((x, m) => (m === k ? e.target.value : x)) })} />
                    <button type="button" onClick={() => update(i, { correct: k })} aria-pressed={q.correct === k}
                      className={`px-3 text-sm font-semibold ${q.correct === k ? "bg-success text-ink" : "text-ash hover:text-ink"}`}>
                      {q.correct === k ? "✓ Correta" : "Correta?"}
                    </button>
                    {q.kind === "multiple" && q.options.length > 2 && (
                      <button type="button" aria-label="Remover alternativa" className="px-2 text-ash hover:text-danger"
                        onClick={() => update(i, { options: q.options.filter((_, m) => m !== k), correct: q.correct === k ? 0 : q.correct > k ? q.correct - 1 : q.correct })}>×</button>
                    )}
                  </div>
                ))}
              </div>
              {q.kind === "multiple" && q.options.length < 5 && (
                <button onClick={() => update(i, { options: [...q.options, ""] })} className="text-sm font-semibold text-ink/70 hover:text-ink">+ Alternativa</button>
              )}
            </div>
          </div>
        ))}

        <button onClick={() => setQs((p) => [...p, blank()])} className="w-full rounded-2xl border-2 border-dashed border-ink/30 py-8 font-display text-xl hover:bg-ink hover:text-paper transition-colors">+ Adicionar questão</button>
      </div>
    </div>
  );
}