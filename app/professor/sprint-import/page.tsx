"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { sprintSupabase } from "@/lib/sprintSupabase";
import {
  ImportedQuestion,
  parseImportFile,
  renderPdfPage,
} from "@/lib/sprintImport";

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

const TIMES = [
  [30, "30 s"],
  [60, "1 min"],
  [120, "2 min"],
  [180, "3 min"],
  [240, "4 min"],
  [300, "5 min"],
  [360, "6 min"],
] as const;

const STATUS_LABEL: Record<string, string> = {
  uploaded: "Enviado",
  processing: "Processando",
  review: "Em revisão",
  saved: "Salvo",
  failed: "Falhou",
};

function safeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function bytesLabel(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function confidenceStyle(value: string) {
  if (value === "high") return "bg-emerald-100 text-emerald-800";
  if (value === "medium") return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

function confidenceLabel(value: string) {
  if (value === "high") return "Alta";
  if (value === "medium") return "Média";
  return "Revisar";
}

export default function SprintImportPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<ImportedQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Matemática");
  const [stage, setStage] = useState<"idle" | "uploading" | "reading" | "identifying" | "review" | "saving">("idle");
  const [notice, setNotice] = useState("");
  const [warning, setWarning] = useState("");
  const [dragging, setDragging] = useState(false);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);

  useEffect(() => {
    sprintSupabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data } = sprintSupabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const loadJobs = async () => {
    const { data, error } = await sprintSupabase
      .from("import_jobs")
      .select("id,file_name,file_type,file_size,status,question_count,title_suggestion,error_message,source_path,saved_quiz_id,created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    if (!error) setJobs((data || []) as ImportJob[]);
  };

  useEffect(() => {
    if (session?.user) loadJobs();
    else setJobs([]);
  }, [session?.user?.id]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setNotice("");
    const { error } = await sprintSupabase.auth.signInWithPassword({ email, password });
    setAuthBusy(false);
    if (error) setNotice("Não foi possível entrar: " + error.message);
  };

  const logout = async () => {
    await sprintSupabase.auth.signOut();
    resetEditor();
  };

  const resetEditor = () => {
    setActiveJob(null);
    setSourceFile(null);
    setQuestions([]);
    setTitle("");
    setDescription("");
    setSubject("Matemática");
    setStage("idle");
    setNotice("");
    setWarning("");
    setSavedQuizId(null);
  };

  const serialize = (items: ImportedQuestion[]) =>
    items.map((q, index) => ({
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

  const uploadQuestionImage = async (dataUrl: string, jobId: string, position: number) => {
    if (!session?.user) throw new Error("Sessão expirada.");
    const blob = await fetch(dataUrl).then((r) => r.blob());
    const ext =
      blob.type === "image/jpeg" ? "jpg" :
      blob.type === "image/webp" ? "webp" :
      blob.type === "image/gif" ? "gif" : "png";
    const path = `${session.user.id}/imports/${jobId}/question-${position + 1}-${Date.now()}.${ext}`;
    const { error } = await sprintSupabase.storage
      .from("question-images")
      .upload(path, blob, { contentType: blob.type || "image/png", upsert: false });
    if (error) throw error;
    return path;
  };

  const persistDrafts = async (job: ImportJob, items: ImportedQuestion[], suggestedTitle = title) => {
    const { error } = await sprintSupabase.rpc("replace_import_drafts", {
      _job_id: job.id,
      _title_suggestion: suggestedTitle,
      _drafts: serialize(items),
    });
    if (error) throw error;
  };

  const processFile = async (file: File) => {
    if (!session?.user) return;
    const lower = file.name.toLowerCase();
    if (!/\.(pdf|docx|doc)$/.test(lower)) {
      setNotice("Envie um arquivo PDF, DOCX ou DOC.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setNotice("O arquivo ultrapassa o limite de 25 MB.");
      return;
    }

    resetEditor();
    setSourceFile(file);
    setStage("uploading");
    setNotice("Enviando o arquivo com segurança…");

    let job: ImportJob | null = null;
    try {
      const { data: created, error: createError } = await sprintSupabase
        .from("import_jobs")
        .insert({
          teacher_id: session.user.id,
          file_name: file.name,
          file_type: file.type || (lower.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
          file_size: file.size,
          status: "uploaded",
        })
        .select()
        .single();
      if (createError) throw createError;
      job = created as ImportJob;

      const path = `${session.user.id}/${job.id}/${safeName(file.name)}`;
      const { error: uploadError } = await sprintSupabase.storage
        .from("import-files")
        .upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (uploadError) throw uploadError;

      await sprintSupabase
        .from("import_jobs")
        .update({ source_path: path, status: "processing" })
        .eq("id", job.id);
      job = { ...job, source_path: path, status: "processing" };
      setActiveJob(job);

      if (lower.endsWith(".doc")) {
        throw new Error("O arquivo .DOC foi armazenado, mas esse formato antigo precisa ser convertido para .DOCX para a leitura automática.");
      }

      setStage("reading");
      setNotice("Lendo o conteúdo do arquivo…");
      const parsed = await parseImportFile(file);

      setStage("identifying");
      setNotice("Identificando questões, alternativas e gabarito…");

      let parsedQuestions = parsed.questions;
      for (let i = 0; i < parsedQuestions.length; i++) {
        const dataUrl = parsedQuestions[i].embedded_image_data;
        if (!dataUrl) continue;
        try {
          const imagePath = await uploadQuestionImage(dataUrl, job.id, i);
          parsedQuestions = parsedQuestions.map((q, index) =>
            index === i ? { ...q, image_path: imagePath } : q,
          );
        } catch {
          parsedQuestions = parsedQuestions.map((q, index) =>
            index === i
              ? { ...q, notes: [q.notes, "A imagem foi detectada, mas precisa ser reenviada antes de salvar."].filter(Boolean).join(" "), confidence: "review" as const }
              : q,
          );
        }
      }

      await persistDrafts(job, parsedQuestions, parsed.title);

      const reviewJob: ImportJob = {
        ...job,
        status: "review",
        question_count: parsedQuestions.length,
        title_suggestion: parsed.title,
      };
      setActiveJob(reviewJob);
      setQuestions(parsedQuestions);
      setTitle(parsed.title);
      setDescription(`Importado de ${file.name}`);
      setWarning(parsed.warning || "");
      setStage("review");
      setNotice(`${parsedQuestions.length} questão(ões) encontrada(s). Revise antes de salvar.`);
      await loadJobs();
    } catch (error: any) {
      const message = error?.message || "Não foi possível processar o arquivo.";
      setNotice(message);
      setStage("idle");
      if (job) {
        await sprintSupabase
          .from("import_jobs")
          .update({ status: "failed", error_message: message })
          .eq("id", job.id);
        await loadJobs();
      }
    }
  };

  const continueReview = async (job: ImportJob) => {
    setNotice("Carregando a importação…");
    setWarning("");
    setSavedQuizId(job.saved_quiz_id);
    const { data, error } = await sprintSupabase
      .from("import_drafts")
      .select("*")
      .eq("import_job_id", job.id)
      .order("position");
    if (error) {
      setNotice(error.message);
      return;
    }
    const restored: ImportedQuestion[] = (data || []).map((d: any, index: number) => ({
      id: d.id,
      position: index,
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
    setStage("review");

    if (job.source_path) {
      const { data: blob } = await sprintSupabase.storage.from("import-files").download(job.source_path);
      if (blob) setSourceFile(new File([blob], job.file_name, { type: job.file_type }));
    }
    setNotice("Rascunho carregado.");
  };

  const deleteJob = async (job: ImportJob) => {
    if (!window.confirm(`Excluir a importação “${job.file_name}”? A atividade já salva, se houver, não será apagada.`)) return;
    if (job.source_path) await sprintSupabase.storage.from("import-files").remove([job.source_path]);
    const { error } = await sprintSupabase.from("import_jobs").delete().eq("id", job.id);
    if (error) setNotice(error.message);
    else {
      if (activeJob?.id === job.id) resetEditor();
      await loadJobs();
    }
  };

  const updateQuestion = (index: number, patch: Partial<ImportedQuestion>) => {
    setQuestions((current) =>
      current.map((q, i) => i === index ? { ...q, ...patch, confidence: patch.confidence || (q.confidence === "high" ? "medium" : q.confidence) } : q),
    );
  };

  const updateOption = (qIndex: number, optionIndex: number, value: string) => {
    setQuestions((current) =>
      current.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[optionIndex] = value;
        return { ...q, options, confidence: q.correct === null ? "review" : "medium" };
      }),
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((current) =>
      current.map((q, i) => i === qIndex && q.options.length < 5
        ? { ...q, options: [...q.options, ""], confidence: "review" }
        : q),
    );
  };

  const removeOption = (qIndex: number, optionIndex: number) => {
    setQuestions((current) =>
      current.map((q, i) => {
        if (i !== qIndex || q.options.length <= 2) return q;
        const options = q.options.filter((_, idx) => idx !== optionIndex);
        let correct = q.correct;
        if (correct === optionIndex) correct = null;
        else if (correct !== null && correct > optionIndex) correct -= 1;
        return { ...q, options, correct, correct_source: correct === null ? null : q.correct_source, confidence: "review" };
      }),
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        position: current.length,
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
      },
    ]);
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const copy = [...questions];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setQuestions(copy.map((q, position) => ({ ...q, position })));
  };

  const removeQuestion = (index: number) => {
    setQuestions((current) => current.filter((_, i) => i !== index).map((q, position) => ({ ...q, position })));
  };

  const attachPdfPage = async (index: number) => {
    const q = questions[index];
    if (!activeJob || !sourceFile || !q.source_page || !sourceFile.name.toLowerCase().endsWith(".pdf")) {
      setNotice("A página original do PDF não está disponível para esta questão.");
      return;
    }
    try {
      setNotice(`Preparando a página ${q.source_page} como imagem…`);
      const dataUrl = await renderPdfPage(sourceFile, q.source_page);
      const imagePath = await uploadQuestionImage(dataUrl, activeJob.id, index);
      const next = questions.map((item, i) => i === index
        ? { ...item, embedded_image_data: dataUrl, image_path: imagePath, notes: [item.notes, `Página ${q.source_page} anexada como imagem.`].filter(Boolean).join(" ") }
        : item);
      setQuestions(next);
      await persistDrafts(activeJob, next);
      setNotice("Imagem da página anexada à questão.");
    } catch (error: any) {
      setNotice(error?.message || "Não foi possível transformar a página em imagem.");
    }
  };

  const validationProblems = useMemo(() => {
    return questions.flatMap((q, index) => {
      const problems: string[] = [];
      if (!q.text.trim() && !q.image_path) problems.push(`Questão ${index + 1}: falta enunciado ou imagem.`);
      if (q.options.filter((x) => x.trim()).length < 2) problems.push(`Questão ${index + 1}: faltam alternativas.`);
      if (q.correct === null || q.correct < 0 || q.correct >= q.options.length || !q.options[q.correct]?.trim()) {
        problems.push(`Questão ${index + 1}: confirme a resposta correta.`);
      }
      return problems;
    });
  }, [questions]);

  const saveAsQuiz = async () => {
    if (!activeJob) return;
    if (!title.trim()) {
      setNotice("Informe o título da atividade.");
      return;
    }
    if (validationProblems.length) {
      setNotice(validationProblems[0]);
      return;
    }
    setStage("saving");
    setNotice("Salvando rascunho e criando a atividade no DIASMATH Sprint…");
    try {
      await persistDrafts(activeJob, questions);
      const { data, error } = await sprintSupabase.rpc("save_import_as_quiz", {
        _job_id: activeJob.id,
        _title: title.trim(),
        _description: description.trim(),
        _subject: subject.trim(),
      });
      if (error) throw error;
      const quizId = String(data);
      setSavedQuizId(quizId);
      setActiveJob({ ...activeJob, status: "saved", saved_quiz_id: quizId });
      setStage("review");
      setNotice("Atividade salva no DIASMATH Sprint com sucesso.");
      await loadJobs();
    } catch (error: any) {
      setStage("review");
      setNotice(error?.message || "Não foi possível salvar a atividade.");
    }
  };

  const pendingCount = questions.filter((q) =>
    q.correct === null ||
    q.options.filter((x) => x.trim()).length < 2 ||
    (!q.text.trim() && !q.image_path)
  ).length;

  if (!authReady) {
    return <div className="min-h-screen grid place-items-center text-slate-600">Conectando ao DIASMATH Sprint…</div>;
  }

  if (!session) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-lg px-6 py-16">
          <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100/60">
            <img src="/diasmath-sprint-logo.webp" alt="" className="h-20 w-20 rounded-2xl shadow-md" />
            <p className="mt-6 text-sm font-black uppercase tracking-widest text-blue-700">DIASMATH Sprint</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Importar PDF/Word</h1>
            <p className="mt-3 leading-7 text-slate-600">
              Entre com a mesma conta de professor usada no Sprint. O arquivo será lido e transformado em um rascunho para sua revisão.
            </p>
            <form onSubmit={login} className="mt-7 space-y-4">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail" className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha" className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" />
              <button disabled={authBusy} className="w-full rounded-2xl bg-blue-700 px-5 py-3.5 font-black text-white hover:bg-blue-800 disabled:opacity-60">
                {authBusy ? "Entrando…" : "Entrar com minha conta do Sprint"}
              </button>
            </form>
            {notice && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{notice}</p>}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-black text-blue-700">DIASMATH Sprint · Professor</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">Importar atividade</h1>
            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Envie PDF ou Word. O DIASMATH identifica questões, alternativas e gabarito, e você confirma tudo antes de salvar.
            </p>
          </div>
          <div className="flex gap-2">
            {activeJob && <button onClick={resetEditor} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold">Nova importação</button>}
            <button onClick={logout} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold">Sair</button>
          </div>
        </div>

        {notice && (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 font-semibold text-blue-950">
            {notice}
          </div>
        )}
        {warning && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900">
            {warning}
          </div>
        )}

        {stage !== "review" && stage !== "saving" && (
          <section className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processFile(file);
              }}
              className={`rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-12 ${dragging ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white"}`}
            >
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-blue-700 text-4xl text-white">↑</div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">Envie sua lista de questões</h2>
              <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">
                PDF e DOCX até 25 MB. Arquivos .DOC antigos são armazenados, mas precisam ser convertidos para DOCX para leitura automática.
              </p>
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processFile(file);
                  e.currentTarget.value = "";
                }}
              />
              <button
                onClick={() => fileInput.current?.click()}
                disabled={stage !== "idle"}
                className="mt-6 rounded-2xl bg-slate-950 px-7 py-3.5 font-black text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {stage === "idle" ? "Escolher PDF ou Word" : "Processando…"}
              </button>

              {stage !== "idle" && (
                <div className="mx-auto mt-8 max-w-2xl">
                  <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                    {[
                      ["uploading", "Enviando"],
                      ["reading", "Lendo"],
                      ["identifying", "Identificando"],
                      ["review", "Revisão"],
                    ].map(([key, label], index) => {
                      const order = ["uploading", "reading", "identifying", "review"];
                      const current = order.indexOf(stage);
                      return (
                        <div key={key} className={`rounded-xl px-2 py-3 ${index <= current ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"}`}>
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <aside className="rounded-3xl bg-slate-950 p-6 text-white">
              <h2 className="text-xl font-black">O que a plataforma procura</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                <li>✓ Questão 1, 01., 1) e padrões semelhantes</li>
                <li>✓ Alternativas A), B), C), D) e E)</li>
                <li>✓ Gabarito ao final do documento</li>
                <li>✓ Imagens existentes em arquivos DOCX</li>
                <li>✓ Página do PDF como imagem quando houver figura/gráfico</li>
                <li>✓ Questões sem gabarito ficam marcadas para revisão</li>
              </ul>
              <p className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6">
                A plataforma nunca publica automaticamente. Você revisa e confirma o gabarito antes de criar a atividade.
              </p>
            </aside>
          </section>
        )}

        {(stage === "review" || stage === "saving") && activeJob && (
          <section className="mt-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
                <label className="font-bold text-slate-700">
                  Título da atividade
                  <input value={title} onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-600" />
                </label>
                <label className="font-bold text-slate-700">
                  Área/conteúdo
                  <input value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-600" />
                </label>
                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-xs font-black uppercase text-blue-700">Detectadas</div>
                  <div className="mt-1 text-3xl font-black text-blue-950">{questions.length}</div>
                  <div className="text-sm text-blue-800">{pendingCount} para revisar</div>
                </div>
              </div>
              <label className="mt-4 block font-bold text-slate-700">
                Descrição
                <input value={description} onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-blue-600" />
              </label>
            </div>

            <div className="mt-6 space-y-5">
              {questions.map((q, qIndex) => (
                <article key={q.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 font-black text-white">{qIndex + 1}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${confidenceStyle(q.confidence)}`}>
                        {confidenceLabel(q.confidence)}
                      </span>
                      {q.source_page && <span className="text-xs font-semibold text-slate-500">página {q.source_page}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => moveQuestion(qIndex, -1)} disabled={qIndex === 0} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-30">↑</button>
                      <button onClick={() => moveQuestion(qIndex, 1)} disabled={qIndex === questions.length - 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-30">↓</button>
                      <button onClick={() => removeQuestion(qIndex)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-bold text-rose-700">Excluir</button>
                    </div>
                  </div>

                  <label className="mt-5 block text-sm font-black text-slate-700">
                    Enunciado
                    <textarea
                      value={q.text}
                      onChange={(e) => updateQuestion(qIndex, { text: e.target.value, confidence: q.confidence === "high" ? "medium" : q.confidence })}
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal leading-6 outline-none focus:border-blue-600"
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {q.source_page && sourceFile?.name.toLowerCase().endsWith(".pdf") && (
                      <button onClick={() => attachPdfPage(qIndex)}
                        className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-800">
                        Usar página {q.source_page} como imagem
                      </button>
                    )}
                    {q.image_path && <span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">✓ Imagem anexada</span>}
                    {q.embedded_image_data && (
                      <img src={q.embedded_image_data} alt="Prévia da figura detectada" className="max-h-40 max-w-full rounded-xl border object-contain" />
                    )}
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="text-sm font-black text-slate-700">Alternativas e gabarito</div>
                    {q.options.map((option, optionIndex) => (
                      <div key={optionIndex} className={`grid grid-cols-[42px_1fr_auto] items-center gap-2 rounded-2xl border p-2 ${q.correct === optionIndex ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}>
                        <button
                          type="button"
                          title="Marcar como resposta correta"
                          onClick={() => updateQuestion(qIndex, { correct: optionIndex, correct_source: "teacher", confidence: "high" })}
                          className={`grid h-10 w-10 place-items-center rounded-xl font-black ${q.correct === optionIndex ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </button>
                        <input
                          value={option}
                          onChange={(e) => updateOption(qIndex, optionIndex, e.target.value)}
                          className="min-w-0 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-600"
                        />
                        {q.options.length > 2 && (
                          <button onClick={() => removeOption(qIndex, optionIndex)} className="px-2 text-lg text-slate-400 hover:text-rose-600">×</button>
                        )}
                      </div>
                    ))}
                    {q.options.length < 5 && (
                      <button onClick={() => addOption(qIndex)} className="w-fit rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-bold text-slate-600">
                        + Alternativa
                      </button>
                    )}
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-black text-slate-700">
                      Tempo
                      <select
                        value={q.time_limit}
                        onChange={(e) => updateQuestion(qIndex, { time_limit: Number(e.target.value) })}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal"
                      >
                        {TIMES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-black text-slate-700">
                      Conteúdo/habilidade
                      <input
                        value={q.skill}
                        onChange={(e) => updateQuestion(qIndex, { skill: e.target.value })}
                        placeholder="Opcional"
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal"
                      />
                    </label>
                  </div>

                  {q.notes && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">{q.notes}</p>}
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={addQuestion} className="rounded-2xl border-2 border-dashed border-blue-300 px-5 py-3 font-black text-blue-800">
                + Adicionar questão
              </button>
              <button
                onClick={() => activeJob && persistDrafts(activeJob, questions).then(() => setNotice("Rascunho atualizado.")).catch((e) => setNotice(e.message))}
                className="rounded-2xl border border-slate-300 px-5 py-3 font-black text-slate-700"
              >
                Salvar rascunho
              </button>
            </div>

            {validationProblems.length > 0 && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <div className="font-black text-rose-800">Antes de criar a atividade:</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-rose-700">
                  {validationProblems.slice(0, 8).map((problem) => <li key={problem}>{problem}</li>)}
                </ul>
              </div>
            )}

            <div className="sticky bottom-4 z-10 mt-8 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-black text-slate-950">{questions.length} questões · {pendingCount} pendentes</div>
                  <div className="text-sm text-slate-500">Nada é publicado sem sua confirmação.</div>
                </div>
                {savedQuizId ? (
                  <a
                    href={`https://diasmath-arena.lovable.app/atividade/${savedQuizId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-emerald-600 px-6 py-3.5 font-black text-white"
                  >
                    Abrir atividade no Sprint ↗
                  </a>
                ) : (
                  <button
                    onClick={saveAsQuiz}
                    disabled={stage === "saving" || validationProblems.length > 0}
                    className="rounded-2xl bg-blue-700 px-7 py-3.5 font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {stage === "saving" ? "Salvando…" : "Salvar como atividade"}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {jobs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-black text-slate-950">Importações recentes</h2>
            <div className="mt-4 grid gap-3">
              {jobs.map((job) => (
                <div key={job.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="min-w-[220px] flex-1">
                    <div className="font-black text-slate-900">{job.file_name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {bytesLabel(job.file_size)} · {new Date(job.created_at).toLocaleString("pt-BR")} · {job.question_count} questões
                    </div>
                    {job.error_message && <div className="mt-1 text-sm font-semibold text-rose-700">{job.error_message}</div>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${
                    job.status === "saved" ? "bg-emerald-100 text-emerald-800" :
                    job.status === "failed" ? "bg-rose-100 text-rose-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {STATUS_LABEL[job.status] || job.status}
                  </span>
                  {job.status === "review" && (
                    <button onClick={() => continueReview(job)} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white">
                      Continuar revisão
                    </button>
                  )}
                  {job.status === "saved" && job.saved_quiz_id && (
                    <a href={`https://diasmath-arena.lovable.app/atividade/${job.saved_quiz_id}`} target="_blank" rel="noopener noreferrer"
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">
                      Abrir no Sprint
                    </a>
                  )}
                  <button onClick={() => deleteJob(job)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600">
                    Excluir importação
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
