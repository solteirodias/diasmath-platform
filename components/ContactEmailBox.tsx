"use client";

import { useMemo, useState } from "react";

const whatsappNumber = "5589999877193";

type Status = "idle" | "form" | "sending" | "sent" | "error" | "whatsapp";

export function ContactEmailBox() {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [topic, setTopic] = useState("Sugestão");
  const [messageText, setMessageText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const cleanName = name.trim() || "Visitante";
  const cleanEmail = senderEmail.trim();
  const cleanMessage = messageText.trim();

  const whatsappText = useMemo(
    () =>
      `Olá, DIASMATH!

Tipo de contato: ${topic}
Nome: ${cleanName}
E-mail: ${cleanEmail || "Não informado"}
Mensagem: ${cleanMessage}`,
    [topic, cleanName, cleanEmail, cleanMessage]
  );

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  function resetForm() {
    setName("");
    setSenderEmail("");
    setTopic("Sugestão");
    setMessageText("");
    setErrorMessage("");
  }

  async function sendEmail() {
    if (!cleanMessage) {
      setErrorMessage("Escreva uma mensagem antes de enviar.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contact",
          appName: "Página de contato",
          category: "Contato",
          name: cleanName,
          senderEmail: cleanEmail,
          topic,
          message: cleanMessage,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Não foi possível enviar a mensagem.");
      }

      resetForm();
      setStatus("sent");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível enviar a mensagem.");
      setStatus("error");
    }
  }

  function openWhatsApp() {
    if (!cleanMessage) {
      setErrorMessage("Escreva uma mensagem antes de enviar pelo WhatsApp.");
      return;
    }

    setTimeout(() => {
      resetForm();
      setStatus("whatsapp");
    }, 300);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950">Canais oficiais</h2>

      <p className="mt-3 leading-7 text-slate-600">
        Para contato direto, use o WhatsApp ou abra a caixa de e-mail dentro do site.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="https://wa.me/5589999877193?text=Ol%C3%A1%2C%20DIASMATH%21%20Tenho%20uma%20sugest%C3%A3o%20ou%20necessidade%20pedag%C3%B3gica."
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-green-600 px-6 py-3 text-sm font-black text-white transition hover:bg-green-700"
        >
          WhatsApp (89) 99987-7193
        </a>

        <button
          type="button"
          onClick={() => setStatus(status === "form" ? "idle" : "form")}
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
        >
          contato@diasmath.com.br
        </button>
      </div>

      {(status === "form" || status === "sending" || status === "error") && (
        <div className="mt-8 rounded-3xl bg-slate-50 p-5">
          <p className="text-sm font-black uppercase tracking-wide text-blue-700">Enviar mensagem por e-mail</p>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Nome</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Digite seu nome" className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Seu e-mail</span>
              <input type="email" value={senderEmail} onChange={(event) => setSenderEmail(event.target.value)} placeholder="seuemail@exemplo.com" className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Tipo de mensagem</span>
              <select value={topic} onChange={(event) => setTopic(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100">
                <option>Sugestão</option>
                <option>Necessidade pedagógica</option>
                <option>Erro encontrado</option>
                <option>Parceria</option>
                <option>Outro assunto</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase text-slate-500">Mensagem</span>
              <textarea value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Escreva sua mensagem..." rows={5} className="mt-1 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
            </label>

            {errorMessage && <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">{errorMessage}</p>}

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={sendEmail} disabled={status === "sending"} className="rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:bg-slate-300">
                {status === "sending" ? "Enviando..." : "Enviar por e-mail"}
              </button>

              <a href={cleanMessage ? whatsappHref : undefined} target="_blank" rel="noopener noreferrer" onClick={openWhatsApp} className={`rounded-full px-6 py-3 text-sm font-black transition ${cleanMessage ? "bg-green-600 text-white hover:bg-green-700" : "pointer-events-none bg-slate-200 text-slate-500"}`}>
                Enviar pelo WhatsApp
              </a>

              <button type="button" onClick={() => { resetForm(); setStatus("idle"); }} className="rounded-full border border-slate-300 px-6 py-3 text-sm font-black text-slate-700 transition hover:border-blue-600 hover:text-blue-700">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "sent" && (
        <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-5">
          <p className="font-black text-green-700">Mensagem enviada com sucesso.</p>
          <p className="mt-2 leading-7 text-green-800">A DIASMATH™ agradece seu contato. Sua sugestão ajuda a melhorar a plataforma.</p>
          <button type="button" onClick={() => setStatus("idle")} className="mt-4 rounded-full bg-green-600 px-5 py-3 text-sm font-black text-white">Fechar</button>
        </div>
      )}

      {status === "whatsapp" && (
        <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-5">
          <p className="font-black text-green-700">Mensagem aberta no WhatsApp.</p>
          <p className="mt-2 leading-7 text-green-800">Agora é só confirmar o envio da mensagem.</p>
          <button type="button" onClick={() => setStatus("idle")} className="mt-4 rounded-full bg-green-600 px-5 py-3 text-sm font-black text-white">Fechar</button>
        </div>
      )}
    </section>
  );
}
