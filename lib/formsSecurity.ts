import { createHmac, timingSafeEqual } from "node:crypto";

export type FormsConfig = { url: string; key: string };
export type FormsSession = { id: string; email: string; pw: string; exp: number };

const COOKIE = "dm_forms_session";
const MAX_AGE = 7 * 24 * 60 * 60;

export function formsConfig(): FormsConfig | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export function formsHeaders(config: FormsConfig) {
  return {
    apikey: config.key,
    Authorization: "Bearer " + config.key,
    "Content-Type": "application/json",
  };
}

export function formsError(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function sessionSecret(): string | null {
  // The dedicated secret is preferred; the server-only service key provides a
  // compatibility fallback until FORMS_SESSION_SECRET is configured.
  return process.env.FORMS_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update("diasmath-forms-session-v1:" + value).digest("base64url");
}

export function issueFormsSession(id: string, email: string, passwordHash: string): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("Forms session secret missing");
  const data: FormsSession = { id, email: email.trim().toLowerCase(), pw: sign("password:"+passwordHash, secret), exp: Math.floor(Date.now()/1000) + MAX_AGE };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  return "v1." + encoded + "." + sign(encoded, secret);
}

export function readFormsSession(request: Request): FormsSession | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const raw = request.headers.get("cookie") || "";
  const token = raw.split(";").map(part => part.trim()).find(part => part.startsWith(COOKIE+"="))?.slice(COOKIE.length+1);
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1" || parts[1].length > 2048) return null;
  const expected = Buffer.from(sign(parts[1], secret));
  const actual = Buffer.from(parts[2]);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (typeof data?.id !== "string" || typeof data?.email !== "string" || typeof data?.pw !== "string" || !Number.isInteger(data.exp)) return null;
    if (!data.id || !data.email || data.exp <= Math.floor(Date.now()/1000)) return null;
    return { id: data.id, email: data.email, pw: data.pw, exp: data.exp };
  } catch { return null; }
}

export function formsCookieHeader(request: Request, token: string, clear = false): string {
  const isSecure = new URL(request.url).protocol === "https:";
  return COOKIE + "=" + (clear ? "" : token) + "; Path=/; HttpOnly; SameSite=Lax; " +
    (isSecure ? "Secure; " : "") + "Max-Age=" + (clear ? "0" : MAX_AGE);
}

export function isAllowedFormsWrite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

export async function formsJson(request: Request, maxBytes = 256_000): Promise<any> {
  const size = Number(request.headers.get("content-length") || 0);
  if (size > maxBytes) throw new Error("payload_too_large");
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) throw new Error("payload_too_large");
  return JSON.parse(raw);
}

export async function getFormsUser(config: FormsConfig, email: string): Promise<any | null> {
  const endpoint = config.url + "/rest/v1/diasmath_forms_users?select=*&email=eq." +
    encodeURIComponent(email) + "&limit=1";
  const response = await fetch(endpoint, { headers: formsHeaders(config), cache: "no-store" });
  if (!response.ok) throw new Error("user_lookup_failed");
  const items = await response.json();
  return Array.isArray(items) ? items[0] || null : null;
}

export async function getFormsUserFromSession(config: FormsConfig, request: Request): Promise<any | null> {
  const session = readFormsSession(request);
  if (!session) return null;
  const user = await getFormsUser(config, session.email);
  if (!user || user.id !== session.id) return null;
  const secret = sessionSecret();
  if (!secret) return null;
  const expected = Buffer.from(sign("password:"+user.password_hash, secret));
  const actual = Buffer.from(session.pw);
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? user : null;
}

export async function getStoredForm(config: FormsConfig, id: string): Promise<any | null> {
  const endpoint = config.url + "/rest/v1/diasmath_forms_forms?select=id,owner_email,owner_id,published,title,form&id=eq." +
    encodeURIComponent(id) + "&limit=1";
  const response = await fetch(endpoint, { headers: formsHeaders(config), cache: "no-store" });
  if (!response.ok) throw new Error("form_lookup_failed");
  const items = await response.json();
  return Array.isArray(items) ? items[0] || null : null;
}

export function ownsStoredForm(row: any, user: any): boolean {
  return Boolean(row && user && row.owner_email === user.email?.toLowerCase());
}
