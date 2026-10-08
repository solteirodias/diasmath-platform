import { createClient } from "@supabase/supabase-js";
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";

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

const lovableAuth = createLovableAuth();

export async function signInSprintWithGoogle(redirectUri: string) {
  const result = await lovableAuth.signInWithOAuth("google", {
    redirect_uri: redirectUri,
  });

  if (result.redirected || result.error) return result;

  try {
    await sprintSupabase.auth.setSession(result.tokens);
    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
