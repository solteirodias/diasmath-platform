import { uid } from "./utils.js";

function q(type, title, options = []) {
  return { id: uid("q"), type, title, required: false, options, min: 1, max: 5, tags: [] };
}
function section(title, description, questions) {
  return { id: uid("sec"), title, description, questions };
}
export const TEMPLATES = [
  {
    id: "training",
    name: "Avaliação de formação",
    description: "Feedback rápido de encontros formativos.",
    create(ownerId) {
      const now = new Date().toISOString();
      return {
        id: uid("form"), ownerId, title: "Avaliação da formação", description: "Sua opinião contribui para aprimorar os próximos encontros.",
        theme: "blue", published: false, createdAt: now, updatedAt: now,
        settings: { collectName: true, collectEmail: false, showProgress: true, allowAnother: false, thankYou: "Obrigado por participar!" },
        sections: [section("Avaliação", "", [
          q("single", "Como você avalia a formação?", ["Excelente", "Boa", "Regular", "Ruim"]),
          q("long", "O que foi mais útil para sua prática?"),
          q("long", "Que sugestões você apresenta para os próximos encontros?")
        ])]
      };
    }
  },
  {
    id: "diagnostic",
    name: "Diagnóstico de aprendizagem",
    description: "Questionário inicial para conhecer a turma.",
    create(ownerId) {
      const now = new Date().toISOString();
      return {
        id: uid("form"), ownerId, title: "Diagnóstico de aprendizagem", description: "Responda com atenção.",
        theme: "green", published: false, createdAt: now, updatedAt: now,
        settings: { collectName: true, collectEmail: false, showProgress: true, allowAnother: false, thankYou: "Diagnóstico enviado!" },
        sections: [section("Perfil", "", [
          q("dropdown", "Série/turma", ["1ª série", "2ª série", "3ª série"]),
          q("scale", "Quanto você se sente confiante em Matemática?")
        ]), section("Percepções", "", [
          q("multiple", "Quais conteúdos apresentam maior dificuldade?", ["Álgebra", "Geometria", "Estatística", "Probabilidade"]),
          q("long", "Explique uma dificuldade que você gostaria de superar.")
        ])]
      };
    }
  },
  {
    id: "meeting",
    name: "Registro de reunião",
    description: "Colete encaminhamentos e decisões.",
    create(ownerId) {
      const now = new Date().toISOString();
      return {
        id: uid("form"), ownerId, title: "Registro de reunião", description: "Formulário para consolidar contribuições da equipe.",
        theme: "purple", published: false, createdAt: now, updatedAt: now,
        settings: { collectName: true, collectEmail: true, showProgress: false, allowAnother: true, thankYou: "Registro concluído." },
        sections: [section("Contribuições", "", [
          q("long", "Qual ponto principal precisa ser registrado?"),
          q("long", "Qual encaminhamento foi acordado?"),
          q("date", "Data prevista para acompanhamento")
        ])]
      };
    }
  }
];
