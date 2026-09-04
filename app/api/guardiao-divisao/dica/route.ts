export const runtime = "nodejs";

type HintPayload = {
  dividendo?: number;
  divisor?: number;
  respostaInformada?: string;
  respostaCorreta?: string;
  tentativa?: number;
  temResto?: boolean;
  nivelAtual?: string;
};

function asNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function cleanText(value: unknown, max = 120): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function limitWords(text: string, maxWords = 35): string {
  const words = cleanText(text, 500).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ") + "...";
}

function localHint(payload: Required<HintPayload>): string {
  const n = Number(payload.dividendo);
  const d = Number(payload.divisor);
  const attempt = Number(payload.tentativa || 1);

  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) {
    return "Observe os grupos formados e compare com a pergunta. Veja se todos ficaram com a mesma quantidade.";
  }

  const quotient = Math.floor(n / d);
  const base = d * 10 < n && quotient !== 10 ? 10 : Math.max(1, quotient - 1);
  const product = base * d;
  const missing = Math.max(0, n - product);

  if (attempt <= 1) {
    return limitWords(`Pense em grupos de ${d}. Comece estimando: ${d} × ${base} chega perto de ${n}? Ajuste sua ideia com calma.`);
  }

  if (attempt === 2) {
    return limitWords(`${d} × ${base} = ${product}. Agora veja quanto ainda falta para chegar a ${n} e pense em mais grupos de ${d}.`);
  }

  return limitWords(`Depois de ${d} × ${base} = ${product}, faltam ${missing}. Veja quantos grupos de ${d} cabem nesse restante e complete.`);
}

function revealsFinalAnswer(text: string, correctAnswer: string): boolean {
  const tip = cleanText(text, 500).toLowerCase();
  const correct = cleanText(correctAnswer).toLowerCase();
  const quotient = correct.split(",")[0]?.trim();

  if (!tip) return false;
  if (tip.includes("a resposta é") || tip.includes("o resultado é") || tip.includes("o quociente é")) return true;
  if (quotient && new RegExp(`(^|\\D)${quotient}(\\D|$)`).test(tip) && /(resposta|resultado|quociente|digite|igual)/i.test(tip)) return true;

  return false;
}

function normalizePayload(raw: HintPayload): Required<HintPayload> {
  return {
    dividendo: asNumber(raw.dividendo) ?? 0,
    divisor: asNumber(raw.divisor) ?? 0,
    respostaInformada: cleanText(raw.respostaInformada),
    respostaCorreta: cleanText(raw.respostaCorreta),
    tentativa: Math.min(3, Math.max(1, Math.floor(asNumber(raw.tentativa) ?? 1))),
    temResto: Boolean(raw.temResto),
    nivelAtual: cleanText(raw.nivelAtual || "Game Guardiões da Divisão"),
  };
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as HintPayload;
    const payload = normalizePayload(raw);

    const fallback = localHint(payload);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json({ ok: true, dica: fallback, source: "local" });
    }

    const systemPrompt = `Você é o Guardião da Divisão, um tutor de Matemática especializado nos anos iniciais do Ensino Fundamental.
Analise a operação, a resposta do estudante e o número da tentativa.
Produza somente uma dica curta, acolhedora e matematicamente correta.
Ajude o estudante a raciocinar usando agrupamentos, decomposição, estimativa, múltiplos, tabuada ou multiplicação inversa.
Não entregue diretamente o quociente final.
Use linguagem simples e adequada para crianças.
Não repreenda o estudante.
Não converse sobre assuntos diferentes da atividade.
Limite a resposta a, no máximo, 35 palavras.`;

    const userInput = [
      `Dividendo: ${payload.dividendo}`,
      `Divisor: ${payload.divisor}`,
      `Resposta informada: ${payload.respostaInformada}`,
      `Resposta correta: ${payload.respostaCorreta}`,
      `Número da tentativa: ${payload.tentativa}`,
      `Tem resto? ${payload.temResto ? "sim" : "não"}`,
      `Etapa ou nível atual: ${payload.nivelAtual}`,
      "",
      "Gere uma dica progressiva. Não revele a resposta final.",
    ].join("\n");

    const model = process.env.OPENAI_MODEL || "gpt-5";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: systemPrompt,
        input: userInput,
        max_output_tokens: 90,
        store: false,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return Response.json({ ok: true, dica: fallback, source: "local", api_status: response.status });
    }

    const outputText =
      typeof data?.output_text === "string"
        ? data.output_text
        : Array.isArray(data?.output)
          ? data.output
              .flatMap((item: any) => Array.isArray(item.content) ? item.content : [])
              .map((content: any) => content.text || "")
              .join(" ")
          : "";

    const dica = limitWords(outputText || fallback);

    if (!dica || revealsFinalAnswer(dica, payload.respostaCorreta)) {
      return Response.json({ ok: true, dica: fallback, source: "local_safety" });
    }

    return Response.json({ ok: true, dica, source: "openai" });
  } catch (error) {
    return Response.json(
      {
        ok: true,
        dica: "Pense nos grupos com calma. Use a multiplicação inversa para testar sua ideia antes de tentar novamente.",
        source: "local_error",
      },
      { status: 200 }
    );
  }
}
