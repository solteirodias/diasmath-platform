export const runtime = "nodejs";

import { randomInt, timingSafeEqual } from "node:crypto";
import {
  formsConfig, formsHeaders, formsError, formsJson, formsCookieHeader,
  getFormsUser, getFormsUserFromSession, issueFormsSession, isAllowedFormsWrite, hashRecoveryCode,
} from "../../../../lib/formsSecurity";

type Action = "login" | "register" | "recover" | "reset" | "profile" | "logout";
type AuthPayload = {
  action?: Action;
  name?: string; email?: string; school?: string; city?: string;
  passwordHash?: string; resetCode?: string;
};

const NO_CACHE = { "Cache-Control": "no-store" };
const RECOVERY_MESSAGE = "Se o e-mail estiver cadastrado, enviaremos um código de recuperação.";

function publicUser(row: any) {
  return {
    id: row.id, name: row.name || "Professor",
    email: row.email, school: row.school || "", city: row.city || "",
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function secureCompare(a: string, b: string) {
  const x=Buffer.from(a), y=Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x,y);
}

function passwordHashValid(value: unknown): value is string {
  // SHA-256 is retained solely to verify existing DIASMATH Forms accounts.
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function emailValid(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function textField(value: unknown, max=150) {
  return String(typeof value === "string" ? value : "").trim().slice(0,max);
}

async function updateUser(config: NonNullable<ReturnType<typeof formsConfig>>, email: string, patch: Record<string, unknown>) {
  const endpoint=config.url+"/rest/v1/diasmath_forms_users?email=eq."+encodeURIComponent(email);
  const response=await fetch(endpoint,{
    method:"PATCH",
    headers:{...formsHeaders(config),Prefer:"return=representation"},
    body:JSON.stringify({...patch,updated_at:new Date().toISOString()}),
    cache:"no-store",
  });
  if(!response.ok)throw new Error("user_update_failed");
  const result=await response.json();
  return Array.isArray(result)?result[0]||null:null;
}

function recoveryEmailHtml(code: string) {
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
  <h2>Recuperação de senha — DIASMATH Forms</h2>
  <p>Use este código de oito dígitos para redefinir sua senha:</p>
  <div style="font-size:30px;letter-spacing:5px;font-weight:900">${code}</div>
  <p>O código vale por 15 minutos. Se você não solicitou esta recuperação, ignore a mensagem.</p>
  </div>`;
}

async function sendRecoveryEmail(email: string, code: string) {
  const apiKey=process.env.RESEND_API_KEY;
  const sender=process.env.FORMS_RECOVERY_FROM||process.env.FEEDBACK_FROM;
  if(!apiKey||!sender)throw new Error("mail_not_configured");
  const response=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{Authorization:"Bearer "+apiKey,"Content-Type":"application/json"},
    body:JSON.stringify({from:sender,to:email,subject:"Recuperação de acesso — DIASMATH Forms",html:recoveryEmailHtml(code)}),
  });
  if(!response.ok)throw new Error("mail_send_failed");
}

function authResponse(request: Request, user: any) {
  const token=issueFormsSession(user.id,user.email,user.password_hash);
  return Response.json({ok:true,user:publicUser(user)},{
    headers:{...NO_CACHE,"Set-Cookie":formsCookieHeader(request,token)}
  });
}

export async function GET(request: Request) {
  try {
    const config=formsConfig();
    if(!config)return formsError("Serviço temporariamente indisponível.",503);
    const user=await getFormsUserFromSession(config,request);
    if(!user)return formsError("Sua sessão expirou. Entre novamente.",401);
    return Response.json({ok:true,user:publicUser(user)},{headers:NO_CACHE});
  }catch{ return formsError("Não foi possível verificar a sessão.",503); }
}

export async function POST(request: Request) {
  try {
    if(!isAllowedFormsWrite(request))return formsError("Origem não autorizada.",403);
    const data=(await formsJson(request,12_000)) as AuthPayload;
    if(!data || typeof data !== "object")return formsError("Dados inválidos.");
    if(data.action==="logout"){
      return Response.json({ok:true},{headers:{...NO_CACHE,"Set-Cookie":formsCookieHeader(request,"",true)}});
    }
    const config=formsConfig();
    if(!config)return formsError("Serviço temporariamente indisponível.",503);
    const action=data.action;
    if(action==="profile"){
      const user=await getFormsUserFromSession(config,request);
      if(!user)return formsError("Sua sessão expirou. Entre novamente.",401);
      if(data.email && data.email.trim().toLowerCase()!==user.email.toLowerCase())return formsError("Acesso negado.",403);
      const updated=await updateUser(config,user.email,{
        name:textField(data.name,120)||user.name,
        school:data.school===undefined?user.school:textField(data.school),
        city:data.city===undefined?user.city:textField(data.city),
      });
      return Response.json({ok:true,user:publicUser(updated||user)},{headers:NO_CACHE});
    }

    const email=textField(data.email,255).toLowerCase();
    if(!emailValid(email))return formsError("Informe um e-mail válido.");
    if(action==="login"){
      if(!passwordHashValid(data.passwordHash))return formsError("E-mail ou senha inválidos.",401);
      const user=await getFormsUser(config,email);
      if(!user || !secureCompare(String(user.password_hash||""),data.passwordHash))return formsError("E-mail ou senha inválidos.",401);
      return authResponse(request,user);
    }
    if(action==="register"){
      if(!passwordHashValid(data.passwordHash))return formsError("Senha inválida.");
      const name=textField(data.name,120),school=textField(data.school),city=textField(data.city);
      if(!name)return formsError("Nome obrigatório.");
      const existing=await getFormsUser(config,email);
      if(existing)return formsError("E-mail já cadastrado. Entre com sua senha ou use a recuperação.",409);
      const newUser={id:"user_"+crypto.randomUUID(),name,email,school,city,password_hash:data.passwordHash};
      const response=await fetch(config.url+"/rest/v1/diasmath_forms_users",{
        method:"POST",headers:{...formsHeaders(config),Prefer:"return=representation"},
        body:JSON.stringify(newUser),cache:"no-store",
      });
      if(response.status===409)return formsError("E-mail já cadastrado.",409);
      if(!response.ok)throw new Error("user_insert_failed");
      const rows=await response.json();
      const created=Array.isArray(rows)?rows[0]:rows;
      if(!created)return formsError("Cadastro indisponível.",503);
      return authResponse(request,created);
    }
    if(action==="recover"){
      const user=await getFormsUser(config,email);
      if(user){
        const expires=Date.parse(user.reset_expires_at||"");
        // Avoid rapid repeated emails to the same mailbox.
        if(!user.reset_code || !Number.isFinite(expires) || expires<Date.now()){
          const code=String(randomInt(10_000_000,100_000_000));
          const digest=hashRecoveryCode(email,code);
          await updateUser(config,email,{reset_code:digest,reset_expires_at:new Date(Date.now()+15*60_000).toISOString()});
          await sendRecoveryEmail(email,code);
        }
      }
      return Response.json({ok:true,message:RECOVERY_MESSAGE},{headers:NO_CACHE});
    }
    if(action==="reset"){
      if(!passwordHashValid(data.passwordHash))return formsError("Nova senha inválida.");
      const code=textField(data.resetCode,12);
      if(!/^\d{6}$|^\d{8}$/.test(code))return formsError("Código inválido.");
      const user=await getFormsUser(config,email);
      // Do not reveal whether an account exists via reset.
      const expiry=Date.parse(user?.reset_expires_at||"");
      if(!user || !Number.isFinite(expiry) || expiry<=Date.now())return formsError("Código inválido ou expirado.",400);
      const digest=hashRecoveryCode(email,code);
      if(!secureCompare(String(user.reset_code||""),digest) && !secureCompare(String(user.reset_code||""),code)){
        return formsError("Código inválido ou expirado.",400);
      }
      const updated=await updateUser(config,email,{
        password_hash:data.passwordHash,reset_code:null,reset_expires_at:null
      });
      if(!updated)return formsError("Não foi possível redefinir a senha.",503);
      return authResponse(request,updated);
    }
    return formsError("Ação não reconhecida.",400);
  }catch(error){
    if(error instanceof Error && error.message==="payload_too_large")return formsError("Requisição muito grande.",413);
    console.error("[Forms auth] Falha na autenticação:",error instanceof Error?error.message:"erro");
    return formsError("Serviço de autenticação indisponível. Tente novamente.",503);
  }
}
