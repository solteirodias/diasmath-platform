import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SPRINT_SUPABASE_URL ||
  "https://kasbdoqdqzntnyvlmddr.supabase.co";

const publishableKey =
  process.env.NEXT_PUBLIC_SPRINT_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_ki2qg8UTjAhlI_UsSZKmYw_UJX0bNsg";

export const sprintSupabase = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function signInSprintWithGoogle(redirectUri: string) {
  return sprintSupabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUri },
  });
}
