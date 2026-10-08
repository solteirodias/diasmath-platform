export type Confidence = "high" | "medium" | "review";
export type CorrectSource = "document" | "ai_suggestion" | "teacher" | null;

export type ImportedQuestion = {
  id: string;
  position: number;
  source_page: number | null;
  kind: "multiple" | "truefalse";
  text: string;
  options: string[];
  correct: number | null;
  correct_source: CorrectSource;
  image_path: string | null;
  embedded_image_data?: string | null;
  skill: string;
  confidence: Confidence;
  notes: string;
  time_limit: number;
};

export type ParsedImport = {
  title: string;
  questions: ImportedQuestion[];
  warning?: string;
  sourceKind: "pdf" | "docx";
};

type SourceLine = { page: number | null; text: string };

const QUESTION_PREFIX = /^\s*quest(?:ão|ao)\s*0*(\d{1,3})(?:\s*[).:\-–]\s*|\s+)?(.*)$/i;
const NUMBERED_PREFIX = /^\s*0*(\d{1,3})\s*[).:\-–]\s*(.*)$/;
const ALT_PREFIX = /^\s*[([]?([A-E])[]).:\-–]\s*(.+)$/i;
const ALT_LOOSE = /^\s*([A-E])\s{2,}(.+)$/i;

function cleanText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function titleFromFile(name: string) {
  return name.replace(/\.(pdf|docx?|PDF|DOCX?)$/, "").replace(/[_-]+/g, " ").trim() || "Atividade importada";
}

function answerMapFromText(text: string) {
  const result = new Map<number, string>();
  const upper = text.toUpperCase();
  const pos = Math.max(upper.lastIndexOf("GABARITO"), upper.lastIndexOf("RESPOSTAS"));
  if (pos < 0) return result;
  const tail = text.slice(pos);
  const re = /(?:^|[\s,;|])0*(\d{1,3})\s*(?:[-–.:)]\s*)?([A-E])(?=$|[\s,;|])/gim;
  let match: RegExpExecArray | null;
  while ((match = re.exec(tail))) result.set(Number(match[1]), match[2].toUpperCase());
  return result;
}

function stripAnswerKey(lines: SourceLine[]) {
  const idx = lines.findIndex((line) => /^(gabarito|respostas)\b/i.test(line.text.trim()));
  return idx >= 0 ? lines.slice(0, idx) : lines;
}

function expandAlternativeLine(line: SourceLine): SourceLine[] {
  const text = line.text;
  const matches = [...text.matchAll(/(?:^|\s)([A-E])[).]\s*/g)];
  if (matches.length <= 1) return [line];
  const out: SourceLine[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? text.length : text.length;
    const chunk = text.slice(start, end).trim();
    if (chunk) out.push({ page: line.page, text: chunk });
  }
  return out.length ? out : [line];
}

export function parseQuestionLines(
  originalLines: SourceLine[],
  fullText: string,
  fileName: string,
): ImportedQuestion[] {
  const answers = answerMapFromText(fullText);
  const lines = stripAnswerKey(originalLines).flatMap(expandAlternativeLine);
  type Work = {
    number: number;
    page: number | null;
    textParts: string[];
    options: string[];
  };
  const works: Work[] = [];
  let current: Work | null = null;

  const pushCurrent = () => {
    if (!current) return;
    const text = cleanText(current.textParts.join(" "));
    if (text || current.options.length) works.push({ ...current, textParts: [text] });
    current = null;
  };

  for (const source of lines) {
    const line = cleanText(source.text);
    if (!line) continue;

    const qMatch = line.match(QUESTION_PREFIX);
    const nMatch = !qMatch ? line.match(NUMBERED_PREFIX) : null;
    const start = qMatch || nMatch;
    if (start) {
      pushCurrent();
      current = {
        number: Number(start[1]),
        page: source.page,
        textParts: start[2] ? [start[2]] : [],
        options: [],
      };
      continue;
    }

    const alt = line.match(ALT_PREFIX) || line.match(ALT_LOOSE);
    if (alt && current) {
      current.options.push(cleanText(alt[2]));
      continue;
    }

    if (current) current.textParts.push(line);
  }
  pushCurrent();

  if (!works.length) {
    const body = cleanText(stripAnswerKey(originalLines).map((x) => x.text).join(" "));
    return [
      {
        id: crypto.randomUUID(),
        position: 0,
        source_page: originalLines[0]?.page ?? null,
        kind: "multiple",
        text: body.slice(0, 12000),
        options: [],
        correct: null,
        correct_source: null,
        image_path: null,
        skill: "",
        confidence: "review",
        notes: "Não foi possível separar automaticamente as questões. Divida ou edite este bloco antes de salvar.",
        time_limit: 30,
      },
    ];
  }

  return works.map((work, position) => {
    const answerLetter = answers.get(work.number);
    const correct = answerLetter ? answerLetter.charCodeAt(0) - 65 : null;
    const validCorrect =
      correct !== null && correct >= 0 && correct < work.options.length ? correct : null;
    const isTrueFalse =
      work.options.length === 2 &&
      work.options.every((option) => /^(verdadeiro|falso|v|f)$/i.test(option.trim()));
    const hasOptions = work.options.length >= 2;
    const confidence: Confidence = validCorrect !== null && hasOptions ? "high" : hasOptions ? "medium" : "review";
    const notes = !hasOptions
      ? "Alternativas não identificadas automaticamente. Complete a questão."
      : answerLetter && validCorrect === null
        ? "O gabarito foi localizado, mas a alternativa indicada não corresponde às opções detectadas."
        : validCorrect === null
          ? "Resposta correta não definida. Confirme o gabarito."
          : "";

    return {
      id: crypto.randomUUID(),
      position,
      source_page: work.page,
      kind: isTrueFalse ? "truefalse" : "multiple",
      text: cleanText(work.textParts.join(" ")),
      options: work.options,
      correct: validCorrect,
      correct_source: validCorrect !== null ? "document" : null,
      image_path: null,
      skill: "",
      confidence,
      notes,
      time_limit: 30,
    };
  });
}

let pdfLoader: Promise<void> | null = null;
let mammothLoader: Promise<void> | null = null;

function loadExternalScript(src: string, id: string, current: () => unknown) {
  if (typeof window === "undefined") return Promise.reject(new Error("Leitor disponível apenas no navegador."));
  if (current()) return Promise.resolve();
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar o leitor do documento.")), { once: true });
    });
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o leitor do documento."));
    document.head.appendChild(script);
  });
}

async function loadPdfJs() {
  const win = window as any;
  if (!win.pdfjsLib) {
    pdfLoader ||= loadExternalScript(
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
      "diasmath-pdfjs",
      () => (window as any).pdfjsLib,
    );
    await pdfLoader;
  }
  const pdfjs = win.pdfjsLib;
  if (!pdfjs) throw new Error("Não foi possível iniciar o leitor de PDF.");
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  return pdfjs;
}

async function loadMammoth() {
  const win = window as any;
  if (!win.mammoth) {
    mammothLoader ||= loadExternalScript(
      "https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js",
      "diasmath-mammoth",
      () => (window as any).mammoth,
    );
    await mammothLoader;
  }
  if (!win.mammoth) throw new Error("Não foi possível iniciar o leitor de Word.");
  return win.mammoth;
}

function textContentToLines(content: any) {
  const lines: { y: number; x: number; text: string }[] = [];
  for (const item of content.items || []) {
    if (!item?.str) continue;
    const y = Number(item.transform?.[5] ?? 0);
    const x = Number(item.transform?.[4] ?? 0);
    let row = lines.find((candidate) => Math.abs(candidate.y - y) < 2.5);
    if (!row) {
      row = { y, x, text: String(item.str) };
      lines.push(row);
    } else {
      row.text += " " + String(item.str);
      row.x = Math.min(row.x, x);
    }
  }
  return lines.sort((a, b) => b.y - a.y || a.x - b.x).map((row) => cleanText(row.text)).filter(Boolean);
}

export async function parsePdf(file: File): Promise<ParsedImport> {
  const pdfjs = await loadPdfJs();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const lines: SourceLine[] = [];
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageLines = textContentToLines(content);
    pageTexts.push(pageLines.join("\n"));
    for (const text of pageLines) lines.push({ page: pageNumber, text });
  }

  const fullText = pageTexts.join("\n");
  const questions = parseQuestionLines(lines, fullText, file.name);
  const warning =
    fullText.replace(/\s/g, "").length < Math.max(30, pdf.numPages * 15)
      ? "Este PDF parece ser escaneado ou ter pouco texto selecionável. Use “Usar página como imagem” nas questões ou converta o arquivo com OCR para melhorar a leitura."
      : undefined;

  return { title: titleFromFile(file.name), questions, warning, sourceKind: "pdf" };
}

export async function renderPdfPage(file: File, pageNumber: number) {
  const pdfjs = await loadPdfJs();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.65 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem da página.");
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png", 0.92);
}

export async function parseDocx(file: File): Promise<ParsedImport> {
  const mammoth: any = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  const raw = await mammoth.extractRawText({ arrayBuffer });
  const text = String(raw.value || "");
  const lines: SourceLine[] = text
    .split(/\r?\n/)
    .map((value) => ({ page: null, text: cleanText(value) }))
    .filter((line) => Boolean(line.text));

  const htmlResult = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.imgElement(async (image: any) => ({
        src: `data:${image.contentType};base64,${await image.read("base64")}`,
      })),
    },
  );

  const parsed = new DOMParser().parseFromString(String(htmlResult.value || ""), "text/html");
  const images = Array.from(parsed.querySelectorAll("img"))
    .map((img) => img.getAttribute("src"))
    .filter((src): src is string => Boolean(src && src.startsWith("data:image/")));

  const questions = parseQuestionLines(lines, text, file.name);
  images.forEach((data, index) => {
    if (!questions[index]) return;
    questions[index].embedded_image_data = data;
    questions[index].confidence = questions[index].confidence === "high" ? "medium" : questions[index].confidence;
    questions[index].notes = [questions[index].notes, "Imagem do Word associada pela ordem do documento; confira a correspondência."]
      .filter(Boolean)
      .join(" ");
  });

  return {
    title: titleFromFile(file.name),
    questions,
    warning: images.length
      ? `${images.length} imagem(ns) encontrada(s) no Word e associada(s) pela ordem. Confira antes de salvar.`
      : undefined,
    sourceKind: "docx",
  };
}

export async function parseImportFile(file: File): Promise<ParsedImport> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return parsePdf(file);
  if (lower.endsWith(".docx")) return parseDocx(file);
  if (lower.endsWith(".doc")) {
    throw new Error("Arquivos .DOC antigos precisam ser convertidos para .DOCX antes da leitura automática.");
  }
  throw new Error("Formato não suportado. Envie PDF ou DOCX.");
}
