export const runtime = "nodejs";

type SAPAIRequest = {
  mode?: string;
  question?: string;
  context?: any;
};

function cleanText(value: unknown, max = 6000): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function safeNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asPct(value: unknown): string {
  const n = safeNumber(value);
  return n === null ? "—" : `${Number(n.toFixed(1))}%`;
}

function limitContext(ctx: any) {
  const indicadores = ctx?.indicadores || {};
  return {
    sistema: cleanText(ctx?.sistema, 100),
    perfil: cleanText(ctx?.perfil, 50),
    usuario: cleanText(ctx?.usuario, 180),
    inep: cleanText(ctx?.inep, 30),
    recorte: cleanText(ctx?.recorte, 300),
    filtros: {
      instrumento: cleanText(ctx?.filtros?.instrumento, 80),
      aplicacao: cleanText(ctx?.filtros?.aplicacao, 40),
      serie: cleanText(ctx?.filtros?.serie, 80),
      disciplina: cleanText(ctx?.filtros?.disciplina, 80),
      escola: cleanText(ctx?.filtros?.escola, 180),
    },
    indicadores: {
      percentual_geral: safeNumber(indicadores.percentual_geral),
      media_estimada: safeNumber(indicadores.media_estimada),
      estudantes: safeNumber(indicadores.estudantes),
      escolas: safeNumber(indicadores.escolas),
      aplicacoes: safeNumber(indicadores.aplicacoes),
      acertos: safeNumber(indicadores.acertos),
      esperado: safeNumber(indicadores.esperado),
      habilidades_criticas: safeNumber(indicadores.habilidades_criticas),
    },
    habilidades_prioritarias: Array.isArray(ctx?.habilidades_prioritarias)
      ? ctx.habilidades_prioritarias.slice(0, 12).map((h: any) => ({
          codigo: cleanText(h.codigo, 30),
          descricao: cleanText(h.descricao, 320),
          percentual: safeNumber(h.percentual),
          itens: safeNumber(h.itens),
          nivel: cleanText(h.nivel, 80),
        }))
      : [],
    ranking_escolas: Array.isArray(ctx?.ranking_escolas)
      ? ctx.ranking_escolas.slice(0, 8).map((r: any) => ({
          posicao: safeNumber(r.posicao),
          escola: cleanText(r.escola, 180),
          inep: cleanText(r.inep, 30),
          percentual: safeNumber(r.percentual),
          media: safeNumber(r.media),
          estudantes: safeNumber(r.estudantes),
        }))
      : [],
    escolas_mais_criticas: Array.isArray(ctx?.escolas_mais_criticas)
      ? ctx.escolas_mais_criticas.slice(0, 8).map((r: any) => ({
          posicao_critica: safeNumber(r.posicao_critica),
          escola: cleanText(r.escola, 180),
          inep: cleanText(r.inep, 30),
          percentual: safeNumber(r.percentual),
          media: safeNumber(r.media),
          estudantes: safeNumber(r.estudantes),
        }))
      : [],
    questoes_criticas: Array.isArray(ctx?.questoes_criticas)
      ? ctx.questoes_criticas.slice(0, 8).map((q: any) => ({
          numero: safeNumber(q.numero),
          descritor: cleanText(q.descritor, 30),
          habilidade: cleanText(q.habilidade, 320),
          percentual_erro: safeNumber(q.percentual_erro),
          instrumento: cleanText(q.instrumento, 80),
          aplicacao: cleanText(q.aplicacao, 40),
          serie: cleanText(q.serie, 80),
          disciplina: cleanText(q.disciplina, 80),
        }))
      : [],
    grupos: Array.isArray(ctx?.grupos)
      ? ctx.grupos.slice(0, 30).map((g: any) => ({
          instrumento: cleanText(g.instrumento, 80),
          aplicacao: cleanText(g.aplicacao, 40),
          serie: cleanText(g.serie, 80),
          disciplina: cleanText(g.disciplina, 80),
          escolas: safeNumber(g.escolas),
          estudantes: safeNumber(g.estudantes),
          percentual: safeNumber(g.percentual),
        }))
      : [],
  };
}

function modeLabel(mode: string) {
  const labels: Record<string, string> = {
    diagnostico: "Diagnóstico pedagógico",
    plano: "Plano de intervenção",
    devolutiva: "Devolutiva para professor",
    reuniao: "Resumo para reunião da GRE",
    mensagem: "Mensagem para escola",
    pergunta: "Pergunta personalizada",
  };
  return labels[mode] || "Análise pedagógica";
}

function classifyPriority(pct: number | null): string {
  if (pct === null) return "sem percentual no recorte";
  if (pct <= 30) return "prioridade urgente";
  if (pct <= 50) return "prioridade de recomposição";
  if (pct <= 70) return "habilidade de consolidação";
  return "habilidade em acompanhamento";
}

function prereqSuggestion(text: string, disciplina: string): string {
  const t = text.toUpperCase();
  const d = disciplina.toUpperCase();

  if (d.includes("MAT")) {
    if (t.includes("FUNÇÃO") || t.includes("GRÁFICO") || t.includes("RETA")) {
      return "leitura de eixos, pares ordenados, variação entre grandezas e relação entre tabela, gráfico e expressão algébrica";
    }
    if (t.includes("ÁREA") || t.includes("VOLUME") || t.includes("PERÍMETRO")) {
      return "identificação da figura, unidades de medida, decomposição de áreas e diferença entre perímetro, área e volume";
    }
    if (t.includes("PROPORCIONAL") || t.includes("PORCENTAGEM") || t.includes("RACIONAIS") || t.includes("FRAÇÃO")) {
      return "razão, equivalência, multiplicação, divisão, porcentagem e organização dos dados";
    }
    if (t.includes("EQUAÇÃO")) {
      return "igualdade, operações inversas, substituição de valores e interpretação do resultado";
    }
    return "leitura do enunciado, seleção de dados, escolha de estratégia e validação do resultado";
  }

  if (t.includes("TESE") || t.includes("ARGUMENT")) {
    return "tema, opinião, argumento, exemplo e marcas linguísticas que sustentam o ponto de vista";
  }
  if (t.includes("INFERIR") || t.includes("IMPLÍCITA")) {
    return "localização de pistas no texto, sentido de palavras pelo contexto e justificativa com trechos";
  }
  if (t.includes("FATO") || t.includes("OPINIÃO")) {
    return "diferença entre informação verificável e julgamento do autor";
  }
  if (t.includes("FINALIDADE")) {
    return "gênero textual, público-alvo, suporte e intenção comunicativa";
  }
  return "leitura orientada, comando da questão, localização de evidências e comparação entre alternativas";
}

function directPersonalizedOpening(question: string, ctx: any): string {
  const q = question.toLowerCase();
  const disciplina = String(ctx?.filtros?.disciplina || "").toLowerCase();

  if (q.includes("melhorar") && (q.includes("matem") || disciplina.includes("matem"))) {
    return "Para melhorar o desempenho dos estudantes em Matemática, a escola deve priorizar as habilidades com menor percentual de acertos e transformar cada descritor crítico em uma sequência curta de retomada, prática guiada e verificação.";
  }
  if (q.includes("devolutiva") || q.includes("professor")) {
    return "A devolutiva aos professores deve ser feita por habilidade, mostrando o que os estudantes ainda não consolidaram, qual pré-requisito precisa ser retomado e que atividade será usada para verificar avanço.";
  }
  if (q.includes("gest") || q.includes("coorden") || q.includes("gre")) {
    return "A gestão deve acompanhar a intervenção com foco em evidências: habilidade priorizada, ação realizada, nova atividade aplicada e evolução do percentual de acertos.";
  }
  if (q.includes("escola")) {
    return "A orientação para a escola deve ser objetiva: selecionar poucas habilidades críticas, organizar uma devolutiva com os professores e acompanhar uma nova evidência de aprendizagem.";
  }
  return "A resposta deve partir diretamente da pergunta feita e usar os dados do recorte apenas para definir prioridades, ações pedagógicas e formas de acompanhamento.";
}

function localPersonalizedResponse(ctx: any, question: string) {
  const filtros = ctx.filtros || {};
  const ind = ctx.indicadores || {};
  const habs = Array.isArray(ctx.habilidades_prioritarias) ? ctx.habilidades_prioritarias.slice(0, 7) : [];
  const linhas: string[] = [];

  linhas.push(directPersonalizedOpening(question, ctx));
  linhas.push("");

  linhas.push("No recorte selecionado, os dados indicam:");
  linhas.push(`- Percentual geral: ${asPct(ind.percentual_geral)}.`);
  linhas.push(`- Série/área: ${filtros.serie || "—"} • ${filtros.disciplina || "—"}.`);
  linhas.push(`- Instrumento/aplicação: ${filtros.instrumento || "—"} • ${filtros.aplicacao || "—"}.`);
  linhas.push(`- Habilidades críticas ou baixas: ${ind.habilidades_criticas ?? "—"}.`);
  linhas.push("");

  if (habs.length) {
    linhas.push("Priorize estas habilidades primeiro:");
    habs.slice(0, 5).forEach((h: any, i: number) => {
      linhas.push(`${i + 1}. ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao}`);
    });
  } else {
    linhas.push("O recorte não apresenta habilidades suficientes para ordenar prioridades. Ajuste os filtros para uma série, disciplina ou aplicação específica.");
  }
  linhas.push("");

  linhas.push("Como transformar isso em prática:");
  linhas.push("1. Escolha até três habilidades prioritárias para um ciclo de intervenção.");
  linhas.push("2. Antes de refazer questões, retome o pré-requisito de cada habilidade.");
  linhas.push("3. Resolva uma questão-modelo com a turma, explicitando o caminho de raciocínio.");
  linhas.push("4. Aplique uma atividade curta semelhante para verificar se houve aprendizagem.");
  linhas.push("5. Reagrupe os estudantes que ainda apresentarem dificuldade e faça nova mediação.");

  if (String(filtros.disciplina || "").toLowerCase().includes("matem") || question.toLowerCase().includes("matem")) {
    linhas.push("");
    linhas.push("Em Matemática, a intervenção deve começar pela compreensão da situação-problema: leitura do enunciado, identificação dos dados, representação visual ou tabela, estimativa e só depois o cálculo formal.");
  }

  return linhas.join("\n");
}

function localResponse(mode: string, ctx: any, question: string) {
  if (mode === "pergunta") {
    return localPersonalizedResponse(ctx, question);
  }

  const filtros = ctx.filtros || {};
  const ind = ctx.indicadores || {};
  const disciplina = filtros.disciplina || "disciplina selecionada";
  const serie = filtros.serie || "série selecionada";
  const instrumento = filtros.instrumento || "avaliação selecionada";
  const habs = Array.isArray(ctx.habilidades_prioritarias) ? ctx.habilidades_prioritarias.slice(0, 8) : [];
  const criticas = habs.filter((h: any) => h.percentual !== null && h.percentual <= 50);
  const title = modeLabel(mode);
  const linhas: string[] = [];

  if (mode === "mensagem") {
    linhas.push("Prezada equipe, o recorte analisado indica que a escola precisa transformar os dados da avaliação em uma ação pedagógica objetiva e acompanhável.");
    linhas.push("");
    linhas.push(`Em ${disciplina}, ${serie}, no instrumento ${instrumento}, o desempenho geral foi de ${asPct(ind.percentual_geral)}.`);
    if (habs.length) {
      linhas.push("");
      linhas.push("Sugerimos iniciar pelas seguintes habilidades:");
      habs.slice(0, 4).forEach((h: any) => linhas.push(`- ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao}`));
    }
    linhas.push("");
    linhas.push("Encaminhamento: organizar uma devolutiva com os professores, selecionar uma questão-modelo por habilidade, retomar os pré-requisitos e aplicar uma atividade curta de verificação.");
    return linhas.join("\n");
  }

  linhas.push(`${title} — ${ctx.recorte || "recorte selecionado"}`);
  linhas.push("");
  linhas.push("1. Síntese do diagnóstico");
  linhas.push(`O recorte de ${disciplina}, ${serie}, em ${instrumento}, apresenta desempenho geral de ${asPct(ind.percentual_geral)}, média estimada ${ind.media_estimada ?? "—"} e participação de ${ind.estudantes ?? "—"} estudante(s).`);
  linhas.push(`Há ${ind.habilidades_criticas ?? "—"} habilidade(s) em nível crítico ou baixo, o que indica necessidade de recomposição focal.`);
  linhas.push("");

  linhas.push("2. Habilidades prioritárias");
  if (habs.length) {
    habs.forEach((h: any, i: number) => {
      linhas.push(`${i + 1}. ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao} (${classifyPriority(h.percentual)}).`);
    });
  } else {
    linhas.push("O recorte selecionado não possui habilidades suficientes para ordenar prioridades.");
  }
  linhas.push("");

  linhas.push("3. Possíveis causas pedagógicas");
  if (criticas.length) {
    criticas.slice(0, 4).forEach((h: any) => {
      linhas.push(`- ${h.codigo}: a dificuldade pode estar ligada a ${prereqSuggestion(h.descricao || "", disciplina)}.`);
    });
  } else {
    linhas.push("- As habilidades do recorte não aparecem em nível muito baixo. A ação pode focar consolidação, ampliação de repertório e análise dos distratores.");
  }
  linhas.push("");

  if (mode === "plano") {
    linhas.push("4. Plano de intervenção recomendado");
    linhas.push("Semana 1: selecione 2 ou 3 habilidades prioritárias e aplique uma questão curta por habilidade.");
    linhas.push("Semana 2: retome pré-requisitos com exemplos simples e representação visual.");
    linhas.push("Semana 3: resolva itens semelhantes com mediação, discutindo erros comuns.");
    linhas.push("Semana 4: aplique nova verificação e registre quem avançou.");
  } else if (mode === "devolutiva") {
    linhas.push("4. Devolutiva para o professor");
    linhas.push("Professor(a), escolha as habilidades com menor percentual, retome o conceito-base, resolva uma questão-modelo e peça que os estudantes justifiquem o raciocínio.");
  } else if (mode === "reuniao") {
    linhas.push("4. Pauta para reunião");
    linhas.push("1. Apresentar o recorte e o percentual geral.");
    linhas.push("2. Priorizar até três habilidades.");
    linhas.push("3. Definir ação por professor.");
    linhas.push("4. Pactuar evidência de acompanhamento.");
  } else {
    linhas.push("4. Encaminhamento pedagógico");
    linhas.push("Organize a recomposição por descritor, com pré-requisito, questão-modelo, atividade de retomada, evidência de aprendizagem e prazo.");
  }

  if (ctx.perfil === "GRE" && Array.isArray(ctx.escolas_mais_criticas) && ctx.escolas_mais_criticas.length) {
    linhas.push("");
    linhas.push("5. Acompanhamento da GRE");
    linhas.push("As escolas com menor percentual devem receber acompanhamento formativo, com foco em apoio pedagógico.");
    ctx.escolas_mais_criticas.slice(0, 5).forEach((e: any, i: number) => {
      linhas.push(`${i + 1}. ${e.escola} — ${asPct(e.percentual)}.`);
    });
  }

  linhas.push("");
  linhas.push("Encaminhamento final");
  linhas.push("Trabalhe poucas habilidades por ciclo, com devolutiva clara, atividade curta e nova verificação.");

  return linhas.join("\n");
}

function buildInstruction(mode: string, question: string) {
  if (mode === "pergunta") {
    return `Você é a IA Pedagógica do SAP Avaliações 2026 da DIASMATH.

REGRA MAIS IMPORTANTE:
Responda somente à pergunta personalizada do usuário.
A primeira linha da resposta deve começar respondendo diretamente à pergunta.
Não comece com título.
Não comece com "Pergunta personalizada".
Não comece citando o recorte.
Não faça diagnóstico geral se a pergunta não pedir diagnóstico.
Não explique o sistema.
Não fale sobre API, chave, token, configuração, erro técnico, HTTP ou status.
Não inclua aviso de privacidade.
Use os dados do contexto apenas quando ajudarem a responder à pergunta.
Se a pergunta for "Como melhorar...", responda com ações práticas, objetivas e pedagógicas.
Se citar habilidades, cite apenas as que aparecem no contexto.
Se faltarem dados para algum ponto, diga de forma simples que o recorte não apresenta essa informação.
A resposta deve ajudar professores, coordenadores e gestores a agir na escola.

Pergunta personalizada:
${question || "O usuário não escreveu a pergunta. Oriente a selecionar uma pergunta objetiva."}`;
  }

  return `Você é a IA Pedagógica do SAP Avaliações 2026 da DIASMATH, especialista em avaliação educacional, recomposição de aprendizagens, formação docente, Matemática e Língua Portuguesa.

Tarefa: ${modeLabel(mode)}.

Regras obrigatórias:
- Produza uma resposta aplicável à prática de professores, coordenadores e gestores.
- Use somente os dados consolidados do contexto.
- Não invente escola, percentual, descritor ou série.
- Não fale sobre API, chave, token, modo local, erro técnico, status HTTP ou configuração.
- Não inclua aviso de privacidade.
- Quando faltar dado, diga apenas que o recorte não apresenta essa informação.
- Não use tom punitivo.
- Priorize ações concretas: pré-requisito, devolutiva, atividade, reagrupamento, evidência e acompanhamento.
- Use linguagem clara, firme e formativa.

Pergunta do usuário, se houver:
${question || "Não houve pergunta personalizada."}`;
}

function firstLineLooksGeneric(text: string): boolean {
  const first = cleanText(text, 600).split(/\n/)[0] || "";
  return /^(pergunta personalizada|diagnóstico pedagógico|diagnostico pedagogico|análise pedagógica|analise pedagogica|recorte|simula\+|avaliação|avaliacao)/i.test(first.trim());
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as SAPAIRequest;
    const mode = cleanText(raw.mode || "diagnostico", 30);
    const question = cleanText(raw.question || "", 1000);
    const context = limitContext(raw.context || {});
    const fallback = localResponse(mode, context, question);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ ok: true, texto: fallback, source: "pedagogical_engine" });
    }

    const model = process.env.OPENAI_MODEL || "gpt-5-mini";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: buildInstruction(mode, question),
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Contexto consolidado do SAP para apoiar a resposta. Não responda além da pergunta feita.\n\n" +
                  JSON.stringify(context, null, 2),
              },
            ],
          },
        ],
        max_output_tokens: mode === "pergunta" ? 1100 : 1500,
        store: false,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json({ ok: true, texto: fallback, source: "pedagogical_engine" });
    }

    const outputText =
      typeof data?.output_text === "string"
        ? data.output_text
        : Array.isArray(data?.output)
          ? data.output
              .flatMap((item: any) => (Array.isArray(item.content) ? item.content : []))
              .map((content: any) => content.text || "")
              .join(" ")
          : "";

    const texto = cleanText(outputText, 9000) || fallback;
    const forbidden = /(OPENAI_API_KEY|API|status\s*\d+|HTTP|modo local|token|chave|erro técnico|erro tecnico|configura)/i;

    if (forbidden.test(texto)) {
      return Response.json({ ok: true, texto: fallback, source: "pedagogical_engine" });
    }

    if (mode === "pergunta" && firstLineLooksGeneric(texto)) {
      return Response.json({ ok: true, texto: fallback, source: "pedagogical_engine" });
    }

    return Response.json({ ok: true, texto, source: "sap_ai" });
  } catch (error) {
    return Response.json(
      {
        ok: true,
        texto:
          "Para responder melhor à pergunta, selecione um recorte específico no SAP e priorize as habilidades com menor percentual de acertos, transformando cada uma em uma ação de retomada, prática guiada e verificação.",
        source: "pedagogical_engine",
      },
      { status: 200 }
    );
  }
}
