"use client";

import { FormEvent, useEffect, useState } from "react";

type SiteComment = {
  id: string;
  app_slug: string;
  app_name: string;
  name: string;
  comment: string;
  created_at: string;
};

type CommentBoxProps = {
  appSlug: string;
  appName: string;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function CommentBox({ appSlug, appName }: CommentBoxProps) {
  const [comments, setComments] = useState<SiteComment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadComments() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/comments?appSlug=${encodeURIComponent(appSlug)}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.error || "Comentários ainda não configurados.");
        setComments([]);
        return;
      }
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch {
      setError("Não foi possível carregar os comentários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appSlug]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanComment = comment.trim();
    if (!cleanComment) {
      setError("Escreva um comentário antes de publicar.");
      return;
    }
    setSending(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appSlug, appName, name, email, comment: cleanComment }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Não foi possível publicar o comentário.");
      setName("");
      setEmail("");
      setComment("");
      setMessage("Comentário publicado com sucesso. Obrigado por contribuir com a DIASMATH™!");
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível publicar o comentário.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-700">Comentários</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Deixe sua sugestão sobre este app</h2>
          <p className="mt-2 max-w-2xl leading-7 text-slate-600">
            Escreva o que achou, relate erros, diga o que precisa melhorar ou sugira novas ideias.
            Seu comentário ficará visível nesta página.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {comments.length} comentário(s)
        </span>
      </div>

      <form onSubmit={submitComment} className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black uppercase text-slate-500">Nome</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Digite seu nome" className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase text-slate-500">Seu e-mail, opcional</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seuemail@exemplo.com" className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-black uppercase text-slate-500">Comentário</span>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Escreva seu comentário, sugestão ou necessidade..." rows={4} className="mt-1 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
        </label>

        {message && <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">{message}</p>}
        {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

        <button type="submit" disabled={sending} className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:bg-slate-300 md:w-auto md:justify-self-start">
          {sending ? "Publicando..." : "Publicar comentário"}
        </button>
      </form>

      <div className="mt-7">
        <h3 className="text-lg font-black text-slate-950">Comentários publicados</h3>
        {loading ? (
          <p className="mt-4 text-slate-600">Carregando comentários...</p>
        ) : comments.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-slate-600">Ainda não há comentários neste app. Seja o primeiro a contribuir.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {comments.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-slate-950">{item.name || "Visitante"}</p>
                  <time className="text-xs font-bold text-slate-500">{formatDate(item.created_at)}</time>
                </div>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{item.comment}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
