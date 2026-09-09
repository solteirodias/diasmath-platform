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
          descricao: cleanText(h.descricao, 260),
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
          habilidade: cleanText(q.habilidade, 260),
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
    privacidade: "Dados consolidados de avaliação. Não usar nem solicitar dados pessoais de estudantes.",
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

function localFallback(mode: string, ctx: any) {
  const indicadores = ctx.indicadores || {};
  const habilidades = Array.isArray(ctx.habilidades_prioritarias) ? ctx.habilidades_prioritarias.slice(0, 5) : [];
  const linhas: string[] = [];

  linhas.push(`${modeLabel(mode)} — ${ctx.recorte || "recorte selecionado"}`);
  linhas.push("");
  linhas.push(`O recorte apresenta percentual geral de ${indicadores.percentual_geral ?? "—"}%, média estimada ${indicadores.media_estimada ?? "—"} e ${indicadores.habilidades_criticas ?? "—"} habilidade(s) em nível crítico ou baixo.`);
  linhas.push("");
  linhas.push("Prioridades pedagógicas:");
  if (habilidades.length) {
    habilidades.forEach((h: any, i: number) => {
      linhas.push(`${i + 1}. ${h.codigo} — ${h.percentual ?? "—"}%: ${h.descricao}`);
    });
  } else {
    linhas.push("Não há habilidades suficientes no recorte atual para ordenar prioridades.");
  }
  linhas.push("");

  if (mode === "plano") {
    linhas.push("Plano sugerido:");
    linhas.push("1. Retomar os pré-requisitos das habilidades mais críticas.");
    linhas.push("2. Trabalhar itens-modelo com mediação do professor.");
    linhas.push("3. Fazer uma atividade curta de verificação na mesma habilidade.");
    linhas.push("4. Registrar evidências e comparar com a próxima aplicação.");
  } else if (mode === "mensagem") {
    linhas.push("Mensagem sugerida:");
    linhas.push("A escola possui dados importantes para orientar a recomposição das aprendizagens. A sugestão é priorizar as habilidades com menor percentual, organizar devolutiva por descritor e acompanhar evidências nas próximas atividades.");
  } else if (mode === "reuniao") {
    linhas.push("Pauta sugerida para reunião:");
    linhas.push("1. Apresentar o recorte e o percentual geral.");
    linhas.push("2. Discutir as habilidades prioritárias.");
    linhas.push("3. Pactuar intervenção por série/disciplina.");
    linhas.push("4. Definir evidência de acompanhamento.");
  } else {
    linhas.push("Encaminhamento:");
    linhas.push("Use as habilidades de menor percentual para planejar recomposição focal. Evite trabalhar todas as questões ao mesmo tempo; priorize descritores com maior impacto no recorte.");
  }

  linhas.push("");
  linhas.push("Observação: resposta gerada no modo local. Para análise mais completa, configure OPENAI_API_KEY na Vercel.");
  return linhas.join("\n");
}

function buildInstruction(mode: string, question: string) {
  const task = modeLabel(mode);
  return `Você é a IA Pedagógica do SAP Avaliações 2026 da DIASMATH, especialista em análise de avaliações, recomposição de aprendizagens, Matemática e Língua Portuguesa.

Sua tarefa: ${task}.

Regras:
- Use somente os dados do contexto enviado.
- Não invente percentuais, escolas, descritores, séries ou resultados.
- Quando faltar dado, diga que o dado não está disponível no recorte.
- Não solicite nem mencione dados pessoais de estudantes.
- Não exponha estudantes individualmente.
- No perfil de escola, escreva pensando apenas na escola logada.
- No perfil GRE, pode comparar escolas de forma pedagógica, sem tom punitivo.
- Priorize habilidades críticas, pré-requisitos, devolutiva prática e ação pedagógica.
- Use linguagem clara, objetiva e útil para coordenador, formador ou professor.
- Estruture a resposta com títulos curtos e encaminhamentos práticos.

Pergunta personalizada do usuário, quando houver:
${question || "Não houve pergunta personalizada."}`;
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as SAPAIRequest;
    const mode = cleanText(raw.mode || "diagnostico", 30);
    const question = cleanText(raw.question || "", 1000);
    const context = limitContext(raw.context || {});

    const fallback = localFallback(mode, context);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json({ ok: true, texto: fallback, source: "local" });
    }

    const model = process.env.OPENAI_MODEL || "gpt-5";

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
                  "Analise o contexto consolidado do SAP e produza a resposta solicitada.\n\n" +
                  JSON.stringify(context, null, 2),
              },
            ],
          },
        ],
        max_output_tokens: 1300,
        store: false,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json({
        ok: true,
        texto: fallback + `\n\nAviso técnico: a IA online não respondeu agora. Status ${response.status}.`,
        source: "local_api_error",
      });
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

    return Response.json({ ok: true, texto, source: "openai" });
  } catch (error) {
    return Response.json(
      {
        ok: true,
        texto:
          "Não foi possível acionar a IA agora. Use o diagnóstico do SAP para priorizar as habilidades com menor percentual de acertos e organize uma devolutiva por descritor.",
        source: "local_error",
      },
      { status: 200 }
    );
  }
}
