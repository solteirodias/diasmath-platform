export const runtime = "nodejs";

type FormsResponsePayload = {
  id?: string;
  formId?: string;
  formTitle?: string;
  submittedAt?: string;
  participant?: Record<string, unknown>;
  answers?: Record<string, unknown>;
  formSnapshot?: Record<string, unknown>;
  responses?: FormsResponsePayload[];
};

function jsonError(message: string, status = 400, details?: unknown) {
  return Response.json({ ok: false, error: message, details }, { status });
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    key,
  };
}

function headers(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function GET(request: Request) {
  try {
    const config = supabaseConfig();

    if (!config) {
      return jsonError(
        "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.",
        500
      );
    }

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("formId");

    if (!formId) {
      return jsonError("formId é obrigatório.", 400);
    }

    const endpoint =
      `${config.url}/rest/v1/diasmath_forms_responses` +
      `?select=id,form_id,form_title,submitted_at,participant,answers,form_snapshot` +
      `&form_id=eq.${encodeURIComponent(formId)}` +
      `&order=submitted_at.desc`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: headers(config.key),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return jsonError("Erro ao buscar respostas no Supabase.", 500, data);
    }

    const responses = Array.isArray(data)
      ? data.map((item) => ({
          id: item.id,
          formId: item.form_id,
          formTitle: item.form_title,
          submittedAt: item.submitted_at,
          participant: item.participant || {},
          answers: item.answers || {},
          formSnapshot: item.form_snapshot || null,
        }))
      : [];

    return Response.json({ ok: true, responses });
  } catch (error) {
    return jsonError(
      "Erro inesperado ao buscar respostas.",
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function POST(request: Request) {
  try {
    const config = supabaseConfig();

    if (!config) {
      return jsonError(
        "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.",
        500
      );
    }

    const payload = (await request.json()) as FormsResponsePayload;

    const incomingResponses = Array.isArray(payload.responses)
      ? payload.responses
      : [payload];

    const validResponses = incomingResponses.filter(
      (item) => item?.formId && item.answers && typeof item.answers === "object"
    );

    if (!validResponses.length) {
      return jsonError("Nenhuma resposta válida enviada.", 400);
    }

    const rows = validResponses.map((item) => {
      const submittedAt = item.submittedAt || new Date().toISOString();

      return {
        id:
          item.id ||
          `resp_${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`,
        form_id: item.formId,
        form_title: item.formTitle || "Formulário DIASMATH",
        submitted_at: submittedAt,
        participant: item.participant || {},
        answers: item.answers || {},
        form_snapshot: item.formSnapshot || {},
      };
    });

    const response = await fetch(
      `${config.url}/rest/v1/diasmath_forms_responses?on_conflict=id`,
      {
        method: "POST",
        headers: {
          ...headers(config.key),
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(rows),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return jsonError("Erro ao salvar resposta no Supabase.", 500, data);
    }

    return Response.json({
      ok: true,
      count: rows.length,
      responses: rows.map((row) => ({
        id: row.id,
        formId: row.form_id,
        formTitle: row.form_title,
        submittedAt: row.submitted_at,
        participant: row.participant,
        answers: row.answers,
        formSnapshot: row.form_snapshot,
      })),
    });
  } catch (error) {
    return jsonError(
      "Erro inesperado ao salvar resposta.",
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
}
