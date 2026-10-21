export const runtime = "nodejs";
import {
  formsConfig, formsHeaders, formsError, formsJson, getFormsUserFromSession,
  getStoredForm, ownsStoredForm, isAllowedFormsWrite,
} from "../../../../lib/formsSecurity";

const NO_CACHE={"Cache-Control":"no-store"};

async function authorized(request: Request) {
  const config=formsConfig();
  if(!config)return null;
  const user=await getFormsUserFromSession(config,request);
  return user?{config,user}:null;
}

function rowForForm(form: any,user: any) {
  const now=new Date().toISOString();
  if(!form || typeof form!=="object" || typeof form.id!=="string" ||
     !/^form_[\w-]{4,120}$/.test(form.id))return null;
  const normalized={
    ...form,id:form.id,
    ownerId:user.id,ownerEmail:user.email,
    updatedAt:now,createdAt:form.createdAt||now,
  };
  return {
    id:form.id,owner_email:user.email,owner_id:user.id,
    title:String(form.title||"Formulário sem título").slice(0,300),
    description:String(form.description||"").slice(0,2000),
    published:Boolean(form.published),updated_at:now,
    created_at:normalized.createdAt,form:normalized
  };
}

export async function GET(request: Request) {
  try {
    const auth=await authorized(request);
    if(!auth)return formsError("Faça login para consultar seus formulários.",401);
    const ownerEmail=new URL(request.url).searchParams.get("ownerEmail");
    if(ownerEmail && ownerEmail.toLowerCase()!==auth.user.email.toLowerCase())return formsError("Acesso negado.",403);
    const endpoint=auth.config.url+"/rest/v1/diasmath_forms_forms"+
      "?select=id,owner_email,owner_id,title,description,published,updated_at,created_at,form"+
      "&owner_email=eq."+encodeURIComponent(auth.user.email)+"&order=updated_at.desc";
    const r=await fetch(endpoint,{headers:formsHeaders(auth.config),cache:"no-store"});
    if(!r.ok)throw new Error("query_forms");
    const data=await r.json();
    const forms=Array.isArray(data)?data.map(row=>({
      ...(row.form||{}),id:row.id,ownerEmail:row.owner_email,
      ownerId:row.owner_id||row.form?.ownerId||"",
      title:row.title||row.form?.title||"Formulário sem título",
      description:row.description||"",published:Boolean(row.published),
      updatedAt:row.updated_at,createdAt:row.created_at
    })):[];
    return Response.json({ok:true,forms},{headers:NO_CACHE});
  }catch(error){console.error("[Forms list GET]",error instanceof Error?error.message:"erro");return formsError("Falha ao consultar formulários.",503)}
}

export async function POST(request: Request) {
  try {
    if(!isAllowedFormsWrite(request))return formsError("Origem não autorizada.",403);
    const auth=await authorized(request);
    if(!auth)return formsError("Faça login para salvar formulários.",401);
    const payload=await formsJson(request,1_000_000);
    const ownerEmail=String(payload?.ownerEmail||"").trim().toLowerCase();
    if(ownerEmail && ownerEmail!==auth.user.email.toLowerCase())return formsError("Acesso negado.",403);
    const forms=Array.isArray(payload.forms)?payload.forms:(payload.form?[payload.form]:[]);
    if(!forms.length||forms.length>30)return formsError("Quantidade de formulários inválida.");
    const rows=forms.map(form=>rowForForm(form,auth.user));
    if(rows.some(row=>!row))return formsError("Formulário inválido.");
    const ids=rows.map(row=>row!.id);
    if(new Set(ids).size!==ids.length)return formsError("Há identificadores duplicados.");

    // The service-role key bypasses database RLS. Explicitly verify every existing
    // form before UPSERT, never trusting ownerEmail or ownerId from the client.
    for(const id of ids){
      const existing=await getStoredForm(auth.config,id);
      if(existing && !ownsStoredForm(existing,auth.user))return formsError("Formulário de outro professor.",403);
    }
    const response=await fetch(auth.config.url+"/rest/v1/diasmath_forms_forms?on_conflict=id",{
      method:"POST",
      headers:{...formsHeaders(auth.config),Prefer:"resolution=merge-duplicates,return=minimal"},
      body:JSON.stringify(rows),cache:"no-store"
    });
    if(!response.ok)throw new Error("write_forms");
    return Response.json({ok:true,count:rows.length},{headers:NO_CACHE});
  }catch(error){
    if(error instanceof Error&&error.message==="payload_too_large")return formsError("Formulário muito grande.",413);
    console.error("[Forms list POST]",error instanceof Error?error.message:"erro");
    return formsError("Não foi possível salvar os formulários.",503);
  }
}

export async function DELETE(request: Request) {
  try {
    if(!isAllowedFormsWrite(request))return formsError("Origem não autorizada.",403);
    const auth=await authorized(request);
    if(!auth)return formsError("Faça login para excluir formulários.",401);
    const params=new URL(request.url).searchParams;
    const formId=params.get("formId")||"";
    const email=params.get("ownerEmail");
    if(email&&email.trim().toLowerCase()!==auth.user.email.toLowerCase())return formsError("Acesso negado.",403);
    if(!formId)return formsError("Informe o identificador do formulário.");
    const existing=await getStoredForm(auth.config,formId);
    if(!ownsStoredForm(existing,auth.user))return formsError("Formulário não encontrado.",404);
    // Deleting the form is an owner-only action; responses are associated with it.
    const end=auth.config.url+"/rest/v1/diasmath_forms_forms?id=eq."+
      encodeURIComponent(formId)+"&owner_email=eq."+encodeURIComponent(auth.user.email);
    const response=await fetch(end,{method:"DELETE",headers:formsHeaders(auth.config),cache:"no-store"});
    if(!response.ok)throw new Error("delete_form");
    return Response.json({ok:true},{headers:NO_CACHE});
  }catch(error){console.error("[Forms list DELETE]",error instanceof Error?error.message:"erro");return formsError("Não foi possível excluir o formulário.",503)}
}
