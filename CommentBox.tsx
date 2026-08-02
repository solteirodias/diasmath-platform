"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Comment = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

type CommentBoxProps = {
  pageId?: string;
  pageSlug?: string;
  slug?: string;
  id?: string;
  title?: string;
  className?: string;
  [key: string]: unknown;
};

export function CommentBox({
  pageId,
  pageSlug,
  slug,
  id,
  title = "Comentários",
  className = "",
}: CommentBoxProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);

  const storageKey = useMemo(() => {
    const identifier = pageId ?? pageSlug ?? slug ?? id ?? "geral";
    return `diasmath-comments-${identifier}`;
  }, [pageId, pageSlug, slug, id]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setComments(saved ? JSON.parse(saved) : []);
    } catch {
      setComments([]);
    } finally {
      setLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(storageKey, JSON.stringify(comments));
  }, [comments, loaded, storageKey]);

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanMessage) {
      return;
    }

    setComments((current) => [
      {
        id: crypto.randomUUID(),
        name: cleanName,
        message: cleanMessage,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    setMessage("");
  }

  return (
    <section className={className}>
      <h2>{title}</h2>

      <form onSubmit={submitComment}>
        <label>
          Nome
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label>
          Comentário
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            required
          />
        </label>

        <button type="submit">Publicar comentário</button>
      </form>

      <div>
        {comments.length === 0 ? (
          <p>Nenhum comentário publicado.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id}>
              <strong>{comment.name}</strong>

              <small>
                {new Date(comment.createdAt).toLocaleString("pt-BR")}
              </small>

              <p>{comment.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
