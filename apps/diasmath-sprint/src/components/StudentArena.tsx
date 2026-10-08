import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuestionImage } from "@/components/QuestionImage";
import { Logo } from "@/components/Brand";
import { AvatarSelector } from "@/components/AvatarSelector";
import { ParticipantAvatar } from "@/components/ParticipantAvatar";
import { Button } from "@/components/ui/button";
import { isAvatarId, type AvatarId } from "@/lib/avatars";
import { ArrowRight } from "lucide-react";
import { LETTERS, secondsLeft, type GameQuestion } from "@/lib/game";

type Status = { nickname: string; avatar_id?: string | null; score: number; rank: number; answered: boolean; last_correct: boolean | null; last_points: number | null };

export function StudentArena({ initialCode = "" }: { initialCode?: string }) {
  const [pin, setPin] = useState(initialCode);
  const [nick, setNick] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [session, setSession] = useState<{ game_id: string; player_id: string } | null>(null);
  const [q, setQ] = useState<GameQuestion | null>(null);
  const [st, setSt] = useState<Status | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const saved = sessionStorage.getItem("dm-arena");
    if (saved) setSession(JSON.parse(saved));
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    if (!session) return;
    const [{ data: gq }, { data: ps }] = await Promise.all([
      supabase.rpc("get_game_question", { _game_id: session.game_id }),
      supabase.rpc("player_status", { _player_id: session.player_id }),
    ]);
    if (!ps) { sessionStorage.removeItem("dm-arena"); setSession(null); return; }
    setQ(gq as unknown as GameQuestion);
    setSt(ps as unknown as Status);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    load();
    const ch = supabase.channel(`arena-${session.player_id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${session.game_id}` }, load)
      .subscribe();
    const poll = setInterval(load, 4000);
    return () => { supabase.removeChannel(ch); clearInterval(poll); };
  }, [session, load]);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joining) return;
    if (!isAvatarId(avatarId)) { setJoinError("Escolha seu personagem para entrar na atividade."); return; }
    if (pin.length !== 6) { setJoinError("O código tem 6 dígitos."); return; }
    if (!nick.trim()) { setJoinError("Informe seu nome para entrar."); return; }
    setJoinError(""); setJoining(true);
    try {
      const { data, error } = await supabase.rpc("join_game", { _pin: pin, _nickname: nick.trim(), _avatar_id: avatarId });
      if (error) throw error;
      if (!data) throw new Error("Não foi possível entrar. Tente novamente.");
      const s = data as unknown as { game_id: string; player_id: string };
      sessionStorage.setItem("dm-arena", JSON.stringify(s));
      setSession(s);
    } catch (error) { setJoinError(error instanceof Error ? error.message : (error as { message?: string })?.message ?? "Não foi possível entrar. Tente novamente."); }
    finally { setJoining(false); }
  };

  const answer = async (k: number) => {
    if (!session) return;
    const { error } = await supabase.rpc("submit_answer", { _player_id: session.player_id, _choice: k });
    if (error) toast.error(error.message);
    load();
  };

  const leave = () => { sessionStorage.removeItem("dm-arena"); setSession(null); setQ(null); setSt(null); };

  if (!session) {
    return (
      <div className="participant-entry">
        <div className="participant-entry-brand"><Logo /></div>
        <form onSubmit={join} className="participant-entry-form">
          <div className="participant-entry-fields">
            <div><label htmlFor="participant-name" className="participant-entry-label">Seu nome</label>
              <input id="participant-name" value={nick} onChange={(e) => setNick(e.target.value.slice(0, 24))} required maxLength={24} autoComplete="given-name" placeholder="Como você quer ser chamado?" className="participant-entry-input" /></div>
            {!initialCode && <div><label htmlFor="participant-pin" className="participant-entry-label">Código da sessão</label>
              <input id="participant-pin" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="000000" maxLength={6} className="participant-entry-input font-mono text-center text-2xl" /></div>}
            {initialCode && <div className="participant-code"><span>Código da sessão</span><strong>{pin}</strong></div>}
          </div>
          <section className="character-selection">
            <h1>Escolha seu personagem</h1>
            <p>Selecione um avatar para entrar na atividade</p>
            <AvatarSelector value={avatarId} onChange={(id) => { setAvatarId(id); setJoinError(""); }} />
          </section>
          {joinError && <p role="alert" className="participant-entry-error">{joinError}</p>}
          <Button type="submit" disabled={joining} className="participant-entry-submit">{joining ? "Entrando…" : "Entrar"}<ArrowRight aria-hidden="true" /></Button>
        </form>
      </div>
    );
  }

  if (!q || !st) return <div className="min-h-screen bg-ink text-paper grid place-items-center">Conectando…</div>;
  const left = secondsLeft(q.started_at, q.time_limit, now);

  return (
    <div className="min-h-screen bg-ink text-paper grid-paper flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-paper/10">
        <span className="flex items-center gap-2 min-w-0"><ParticipantAvatar avatarId={st.avatar_id} className="size-10" /><span className="font-semibold break-words">{st.nickname}</span></span>
        {q.status === "question" && <span className="font-mono text-sun">{left}s</span>}
        {q.scoring && <span className="font-mono text-brand">{st.score} pts</span>}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        {q.status === "lobby" && <><ParticipantAvatar avatarId={st.avatar_id} className="size-36 mb-4" /><div className="font-display text-3xl mb-3">Você está na sala!</div><p className="text-ash">Aguarde o professor começar…</p></>}
        {q.status === "question" && !st.answered && (
          <div className="w-full max-w-lg flex-1 flex flex-col gap-3">
            <p className="font-mono text-xs text-ash">Questão {q.index + 1}/{q.total}</p>
            {q.text && <p className="text-xl font-semibold">{q.text}</p>}
            <QuestionImage path={q.image_path} legacyUrl={q.image_url} playerId={session.player_id} questionId={q.question_id} />
            <div className="grid gap-3 mt-2">
              {q.options?.map((o, k) => (
                <button key={k} onClick={() => answer(k)} className="rounded-2xl bg-panel border-2 border-paper/15 active:border-brand p-4 flex items-center gap-4 text-left text-lg font-semibold min-h-16">
                  <span className="font-mono size-10 shrink-0 rounded-xl bg-brand text-ink grid place-items-center">{LETTERS[k]}</span>
                  <span>{q.kind === "image" ? `Alternativa ${o}` : o}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {q.status === "question" && st.answered && <div><div className="font-display text-3xl">Resposta enviada ✓</div><p className="text-ash mt-2">Aguarde a correção…</p></div>}
        {q.status === "reveal" && (
          <div className={`p-8 w-full max-w-sm rounded-3xl border-2 ${st.last_correct ? "border-success bg-success/15" : "border-danger bg-danger/15"}`}>
            <ParticipantAvatar avatarId={st.avatar_id} className="size-20 mx-auto mb-2" />
            <div className="text-5xl">{st.last_correct ? "✓" : "✗"}</div>
            <div className="font-display text-3xl mt-2">{st.last_correct ? "Acertou!" : st.answered ? "Não foi dessa vez" : "Sem resposta"}</div>
            {q.scoring && <p className="mt-3 text-lg font-mono">+{st.last_points ?? 0} pts · {st.rank}º lugar</p>}
          </div>
        )}
        {q.status === "finished" && (
          <div>
            <ParticipantAvatar avatarId={st.avatar_id} className="size-32 mx-auto mb-4" />
            <div className="font-display text-3xl">Sessão encerrada</div>
            {q.scoring && <><div className="font-mono text-6xl text-sun mt-4">{st.rank}º</div><p className="text-xl mt-2">{st.score} pontos</p></>}
            <button onClick={leave} className="btn-skew btn-brand mt-8"><span>Entrar em outra sessão</span></button>
          </div>
        )}
      </div>
    </div>
  );
}