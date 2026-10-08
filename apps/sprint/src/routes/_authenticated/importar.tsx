import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/Brand";
import { parseImportFile, renderPdfPage, type ImportedQuestion } from "@/lib/import-parser";

export const Route = createFileRoute("/_authenticated/importar")({
  head: () => ({
    meta: [
      { title: "Importar PDF/Word — DIASMATH Sprint" },
      { name: "description", content: "Transforme PDF ou Word em atividade do DIASMATH Sprint." },
    ],
  }),
  component: ImportarAtividade,
});

type ImportJob = {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: "uploaded" | "processing" | "review" | "saved" | "failed";
  question_count: number;
  title_suggestion: string;
  error_message: string | null;
  source_path: string | null;
  saved_quiz_id: string | null;
  created_at: string;
};

const db = supabase as any;
const TIMES = [
  [30, "30 s"], [60, "1 min"], [120, "2 min"], [180, "3 min"],
  [240, "4 min"], [300, "5 min"], [360, "6 min"],
] as const;

function safeName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120);
}

function bytesLabel(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function badge(confidence: string) {
  if (confidence === "high") return "bg-success/15 text-success";
  if (confidence === "medium") return "bg-sun/20 text-sun";
  return "bg-danger/15 text-danger";
}

function confidenceLabel(confidence: string) {
  if (confidence === "high") return "Alta";
  if (confidence === "medium") return "Média";
  return "Revisar";
}

function ImportarAtividade() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<ImportedQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Matemática");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<"idle"|"uploading"|"reading"|"identifying"|"review"|"saving">("idle");
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const [dragging, setDragging] = useState(false);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);

  const loadJobs = async () => {
    const { data } = await db.from("import_jobs")
      .select("id,file_name,file_type,file_size,status,question_count,title_suggestion,error_message,source_path,saved_quiz_id,created_at")
      .order("created_at", { ascending: false }).limit(12);
    setJobs((data || []) as ImportJob[]);
  };

  useEffect(() => { void loadJobs(); }, []);

  const serialize = (items: ImportedQuestion[]) => items.map((q, index) => ({
    position: index,
    source_page: q.source_page,
    kind: q.kind,
    text: q.text,
    options: q.options,
    correct: q.correct,
    correct_source: q.correct_source,
    image_path: q.image_path,
    skill: q.skill,
    confidence: q.confidence,
    notes: q.notes,
    time_limit: q.time_limit,
  }));

  const persist = async (job: ImportJob, items: ImportedQuestion[], suggestedTitle = title) => {
    const { error } = await db.rpc("replace_import_drafts", {
      _job_id: job.id,
      _title_suggestion: suggestedTitle,
      _drafts: serialize(items),
    });
    if (error) throw error;
  };

  const uploadQuestionImage = async (dataUrl: string, jobId: string, position: number) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sessão expirada.");
    const blob = await fetch(dataUrl).then((r) => r.blob());
    const ext = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/webp" ? "webp" : "png";
    const path = `${auth.user.id}/imports/${jobId}/question-${position + 1}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("question-images").upload(path, blob, {
      contentType: blob.type || "image/png",
      upsert: false,
    });
    if (error) throw error;
    return path;
  };

  const processFile = async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!/\.(pdf|docx|doc)$/.test(lower)) {
      toast.error("Envie PDF, DOCX ou DOC.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("O arquivo ultrapassa 25 MB.");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setSourceFile(file);
    setSavedQuizId(null);
    setWarning("");
    setStage("uploading");
    setMessage("Enviando arquivo…");

    let job: ImportJob | null = null;
    try {
      const { data: created, error: createError } = await db.from("import_jobs").insert({
        teacher_id: auth.user.id,
        file_name: file.name,
        file_type: file.type || (lower.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        file_size: file.size,
        status: "uploaded",
      }).select().single();
      if (createError) throw createError;
      job = created as ImportJob;

      const sourcePath = `${auth.user.id}/${job.id}/${safeName(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("import-files").upload(sourcePath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });
      if (uploadError) throw uploadError;

      await db.from("import_jobs").update({ source_path: sourcePath, status: "processing" }).eq("id", job.id);
      job = { ...job, source_path: sourcePath, status: "processing" };
      setActiveJob(job);

      if (lower.endsWith(".doc")) {
        throw new Error("Arquivo .DOC antigo: converta para .DOCX e envie novamente.");
      }

      setStage("reading");
      setMessage("Lendo PDF/Word…");
      const parsed = await parseImportFile(file);

      setStage("identifying");
      setMessage("Identificando questões, alternativas e gabarito…");
      let items = parsed.questions;

      for (let i = 0; i < items.length; i++) {
        const embedded = items[i]?.embedded_image_data;
        if (!embedded) continue;
        try {
          const imagePath = await uploadQuestionImage(embedded, job.id, i);
          items = items.map((q, idx) => idx === i ? { ...q, image_path: imagePath } : q);
        } catch {
          items = items.map((q, idx) => idx === i
            ? { ...q, confidence: "review" as const, notes: [q.notes, "Confira/reenvie a imagem desta questão."].filter(Boolean).join(" ") }
            : q);
        }
      }

      await persist(job, items, parsed.title);
      const reviewJob = { ...job, status: "review" as const, question_count: items.length, title_suggestion: parsed.title };
      setActiveJob(reviewJob);
      setQuestions(items);
      setTitle(parsed.title);
      setSubject("Matemática");
      setDescription(`Importado de ${file.name}`);
      setWarning(parsed.warning || "");
      setStage("review");
      setMessage(`${items.length} questão(ões) detectada(s). Revise antes de salvar.`);
      await loadJobs();
    } catch (error: any) {
      const text = error?.message || "Não foi possível processar o arquivo.";
      setStage("idle");
      setMessage(text);
      toast.error(text);
      if (job) {
        await db.from("import_jobs").update({ status: "failed", error_message: text }).eq("id", job.id);
        await loadJobs();
      }
    }
  };

  const continueReview = async (job: ImportJob) => {
    const { data, error } = await db.from("import_drafts").select("*")
      .eq("import_job_id", job.id).order("position");
    if (error) return toast.error(error.message);

    const restored: ImportedQuestion[] = (data || []).map((d: any, i: number) => ({
      id: d.id,
      position: i,
      source_page: d.source_page,
      kind: d.kind === "truefalse" ? "truefalse" : "multiple",
      text: d.text || "",
      options: d.options || [],
      correct: d.correct,
      correct_source: d.correct_source,
      image_path: d.image_path,
      skill: d.skill || "",
      confidence: d.confidence || "review",
      notes: d.notes || "",
      time_limit: d.time_limit || 30,
    }));

    setActiveJob(job);
    setQuestions(restored);
    setTitle(job.title_suggestion || job.file_name.replace(/\.(pdf|docx?|PDF|DOCX?)$/, ""));
    setDescription(`Importado de ${job.file_name}`);
    setSavedQuizId(job.saved_quiz_id);
    setStage("review");

    if (job.source_path) {
      const { data: blob } = await supabase.storage.from("import-files").download(job.source_path);
      if (blob) setSourceFile(new File([blob], job.file_name, { type: job.file_type }));
    }
  };

  const updateQuestion = (index: number, patch: Partial<ImportedQuestion>) => {
    setQuestions((items) => items.map((q, i) => i === index ? { ...q, ...patch } : q));
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions((items) => items.map((q, i) => {
      if (i !== qi) return q;
      const options = [...q.options];
      options[oi] = value;
      return { ...q, options, confidence: q.correct === null ? "review" : "medium" };
    }));
  };

  const addQuestion = () => setQuestions((items) => [...items, {
    id: crypto.randomUUID(),
    position: items.length,
    source_page: null,
    kind: "multiple",
    text: "",
    options: ["", "", "", ""],
    correct: null,
    correct_source: null,
    image_path: null,
    skill: "",
    confidence: "review",
    notes: "Questão adicionada pelo professor.",
    time_limit: 30,
  }]);

  const removeQuestion = (index: number) => setQuestions((items) =>
    items.filter((_, i) => i !== index).map((q, position) => ({ ...q, position })));

  const move = (index: number, direction: -1|1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const copy = [...questions];
    [copy[index], copy[target]] = [copy[target]!, copy[index]!];
    setQuestions(copy.map((q, position) => ({ ...q, position })));
  };

  const attachPdfPage = async (index: number) => {
    const q = questions[index];
    if (!q?.source_page || !sourceFile || !sourceFile.name.toLowerCase().endsWith(".pdf") || !activeJob) {
      return toast.error("A página original do PDF não está disponível.");
    }
    try {
      setMessage(`Preparando página ${q.source_page} como imagem…`);
      const dataUrl = await renderPdfPage(sourceFile, q.source_page);
      const path = await uploadQuestionImage(dataUrl, activeJob.id, index);
      const next = questions.map((item, i) => i === index
        ? { ...item, image_path: path, embedded_image_data: dataUrl, notes: [item.notes, `Página ${q.source_page} anexada como imagem.`].filter(Boolean).join(" ") }
        : item);
      setQuestions(next);
      await persist(activeJob, next);
      setMessage("Imagem anexada.");
    } catch (error: any) {
      toast.error(error?.message || "Falha ao anexar a página.");
    }
  };

  const validation = useMemo(() => questions.flatMap((q, i) => {
    const errors: string[] = [];
    if (!q.text.trim() && !q.image_path) errors.push(`Questão ${i + 1}: falta enunciado ou imagem.`);
    if (q.options.filter((x) => x.trim()).length < 2) errors.push(`Questão ${i + 1}: faltam alternativas.`);
    if (q.correct === null || q.correct < 0 || q.correct >= q.options.length || !q.options[q.correct]?.trim()) {
      errors.push(`Questão ${i + 1}: confirme a resposta correta.`);
    }
    return errors;
  }), [questions]);

  const saveQuiz = async () => {
    if (!activeJob || !title.trim()) return toast.error("Informe o título.");
    if (validation.length) return toast.error(validation[0]);
    setStage("saving");
    try {
      await persist(activeJob, questions);
      const { data, error } = await db.rpc("save_import_as_quiz", {
        _job_id: activeJob.id,
        _title: title.trim(),
        _description: description.trim(),
        _subject: subject.trim(),
      });
      if (error) throw error;
      setSavedQuizId(String(data));
      setStage("review");
      setMessage("Atividade criada no DIASMATH Sprint.");
      toast.success("Atividade salva!");
      await loadJobs();
    } catch (error: any) {
      setStage("review");
      toast.error(error?.message || "Não foi possível salvar.");
    }
  };

  const pending = questions.filter((q) =>
    q.correct === null || q.options.filter((x) => x.trim()).length < 2 || (!q.text.trim() && !q.image_path)
  ).length;

  return (
    <div className="min-h-screen bg-ink text-paper grid-paper">
      <TopBar sub="Professor">
        <Link to="/painel" className="text-sm font-semibold text-ash hover:text-paper">← Minhas atividades</Link>
      </TopBar>

      <main className="max-w-[1200px] mx-auto px-5 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-brand mb-3 font-semibold">DIASMATH Sprint · Importação</div>
        <h1 className="font-display text-4xl md:text-5xl">Importar PDF/Word</h1>
        <p className="text-ash mt-2 max-w-3xl">Envie sua lista. O Sprint monta um rascunho e você revisa antes de salvar.</p>

        {message && <div className="mt-6 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm">{message}</div>}
        {warning && <div className="mt-3 rounded-xl border border-sun/30 bg-sun/10 px-4 py-3 text-sm text-sun">{warning}</div>}

        {stage !== "review" && stage !== "saving" && (
          <section
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files?.[0]; if (f) void processFile(f); }}
            className={`mt-8 rounded-2xl border-2 border-dashed p-10 text-center ${dragging ? "border-brand bg-brand/10" : "border-paper/20 bg-panel"}`}
          >
            <div className="font-display text-3xl">PDF ou Word → atividade pronta para revisar</div>
            <p className="text-ash mt-3">PDF e DOCX até 25 MB. Arquivos .DOC antigos precisam ser convertidos para DOCX.</p>
            <input ref={fileInput} className="hidden" type="file" accept=".pdf,.docx,.doc" onChange={(e) => {
              const f=e.target.files?.[0]; if (f) void processFile(f); e.currentTarget.value="";
            }} />
            <button onClick={() => fileInput.current?.click()} disabled={stage !== "idle"} className="btn-skew btn-brand mt-6">
              <span>{stage === "idle" ? "Selecionar arquivo" : "Processando…"}</span>
            </button>
          </section>
        )}

        {(stage === "review" || stage === "saving") && activeJob && (
          <section className="mt-8">
            <div className="rounded-2xl bg-panel border border-paper/10 p-5 grid md:grid-cols-[1fr_220px] gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-ash">Título</label>
                <input className="field mt-2" value={title} onChange={(e)=>setTitle(e.target.value)} />
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <input className="field" value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder="Área/conteúdo" />
                  <input className="field" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Descrição" />
                </div>
              </div>
              <div className="rounded-xl bg-paper/10 p-4">
                <div className="text-xs uppercase text-ash">Detectadas</div>
                <div className="font-display text-4xl text-brand">{questions.length}</div>
                <div className="text-sm text-ash">{pending} para revisar</div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {questions.map((q, qi) => (
                <article key={q.id} className="rounded-2xl bg-panel border border-paper/10 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-lg bg-paper text-ink font-display">{qi+1}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge(q.confidence)}`}>{confidenceLabel(q.confidence)}</span>
                      {q.source_page && <span className="text-xs text-ash">pág. {q.source_page}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>move(qi,-1)} disabled={qi===0} className="px-3 py-2 rounded-lg bg-paper/10 disabled:opacity-30">↑</button>
                      <button onClick={()=>move(qi,1)} disabled={qi===questions.length-1} className="px-3 py-2 rounded-lg bg-paper/10 disabled:opacity-30">↓</button>
                      <button onClick={()=>removeQuestion(qi)} className="px-3 py-2 rounded-lg text-danger bg-danger/10">Excluir</button>
                    </div>
                  </div>

                  <textarea className="field mt-4 min-h-24" value={q.text} onChange={(e)=>updateQuestion(qi,{text:e.target.value,confidence:"review"})} placeholder="Enunciado" />

                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {q.source_page && sourceFile?.name.toLowerCase().endsWith(".pdf") && (
                      <button onClick={()=>void attachPdfPage(qi)} className="px-3 py-2 rounded-lg bg-brand/15 text-brand text-sm font-bold">Usar página como imagem</button>
                    )}
                    {q.image_path && <span className="text-sm text-success font-bold">✓ imagem anexada</span>}
                    {q.embedded_image_data && <img src={q.embedded_image_data} alt="" className="max-h-36 rounded-lg object-contain bg-paper" />}
                  </div>

                  <div className="mt-4 space-y-2">
                    {q.options.map((option, oi) => (
                      <div key={oi} className={`grid grid-cols-[42px_1fr] gap-2 rounded-xl p-2 ${q.correct===oi ? "bg-success/10 ring-1 ring-success" : "bg-paper/5"}`}>
                        <button
                          onClick={()=>updateQuestion(qi,{correct:oi,correct_source:"teacher",confidence:"high"})}
                          className={`rounded-lg font-bold ${q.correct===oi ? "bg-success text-ink" : "bg-paper/10"}`}
                        >{String.fromCharCode(65+oi)}</button>
                        <input className="field" value={option} onChange={(e)=>updateOption(qi,oi,e.target.value)} />
                      </div>
                    ))}
                    {q.options.length < 5 && (
                      <button onClick={()=>updateQuestion(qi,{options:[...q.options,""],confidence:"review"})} className="text-sm text-brand font-bold">+ alternativa</button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <select className="field" value={q.time_limit} onChange={(e)=>updateQuestion(qi,{time_limit:Number(e.target.value)})}>
                      {TIMES.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                    <input className="field" value={q.skill} onChange={(e)=>updateQuestion(qi,{skill:e.target.value})} placeholder="Conteúdo/habilidade (opcional)" />
                  </div>

                  {q.notes && <div className="mt-3 text-xs text-sun">{q.notes}</div>}
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={addQuestion} className="btn-skew btn-outline"><span>+ Adicionar questão</span></button>
              <button onClick={()=>activeJob && persist(activeJob,questions).then(()=>toast.success("Rascunho salvo")).catch((e)=>toast.error(e.message))} className="btn-skew btn-outline">
                <span>Salvar rascunho</span>
              </button>
            </div>

            {validation.length > 0 && (
              <div className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                <strong>Antes de salvar:</strong>
                <ul className="list-disc pl-5 mt-2">{validation.slice(0,6).map((v)=><li key={v}>{v}</li>)}</ul>
              </div>
            )}

            <div className="sticky bottom-3 mt-7 rounded-2xl bg-paper text-ink p-4 shadow-2xl flex flex-wrap justify-between items-center gap-4">
              <div><strong>{questions.length} questões</strong><div className="text-sm text-ash">{pending} pendentes</div></div>
              {savedQuizId ? (
                <Link to="/atividade/$id" params={{id:savedQuizId}} className="btn-skew btn-brand"><span>Abrir atividade</span></Link>
              ) : (
                <button onClick={()=>void saveQuiz()} disabled={stage==="saving" || validation.length>0} className="btn-skew btn-brand">
                  <span>{stage==="saving" ? "Salvando…" : "Salvar como atividade"}</span>
                </button>
              )}
            </div>
          </section>
        )}

        {jobs.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl">Importações recentes</h2>
            <div className="mt-4 space-y-2">
              {jobs.map((job)=>(
                <div key={job.id} className="rounded-xl bg-panel border border-paper/10 p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-56">
                    <div className="font-bold">{job.file_name}</div>
                    <div className="text-xs text-ash">{bytesLabel(job.file_size)} · {job.question_count} questões</div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-paper/10">{job.status}</span>
                  {job.status==="review" && <button onClick={()=>void continueReview(job)} className="px-3 py-2 rounded-lg bg-brand text-ink font-bold text-sm">Continuar revisão</button>}
                  {job.status==="saved" && job.saved_quiz_id && <Link to="/atividade/$id" params={{id:job.saved_quiz_id}} className="px-3 py-2 rounded-lg bg-success text-ink font-bold text-sm">Abrir atividade</Link>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}