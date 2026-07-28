(function () {
  "use strict";

  const V8 = "SAP Avaliações 2026 — V8.1 Descritores pela imagem original";

  const OVERRIDES = {
    // Correção já identificada visualmente
    "questao-10": {
      codigo: "D17",
      descricao: "Identificar a localização de números racionais na reta numérica.",
      motivo:
        "A imagem original da Questão 10 mostra D17. O sistema estava exibindo D33 indevidamente.",
      conhecimentos: [
        "Ler e interpretar uma reta numérica.",
        "Identificar a regularidade da escala apresentada.",
        "Perceber de quanto em quanto as marcações avançam.",
        "Localizar pontos representados por letras na reta graduada.",
        "Relacionar números decimais e frações simples à sua posição na reta.",
        "Comparar números racionais em diferentes representações.",
        "Verificar se uma afirmação sobre a posição de um ponto é verdadeira ou falsa."
      ],
      devolutiva: [
        "Professor, antes de revelar o gabarito, retome com a turma como se lê uma reta numérica.",
        "Pergunte de quanto em quanto a reta está aumentando e qual é o valor de cada marcação.",
        "Peça que os estudantes localizem os pontos indicados pelas letras.",
        "Discuta alternativa por alternativa, verificando se o número indicado corresponde realmente à posição do ponto.",
        "Quando aparecer fração ou número decimal, solicite que os alunos comparem as representações antes de escolher a alternativa.",
        "Redesenhe a reta no quadro e faça a marcação coletiva dos pontos.",
        "Para consolidar, proponha uma nova reta numérica com números decimais e frações simples."
      ]
    }
  };

  const GUIAS = {
    D17: {
      descricao: "Identificar a localização de números racionais na reta numérica.",
      conhecimentos: [
        "Ler e interpretar uma reta numérica.",
        "Identificar a escala e as subdivisões da reta.",
        "Comparar números racionais em forma decimal e fracionária.",
        "Relacionar cada número à posição correspondente na reta.",
        "Analisar se uma afirmação sobre a localização de um ponto é verdadeira ou falsa."
      ],
      devolutiva: [
        "Retome a leitura da reta numérica antes de corrigir a questão.",
        "Peça que os estudantes identifiquem a escala usada.",
        "Marque coletivamente os pontos indicados.",
        "Discuta os erros de localização mais comuns.",
        "Aplique uma nova questão semelhante para verificar se a turma consolidou a habilidade."
      ]
    }
  };

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function contem(texto, termo) {
    return normalizar(texto).includes(normalizar(termo));
  }

  function codigoDescritor(texto) {
    const match = String(texto || "").match(/\bD\s*([0-9]{2})\b/i);
    return match ? `D${match[1]}` : null;
  }

  function questaoAtual() {
    const texto = document.body.innerText || "";
    const match = texto.match(/Questão\s+([0-9]+)/i);
    return match ? Number(match[1]) : null;
  }

  function chaveQuestaoAtual() {
    const q = questaoAtual();
    return q ? `questao-${q}` : null;
  }

  function menorElementoComTexto(texto) {
    const alvo = normalizar(texto);
    const elementos = Array.from(
      document.querySelectorAll("main, section, article, aside, div")
    );

    return (
      elementos
        .filter((el) => normalizar(el.innerText).includes(alvo))
        .sort(
          (a, b) =>
            normalizar(a.innerText).length - normalizar(b.innerText).length
        )[0] || null
    );
  }

  function encontrarTitulo(texto) {
    const alvo = normalizar(texto);
    const elementos = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, strong, b, p, div")
    );

    return (
      elementos
        .filter((el) => {
          const t = normalizar(el.innerText);
          return t === alvo || t.startsWith(alvo);
        })
        .sort(
          (a, b) =>
            normalizar(a.innerText).length - normalizar(b.innerText).length
        )[0] || null
    );
  }

  function cardDoTitulo(titulo) {
    if (!titulo) return null;

    let atual = titulo;

    for (let i = 0; i < 7 && atual; i++) {
      const texto = normalizar(atual.innerText);

      if (
        texto.length > 80 &&
        texto.length < 4000 &&
        (texto.includes("habilidade") ||
          texto.includes("devolutiva") ||
          texto.includes("conhecimentos previos"))
      ) {
        return atual;
      }

      atual = atual.parentElement;
    }

    return titulo.parentElement;
  }

  function removerAbaAreasDisciplinas() {
    const elementos = Array.from(
      document.querySelectorAll("button, a, [role='tab'], .tab, .nav-item")
    );

    elementos.forEach((el) => {
      const texto = normalizar(el.innerText || el.textContent);

      if (texto.includes("areas e disciplinas")) {
        el.style.display = "none";
        el.setAttribute("aria-hidden", "true");
      }
    });
  }

  function atualizarTextoDescritorVisivel(codigo, descricao) {
    const elementos = Array.from(
      document.querySelectorAll("p, span, strong, b, div, h2, h3, li")
    );

    elementos.forEach((el) => {
      const texto = el.innerText || "";
      const atual = codigoDescritor(texto);

      if (!atual) return;

      if (atual !== codigo) {
        el.innerHTML = el.innerHTML.replace(
          /\bD\s*[0-9]{2}\b[^<.]*/i,
          `${codigo} — ${descricao}`
        );
        el.setAttribute("data-sap-v8-descritor-corrigido", "true");
      }
    });
  }

  function corrigirHabilidadeConhecimentos(codigo, guia, motivo) {
    const titulo = encontrarTitulo("Habilidade e conhecimentos prévios");
    const card = cardDoTitulo(titulo);

    if (!card) return;

    card.innerHTML = `
      <h2>Habilidade e conhecimentos prévios</h2>

      <p>
        <strong>${codigo} — ${guia.descricao}</strong>
      </p>

      <p style="margin-top: 12px;">
        <strong>Fonte do descritor:</strong> imagem original da questão.
      </p>

      <p style="margin-top: 12px;">
        Para resolver esta questão, o aluno precisa mobilizar conhecimentos diretamente relacionados ao descritor identificado no próprio item.
      </p>

      <p style="margin-top: 12px;">
        <strong>Conhecimentos prévios necessários:</strong>
      </p>

      <ul>
        ${guia.conhecimentos.map((item) => `<li>${item}</li>`).join("")}
      </ul>

      <div style="margin-top: 14px; padding: 12px 14px; border-radius: 14px; background: #ecfeff; border: 1px solid #a5f3fc; color: #164e63;">
        <strong>Correção pedagógica V8.1:</strong>
        ${motivo || "O descritor exibido foi ajustado para coincidir com o código apresentado na imagem original da questão."}
      </div>
    `;
  }

  function corrigirDevolutiva(codigo, guia) {
    const titulo = encontrarTitulo("Sugestão para a devolutiva");
    const card = cardDoTitulo(titulo);

    if (!card) return;

    card.innerHTML = `
      <h2>Sugestão para a devolutiva</h2>

      <p>
        <strong>Descritor trabalhado:</strong> ${codigo} — ${guia.descricao}
      </p>

      <ol style="margin-top: 12px;">
        ${guia.devolutiva.map((item) => `<li>${item}</li>`).join("")}
      </ol>

      <div style="margin-top: 14px; padding: 12px 14px; border-radius: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #14532d;">
        <strong>Encaminhamento prático:</strong>
        organize a devolutiva a partir do erro observado na questão, retomando primeiro os conhecimentos necessários e só depois apresentando o gabarito.
      </div>
    `;
  }

  function corrigirQuestaoPorOverride() {
    const chave = chaveQuestaoAtual();

    if (!chave || !OVERRIDES[chave]) return;

    const correcao = OVERRIDES[chave];
    const guia = {
      descricao: correcao.descricao,
      conhecimentos: correcao.conhecimentos,
      devolutiva: correcao.devolutiva
    };

    atualizarTextoDescritorVisivel(correcao.codigo, correcao.descricao);
    corrigirHabilidadeConhecimentos(correcao.codigo, guia, correcao.motivo);
    corrigirDevolutiva(correcao.codigo, guia);
  }

  function corrigirDescritoresDivergentesVisiveis() {
    const texto = document.body.innerText || "";
    const codigoNaTela = codigoDescritor(texto);

    if (!codigoNaTela) return;

    const guia = GUIAS[codigoNaTela];

    if (!guia) return;

    atualizarTextoDescritorVisivel(codigoNaTela, guia.descricao);
  }

  function inserirAvisoFonteV8() {
    if (document.querySelector("[data-sap-v8-aviso='true']")) return;

    const aviso = document.createElement("div");
    aviso.setAttribute("data-sap-v8-aviso", "true");

    aviso.innerHTML = `
      <strong>V8.1 Pedagógica</strong> — descritores conferidos pela imagem original da questão.
    `;

    aviso.style.position = "fixed";
    aviso.style.right = "14px";
    aviso.style.bottom = "14px";
    aviso.style.zIndex = "9999";
    aviso.style.background = "#0f766e";
    aviso.style.color = "#ffffff";
    aviso.style.fontWeight = "900";
    aviso.style.fontSize = "12px";
    aviso.style.padding = "9px 12px";
    aviso.style.borderRadius = "999px";
    aviso.style.boxShadow = "0 10px 24px rgba(0,0,0,.18)";

    document.body.appendChild(aviso);
  }

  function destacarInconsistencias() {
    const cards = Array.from(document.querySelectorAll("section, article, div"));

    cards.forEach((card) => {
      const texto = card.innerText || "";

      const codigos = texto.match(/\bD\s*[0-9]{2}\b/gi);

      if (!codigos || codigos.length < 2) return;

      const unicos = Array.from(
        new Set(codigos.map((c) => c.replace(/\s+/g, "").toUpperCase()))
      );

      if (unicos.length > 1 && normalizar(texto).includes("questao")) {
        card.style.outline = "3px solid #f97316";
        card.style.outlineOffset = "3px";

        if (!card.querySelector("[data-sap-v8-alerta='true']")) {
          const alerta = document.createElement("div");
          alerta.setAttribute("data-sap-v8-alerta", "true");
          alerta.innerHTML = `
            <strong>Atenção:</strong> há mais de um descritor aparecendo neste bloco. 
            Conferir o código da imagem original da questão.
          `;
          alerta.style.marginTop = "10px";
          alerta.style.padding = "10px 12px";
          alerta.style.borderRadius = "12px";
          alerta.style.background = "#fff7ed";
          alerta.style.border = "1px solid #fed7aa";
          alerta.style.color = "#9a3412";
          alerta.style.fontWeight = "800";

          card.appendChild(alerta);
        }
      }
    });
  }

  function rodarV8() {
    removerAbaAreasDisciplinas();
    corrigirQuestaoPorOverride();
    corrigirDescritoresDivergentesVisiveis();
    destacarInconsistencias();
    inserirAvisoFonteV8();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rodarV8);
  } else {
    rodarV8();
  }

  const observer = new MutationObserver(() => {
    clearTimeout(window.__SAP_V8_DESCRITORES_TIMER__);
    window.__SAP_V8_DESCRITORES_TIMER__ = setTimeout(rodarV8, 150);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });

  window.SAP_V8_DESCRITORES = {
    versao: V8,
    rodarAgora: rodarV8,
    overrides: OVERRIDES,
    guias: GUIAS
  };
})();
