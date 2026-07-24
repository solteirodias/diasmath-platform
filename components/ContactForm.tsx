"use client";

import { FormEvent, useMemo, useState } from "react";

const whatsappNumber = "5589999877193";
const contactEmail = "contato@diasmath.com.br";

export function ContactForm() {
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [topic, setTopic] = useState("Sugestão");
  const [messageText, setMessageText] = useState("");
  const [sentMode, setSentMode] = useState<"email" | "whatsapp" | null>(null);

  const cleanName = name.trim() || "Visitante";
  const cleanEmail = senderEmail.trim();
  const cleanMessage = messageText.trim();

  const fullMessage = useMemo(
    () =>
      `Olá, DIASMATH!\n\nTipo de contato: ${topic}\nNome: ${cleanName}\nE-mail: ${cleanEmail || "Não informado"}\nMensagem: ${cleanMessage}`,
    [topic, cleanName, cleanEmail, cleanMessage]
  );

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fullMessage)}`;

  function resetForm() {
    setName("");
    setSenderEmail("");
    setTopic("Sugestão");
    setMessageText("");
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    if (!cleanMessage) {
      event.preventDefault();
      return;
    }

    setSentMode("email");

    window.setTimeout(() => {
      resetForm();
    }, 400);
  }

  function handleWhatsAppClick() {
    if (!cleanMessage) return;

    setSentMode("whatsapp");

    window.setTimeout(() => {
      resetForm();
    }, 400);
  }

  if (sentMode) {
    return (
      <section className="rounded-3xl border border-green-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-green-700">
          Obrigado!
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-950">
          {sentMode === "email"
            ? "Mensagem enviada com sucesso."
            : "Mensagem aberta no WhatsApp."}
        </h2>

        <p className="mt-4 leading-7 text-slate-600">
          {sentMode === "email"
            ? "A DIASMATH™ agradece seu contato. Sua sugestão ajuda a melhorar a plataforma."
            : "Agora é só confirmar o envio no WhatsApp. A DIASMATH™ agradece seu contato."}
        </p>

        <button
          type="button"
          onClick={() => setSentMode(null)}
          className="mt-6 rounded-full bg-green-600 px-6 py-3 text-sm font-black text-white transition hover:bg-green-700"
        >
          Enviar outro comentário
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-black uppercase tracking-wide text-blue-700">
        Formulário de contato
      </p>

      <h2 className="mt-2 text-3xl font-black text-slate-950">
        Envie sua sugestão
      </h2>

      <p className="mt-3 leading-7 text-slate-600">
        Preencha os campos abaixo. Seu e-mail ajuda a DIASMATH™ a responder sua mensagem, caso seja necessário.
      </p>

      <form
        action={`https://formsubmit.co/${contactEmail}`}
        method="POST"
        target="diasmath-contact-frame"
        onSubmit={handleEmailSubmit}
        className="mt-6 grid gap-4"
      >
        <input type="hidden" name="_subject" value="Contato pelo site DIASMATH™" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_template" value="table" />

        <label className="block">
          <span className="text-xs font-black uppercase text-slate-500">Nome</span>
          <input
            name="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Digite seu nome"
            className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase text-slate-500">Seu e-mail</span>
          <input
            name="email"
            type="email"
            value={senderEmail}
            onChange={(event) => setSenderEmail(event.target.value)}
            placeholder="seuemail@exemplo.com"
            className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase text-slate-500">Tipo de mensagem</span>
          <select
            name="Tipo"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option>Sugestão</option>
            <option>Necessidade pedagógica</option>
            <option>Erro encontrado</option>
            <option>Parceria</option>
            <option>Outro assunto</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase text-slate-500">Mensagem</span>
          <textarea
            name="Mensagem"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Escreva aqui sua sugestão, necessidade ou comentário..."
            rows={6}
            required
            className="mt-1 w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={cleanMessage ? whatsappHref : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className={`rounded-full px-5 py-3 text-center text-sm font-black transition ${cleanMessage ? "bg-green-600 text-white hover:bg-green-700" : "pointer-events-none bg-slate-200 text-slate-500"}`}
          >
            Enviar pelo WhatsApp
          </a>

          <button
            type="submit"
            disabled={!cleanMessage}
            className={`rounded-full px-5 py-3 text-sm font-black transition ${cleanMessage ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-500"}`}
          >
            Enviar por e-mail
          </button>
        </div>
      </form>

      <iframe name="diasmath-contact-frame" title="Envio de contato DIASMATH" className="hidden" />
    </section>
  );
}
