import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/Brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — DIASMATH Sprint" },
      { name: "description", content: "Acesse sua conta de professor para criar e aplicar atividades ao vivo." },
      { property: "og:title", content: "Entrar — DIASMATH Sprint" },
      { property: "og:description", content: "Área do professor DIASMATH Sprint." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/painel" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/sprint/painel` },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/painel" });
        else toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/sprint/painel` },
    });
    if (error) toast.error("Não foi possível entrar com Google");
  };

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="font-display text-5xl leading-none">
          {mode === "login" ? "DIASMATH Sprint · Professor" : "Criar conta de professor"}
        </h1>
        <p className="text-ash mt-3">Crie atividades e aplique sessões ao vivo para sua turma.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input className="field" type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="field" type="password" required minLength={6} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={busy} className="btn-skew btn-brand w-full py-4">
            <span>{mode === "login" ? "Entrar" : "Criar conta"}</span>
          </button>
        </form>
        <button onClick={google} className="btn-skew btn-outline w-full py-4 mt-4">
          <span>Continuar com Google</span>
        </button>
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-6 text-sm underline hover:text-brand">
          {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}