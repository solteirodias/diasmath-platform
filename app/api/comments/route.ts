export const runtime = "nodejs";

type CommentPayload = {
  appSlug?: string;
  appName?: string;
  name?: string;
  email?: string;
  comment?: string;
};

function clean(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function clip(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: key || "",
    Authorization: `Bearer ${key || ""}`,
    "Content-Type": "application/json",
  };
}

function getSupabaseUrl() {
  return process.env.SUPABASE_URL?.replace(/\/$/, "");
}

export async function GET(request: Request) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      {
        ok: false,
        error:
          "Comentários ainda não configurados. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.",
        comments: [],
      },
      { status: 200 }
    );
  }

  const { searchParams } = new URL(request.url);
  const appSlug = clean(searchParams.get("appSlug"));
  if (!appSlug) return Response.json({ ok: true, comments: [] });

  const url =
    `${supabaseUrl}/rest/v1/diasmath_comments` +
    `?app_slug=eq.${encodeURIComponent(appSlug)}` +
    `&approved=eq.true` +
    `&select=id,app_slug,app_name,name,comment,created_at` +
    `&order=created_at.desc` +
    `&limit=50`;

  const response = await fetch(url, {
    method: "GET",
    headers: supabaseHeaders(),
    cache: "no-store",
  });

  const data = await response.json().catch(() => []);
  if (!response.ok) {
    return Response.json(
      {
        ok: false,
        error: "Não foi possível carregar os comentários.",
        details: data,
        comments: [],
      },
      { status: 200 }
    );
  }

  return Response.json({ ok: true, comments: data });
}

export async function POST(request: Request) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      {
        ok: false,
        error:
          "Comentários ainda não configurados. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.",
      },
      { status: 500 }
    );
  }

  const payload = (await request.json().catch(() => ({}))) as CommentPayload;
  const appSlug = clip(clean(payload.appSlug), 120);
  const appName = clip(clean(payload.appName, "App DIASMATH"), 160);
  const name = clip(clean(payload.name, "Visitante"), 80);
  const email = clip(clean(payload.email), 160);
  const comment = clip(clean(payload.comment), 1200);

  if (!appSlug || !comment) {
    return Response.json(
      { ok: false, error: "Informe o app e escreva um comentário." },
      { status: 400 }
    );
  }

  const row = {
    app_slug: appSlug,
    app_name: appName,
    name,
    email: email || null,
    comment,
    approved: true,
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/diasmath_comments`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(row),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return Response.json(
      { ok: false, error: "Não foi possível publicar o comentário.", details: data },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, comment: Array.isArray(data) ? data[0] : data });
}
