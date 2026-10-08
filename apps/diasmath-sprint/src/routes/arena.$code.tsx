import { createFileRoute } from "@tanstack/react-router";
import { StudentArena } from "@/components/StudentArena";

export const Route = createFileRoute("/arena/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Sessão ${params.code} — DIASMATH Sprint` },
      { name: "description", content: "Informe seu nome para entrar na sessão ao vivo." },
      { property: "og:title", content: `Sessão ${params.code} — DIASMATH Sprint` },
      { property: "og:description", content: "Entre na atividade ao vivo pelo celular." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Code,
});

function Code() {
  const { code } = Route.useParams();
  return <StudentArena initialCode={code.replace(/\D/g, "").slice(0, 6)} />;
}