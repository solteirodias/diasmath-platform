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
      ? ctx.habilidades_prioritarias.slice(0, 30).map((h: any) => ({
          codigo: cleanText(h.codigo, 30),
          descricao: cleanText(h.descricao, 340),
          percentual: safeNumber(h.percentual),
          itens: safeNumber(h.itens),
          nivel: cleanText(h.nivel, 80),
        }))
      : [],
    ranking_escolas: Array.isArray(ctx?.ranking_escolas)
      ? ctx.ranking_escolas.slice(0, 20).map((r: any) => ({
          posicao: safeNumber(r.posicao),
          escola: cleanText(r.escola, 180),
          inep: cleanText(r.inep, 30),
          percentual: safeNumber(r.percentual),
          media: safeNumber(r.media),
          estudantes: safeNumber(r.estudantes),
        }))
      : [],
    escolas_mais_criticas: Array.isArray(ctx?.escolas_mais_criticas)
      ? ctx.escolas_mais_criticas.slice(0, 20).map((r: any) => ({
          posicao_critica: safeNumber(r.posicao_critica),
          escola: cleanText(r.escola, 180),
          inep: cleanText(r.inep, 30),
          percentual: safeNumber(r.percentual),
          media: safeNumber(r.media),
          estudantes: safeNumber(r.estudantes),
        }))
      : [],
    questoes_criticas: Array.isArray(ctx?.questoes_criticas)
      ? ctx.questoes_criticas.slice(0, 20).map((q: any) => ({
          numero: safeNumber(q.numero),
          descritor: cleanText(q.descritor, 30),
          habilidade: cleanText(q.habilidade, 340),
          percentual_erro: safeNumber(q.percentual_erro),
          instrumento: cleanText(q.instrumento, 80),
          aplicacao: cleanText(q.aplicacao, 40),
          serie: cleanText(q.serie, 80),
          disciplina: cleanText(q.disciplina, 80),
        }))
      : [],
    grupos: Array.isArray(ctx?.grupos)
      ? ctx.grupos.slice(0, 40).map((g: any) => ({
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

function sortByPct(items: any[], order: "asc" | "desc") {
  return [...items]
    .filter((x) => x && x.percentual !== null && x.percentual !== undefined)
    .sort((a, b) => order === "asc" ? Number(a.percentual) - Number(b.percentual) : Number(b.percentual) - Number(a.percentual));
}

function localPersonalizedResponse(ctx: any, question: string) {
  const q = question.toLowerCase();
  const ind = ctx.indicadores || {};
  const filtros = ctx.filtros || {};
  const habs = Array.isArray(ctx.habilidades_prioritarias) ? ctx.habilidades_prioritarias : [];
  const melhoresHab = sortByPct(habs, "desc").slice(0, 6);
  const pioresHab = sortByPct(habs, "asc").slice(0, 6);
  const linhas: string[] = [];

  if (q.includes("melhor") || q.includes("maior resultado") || q.includes("mais alto") || q.includes("destaque")) {
    linhas.push("Os melhores resultados do recorte são os que aparecem com maior percentual de acertos, considerando escolas e habilidades disponíveis nos filtros atuais.");
    linhas.push("");

    if (ctx.perfil === "GRE" && Array.isArray(ctx.ranking_escolas) && ctx.ranking_escolas.length) {
      linhas.push("Melhores resultados por escola:");
      ctx.ranking_escolas.slice(0, 5).forEach((e: any, i: number) => {
        linhas.push(`${i + 1}. ${e.escola} — ${asPct(e.percentual)} de acertos, média ${e.media ?? "—"}, ${e.estudantes ?? "—"} estudante(s).`);
      });
      linhas.push("");
    }

    if (melhoresHab.length) {
      linhas.push("Melhores resultados por habilidade:");
      melhoresHab.slice(0, 5).forEach((h: any, i: number) => {
        linhas.push(`${i + 1}. ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao}`);
      });
    } else {
      linhas.push("O recorte não apresenta habilidades suficientes para listar melhores resultados por habilidade.");
    }

    linhas.push("");
    linhas.push("Uso pedagógico: transforme esses resultados em referência de boas práticas. Veja o que funcionou nessas habilidades e use como apoio para trabalhar as habilidades mais frágeis.");
    return linhas.join("\n");
  }

  if (q.includes("pior") || q.includes("menor") || q.includes("crític") || q.includes("critico") || q.includes("priorizar")) {
    linhas.push("As maiores prioridades do recorte são as habilidades com menor percentual de acertos, pois elas indicam onde a aprendizagem precisa de intervenção mais imediata.");
    linhas.push("");
    if (pioresHab.length) {
      linhas.push("Habilidades que devem ser priorizadas:");
      pioresHab.slice(0, 6).forEach((h: any, i: number) => {
        linhas.push(`${i + 1}. ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao}`);
      });
    }
    linhas.push("");
    linhas.push("Encaminhamento: escolha no máximo três habilidades para o primeiro ciclo, retome pré-requisitos, resolva uma questão-modelo e aplique nova verificação curta.");
    return linhas.join("\n");
  }

  if (q.includes("compar") || q.includes("ranking")) {
    if (ctx.perfil === "GRE" && Array.isArray(ctx.ranking_escolas) && ctx.ranking_escolas.length) {
      linhas.push("A comparação do recorte deve ser feita observando os maiores e menores percentuais, sempre com finalidade de apoio pedagógico.");
      linhas.push("");
      linhas.push("Maiores resultados:");
      ctx.ranking_escolas.slice(0, 5).forEach((e: any, i: number) => linhas.push(`${i + 1}. ${e.escola} — ${asPct(e.percentual)}.`));
      if (Array.isArray(ctx.escolas_mais_criticas) && ctx.escolas_mais_criticas.length) {
        linhas.push("");
        linhas.push("Escolas que precisam de maior apoio:");
        ctx.escolas_mais_criticas.slice(0, 5).forEach((e: any, i: number) => linhas.push(`${i + 1}. ${e.escola} — ${asPct(e.percentual)}.`));
      }
    } else {
      linhas.push("Neste acesso de escola, a comparação deve focar a própria unidade: verificar habilidades mais fortes, habilidades mais frágeis e evolução entre aplicações.");
    }
    return linhas.join("\n");
  }

  if (q.includes("melhorar") || q.includes("interven") || q.includes("plano") || q.includes("ação") || q.includes("acao")) {
    linhas.push(`Para melhorar o desempenho em ${filtros.disciplina || "Matemática/Língua Portuguesa"}, a escola deve transformar os descritores frágeis em um ciclo curto de intervenção: retomada, prática guiada e nova verificação.`);
    linhas.push("");
    if (pioresHab.length) {
      linhas.push("Comece por estas habilidades:");
      pioresHab.slice(0, 5).forEach((h: any, i: number) => linhas.push(`${i + 1}. ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao}`));
      linhas.push("");
    }
    linhas.push("Ação prática:");
    linhas.push("1. Selecione até três habilidades.");
    linhas.push("2. Retome os pré-requisitos antes de refazer questões.");
    linhas.push("3. Resolva uma questão-modelo com mediação.");
    linhas.push("4. Aplique uma tarefa curta semelhante.");
    linhas.push("5. Reagrupe quem ainda não consolidou e acompanhe nova evidência.");
    return linhas.join("\n");
  }

  if (q.includes("professor") || q.includes("devolutiva") || q.includes("orientar")) {
    linhas.push("A orientação ao professor deve ser direta: trabalhar por habilidade, explicar o erro provável dos estudantes e definir uma atividade curta para verificar avanço.");
    linhas.push("");
    if (pioresHab.length) {
      linhas.push("Foco sugerido para a devolutiva:");
      pioresHab.slice(0, 5).forEach((h: any, i: number) => linhas.push(`${i + 1}. ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao}`));
    }
    linhas.push("");
    linhas.push("Na prática, peça ao professor que escolha uma questão-modelo, resolva com a turma, compare distratores e aplique uma nova questão semelhante.");
    return linhas.join("\n");
  }

  if (q.includes("mensagem") || q.includes("texto")) {
    linhas.push("Prezada equipe, os dados do SAP mostram a necessidade de transformar os resultados da avaliação em ações pedagógicas objetivas e acompanháveis.");
    linhas.push("");
    linhas.push(`No recorte analisado, o percentual geral foi de ${asPct(ind.percentual_geral)}. A orientação é priorizar as habilidades de menor desempenho, organizar devolutiva por descritor e acompanhar nova evidência de aprendizagem.`);
    return linhas.join("\n");
  }

  linhas.push("Com base no recorte atual, a resposta deve considerar o desempenho geral, as habilidades prioritárias e o objetivo pedagógico da pergunta feita.");
  linhas.push("");
  linhas.push(`O percentual geral do recorte é ${asPct(ind.percentual_geral)}, com ${ind.habilidades_criticas ?? "—"} habilidade(s) críticas ou baixas.`);
  if (pioresHab.length) {
    linhas.push("");
    linhas.push("Habilidades mais importantes para análise:");
    pioresHab.slice(0, 5).forEach((h: any, i: number) => linhas.push(`${i + 1}. ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao}`));
  }
  linhas.push("");
  linhas.push("Encaminhamento: use os dados para decidir prioridade, orientar professores, planejar intervenção e acompanhar uma nova evidência de aprendizagem.");
  return linhas.join("\n");
}

function localResponse(mode: string, ctx: any, question: string) {
  if (mode === "pergunta") return localPersonalizedResponse(ctx, question);

  const ind = ctx.indicadores || {};
  const habs = sortByPct(Array.isArray(ctx.habilidades_prioritarias) ? ctx.habilidades_prioritarias : [], "asc").slice(0, 8);
  const linhas: string[] = [];
  linhas.push(`${modeLabel(mode)} — ${ctx.recorte || "recorte selecionado"}`);
  linhas.push("");
  linhas.push(`O recorte apresenta percentual geral de ${asPct(ind.percentual_geral)} e ${ind.habilidades_criticas ?? "—"} habilidade(s) críticas ou baixas.`);
  linhas.push("");
  linhas.push("Prioridades pedagógicas:");
  habs.forEach((h: any, i: number) => linhas.push(`${i + 1}. ${h.codigo} — ${asPct(h.percentual)}: ${h.descricao}`));
  linhas.push("");
  linhas.push("Encaminhamento: retomar pré-requisitos, resolver questão-modelo, aplicar atividade curta e acompanhar nova evidência.");
  return linhas.join("\n");
}

function buildInstruction(mode: string, question: string) {
  if (mode === "pergunta") {
    return `Você é a IA Pedagógica do SAP Avaliações 2026 da DIASMATH.

Você deve responder qualquer pergunta relacionada a avaliação, resultados, escola, GRE, gestão, professor, aprendizagem, Matemática, Língua Portuguesa, intervenção, habilidades, devolutivas, plano de ação ou uso pedagógico dos dados.

REGRA PRINCIPAL:
A primeira linha deve responder diretamente à pergunta feita.
Não comece com título.
Não comece com "Pergunta personalizada".
Não comece explicando o recorte.
Não diga que a resposta deve partir da pergunta; simplesmente responda.
Não transforme toda pergunta em diagnóstico geral.
Se a pergunta pedir melhores resultados, liste os melhores resultados.
Se pedir piores resultados ou prioridades, liste as maiores fragilidades.
Se pedir como melhorar, dê ações práticas.
Se pedir mensagem, escreva a mensagem.
Se pedir orientação ao professor, dê orientação direta ao professor.
Se pedir comparação, compare com os dados disponíveis.
Se a pergunta for ampla, responda de forma pedagógica e útil, usando os dados do SAP como apoio.

Pode usar conhecimento pedagógico geral para orientar prática escolar, mas só cite percentuais, escolas e descritores que estejam no contexto.
Não invente dados.
Não fale sobre API, chave, token, configuração, erro técnico, HTTP ou status.
Não inclua aviso de privacidade.
Use linguagem clara, prática e formativa.

Pergunta do usuário:
${question || "O usuário não escreveu a pergunta. Oriente-o a escrever uma pergunta objetiva sobre o recorte."}`;
  }

  return `Você é a IA Pedagógica do SAP Avaliações 2026 da DIASMATH.

Tarefa: ${modeLabel(mode)}.

Produza uma resposta prática para professores, coordenadores e gestores.
Use os dados consolidados do contexto.
Não invente escola, percentual, descritor ou série.
Não fale sobre API, chave, token, erro técnico, HTTP ou configuração.
Não inclua aviso de privacidade.
Priorize ações concretas: pré-requisito, devolutiva, atividade, reagrupamento, evidência e acompanhamento.`;
}

function firstLineInvalidForQuestion(text: string): boolean {
  const first = cleanText(text, 600).split(/\n/)[0] || "";
  return /^(pergunta personalizada|diagnóstico pedagógico|diagnostico pedagogico|análise pedagógica|analise pedagogica|recorte|simula\+|avaliação|avaliacao|a resposta deve)/i.test(first.trim());
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
                  "Contexto consolidado do SAP para apoiar a resposta. Responda à pergunta do usuário de forma direta.\n\n" +
                  JSON.stringify(context, null, 2),
              },
            ],
          },
        ],
        max_output_tokens: mode === "pergunta" ? 1200 : 1500,
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

    if (mode === "pergunta" && firstLineInvalidForQuestion(texto)) {
      return Response.json({ ok: true, texto: fallback, source: "pedagogical_engine" });
    }

    return Response.json({ ok: true, texto, source: "sap_ai" });
  } catch (error) {
    return Response.json(
      {
        ok: true,
        texto:
          "Com base no recorte atual, priorize as habilidades de menor desempenho, oriente os professores por descritor e acompanhe uma nova evidência de aprendizagem após a intervenção.",
        source: "pedagogical_engine",
      },
      { status: 200 }
    );
  }
}
