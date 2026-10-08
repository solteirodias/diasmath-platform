import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.SUPABASE_URL);
const key =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== "undefined" && process.env?.SUPABASE_PUBLISHABLE_KEY);

if (!url || !key) throw new Error("Configuração do Supabase ausente.");

export const supabase = createClient<Database>(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
