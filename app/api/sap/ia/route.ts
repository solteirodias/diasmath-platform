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
          descricao: cleanText(h.descricao, 300),
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
          habilidade: cleanText(q.habilidade, 300),
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
      return "retomar leitura de eixos, pares ordenados, variação entre grandezas e relação entre tabela, gráfico e expressão algébrica";
    }
    if (t.includes("ÁREA") || t.includes("VOLUME") || t.includes("PERÍMETRO")) {
      return "retomar identificação da figura, unidades de medida, composição/decomposição de áreas e diferença entre perímetro, área e volume";
    }
    if (t.includes("PROPORCIONAL") || t.includes("PORCENTAGEM") || t.includes("RACIONAIS") || t.includes("FRAÇÃO")) {
      return "retomar razão, equivalência, multiplicação, divisão, porcentagem e organização dos dados em tabela";
    }
    if (t.includes("EQUAÇÃO")) {
      return "retomar igualdade, operações inversas, substituição de valores e interpretação do resultado no problema";
    }
    return "retomar leitura do enunciado, seleção de dados, escolha da estratégia e validação do resultado";
  }

  if (t.includes("TESE") || t.includes("ARGUMENT")) {
    return "retomar tema, opinião, argumento, exemplo e marcas linguísticas que sustentam o ponto de vista";
  }
  if (t.includes("INFERIR") || t.includes("IMPLÍCITA")) {
    return "retomar localização de pistas no texto, sentido de palavras pelo contexto e justificativa da resposta com trechos";
  }
  if (t.includes("FATO") || t.includes("OPINIÃO")) {
    return "retomar diferença entre informação verificável e julgamento do autor, usando trechos do texto";
  }
  if (t.includes("FINALIDADE")) {
    return "retomar gênero textual, público-alvo, suporte e intenção comunicativa";
  }
  return "retomar leitura orientada, comando da questão, localização de evidências e comparação entre alternativas";
}

function localResponse(mode: string, ctx: any, question: string) {
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
    linhas.push("Mensagem sugerida para a escola");
    linhas.push("");
    linhas.push(`Prezada equipe, ao analisarmos o recorte de ${disciplina}, ${serie}, em ${instrumento}, observamos desempenho geral de ${asPct(ind.percentual_geral)}. O foco agora é transformar esse dado em ação pedagógica objetiva, priorizando as habilidades com menor percentual de acertos.`);
    if (habs.length) {
      linhas.push("");
      linhas.push("Sugerimos iniciar pelas seguintes habilidades:");
      habs.slice(0, 4).forEach((h: any) => linhas.push(`- ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao}`));
    }
    linhas.push("");
    linhas.push("Encaminhamento: organizar uma devolutiva com os professores, selecionar uma questão-modelo por habilidade, retomar os pré-requisitos e aplicar uma atividade curta de verificação. A GRE acompanhará o processo como apoio formativo.");
    return linhas.join("\n");
  }

  linhas.push(`${title} — ${ctx.recorte || "recorte selecionado"}`);
  linhas.push("");
  linhas.push("1. Síntese do diagnóstico");
  linhas.push(`O recorte de ${disciplina}, ${serie}, em ${instrumento}, apresenta desempenho geral de ${asPct(ind.percentual_geral)}, média estimada ${ind.media_estimada ?? "—"} e participação de ${ind.estudantes ?? "—"} estudante(s).`);
  linhas.push(`Há ${ind.habilidades_criticas ?? "—"} habilidade(s) em nível crítico ou baixo, o que indica necessidade de recomposição focal, e não apenas revisão geral de conteúdo.`);
  linhas.push("");

  linhas.push("2. Habilidades prioritárias");
  if (habs.length) {
    habs.forEach((h: any, i: number) => {
      linhas.push(`${i + 1}. ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao} (${classifyPriority(h.percentual)}).`);
    });
  } else {
    linhas.push("O recorte selecionado não possui habilidades suficientes para ordenar prioridades. Ajuste os filtros para uma série, disciplina ou aplicação específica.");
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

  if (mode === "plano" || mode === "pergunta") {
    linhas.push("4. Plano de intervenção recomendado");
    linhas.push("Semana 1 — Diagnóstico fino: selecione 2 ou 3 habilidades prioritárias, aplique uma questão curta por habilidade e peça que os estudantes expliquem o caminho de resolução.");
    linhas.push("Semana 2 — Retomada orientada: trabalhe os pré-requisitos com exemplos simples, representação visual, leitura do enunciado e comparação entre estratégias.");
    linhas.push("Semana 3 — Prática guiada: resolva itens semelhantes aos da avaliação, discutindo erros comuns e distratores.");
    linhas.push("Semana 4 — Verificação: aplique nova atividade curta, registre percentual de acerto e identifique estudantes que ainda precisam de reagrupamento.");
  } else if (mode === "devolutiva") {
    linhas.push("4. Devolutiva para o professor");
    linhas.push("Professor(a), o foco não deve ser apenas corrigir a prova. A orientação é escolher as habilidades com menor percentual, retomar o conceito-base, resolver uma questão-modelo e pedir que os estudantes justifiquem o raciocínio.");
    linhas.push("Na devolutiva, compare alternativas erradas com a correta para mostrar que tipo de leitura, cálculo ou interpretação levou ao erro.");
  } else if (mode === "reuniao") {
    linhas.push("4. Pauta para reunião de acompanhamento");
    linhas.push("1. Apresentar o recorte e o percentual geral.");
    linhas.push("2. Priorizar até três habilidades por disciplina/série.");
    linhas.push("3. Definir ação de recomposição por professor.");
    linhas.push("4. Pactuar uma evidência: atividade curta, registro de acertos e nova devolutiva.");
    linhas.push("5. Retomar os resultados no próximo encontro da gestão/formação.");
  } else {
    linhas.push("4. Encaminhamento pedagógico");
    linhas.push("Organize a recomposição por descritor. Para cada habilidade prioritária, defina: pré-requisito, questão-modelo, atividade de retomada, evidência de aprendizagem e prazo de acompanhamento.");
  }
  linhas.push("");

  if (ctx.perfil === "GRE" && Array.isArray(ctx.escolas_mais_criticas) && ctx.escolas_mais_criticas.length) {
    linhas.push("5. Acompanhamento da GRE");
    linhas.push("As escolas com menor percentual no recorte devem receber acompanhamento formativo, com foco em apoio pedagógico, não exposição.");
    ctx.escolas_mais_criticas.slice(0, 5).forEach((e: any, i: number) => {
      linhas.push(`${i + 1}. ${e.escola} — ${asPct(e.percentual)}.`);
    });
    linhas.push("");
  }

  linhas.push("Encaminhamento final");
  linhas.push("A ação mais eficiente é trabalhar poucas habilidades por ciclo, com devolutiva clara, atividade curta e nova verificação. O objetivo é transformar o resultado da avaliação em decisão pedagógica concreta para a sala de aula.");

  return linhas.join("\n");
}

function buildInstruction(mode: string, question: string) {
  return `Você é a IA Pedagógica do SAP Avaliações 2026 da DIASMATH, especialista em avaliação educacional, recomposição de aprendizagens, formação docente, Matemática e Língua Portuguesa.

Tarefa: ${modeLabel(mode)}.

Regras obrigatórias:
- Produza uma resposta consistente, aplicável à prática de professores, coordenadores e gestores.
- Use somente os dados consolidados do contexto.
- Não invente escola, percentual, descritor ou série.
- Não fale sobre API, chave, token, modo local, erro técnico, status HTTP ou configuração.
- Não inclua aviso de privacidade na resposta.
- Quando faltar dado, diga apenas que o recorte não apresenta essa informação.
- Não use tom punitivo.
- Não exponha escolas de forma vexatória.
- Priorize ações pedagógicas concretas: pré-requisito, devolutiva, atividade, reagrupamento, evidência e acompanhamento.
- Use linguagem clara, firme e formativa.
- Organize com títulos curtos.

Pergunta do usuário:
${question || "Não houve pergunta personalizada."}`;
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
                  "Analise o contexto consolidado do SAP e produza uma orientação pedagógica prática.\n\n" +
                  JSON.stringify(context, null, 2),
              },
            ],
          },
        ],
        max_output_tokens: 1500,
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
    const forbidden = /(OPENAI_API_KEY|API|status\s*\d+|HTTP|modo local|token|chave|erro técnico|erro tecnico)/i;

    return Response.json({
      ok: true,
      texto: forbidden.test(texto) ? fallback : texto,
      source: "sap_ai",
    });
  } catch (error) {
    return Response.json(
      {
        ok: true,
        texto:
          "Diagnóstico pedagógico\n\nO recorte selecionado precisa ser analisado a partir das habilidades com menor percentual de acertos. Priorize uma intervenção focal: retome os pré-requisitos, trabalhe uma questão-modelo com mediação, aplique uma atividade curta de verificação e acompanhe os estudantes que permanecerem com dificuldade.",
        source: "pedagogical_engine",
      },
      { status: 200 }
    );
  }
}
