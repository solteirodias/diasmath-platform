import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { QuestionImage } from "@/components/QuestionImage";
import { Logo } from "@/components/Brand";
import { ParticipantAvatar } from "@/components/ParticipantAvatar";
import { LETTERS, pct, secondsLeft, type GameQuestion } from "@/lib/game";

export const Route = createFileRoute("/_authenticated/sessao/$gameId")({
  head: () => ({
    meta: [
      { title: "Sessão ao vivo — DIASMATH Sprint" },
      { name: "description", content: "Conduza a sessão ao vivo com sua turma." },
      { property: "og:title", content: "Sessão ao vivo — DIASMATH Sprint" },
      { property: "og:description", content: "Lobby, questões sincronizadas e resultados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Host,
});

type Player = { id: string; nickname: string; score: number; avatar_id: string | null };
type Ans = { choice: number; question_id: string; player_id: string; is_correct: boolean; points: number };
type QRow = { id: string; text: string; options: string[]; correct: number; skill: string };

function Host() {
  const { gameId } = Route.useParams();
  const [q, setQ] = useState<GameQuestion | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [answers, setAnswers] = useState<Ans[]>([]);
  const [questions, setQuestions] = useState<QRow[]>([]);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    const [{ data: gq }, { data: ps }, { data: an }] = await Promise.all([
      supabase.rpc("get_game_question", { _game_id: gameId }),
      supabase.from("players").select("id, nickname, score, avatar_id").eq("game_id", gameId).order("score", { ascending: false }),
      supabase.from("answers").select("choice, question_id, player_id, is_correct, points").eq("game_id", gameId),
    ]);
    setQ(gq as unknown as GameQuestion);
    setPlayers(ps ?? []);
    setAnswers(an ?? []);
  }, [gameId]);

  useEffect(() => {
    load();
    const ch = supabase.channel(`host-${gameId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `game_id=eq.${gameId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "answers", filter: `game_id=eq.${gameId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` }, load)
      .subscribe();
    const t = setInterval(() => setNow(Date.now()), 500);
    const poll = setInterval(load, 4000);
    return () => { supabase.removeChannel(ch); clearInterval(t); clearInterval(poll); };
  }, [gameId, load]);

  useEffect(() => {
    if (q?.status !== "finished") return;
    (async () => {
      const { data: g } = await supabase.from("games").select("quiz_id").eq("id", gameId).single();
      if (!g) return;
      const { data } = await supabase.from("questions").select("id, text, options, correct, skill").eq("quiz_id", g.quiz_id).order("position");
      setQuestions(data ?? []);
    })();
  }, [q?.status, gameId]);

  const left = secondsLeft(q?.started_at, q?.time_limit, now);
  const current = answers.filter((a) => a.question_id === q?.question_id);

  const setGame = (patch: { status: string; current_index?: number; question_started_at?: string; finished_at?: string }) =>
    supabase.from("games").update(patch).eq("id", gameId).then(load);
  const finish = () => setGame({ status: "finished", finished_at: new Date().toISOString() });
  const next = () => {
    if (!q) return;
    if (q.index + 1 >= q.total) finish();
    else setGame({ status: "question", current_index: q.index + 1, question_started_at: new Date().toISOString() });
  };

  useEffect(() => {
    if (q?.status === "question" && (left === 0 || (players.length > 0 && current.length >= players.length)))
      setGame({ status: "reveal" });
  }, [left, current.length, players.length, q?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!q) return <div className="p-10">Carregando…</div>;
  const link = typeof window !== "undefined" ? `${window.location.origin}/arena/${q.pin}` : "";

  return (
    <div className="min-h-screen bg-ink text-paper grid-paper">
      <div className="flex flex-wrap gap-3 items-center justify-between px-4 py-4 min-h-20 border-b border-paper/10">
        <Link to="/painel"><Logo /></Link>
        <div className="flex items-center gap-6">
          <span className="text-sm text-ash">Código <span className="font-mono text-3xl text-brand tracking-[0.2em] ml-2">{q.pin}</span></span>
          {q.status !== "finished" && <button onClick={() => confirm("Finalizar a sessão agora?") && finish()} className="text-sm text-danger hover:underline">Finalizar sessão</button>}
        </div>
      </div>

      {q.status === "lobby" && (
        <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[auto_1fr] gap-12 items-start">
          <div className="bg-paper text-ink rounded-3xl p-6 text-center min-w-0">
            <QRCodeSVG value={link} size={260} className="max-w-full h-auto mx-auto" />
            <div className="font-mono text-6xl font-bold tracking-[0.15em] mt-6">{q.pin}</div>
            <button onClick={() => navigator.clipboard.writeText(link)} className="mt-3 text-sm underline break-all">{link} (copiar)</button>
          </div>
          <div>
            <p className="text-brand uppercase tracking-widest text-sm font-semibold">{q.title}</p>
            <h1 className="font-display text-5xl mt-2">Sala de espera</h1>
            <p className="text-ash mt-2">Escaneie o QR Code ou acesse <b className="text-paper">{typeof window !== "undefined" ? window.location.host : ""}/arena</b> e digite o código.</p>
            <p className="mt-8 font-mono text-xl">{players.length} participante(s)</p>
            <div className="flex flex-wrap gap-3 my-6">
              {players.map((p) => <div key={p.id} className="bg-panel border border-paper/10 rounded-lg px-3 py-2 flex items-center gap-3 max-w-full"><ParticipantAvatar avatarId={p.avatar_id} className="size-14" /><span className="font-semibold break-words min-w-0">{p.nickname}</span></div>)}
            </div>
            <button onClick={next} disabled={!players.length} className="btn-skew btn-brand px-10 py-5 text-xl"><span>Começar ▶</span></button>
          </div>
        </div>
      )}

      {(q.status === "question" || q.status === "reveal") && (
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-6 text-ash font-mono">
            <span>Questão {q.index + 1}/{q.total}</span>
            <span>{current.length}/{players.length} respostas recebidas</span>
            <span className="text-5xl text-sun">{q.status === "question" ? `${left}s` : "✓"}</span>
          </div>
          {q.text && <h1 className="font-display text-3xl md:text-5xl text-center mb-6">{q.text}</h1>}
          <div className="mb-8"><QuestionImage path={q.image_path} legacyUrl={q.image_url} large /></div>
          <div className="grid md:grid-cols-2 gap-4">
            {q.options?.map((o, k) => {
              const n = current.filter((a) => a.choice === k).length;
              const isRight = q.status === "reveal" && q.correct === k;
              return (
                <div key={k} className={`rounded-2xl p-5 flex items-center gap-4 text-2xl font-semibold border-2 ${isRight ? "border-success bg-success/15" : "border-paper/15 bg-panel"} ${q.status === "reveal" && !isRight ? "opacity-50" : ""}`}>
                  <span className="font-mono size-12 rounded-xl bg-paper/10 grid place-items-center">{LETTERS[k]}</span>
                  <span className="flex-1">{q.kind === "image" ? `Alternativa ${o}` : o}</span>
                  {isRight && <span className="text-success text-base">✓ Correta</span>}
                  {q.status === "reveal" && <span className="font-mono">{n}</span>}
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-end gap-4">
            {q.status === "question" && <button onClick={() => setGame({ status: "reveal" })} className="btn-skew btn-outline"><span>Encerrar tempo</span></button>}
            {q.status === "reveal" && <button onClick={next} className="btn-skew btn-brand px-10 py-5 text-xl"><span>{q.index + 1 >= q.total ? "Ver resultado" : "Próxima ▶"}</span></button>}
          </div>
          {q.status === "reveal" && q.scoring && <div className="mt-8"><Ranking players={players.slice(0, 5)} /></div>}
        </div>
      )}

      {q.status === "finished" && <Report q={q} players={players} answers={answers} questions={questions} />}
    </div>
  );
}

function Report({ q, players, answers, questions }: { q: GameQuestion; players: Player[]; answers: Ans[]; questions: QRow[] }) {
  const correct = answers.filter((a) => a.is_correct).length;
  const possible = players.length * questions.length;
  const perQ = questions.map((qq) => {
    const as = answers.filter((a) => a.question_id === qq.id);
    return { ...qq, n: as.length, ok: as.filter((a) => a.is_correct).length };
  });
  const hardest = [...perQ].sort((a, b) => pct(a.ok, players.length) - pct(b.ok, players.length)).slice(0, 3);
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      <div>
        <p className="text-brand uppercase tracking-widest text-sm font-semibold">{q.title}</p>
        <h1 className="font-display text-5xl mt-2">Resultado da sessão</h1>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {[["Participantes", players.length], ["Acerto geral", `${pct(correct, possible)}%`], ["Questões", questions.length]].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-panel p-6"><div className="text-ash text-sm">{l}</div><div className="font-mono text-4xl mt-2">{v}</div></div>
        ))}
      </div>
      {q.scoring && <Ranking players={players} />}
      <section>
        <h2 className="font-display text-2xl mb-4">Desempenho por questão</h2>
        <div className="space-y-3">
          {perQ.map((qq, i) => {
            const p = pct(qq.ok, players.length);
            return (
              <div key={qq.id} className="rounded-xl bg-panel p-4">
                <div className="flex justify-between gap-4"><span><b>{i + 1}.</b> {qq.text}{qq.skill && <span className="text-ash text-sm"> · {qq.skill}</span>}</span><span className="font-mono">{p}% ({qq.ok}/{players.length})</span></div>
                <div className="h-2 bg-paper/10 rounded mt-2"><div className="h-2 rounded bg-brand" style={{ width: `${p}%` }} /></div>
              </div>
            );
          })}
        </div>
        {hardest.length > 0 && <p className="text-ash mt-4">Maior dificuldade: {hardest.map((h) => `Q${perQ.indexOf(h) + 1}${h.skill ? ` (${h.skill})` : ""}`).join(", ")}</p>}
      </section>
      <section className="overflow-x-auto">
        <h2 className="font-display text-2xl mb-4">Respostas por aluno</h2>
        <table className="w-full text-left font-mono text-sm">
          <thead><tr className="text-ash"><th className="p-2">Aluno</th>{questions.map((_, i) => <th key={i} className="p-2">Q{i + 1}</th>)}<th className="p-2">Acertos</th></tr></thead>
          <tbody>
            {players.map((p) => {
              const mine = answers.filter((a) => a.player_id === p.id);
              return (
                <tr key={p.id} className="border-t border-paper/10">
                  <td className="p-2 font-sans font-semibold"><span className="flex items-center gap-2"><ParticipantAvatar avatarId={p.avatar_id} className="size-10" />{p.nickname}</span></td>
                  {questions.map((qq) => {
                    const a = mine.find((x) => x.question_id === qq.id);
                    return <td key={qq.id} className={`p-2 ${a ? (a.is_correct ? "text-success" : "text-danger") : "text-ash"}`}>{a ? `${LETTERS[a.choice]} ${a.is_correct ? "✓" : "✗"}` : "—"}</td>;
                  })}
                  <td className="p-2">{mine.filter((a) => a.is_correct).length}/{questions.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <Link to="/painel" className="btn-skew btn-brand"><span>Voltar às atividades</span></Link>
    </div>
  );
}

function Ranking({ players }: { players: Player[] }) {
  return (
    <div className="rounded-2xl bg-panel overflow-hidden">
      <div className="p-4 font-display text-xl border-b border-paper/10">Ranking</div>
      {players.map((p, i) => (
        <div key={p.id} className="flex items-center gap-4 p-4 border-b border-paper/5">
          <span className={`font-mono text-xl w-8 ${i === 0 ? "text-sun" : "text-ash"}`}>{i + 1}º</span>
          <ParticipantAvatar avatarId={p.avatar_id} className="size-12" />
          <span className="flex-1 font-semibold min-w-0 break-words">{p.nickname}</span>
          <span className="font-mono">{p.score}</span>
        </div>
      ))}
    </div>
  );
}