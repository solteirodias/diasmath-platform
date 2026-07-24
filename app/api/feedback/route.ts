export const runtime = "nodejs";

type FeedbackPayload = {
  source?: "contact" | "app";
  appName?: string;
  category?: string;
  name?: string;
  senderEmail?: string;
  topic?: string;
  message?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clean(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.FEEDBACK_TO || "fvdias23@gmail.com";
    const from = process.env.FEEDBACK_FROM || "DIASMATH <onboarding@resend.dev>";

    if (!apiKey) {
      return Response.json(
        { ok: false, error: "RESEND_API_KEY não configurada na Vercel. Configure em Settings → Environment Variables e faça Redeploy." },
        { status: 500 }
      );
    }

    const payload = (await request.json()) as FeedbackPayload;
    const source = clean(payload.source, "contact");
    const appName = clean(payload.appName, "Página de contato");
    const category = clean(payload.category, "Contato");
    const name = clean(payload.name, "Visitante");
    const senderEmail = clean(payload.senderEmail, "Não informado");
    const topic = clean(payload.topic, "Mensagem");
    const message = clean(payload.message);

    if (!message) {
      return Response.json({ ok: false, error: "A mensagem não pode ficar vazia." }, { status: 400 });
    }

    const subject = source === "contact" ? `Contato DIASMATH™ — ${topic}` : `Comentário DIASMATH™ — ${appName}`;
    const text = [
      "Novo contato/comentário recebido pelo site DIASMATH™",
      "",
      `Origem: ${source}`,
      `App/Página: ${appName}`,
      `Categoria: ${category}`,
      `Tipo: ${topic}`,
      `Nome: ${name}`,
      `E-mail do remetente: ${senderEmail}`,
      "",
      "Mensagem:",
      message,
    ].join("
");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="margin:0 0 12px">Novo contato/comentário — DIASMATH™</h2>
        <table style="border-collapse:collapse;width:100%;max-width:720px">
          <tbody>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Origem</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${escapeHtml(source)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>App/Página</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${escapeHtml(appName)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Categoria</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${escapeHtml(category)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Tipo</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${escapeHtml(topic)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Nome</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>E-mail</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${escapeHtml(senderEmail)}</td></tr>
          </tbody>
        </table>
        <h3 style="margin:18px 0 8px">Mensagem</h3>
        <div style="white-space:pre-wrap;border:1px solid #e2e8f0;border-radius:12px;padding:14px;background:#f8fafc">${escapeHtml(message)}</div>
      </div>`;

    const body: Record<string, unknown> = { from, to, subject, html, text };
    if (senderEmail !== "Não informado") body.reply_to = senderEmail;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return Response.json({ ok: false, error: "A API de e-mail recusou o envio.", details: result }, { status: 500 });
    }
    return Response.json({ ok: true, result });
  } catch (error) {
    return Response.json({ ok: false, error: "Erro inesperado ao enviar mensagem.", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
