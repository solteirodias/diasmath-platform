"use client";

import { useMemo, useState } from "react";

type FeedbackBoxProps = {
  appName: string;
  category?: string;
};

const whatsappNumber = "5589999877193";

type Status = "idle" | "sending" | "sent" | "error" | "whatsapp";

export function FeedbackBox({ appName, category = "DIASMATH" }: FeedbackBoxProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const cleanName = name.trim() || "Visitante";
  const cleanEmail = senderEmail.trim();
  const cleanComment = comment.trim();

  const message = useMemo(
    () =>
      `Olá, DIASMATH! Tenho uma sugestão/comentário.\n\nApp: ${appName}\nCategoria: ${category}\nNome: ${cleanName}\nE-mail: ${cleanEmail || "Não informado"}\nComentário: ${cleanComment}`,
    [appName, category, cleanName, cleanEmail, cleanComment]
  );

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  function resetBox() {
    setName("");
    setSenderEmail("");
    setComment("");
  }

  async function sendEmail() {
    if (!cleanComment) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "app",
          appName,
          category,
          name: cleanName,
          senderEmail: cleanEmail,
          topic: "Comentário sobre app",
          message: cleanComment,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Não foi possível enviar o comentário.");
      }

      resetBox();
      setStatus("sent");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível enviar o comentário.");
      setStatus("error");
    }
  }

  function handleWhatsAppClick() {
    if (!cleanComment) return;

    window.setTimeout(() => {
      resetBox();
      setStatus("whatsapp");
    }, 300);
  }

  if (status === "sent" || status === "whatsapp") {
    return (
      <div className="fixed bottom-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
        <section className="rounded-3xl border border-green-200 bg-white p-5 text-slate-900 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-wide text-green-700">Obrigado!</p>
          <h2 className="mt-1 text-lg font-black leading-tight">
            {status === "sent" ? "Comentário enviado com sucesso." : "Comentário aberto no WhatsApp."}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {status === "sent"
              ? "A DIASMATH™ agradece sua contribuição. Sua sugestão ajuda a melhorar os jogos, laboratórios e atividades da plataforma."
              : "Agora é só confirmar o envio no WhatsApp. A DIASMATH™ agradece sua contribuição."}
          </p>
          <button type="button" onClick={() => { setStatus("idle"); setOpen(false); }} className="mt-4 w-full rounded-full bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-700">Fechar</button>
        </section>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="ml-auto flex rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-blue-700">💬 Comentar este app</button>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">Comentário DIASMATH™</p>
              <h2 className="mt-1 text-lg font-black leading-tight">O que você achou?</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600 transition hover:bg-slate-200" aria-label="Fechar comentários">×</button>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">Envie sugestões, dificuldades, erros encontrados ou ideias do que você precisa para suas aulas.</p>
          <label className="mt-4 block"><span className="text-xs font-black uppercase text-slate-500">Seu nome</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Digite seu nome" className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" /></label>
          <label className="mt-3 block"><span className="text-xs font-black uppercase text-slate-500">Seu e-mail</span><input type="email" value={senderEmail} onChange={(event) => setSenderEmail(event.target.value)} placeholder="seuemail@exemplo.com" className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" /></label>
          <label className="mt-3 block"><span className="text-xs font-black uppercase text-slate-500">Comentário</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Escreva sua sugestão, dúvida ou necessidade..." rows={4} required className="mt-1 w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" /></label>
          {status === "error" && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">{errorMessage}</p>}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a href={cleanComment ? whatsappHref : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!cleanComment} onClick={handleWhatsAppClick} className={`rounded-full px-4 py-3 text-center text-sm font-black transition ${cleanComment ? "bg-green-600 text-white hover:bg-green-700" : "pointer-events-none bg-slate-200 text-slate-500"}`}>Enviar WhatsApp</a>
            <button type="button" onClick={sendEmail} disabled={!cleanComment || status === "sending"} className={`rounded-full px-4 py-3 text-center text-sm font-black transition ${cleanComment && status !== "sending" ? "bg-slate-950 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-500"}`}>{status === "sending" ? "Enviando..." : "Enviar e-mail"}</button>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">O comentário será enviado para a DIASMATH™ por WhatsApp ou e-mail.</p>
        </section>
      )}
    </div>
  );
}
