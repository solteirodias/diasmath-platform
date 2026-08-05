export const runtime = "nodejs";

type FormsPayload = {
  ownerEmail?: string;
  ownerId?: string;
  form?: any;
  forms?: any[];
};

function jsonError(message: string, status = 400, details?: unknown) {
  return Response.json({ ok: false, error: message, details }, { status });
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function headers(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function normalizeFormRow(form: any, ownerEmail: string, ownerId?: string) {
  const now = new Date().toISOString();
  const normalized = {
    ...form,
    ownerEmail,
    ownerId: ownerId || form.ownerId || "",
    updatedAt: form.updatedAt || now,
    createdAt: form.createdAt || now,
  };

  return {
    id: String(normalized.id),
    owner_email: ownerEmail,
    owner_id: normalized.ownerId || "",
    title: normalized.title || "Formulário sem título",
    description: normalized.description || "",
    published: Boolean(normalized.published),
    updated_at: normalized.updatedAt || now,
    created_at: normalized.createdAt || now,
    form: normalized,
  };
}

export async function GET(request: Request) {
  try {
    const config = supabaseConfig();
    if (!config) return jsonError("Supabase não configurado. Defina as variáveis na Vercel.", 500);

    const { searchParams } = new URL(request.url);
    const ownerEmail = (searchParams.get("ownerEmail") || "").trim().toLowerCase();
    if (!ownerEmail) return jsonError("ownerEmail é obrigatório.", 400);

    const endpoint =
      `${config.url}/rest/v1/diasmath_forms_forms` +
      `?select=id,owner_email,owner_id,title,description,published,updated_at,created_at,form` +
      `&owner_email=eq.${encodeURIComponent(ownerEmail)}` +
      `&order=updated_at.desc`;

    const response = await fetch(endpoint, { method: "GET", headers: headers(config.key), cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) return jsonError("Erro ao buscar formulários no Supabase.", 500, data);

    const forms = Array.isArray(data)
      ? data.map((row) => ({
          ...(row.form || {}),
          id: row.id,
          ownerEmail: row.owner_email,
          ownerId: row.owner_id || row.form?.ownerId || "",
          title: row.title || row.form?.title || "Formulário sem título",
          description: row.description || row.form?.description || "",
          published: Boolean(row.published),
          updatedAt: row.updated_at || row.form?.updatedAt,
          createdAt: row.created_at || row.form?.createdAt,
        }))
      : [];

    return Response.json({ ok: true, forms });
  } catch (error) {
    return jsonError("Erro inesperado ao buscar formulários.", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(request: Request) {
  try {
    const config = supabaseConfig();
    if (!config) return jsonError("Supabase não configurado. Defina as variáveis na Vercel.", 500);

    const payload = (await request.json()) as FormsPayload;
    const ownerEmail = (payload.ownerEmail || "").trim().toLowerCase();
    if (!ownerEmail) return jsonError("ownerEmail é obrigatório.", 400);

    const forms = Array.isArray(payload.forms) ? payload.forms : payload.form ? [payload.form] : [];
    if (!forms.length) return jsonError("Nenhum formulário enviado.", 400);

    const rows = forms.filter((form) => form && form.id).map((form) => normalizeFormRow(form, ownerEmail, payload.ownerId));
    if (!rows.length) return jsonError("Nenhum formulário válido enviado.", 400);

    const response = await fetch(`${config.url}/rest/v1/diasmath_forms_forms?on_conflict=id`, {
      method: "POST",
      headers: { ...headers(config.key), Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(rows),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) return jsonError("Erro ao salvar formulários no Supabase.", 500, data);

    return Response.json({ ok: true, count: rows.length, rows: data || [] });
  } catch (error) {
    return jsonError("Erro inesperado ao salvar formulário.", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function DELETE(request: Request) {
  try {
    const config = supabaseConfig();
    if (!config) return jsonError("Supabase não configurado. Defina as variáveis na Vercel.", 500);

    const { searchParams } = new URL(request.url);
    const ownerEmail = (searchParams.get("ownerEmail") || "").trim().toLowerCase();
    const formId = searchParams.get("formId") || "";

    if (!ownerEmail) return jsonError("ownerEmail é obrigatório.", 400);
    if (!formId) return jsonError("formId é obrigatório.", 400);

    const endpoint =
      `${config.url}/rest/v1/diasmath_forms_forms` +
      `?id=eq.${encodeURIComponent(formId)}` +
      `&owner_email=eq.${encodeURIComponent(ownerEmail)}`;

    const response = await fetch(endpoint, { method: "DELETE", headers: headers(config.key) });
    const data = await response.text().catch(() => "");
    if (!response.ok) return jsonError("Erro ao excluir formulário no Supabase.", 500, data);

    return Response.json({ ok: true });
  } catch (error) {
    return jsonError("Erro inesperado ao excluir formulário.", 500, error instanceof Error ? error.message : String(error));
  }
}
