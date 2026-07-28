(function () {
  "use strict";

  const V8_VERSION = "SAP Avaliações 2026 — V8 Pedagógica";

  function normalize(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function contains(text, term) {
    return normalize(text).includes(normalize(term));
  }

  function containsAny(text, terms) {
    return terms.some((term) => contains(text, term));
  }

  function findSmallestElementContaining(text) {
    const target = normalize(text);
    const elements = Array.from(document.querySelectorAll("main, section, article, div, aside"));

    return elements
      .filter((element) => normalize(element.innerText).includes(target))
      .sort((a, b) => normalize(a.innerText).length - normalize(b.innerText).length)[0] || null;
  }

  function findHeading(text) {
    const target = normalize(text);
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, strong, b, p, div"));

    return headings
      .filter((element) => normalize(element.innerText) === target || normalize(element.innerText).startsWith(target))
      .sort((a, b) => normalize(a.innerText).length - normalize(b.innerText).length)[0] || null;
  }

  function getCardFromHeading(heading) {
    if (!heading) return null;

    let current = heading;

    for (let i = 0; i < 6 && current; i++) {
      const text = normalize(current.innerText);

      if (
        text.includes("habilidade") &&
        text.length > 80 &&
        text.length < 3000
      ) {
        return current;
      }

      current = current.parentElement;
    }

    return heading.parentElement;
  }

  function markFixed(element) {
    if (!element) return;
    element.setAttribute("data-sap-v8-fixed", "true");
  }

  function alreadyFixed(element) {
    return element && element.getAttribute("data-sap-v8-fixed") === "true";
  }

  function removeAreasDisciplinasTab() {
    const clickableElements = Array.from(
      document.querySelectorAll("button, a, [role='tab'], .tab, .nav-item, .menu-item")
    );

    clickableElements.forEach((element) => {
      const text = normalize(element.innerText || element.textContent);

      if (
        text === "areas e disciplinas" ||
        text.includes("areas e disciplinas")
      ) {
        element.style.display = "none";
        element.setAttribute("aria-hidden", "true");
      }
    });

    const possiblePanel = findSmallestElementContaining("Áreas e Disciplinas");

    if (possiblePanel) {
      const text = normalize(possiblePanel.innerText);

      if (
        text.includes("areas e disciplinas") &&
        !text.includes("questoes e devolutivas") &&
        !text.includes("habilidades criticas") &&
        text.length < 2500
      ) {
        possiblePanel.style.display = "none";
        possiblePanel.setAttribute("aria-hidden", "true");
      }
    }
  }

  const questao10D17 = {
    habilidade:
      "D17 EF — Identificar a localização de números racionais na reta numérica.",

    conhecimentos: [
      "Ler e interpretar uma reta numérica.",
      "Identificar a regularidade da escala apresentada na reta.",
      "Perceber de quanto em quanto as marcações avançam.",
      "Localizar pontos representados por letras em uma reta graduada.",
      "Relacionar números decimais e frações simples à sua posição na reta.",
      "Comparar números racionais escritos em diferentes representações.",
      "Verificar se uma afirmação sobre a posição de um ponto é verdadeira ou falsa."
    ],

    explicacao:
      "Para resolver esta questão, o aluno precisa perceber que a reta numérica está dividida em intervalos regulares e que cada ponto marcado ocupa uma posição específica nessa escala. A questão não avalia equação ou inequação; ela avalia leitura, comparação e localização de números racionais na reta numérica.",

    devolutiva: [
      "Professor, antes de revelar o gabarito, retome com a turma como se lê uma reta numérica.",
      "Comece perguntando: de quanto em quanto a reta está aumentando?",
      "Peça que os estudantes identifiquem o valor de cada marcação e localizem os pontos indicados pelas letras.",
      "Discuta com a turma se alguma alternativa apresenta número fora da posição indicada.",
      "Quando aparecer fração ou decimal, peça que os estudantes comparem as representações antes de decidir a alternativa.",
      "Redesenhe a reta no quadro e analise alternativa por alternativa, mostrando por que algumas afirmações não correspondem à posição real dos pontos.",
      "Para consolidar, proponha uma nova reta numérica com números decimais e frações simples, pedindo que os estudantes localizem pontos e justifiquem suas escolhas."
    ]
  };

  function isQuestao10Context() {
    const text = document.body.innerText || "";

    return (
      contains(text, "Questão 10") &&
      contains(text, "Minittestes 4") &&
      contains(text, "Matemática") &&
      contains(text, "D33 EF")
    );
  }

  function fixQuestao10Habilidade() {
    if (!isQuestao10Context()) return;

    const heading = findHeading("Habilidade e conhecimentos prévios");
    const card = getCardFromHeading(heading);

    if (!card || alreadyFixed(card)) return;

    card.innerHTML = `
      <h2>Habilidade e conhecimentos prévios</h2>

      <p>
        <strong>${questao10D17.habilidade}</strong>
      </p>

      <p style="margin-top: 12px;">
        ${questao10D17.explicacao}
      </p>

      <p style="margin-top: 12px;">
        <strong>Para resolver esta questão, o aluno precisa saber:</strong>
      </p>

      <ul>
        ${questao10D17.conhecimentos.map((item) => `<li>${item}</li>`).join("")}
      </ul>

      <div style="margin-top: 14px; padding: 12px 14px; border-radius: 14px; background: #ecfeff; border: 1px solid #a5f3fc; color: #164e63;">
        <strong>Correção pedagógica V8:</strong>
        esta questão foi reclassificada de D33 EF para D17 EF, pois o foco real do item é a localização de números racionais na reta numérica.
      </div>
    `;

    markFixed(card);
  }

  function fixQuestao10Devolutiva() {
    if (!isQuestao10Context()) return;

    const heading = findHeading("Sugestão para a devolutiva");
    const card = getCardFromHeading(heading);

    if (!card || alreadyFixed(card)) return;

    card.innerHTML = `
      <h2>Sugestão para a devolutiva</h2>

      <ol>
        ${questao10D17.devolutiva.map((item) => `<li>${item}</li>`).join("")}
      </ol>

      <div style="margin-top: 14px; padding: 12px 14px; border-radius: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #14532d;">
        <strong>Encaminhamento prático:</strong>
        organize a correção no quadro com uma reta numérica ampliada. Faça os alunos justificarem cada localização antes de marcar a alternativa correta.
      </div>
    `;

    markFixed(card);
  }

  function removeWrongDependencyItems() {
    const bodyText = document.body.innerText || "";

    if (!contains(bodyText, "Mapa de Dependências")) return;

    const cards = Array.from(document.querySelectorAll("section, article, div"));

    cards.forEach((card) => {
      const text = normalize(card.innerText);

      if (!text.includes("habilidade em foco")) return;
      if (alreadyFixed(card)) return;

      const isRetaNumerica =
        text.includes("reta numerica") ||
        text.includes("numeros racionais na reta") ||
        text.includes("localizacao de numeros racionais");

      if (!isRetaNumerica) return;

      const listItems = Array.from(card.querySelectorAll("li"));

      listItems.forEach((li) => {
        const itemText = normalize(li.innerText);

        const invalid =
          itemText.includes("equacao") ||
          itemText.includes("inequacao") ||
          itemText.includes("expressao algebrica") ||
          itemText.includes("lingua portuguesa") ||
          itemText.includes("genero textual") ||
          itemText.includes("ciencias da natureza") ||
          itemText.includes("historia") ||
          itemText.includes("geografia");

        const repeatedFocus =
          itemText.includes("identificar a localizacao de numeros racionais na reta numerica") &&
          text.includes("habilidade em foco");

        if (invalid || repeatedFocus) {
          li.style.display = "none";
          li.setAttribute("aria-hidden", "true");
        }
      });

      markFixed(card);
    });
  }

  function addV8Badge() {
    if (document.querySelector("[data-sap-v8-badge='true']")) return;

    const badge = document.createElement("div");
    badge.setAttribute("data-sap-v8-badge", "true");
    badge.textContent = V8_VERSION;

    badge.style.position = "fixed";
    badge.style.right = "14px";
    badge.style.bottom = "14px";
    badge.style.zIndex = "9999";
    badge.style.background = "#0f766e";
    badge.style.color = "#ffffff";
    badge.style.fontWeight = "900";
    badge.style.fontSize = "12px";
    badge.style.padding = "9px 12px";
    badge.style.borderRadius = "999px";
    badge.style.boxShadow = "0 10px 24px rgba(0,0,0,.18)";

    document.body.appendChild(badge);
  }

  function runPedagogicalFixes() {
    removeAreasDisciplinasTab();
    fixQuestao10Habilidade();
    fixQuestao10Devolutiva();
    removeWrongDependencyItems();
    addV8Badge();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runPedagogicalFixes);
  } else {
    runPedagogicalFixes();
  }

  const observer = new MutationObserver(() => {
    clearTimeout(window.__sapV8Timer);
    window.__sapV8Timer = setTimeout(runPedagogicalFixes, 120);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });

  window.SAP_V8_PEDAGOGICA = {
    version: V8_VERSION,
    revisarAgora: runPedagogicalFixes
  };
})();
