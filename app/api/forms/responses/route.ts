export const runtime = "nodejs";
import {
  formsConfig, formsHeaders, formsError, formsJson, getFormsUserFromSession,
  getStoredForm, ownsStoredForm, isAllowedFormsWrite,
} from "../../../../lib/formsSecurity";

const NO_CACHE={"Cache-Control":"no-store"};
type Incoming={id?:string;formId?:string;formTitle?:string;submittedAt?:string;participant?:any;answers?:any;formSnapshot?:any};

function sanitizeParticipant(input: any, settings: any) {
  const item=input && typeof input==="object" && !Array.isArray(input)?input:{};
  const name=String(item.name||"").trim().slice(0,160);
  const email=String(item.email||"").trim().slice(0,254);
  if(settings?.collectName&&!name)return null;
  if(settings?.collectEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return null;
  return {name:settings?.collectName?name:"",email:settings?.collectEmail?email:""};
}

function sanitizeAnswers(raw: any, form: any): Record<string, string | string[]> | null {
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
  const questions=(Array.isArray(form.sections)?form.sections:[]).flatMap((s:any)=>Array.isArray(s.questions)?s.questions:[]);
  if(questions.length>200)return null;
  const ids=new Set(questions.map((q:any)=>String(q.id)));
  if(Object.keys(raw).length>220||Object.keys(raw).some(id=>!ids.has(id)))return null;
  const cleaned:Record<string,string|string[]>={};
  for(const q of questions){
    const id=String(q.id), v=raw[id], isMultiple=q.type==="multiple";
    if(isMultiple){
      if(v!==undefined && (!Array.isArray(v)||v.length>40||v.some(x=>typeof x!=="string"||x.length>1500)))return null;
      const items=Array.isArray(v)?v:[];
      if(q.required&&!items.length)return null;
      cleaned[id]=items;
    }else{
      if(v!==undefined && typeof v!=="string" && typeof v!=="number")return null;
      const text=v===undefined?"":String(v).trim().slice(0,12_000);
      if(v!==undefined && String(v).length>12_000)return null;
      if(q.required&&!text)return null;
      cleaned[id]=text;
    }
  }
  return cleaned;
}

export async function GET(request: Request) {
  try {
    const config=formsConfig();
    if(!config)return formsError("Serviço temporariamente indisponível.",503);
    const user=await getFormsUserFromSession(config,request);
    if(!user)return formsError("Entre para consultar respostas.",401);
    const id=new URL(request.url).searchParams.get("formId")||"";
    if(!id)return formsError("Informe o formulário.");
    const row=await getStoredForm(config,id);
    if(!ownsStoredForm(row,user))return formsError("Respostas não disponíveis.",403);
    const url=config.url+"/rest/v1/diasmath_forms_responses"+
      "?select=id,form_id,form_title,submitted_at,participant,answers,form_snapshot"+
      "&form_id=eq."+encodeURIComponent(id)+"&order=submitted_at.desc";
    const r=await fetch(url,{headers:formsHeaders(config),cache:"no-store"});
    if(!r.ok)throw new Error("responses_query");
    const data=await r.json();
    const responses=Array.isArray(data)?data.map(item=>({
      id:item.id,formId:item.form_id,formTitle:item.form_title,
      submittedAt:item.submitted_at,participant:item.participant||{},
      answers:item.answers||{},formSnapshot:item.form_snapshot||null
    })):[];
    return Response.json({ok:true,responses},{headers:NO_CACHE});
  }catch(error){console.error("[Forms responses GET]",error instanceof Error?error.message:"erro");return formsError("Não foi possível consultar respostas.",503)}
}

export async function POST(request: Request) {
  try {
    if(!isAllowedFormsWrite(request))return formsError("Origem não autorizada.",403);
    const config=formsConfig();
    if(!config)return formsError("Serviço temporariamente indisponível.",503);
    const payload=await formsJson(request,500_000);
    const items:Incoming[]=Array.isArray(payload?.responses)?payload.responses:[payload];
    if(!items.length||items.length>30)return formsError("Quantidade de respostas inválida.");
    const user=await getFormsUserFromSession(config,request);
    if(!user && items.length!==1)return formsError("Envio em lote exige acesso do professor.",401);
    const rows:any[]=[];
    const cache=new Map<string,any>();
    for(const item of items){
      if(!item||typeof item.formId!=="string"||item.formId.length>180)return formsError("Identificador de formulário inválido.");
      let stored=cache.get(item.formId);
      if(!stored){
        stored=await getStoredForm(config,item.formId);
        if(!stored)return formsError("Formulário não encontrado.",404);
        cache.set(item.formId,stored);
      }
      const owner=ownsStoredForm(stored,user);
      if(!owner&&!stored.published)return formsError("Formulário não está disponível para respostas.",403);
      const current=stored.form||{};
      const participant=sanitizeParticipant(item.participant,current.settings||{});
      const answers=sanitizeAnswers(item.answers,current);
      if(!participant||!answers)return formsError("Resposta incompleta ou inválida.",400);
      // Never accept arbitrary client-provided form snapshots or metadata.
      const safeSnapshot={
        id:stored.id,title:stored.title||current.title||"Formulário DIASMATH",
        sections:current.sections||[],settings:current.settings||{},
      };
      const requestedId=owner&&typeof item.id==="string"&&/^resp_[\w-]{6,180}$/.test(item.id)?item.id:null;
      const submittedAt=owner&&item.submittedAt&&!Number.isNaN(Date.parse(item.submittedAt))?
        new Date(item.submittedAt).toISOString():new Date().toISOString();
      rows.push({
        id:requestedId||"resp_"+crypto.randomUUID(),
        form_id:stored.id,form_title:safeSnapshot.title,submitted_at:submittedAt,
        participant,answers,form_snapshot:safeSnapshot,
      });
    }
    // Conflict ignores ensure public submitters cannot overwrite old responses.
    const response=await fetch(config.url+"/rest/v1/diasmath_forms_responses?on_conflict=id",{
      method:"POST",
      headers:{...formsHeaders(config),Prefer:"resolution=ignore-duplicates,return=minimal"},
      body:JSON.stringify(rows),cache:"no-store",
    });
    if(!response.ok)throw new Error("responses_insert");
    // Do not reflect student answers back to anonymous clients.
    return Response.json({ok:true,count:rows.length},{headers:NO_CACHE});
  }catch(error){
    if(error instanceof Error&&error.message==="payload_too_large")return formsError("Respostas muito grandes.",413);
    console.error("[Forms responses POST]",error instanceof Error?error.message:"erro");
    return formsError("Não foi possível registrar a resposta.",503);
  }
}
