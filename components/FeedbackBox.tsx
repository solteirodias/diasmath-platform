"use client";

import { FormEvent, useMemo, useState } from "react";

type FeedbackBoxProps = {
  appName: string;
  category?: string;
};

const whatsappNumber = "5589999877193";
const contactEmail = "contato@diasmath.com.br";

export function FeedbackBox({ appName, category = "DIASMATH" }: FeedbackBoxProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sentMode, setSentMode] = useState<"email" | "whatsapp" | null>(null);

  const cleanName = name.trim() || "Visitante";
  const cleanComment = comment.trim();

  const message = useMemo(
    () =>
      `Olá, DIASMATH! Tenho uma sugestão/comentário.\n\nApp: ${appName}\nCategoria: ${category}\nNome: ${cleanName}\nComentário: ${cleanComment}`,
    [appName, category, cleanName, cleanComment]
  );

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  function resetBox() {
    setName("");
    setComment("");
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    if (!cleanComment) {
      event.preventDefault();
      return;
    }

    setSentMode("email");

    window.setTimeout(() => {
      resetBox();
    }, 400);
  }

  function handleWhatsAppClick() {
    if (!cleanComment) return;

    setSentMode("whatsapp");

    window.setTimeout(() => {
      resetBox();
    }, 400);
  }

  if (sentMode) {
    return (
      <div className="fixed bottom-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
        <section className="rounded-3xl border border-green-200 bg-white p-5 text-slate-900 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-green-700">
                Obrigado!
              </p>
              <h2 className="mt-1 text-lg font-black leading-tight">
                {sentMode === "email"
                  ? "Comentário enviado com sucesso."
                  : "Comentário aberto no WhatsApp."}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setSentMode(null);
                setOpen(false);
              }}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600 transition hover:bg-slate-200"
              aria-label="Fechar mensagem"
            >
              ×
            </button>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {sentMode === "email"
              ? "A DIASMATH™ agradece sua contribuição. Sua sugestão ajuda a melhorar os jogos, laboratórios e atividades da plataforma."
              : "Agora é só confirmar o envio da mensagem no WhatsApp. A DIASMATH™ agradece sua contribuição."}
          </p>

          <button
            type="button"
            onClick={() => {
              setSentMode(null);
              setOpen(false);
            }}
            className="mt-4 w-full rounded-full bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-700"
          >
            Fechar
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto flex rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-blue-700"
        >
          💬 Comentar este app
        </button>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                Comentário DIASMATH™
              </p>
              <h2 className="mt-1 text-lg font-black leading-tight">
                O que você achou?
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600 transition hover:bg-slate-200"
              aria-label="Fechar comentários"
            >
              ×
            </button>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Envie sugestões, dificuldades, erros encontrados ou ideias do que você precisa para suas aulas.
          </p>

          <form
            action={`https://formsubmit.co/${contactEmail}`}
            method="POST"
            target="diasmath-feedback-frame"
            onSubmit={handleEmailSubmit}
          >
            <input type="hidden" name="_subject" value={`Comentário DIASMATH™ — ${appName}`} />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="App" value={appName} />
            <input type="hidden" name="Categoria" value={category} />

            <label className="mt-4 block">
              <span className="text-xs font-black uppercase text-slate-500">Seu nome</span>
              <input
                name="Nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Digite seu nome"
                className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="mt-3 block">
              <span className="text-xs font-black uppercase text-slate-500">Comentário</span>
              <textarea
                name="Comentário"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Escreva sua sugestão, dúvida ou necessidade..."
                rows={4}
                required
                className="mt-1 w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <a
                href={cleanComment ? whatsappHref : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!cleanComment}
                onClick={handleWhatsAppClick}
                className={`rounded-full px-4 py-3 text-center text-sm font-black transition ${cleanComment ? "bg-green-600 text-white hover:bg-green-700" : "pointer-events-none bg-slate-200 text-slate-500"}`}
              >
                Enviar WhatsApp
              </a>

              <button
                type="submit"
                disabled={!cleanComment}
                className={`rounded-full px-4 py-3 text-center text-sm font-black transition ${cleanComment ? "bg-slate-950 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-500"}`}
              >
                Enviar e-mail
              </button>
            </div>
          </form>

          <iframe name="diasmath-feedback-frame" title="Envio de comentário DIASMATH" className="hidden" />

          <p className="mt-3 text-xs leading-5 text-slate-500">
            O comentário será enviado para a DIASMATH™ por WhatsApp ou e-mail.
          </p>
        </section>
      )}
    </div>
  );
}
