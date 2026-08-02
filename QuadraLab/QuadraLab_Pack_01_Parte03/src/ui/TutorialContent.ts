import { element } from "./dom";

export function tutorialContent(): HTMLElement {
  const content = element("div", "tutorial-content");

  const steps = [
    ["1. Escolha uma peça", "Use a paleta para adicionar x², x ou unidade."],
    ["2. Arraste no tabuleiro", "A peça se encaixa automaticamente na grade."],
    ["3. Organize as áreas", "Monte retângulos e compare suas dimensões."],
    ["4. Explore os sinais", "Peças positivas e negativas possuem cores diferentes."],
    ["5. Investigue", "O objetivo é descobrir relações, não aplicar uma fórmula pronta."]
  ];

  steps.forEach(([title, text]) => {
    const card = element("article", "tutorial-step");
    card.append(element("h3", "", title), element("p", "", text));
    content.append(card);
  });

  return content;
}
