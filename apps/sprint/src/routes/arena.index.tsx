import { createFileRoute } from "@tanstack/react-router";
import { StudentArena } from "@/components/StudentArena";

export const Route = createFileRoute("/arena/")({
  head: () => ({
    meta: [
      { title: "Entrar na sessão — DIASMATH Sprint" },
      { name: "description", content: "Digite o código de 6 dígitos e seu nome para participar." },
      { property: "og:title", content: "Entrar na sessão — DIASMATH Sprint" },
      { property: "og:description", content: "Participe da atividade de Matemática da sua turma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <StudentArena />,
});