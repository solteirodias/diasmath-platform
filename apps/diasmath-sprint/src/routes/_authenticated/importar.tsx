import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/Brand";
import { parseImportFile, renderPdfPage, type ImportedQuestion } from "@/lib/import";
import { QUESTION_IMAGE_BUCKET } from "@/lib/question-images";

export const Route = createFileRoute("/_authenticated/importar")({
  head: () => ({ meta: [
    { title: "Importar PDF/Word — DIASMATH Sprint" },
    { name: "description", content: "Transforme PDF ou Word em uma atividade do DIASMATH Sprint." },
  ] }),
  component: Importar,
});

type Job = {
  id:string; file_name:string; file_type:string; file_size:number; status:string;
  question_count:number; title_suggestion:string; source_path:string|null;
  saved_quiz_id:string|null; created_at:string;
};

const TIMES=[[30,"30 s"],[60,"1 min"],[120,"2 min"],[180,"3 min"],[240,"4 min"],[300,"5 min"],[360,"6 min"]] as const;

function Importar(){
  const navigate=useNavigate();
  const input=useRef<HTMLInputElement>(null);
  const db=supabase as any;
  const [file,setFile]=useState<File|null>(null);
  const [job,setJob]=useState<Job|null>(null);
  const [jobs,setJobs]=useState<Job[]>([]);
  const [questions,setQuestions]=useState<ImportedQuestion[]>([]);
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [subject,setSubject]=useState("Matemática");
  const [stage,setStage]=useState<"idle"|"uploading"|"reading"|"review"|"saving">("idle");
  const [warning,setWarning]=useState("");
  const [drag,setDrag]=useState(false);

  const loadJobs=async()=>{
    const {data}=await db.from("import_jobs").select("*").order("created_at",{ascending:false}).limit(10);
    setJobs(data||[]);
  };
  useEffect(()=>{loadJobs();},[]);

  const serialize=(items:ImportedQuestion[])=>items.map((q,i)=>({
    position:i,source_page:q.source_page,kind:q.kind,text:q.text,options:q.options,
    correct:q.correct,correct_source:q.correct_source,image_path:q.image_path,skill:q.skill,
    confidence:q.confidence,notes:q.notes,time_limit:q.time_limit,
  }));

  const uploadImage=async(dataUrl:string,jobId:string,index:number)=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user) throw new Error("Sessão expirada.");
    const blob=await fetch(dataUrl).then(r=>r.blob());
    const ext=blob.type==="image/jpeg"?"jpg":blob.type==="image/webp"?"webp":"png";
    const path=`${user.id}/imports/${jobId}/q-${index+1}-${Date.now()}.${ext}`;
    const {error}=await supabase.storage.from(QUESTION_IMAGE_BUCKET).upload(path,blob,{contentType:blob.type||"image/png"});
    if(error) throw error;
    return path;
  };

  const persist=async(active:Job,items:ImportedQuestion[],suggested=title)=>{
    const {error}=await db.rpc("replace_import_drafts",{_job_id:active.id,_title_suggestion:suggested,_drafts:serialize(items)});
    if(error) throw error;
  };

  const processFile=async(selected:File)=>{
    if(selected.size>25*1024*1024){toast.error("O arquivo deve ter no máximo 25 MB.");return;}
    if(!/\.(pdf|docx|doc)$/i.test(selected.name)){toast.error("Envie PDF, DOCX ou DOC.");return;}
    setFile(selected); setStage("uploading"); setWarning("");
    try{
      const {data:{user}}=await supabase.auth.getUser(); if(!user) throw new Error("Faça login novamente.");
      const {data:created,error:createError}=await db.from("import_jobs").insert({
        teacher_id:user.id,file_name:selected.name,file_type:selected.type||"application/octet-stream",
        file_size:selected.size,status:"uploaded"
      }).select().single();
      if(createError) throw createError;
      const active=created as Job;
      const safe=selected.name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"-");
      const path=`${user.id}/${active.id}/${safe}`;
      const {error:upError}=await supabase.storage.from("import-files").upload(path,selected,{contentType:selected.type||undefined});
      if(upError) throw upError;
      await db.from("import_jobs").update({source_path:path,status:"processing"}).eq("id",active.id);

      if(/\.doc$/i.test(selected.name)) throw new Error("Arquivo .DOC antigo: converta para .DOCX e envie novamente.");

      setStage("reading");
      const parsed=await parseImportFile(selected);
      let items=parsed.questions;
      for(let i=0;i<items.length;i++){
        const dataUrl=items[i].embedded_image_data;
        if(!dataUrl) continue;
        try{
          const image_path=await uploadImage(dataUrl,active.id,i);
          items=items.map((q,n)=>n===i?{...q,image_path}:q);
        }catch{}
      }
      await persist(active,items,parsed.title);
      setJob({...active,status:"review",question_count:items.length,title_suggestion:parsed.title,source_path:path});
      setQuestions(items); setTitle(parsed.title); setDescription(`Importado de ${selected.name}`);
      setWarning(parsed.warning||""); setStage("review"); await loadJobs();
      toast.success(`${items.length} questão(ões) encontrada(s). Revise antes de salvar.`);
    }catch(e){
      setStage("idle"); toast.error(e instanceof Error?e.message:"Falha na importação.");
    }
  };

  const continueJob=async(active:Job)=>{
    const {data,error}=await db.from("import_drafts").select("*").eq("import_job_id",active.id).order("position");
    if(error){toast.error(error.message);return;}
    setJob(active);
    setQuestions((data||[]).map((q:any)=>({
      id:q.id,position:q.position,source_page:q.source_page,kind:q.kind,text:q.text||"",
      options:q.options||[],correct:q.correct,correct_source:q.correct_source,image_path:q.image_path,
      skill:q.skill||"",confidence:q.confidence||"review",notes:q.notes||"",time_limit:q.time_limit||30,
    })));
    setTitle(active.title_suggestion||active.file_name.replace(/\.(pdf|docx?|DOCX?|PDF)$/,""));
    setDescription(`Importado de ${active.file_name}`);
    if(active.source_path){
      const {data:blob}=await supabase.storage.from("import-files").download(active.source_path);
      if(blob) setFile(new File([blob],active.file_name,{type:active.file_type}));
    }
    setStage("review");
  };

  const update=(i:number,patch:Partial<ImportedQuestion>)=>setQuestions(qs=>qs.map((q,n)=>n===i?{...q,...patch}:q));
  const setOption=(i:number,j:number,value:string)=>setQuestions(qs=>qs.map((q,n)=>{
    if(n!==i)return q; const options=[...q.options];options[j]=value;return {...q,options,confidence:q.correct===null?"review":"medium"};
  }));
  const addQuestion=()=>setQuestions(qs=>[...qs,{id:crypto.randomUUID(),position:qs.length,source_page:null,kind:"multiple",text:"",options:["","","",""],correct:null,correct_source:null,image_path:null,skill:"",confidence:"review",notes:"Questão adicionada pelo professor.",time_limit:30}]);
  const removeQuestion=(i:number)=>setQuestions(qs=>qs.filter((_,n)=>n!==i).map((q,n)=>({...q,position:n})));

  const pageAsImage=async(i:number)=>{
    const q=questions[i];
    if(!job||!file||!q.source_page||!file.name.toLowerCase().endsWith(".pdf")) return;
    try{
      const dataUrl=await renderPdfPage(file,q.source_page);
      const image_path=await uploadImage(dataUrl,job.id,i);
      const next=questions.map((x,n)=>n===i?{...x,image_path,embedded_image_data:dataUrl}:x);
      setQuestions(next); await persist(job,next); toast.success("Página anexada como imagem.");
    }catch(e){toast.error(e instanceof Error?e.message:"Não foi possível anexar a página.");}
  };

  const problems=useMemo(()=>questions.flatMap((q,i)=>{
    const p:string[]=[]; const filled=q.options.filter(x=>x.trim()).length;
    if(!q.text.trim()&&!q.image_path)p.push(`Questão ${i+1}: falta enunciado ou imagem.`);
    if(filled<2)p.push(`Questão ${i+1}: faltam alternativas.`);
    if(q.correct===null||q.correct<0||q.correct>=q.options.length||!q.options[q.correct]?.trim())p.push(`Questão ${i+1}: confirme a resposta correta.`);
    return p;
  }),[questions]);

  const save=async()=>{
    if(!job||!title.trim())return;
    if(problems.length){toast.error(problems[0]);return;}
    setStage("saving");
    try{
      await persist(job,questions,title.trim());
      const {data,error}=await db.rpc("save_import_as_quiz",{_job_id:job.id,_title:title.trim(),_description:description.trim(),_subject:subject.trim()});
      if(error) throw error;
      toast.success("Atividade criada no DIASMATH Sprint!");
      navigate({to:"/atividade/$id",params:{id:String(data)}});
    }catch(e){toast.error(e instanceof Error?e.message:"Não foi possível salvar.");setStage("review");}
  };

  return <div className="min-h-screen bg-ink text-paper">
    <TopBar sub="Professor">
      <Link to="/painel" className="text-sm font-semibold text-ash hover:text-paper">← Minhas atividades</Link>
    </TopBar>
    <main className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="text-xs uppercase tracking-[0.3em] text-brand font-semibold">DIASMATH Sprint · Importação inteligente</div>
      <h1 className="font-display text-4xl md:text-5xl mt-2">Importar PDF/Word</h1>
      <p className="text-ash mt-3 max-w-2xl">Envie sua lista. A plataforma identifica questões, alternativas e gabarito; você revisa antes de salvar.</p>

      {stage!=="review"&&stage!=="saving"&&<section className="mt-8 grid md:grid-cols-[1.3fr_.7fr] gap-6">
        <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files?.[0];if(f)processFile(f)}} className={`rounded-2xl border-2 border-dashed p-10 text-center ${drag?"border-brand bg-brand/10":"border-paper/20 bg-panel"}`}>
          <div className="font-display text-2xl">Arraste seu PDF ou Word aqui</div>
          <p className="text-ash mt-2">PDF ou DOCX até 25 MB.</p>
          <input ref={input} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)processFile(f);e.currentTarget.value=""}}/>
          <button onClick={()=>input.current?.click()} disabled={stage!=="idle"} className="btn-skew btn-brand mt-6 px-7 py-4"><span>{stage==="idle"?"Escolher arquivo":"Processando…"}</span></button>
          {stage!=="idle"&&<p className="mt-5 text-brand font-semibold">{stage==="uploading"?"Enviando arquivo…":"Lendo e identificando questões…"}</p>}
        </div>
        <div className="rounded-2xl bg-panel border border-paper/10 p-6">
          <h2 className="font-display text-xl">O que o Sprint procura</h2>
          <ul className="mt-4 space-y-2 text-sm text-ash">
            <li>✓ Questões numeradas</li><li>✓ Alternativas A–E</li><li>✓ Gabarito no final</li>
            <li>✓ Imagens em DOCX</li><li>✓ Página do PDF como imagem</li><li>✓ Itens pendentes ficam para revisão</li>
          </ul>
        </div>
      </section>}

      {warning&&<div className="mt-5 rounded-xl border border-sun/40 bg-sun/10 p-4 text-sun">{warning}</div>}

      {(stage==="review"||stage==="saving")&&<section className="mt-8">
        <div className="rounded-2xl bg-panel border border-paper/10 p-6 grid md:grid-cols-3 gap-4">
          <label className="md:col-span-2">Título<input className="field mt-2" value={title} onChange={e=>setTitle(e.target.value)}/></label>
          <label>Conteúdo<input className="field mt-2" value={subject} onChange={e=>setSubject(e.target.value)}/></label>
          <label className="md:col-span-3">Descrição<input className="field mt-2" value={description} onChange={e=>setDescription(e.target.value)}/></label>
        </div>

        <div className="mt-6 space-y-5">
          {questions.map((q,i)=><article key={q.id} className="rounded-2xl bg-panel border border-paper/10 p-6">
            <div className="flex items-center justify-between gap-3"><h2 className="font-display text-xl">Questão {i+1}</h2><button onClick={()=>removeQuestion(i)} className="text-danger text-sm">Excluir</button></div>
            <textarea className="field mt-4 min-h-24" value={q.text} onChange={e=>update(i,{text:e.target.value})} placeholder="Enunciado"/>
            {q.source_page&&file?.name.toLowerCase().endsWith(".pdf")&&<button onClick={()=>pageAsImage(i)} className="mt-3 text-sm underline text-brand">Usar página {q.source_page} como imagem</button>}
            {q.embedded_image_data&&<img src={q.embedded_image_data} alt="" className="mt-3 max-h-44 object-contain rounded-lg"/>}
            {q.image_path&&<div className="mt-2 text-xs text-brand">✓ Imagem anexada</div>}
            <div className="mt-4 space-y-2">{q.options.map((opt,j)=><div key={j} className={`grid grid-cols-[44px_1fr] gap-2 rounded-xl p-2 ${q.correct===j?"bg-brand/15 ring-1 ring-brand":"bg-paper/5"}`}>
              <button onClick={()=>update(i,{correct:j,correct_source:"teacher",confidence:"high"})} className={`rounded-lg font-display ${q.correct===j?"bg-brand text-paper":"bg-paper/10"}`}>{String.fromCharCode(65+j)}</button>
              <input className="field" value={opt} onChange={e=>setOption(i,j,e.target.value)}/>
            </div>)}</div>
            {q.options.length<5&&<button onClick={()=>update(i,{options:[...q.options,""]})} className="mt-3 text-sm underline">+ alternativa</button>}
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <label>Tempo<select className="field mt-2" value={q.time_limit} onChange={e=>update(i,{time_limit:Number(e.target.value)})}>{TIMES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
              <label>Habilidade/conteúdo<input className="field mt-2" value={q.skill} onChange={e=>update(i,{skill:e.target.value})}/></label>
            </div>
            {q.notes&&<p className="mt-3 text-xs text-sun">{q.notes}</p>}
          </article>)}
        </div>
        <button onClick={addQuestion} className="mt-5 btn-skew btn-outline"><span>+ Adicionar questão</span></button>
        {problems.length>0&&<div className="mt-5 rounded-xl bg-danger/10 border border-danger/30 p-4 text-danger"><b>Revise antes de salvar:</b><ul className="list-disc pl-5 mt-2 text-sm">{problems.slice(0,6).map(x=><li key={x}>{x}</li>)}</ul></div>}
        <div className="sticky bottom-3 mt-7 rounded-2xl bg-paper text-ink p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div><b>{questions.length} questões</b><div className="text-sm text-ash">{problems.length?"Ainda há itens para revisar.":"Tudo pronto para salvar."}</div></div>
          <button onClick={save} disabled={stage==="saving"||problems.length>0} className="btn-skew btn-brand px-7 py-4 disabled:opacity-40"><span>{stage==="saving"?"Salvando…":"Salvar como atividade"}</span></button>
        </div>
      </section>}

      {jobs.length>0&&stage!=="review"&&stage!=="saving"&&<section className="mt-12">
        <h2 className="font-display text-2xl">Importações recentes</h2>
        <div className="mt-4 space-y-2">{jobs.map(j=><div key={j.id} className="rounded-xl bg-panel border border-paper/10 p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48"><b>{j.file_name}</b><div className="text-xs text-ash">{j.question_count} questões · {j.status}</div></div>
          {j.status==="review"&&<button onClick={()=>continueJob(j)} className="btn-skew btn-outline"><span>Continuar revisão</span></button>}
          {j.status==="saved"&&j.saved_quiz_id&&<Link to="/atividade/$id" params={{id:j.saved_quiz_id}} className="text-brand underline">Abrir atividade</Link>}
        </div>)}</div>
      </section>}
    </main>
  </div>;
}
