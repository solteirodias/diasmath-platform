"use client";

import { useState } from "react";

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

  const cleanComment = comment.trim();
  const cleanName = name.trim() || "Visitante";

  const message = `Olá, DIASMATH! Tenho uma sugestão/comentário.

App: ${appName}
Categoria: ${category}
Nome: ${cleanName}
Comentário: ${cleanComment}`;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const emailHref = `mailto:${contactEmail}?subject=${encodeURIComponent("Comentário sobre " + appName)}&body=${encodeURIComponent(message)}`;

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
              <h2 className="mt-1 text-lg font-black leading-tight">O que você achou?</h2>
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

          <label className="mt-4 block">
            <span className="text-xs font-black uppercase text-slate-500">Seu nome</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Digite seu nome"
              className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-xs font-black uppercase text-slate-500">Comentário</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Escreva sua sugestão, dúvida ou necessidade..."
              rows={4}
              className="mt-1 w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a
              href={cleanComment ? whatsappHref : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!cleanComment}
              className={`rounded-full px-4 py-3 text-center text-sm font-black transition ${cleanComment ? "bg-green-600 text-white hover:bg-green-700" : "pointer-events-none bg-slate-200 text-slate-500"}`}
            >
              Enviar WhatsApp
            </a>

            <a
              href={cleanComment ? emailHref : undefined}
              aria-disabled={!cleanComment}
              className={`rounded-full px-4 py-3 text-center text-sm font-black transition ${cleanComment ? "bg-slate-950 text-white hover:bg-blue-700" : "pointer-events-none bg-slate-200 text-slate-500"}`}
            >
              Enviar e-mail
            </a>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            O comentário será enviado diretamente para a DIASMATH™. Nenhum banco de dados é usado nesta versão.
          </p>
        </section>
      )}
    </div>
  );
}
