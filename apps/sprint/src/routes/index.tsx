import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, LogoMark, TopBar } from "@/components/Brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DIASMATH Sprint — Aulas de Matemática que aceleram o ritmo" },
      { name: "description", content: "Crie atividades de Matemática e jogue ao vivo com sua turma. Alunos entram com um PIN e competem no placar." },
      { property: "og:title", content: "DIASMATH Sprint — Aulas que aceleram o ritmo" },
      { property: "og:description", content: "Quizzes de Matemática ao vivo para professores e alunos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().length >= 4) navigate({ to: "/arena/$code", params: { code: pin.trim() } });
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <TopBar>
        <Link to="/painel" className="hidden sm:inline text-sm font-medium hover:text-brand">Sou professor</Link>
        <Link to="/painel" className="btn-skew btn-brand"><span>Criar atividade</span></Link>
      </TopBar>

      <header className="border-b-2 border-ink">
        <div className="max-w-[1440px] mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border-2 border-ink px-3 py-1 text-xs font-semibold uppercase tracking-widest -skew-x-12 mb-8">
              <span className="size-2 bg-brand inline-block" />Plataforma de aulas interativas
            </div>
            <LogoMark className="size-28 mb-6" />
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-none">
              DIASMATH<br /><span className="text-brand">Sprint</span>
            </h1>
            <p className="mt-6 text-lg text-ash max-w-md">
              Transforme suas atividades de Matemática em partidas ao vivo. O professor cria, a turma entra com um PIN e compete.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/painel" className="btn-skew btn-ink px-7 py-4"><span>Começar agora</span></Link>
            </div>
          </div>

          <form onSubmit={join} className="-skew-x-3">
            <div className="bg-ink text-paper p-8 skew-x-3">
              <div className="text-xs uppercase tracking-widest text-ash mb-4">Aluno? Entre no jogo</div>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="PIN do jogo"
                aria-label="PIN do jogo"
                className="w-full bg-paper/10 p-5 font-display text-4xl text-brand tracking-[0.3em] text-center outline-none placeholder:text-ash placeholder:text-2xl placeholder:tracking-normal"
              />
              <button type="submit" className="btn-skew btn-brand w-full mt-4 py-4 text-lg"><span>Entrar</span></button>
              <div className="mt-6 grid grid-cols-4 gap-2 font-display text-2xl text-center">
                <span className="bg-ans-1 py-2">+</span><span className="bg-ans-2 py-2">−</span>
                <span className="bg-ans-3 py-2 text-ink">×</span><span className="bg-ans-4 py-2">÷</span>
              </div>
            </div>
          </form>
        </div>
      </header>

      <section className="py-20 border-b-2 border-ink">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">3 PASSOS.<br />UMA SALA.</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-ash">01 — 03</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Step n="01" title="Crie a atividade" text="Monte perguntas com 4 alternativas e tempo por questão." className="bg-brand text-paper" />
            <Step n="02" title="Lance com PIN" text="Projete a tela. Os alunos entram pelo celular em segundos." className="bg-paper" muted />
            <Step n="03" title="Placar ao vivo" text="Resposta certa e rápida vale mais. Pódio no final." className="bg-ink text-paper" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand text-paper">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="font-display text-4xl md:text-6xl tracking-tight leading-none">COLOQUE A<br />TURMA EM CAMPO.</h2>
          <Link to="/painel" className="btn-skew btn-ink px-8 py-5"><span>Criar minha primeira atividade</span></Link>
        </div>
      </section>

      <footer className="bg-ink text-paper py-12">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <a href="https://www.diasmath.com.br/" className="text-sm text-ash hover:text-paper">diasmath.com.br</a>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, title, text, className, muted }: { n: string; title: string; text: string; className: string; muted?: boolean }) {
  return (
    <div className={`border-2 border-ink p-8 -skew-x-2 hover:skew-x-0 transition-transform ${className}`}>
      <div className="font-display text-6xl opacity-40">{n}</div>
      <h3 className="font-display text-2xl mt-4">{title}</h3>
      <p className={`mt-3 ${muted ? "text-ash" : "opacity-90"}`}>{text}</p>
    </div>
  );
}