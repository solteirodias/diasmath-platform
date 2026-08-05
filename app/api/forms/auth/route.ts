export const runtime = "nodejs";

type AuthPayload = {
  action?: "login" | "register" | "recover" | "reset" | "profile";
  name?: string;
  email?: string;
  school?: string;
  city?: string;
  passwordHash?: string;
  resetCode?: string;
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

function publicUser(row: any) {
  return {
    id: row.id,
    name: row.name || "Professor",
    email: row.email,
    school: row.school || "",
    city: row.city || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getUserByEmail(config: { url: string; key: string }, email: string) {
  const endpoint =
    `${config.url}/rest/v1/diasmath_forms_users` +
    `?select=*&email=eq.${encodeURIComponent(email)}&limit=1`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: headers(config.key),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(JSON.stringify(data || { message: "Erro ao buscar usuário." }));
  return Array.isArray(data) && data.length ? data[0] : null;
}

async function insertUser(
  config: { url: string; key: string },
  payload: { id: string; name: string; email: string; school: string; city: string; password_hash: string }
) {
  const response = await fetch(`${config.url}/rest/v1/diasmath_forms_users`, {
    method: "POST",
    headers: { ...headers(config.key), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(JSON.stringify(data || { message: "Erro ao criar usuário." }));
  return Array.isArray(data) ? data[0] : data;
}

async function updateUser(config: { url: string; key: string }, email: string, patch: Record<string, unknown>) {
  const response = await fetch(
    `${config.url}/rest/v1/diasmath_forms_users?email=eq.${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      headers: { ...headers(config.key), Prefer: "return=representation" },
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(JSON.stringify(data || { message: "Erro ao atualizar usuário." }));
  return Array.isArray(data) && data.length ? data[0] : null;
}

function recoveryEmailHtml(code: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="color:#0b4d86">Recuperação de senha — DIASMATH Forms</h2>
      <p>Recebemos uma solicitação para redefinir sua senha no DIASMATH Forms.</p>
      <p>Use este código:</p>
      <div style="font-size:32px;font-weight:900;letter-spacing:6px;background:#eef6ff;border:1px solid #bfdbfe;border-radius:14px;padding:16px;text-align:center;color:#0b4d86">${code}</div>
      <p>O código vale por 30 minutos.</p>
      <p>Se você não solicitou a recuperação, ignore este e-mail.</p>
    </div>
  `;
}

async function sendRecoveryEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.FORMS_RECOVERY_FROM ||
    process.env.FEEDBACK_FROM ||
    "DIASMATH <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("Envio de e-mail não configurado. Configure RESEND_API_KEY na Vercel.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Código de recuperação — DIASMATH Forms",
      html: recoveryEmailHtml(code),
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(JSON.stringify(data || { message: "Falha ao enviar e-mail." }));
  return data;
}

export async function POST(request: Request) {
  try {
    const config = supabaseConfig();
    if (!config) {
      return jsonError("Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.", 500);
    }

    const payload = (await request.json()) as AuthPayload;
    const action = payload.action;
    const email = (payload.email || "").trim().toLowerCase();

    if (!action) return jsonError("Ação não informada.", 400);
    if (!email) return jsonError("E-mail é obrigatório.", 400);

    if (action === "login") {
      if (!payload.passwordHash) return jsonError("Senha é obrigatória.", 400);
      let user = await getUserByEmail(config, email);

      if (!user) {
        user = await insertUser(config, {
          id: `user_${crypto.randomUUID()}`,
          name: payload.name || "Professor",
          email,
          school: payload.school || "DIASMATH",
          city: payload.city || "",
          password_hash: payload.passwordHash,
        });
      }

      if (user.password_hash !== payload.passwordHash) {
        return jsonError("E-mail ou senha inválidos.", 401);
      }

      return Response.json({ ok: true, user: publicUser(user) });
    }

    if (action === "register") {
      if (!payload.passwordHash) return jsonError("Senha é obrigatória.", 400);
      const existing = await getUserByEmail(config, email);

      if (existing) {
        const updated = await updateUser(config, email, {
          name: payload.name || existing.name || "Professor",
          school: payload.school || existing.school || "",
          city: payload.city || existing.city || "",
          password_hash: payload.passwordHash,
        });
        return Response.json({ ok: true, user: publicUser(updated || existing) });
      }

      const user = await insertUser(config, {
        id: `user_${crypto.randomUUID()}`,
        name: payload.name || "Professor",
        email,
        school: payload.school || "",
        city: payload.city || "",
        password_hash: payload.passwordHash,
      });

      return Response.json({ ok: true, user: publicUser(user) });
    }

    if (action === "profile") {
      const existing = await getUserByEmail(config, email);
      if (!existing) return jsonError("Usuário não encontrado.", 404);
      const updated = await updateUser(config, email, {
        name: payload.name || existing.name || "Professor",
        school: payload.school ?? existing.school ?? "",
        city: payload.city ?? existing.city ?? "",
      });
      return Response.json({ ok: true, user: publicUser(updated || existing) });
    }

    if (action === "recover") {
      const user = await getUserByEmail(config, email);
      if (!user) {
        return Response.json({ ok: true, message: "Se o e-mail estiver cadastrado, enviaremos um código de recuperação." });
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      await updateUser(config, email, { reset_code: code, reset_expires_at: expires });
      await sendRecoveryEmail(email, code);

      return Response.json({ ok: true, message: "Código de recuperação enviado para o e-mail cadastrado." });
    }

    if (action === "reset") {
      if (!payload.resetCode) return jsonError("Código é obrigatório.", 400);
      if (!payload.passwordHash) return jsonError("Nova senha é obrigatória.", 400);

      const user = await getUserByEmail(config, email);
      if (!user) return jsonError("Usuário não encontrado.", 404);
      if (!user.reset_code || user.reset_code !== payload.resetCode.trim()) return jsonError("Código inválido.", 400);

      if (!user.reset_expires_at || new Date(user.reset_expires_at).getTime() < Date.now()) {
        return jsonError("Código expirado. Solicite um novo código.", 400);
      }

      const updated = await updateUser(config, email, {
        password_hash: payload.passwordHash,
        reset_code: null,
        reset_expires_at: null,
      });

      return Response.json({ ok: true, user: publicUser(updated || user) });
    }

    return jsonError("Ação inválida.", 400);
  } catch (error) {
    return jsonError(
      "Erro no acesso do DIASMATH Forms.",
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
}
