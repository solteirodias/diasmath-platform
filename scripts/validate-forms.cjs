"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ts=require("typescript");
const nodeCrypto=require("node:crypto");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const moduleCache=new Map();

const users=new Map();
const forms=new Map();
const answers=new Map();
let lastMailCode=null;

async function mockFetch(url,options={}){
  const u=new URL(url),method=options.method||"GET",body=options.body?JSON.parse(options.body):null;
  const json=(data,status=200)=>Response.json(data,{status});
  if(u.hostname==="api.resend.com"){
    const match=String(body?.html||"").match(/>(\d{8})<\/div>/);
    lastMailCode=match?match[1]:null;
    return json({id:"test_email"});
  }
  const filter=(name)=>{const v=u.searchParams.get(name);return v?.startsWith("eq.")?v.slice(3):null};
  if(u.pathname.endsWith("/diasmath_forms_users")){
    const email=filter("email");
    if(method==="GET")return json(email&&users.has(email)?[users.get(email)]:[]);
    if(method==="POST"){
      if(users.has(body.email))return json({error:"duplicate"},409);
      users.set(body.email,{...body,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
      return json([users.get(body.email)],201);
    }
    if(method==="PATCH"){
      const user=users.get(email);
      if(!user)return json([]);
      Object.assign(user,body);
      return json([user]);
    }
  }
  if(u.pathname.endsWith("/diasmath_forms_forms")){
    const id=filter("id"),email=filter("owner_email");
    if(method==="GET"){
      let result=[...forms.values()];
      if(id)result=result.filter(v=>v.id===id);
      if(email)result=result.filter(v=>v.owner_email===email);
      return json(result);
    }
    if(method==="POST"){
      const entries=Array.isArray(body)?body:[body];
      for(const entry of entries){if(forms.has(entry.id))return json({error:"duplicate"},409);}
      entries.forEach(entry=>forms.set(entry.id,entry));
      return json([],201);
    }
    if(method==="PATCH"){
      const found=forms.get(id);
      if(found&&(!email||found.owner_email===email))Object.assign(found,body);
      return json([]);
    }
    if(method==="DELETE"){
      if(forms.has(id)&&forms.get(id).owner_email===email)forms.delete(id);
      return json([]);
    }
  }
  if(u.pathname.endsWith("/diasmath_forms_responses")){
    const id=filter("form_id");
    if(method==="GET")return json([...answers.values()].filter(x=>x.form_id===id));
    if(method==="POST"){
      const entries=Array.isArray(body)?body:[body];
      entries.forEach(v=>{if(!answers.has(v.id))answers.set(v.id,v)});
      return json([],201);
    }
  }
  throw new Error("Unexpected API call: "+method+" "+url);
}

function loadModule(relativePath){
  const full=path.resolve(root,relativePath);
  if(moduleCache.has(full))return moduleCache.get(full).exports;
  const code=ts.transpileModule(fs.readFileSync(full,"utf8"),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
    fileName:full
  }).outputText;
  const mod={exports:{}};
  moduleCache.set(full,mod);
  const customRequire=name=>{
    if(name.startsWith("."))return loadModule(path.relative(root,path.resolve(path.dirname(full),name+".ts")));
    return require(name);
  };
  const ctx={module:mod,exports:mod.exports,require:customRequire,process,
    fetch:mockFetch,Request,Response,URL,Buffer,console,Date,crypto:nodeCrypto.webcrypto,
    setTimeout,clearTimeout};
  const wrapper=vm.runInNewContext("(function(module,exports,require,process,fetch,Request,Response,URL,Buffer,console,Date,crypto){"+code+"\n})",ctx,{filename:relativePath});
  wrapper(mod,mod.exports,customRequire,process,mockFetch,Request,Response,URL,Buffer,console,Date,nodeCrypto.webcrypto);
  return mod.exports;
}

process.env.SUPABASE_URL="https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY="test_service_key_not_real";
process.env.FORMS_SESSION_SECRET="test_session_key_32_bytes_not_real";
process.env.RESEND_API_KEY="test_mail_key";
process.env.FORMS_RECOVERY_FROM="DIASMATH <forms@example.com>";

const auth=loadModule("app/api/forms/auth/route.ts");
const listing=loadModule("app/api/forms/list/route.ts");
const responses=loadModule("app/api/forms/responses/route.ts");
const publicForm=loadModule("app/api/forms/public/route.ts");
const security=loadModule("lib/formsSecurity.ts");
const base="https://diasmath.com.br";
function req(route,method="GET",body,session,origin=base){
  const headers={};
  if(session)headers.cookie=session;
  if(method!=="GET")headers.origin=origin;
  if(body!==undefined)headers["content-type"]="application/json";
  return new Request(base+route,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
}
const cookieOf=response=>response.headers.get("set-cookie")?.split(";")[0]||"";
let count=0;
async function test(name,callback){
  try{await callback();count++;console.log("✓ "+name)}
  catch(error){console.error("✗ "+name);throw error}
}
async function main(){
  const hashA="a".repeat(64),hashB="b".repeat(64);
  await test("Login não cria conta desconhecida",async()=>{
    const response=await auth.POST(req("/api/forms/auth","POST",{action:"login",email:"ana@example.com",passwordHash:hashA}));
    assert.equal(response.status,401);assert.equal(users.size,0);
  });
  let ana="";
  await test("Cadastro inicia sessão HttpOnly sem expor hash",async()=>{
    const response=await auth.POST(req("/api/forms/auth","POST",{
      action:"register",name:"Ana",email:"ana@example.com",school:"Escola A",city:"Oeiras",passwordHash:hashA
    }));
    assert.equal(response.status,200);
    ana=cookieOf(response);
    assert.match(response.headers.get("set-cookie"),/HttpOnly/);
    assert.match(response.headers.get("set-cookie"),/SameSite=Lax/);
    const data=await response.json();
    assert.equal(data.user.name,"Ana");
    assert.equal("password_hash" in data.user,false);
  });
  await test("Cadastro repetido não substitui senha de terceiros",async()=>{
    const response=await auth.POST(req("/api/forms/auth","POST",{
      action:"register",name:"Invasor",email:"ana@example.com",passwordHash:hashB
    }));
    assert.equal(response.status,409);assert.equal(users.get("ana@example.com").password_hash,hashA);
  });
  await test("Edição de perfil exige cookie legítimo",async()=>{
    const attack=await auth.POST(req("/api/forms/auth","POST",{action:"profile",email:"ana@example.com",name:"Invasor"}));
    assert.equal(attack.status,401);
    const okay=await auth.POST(req("/api/forms/auth","POST",{action:"profile",email:"ana@example.com",name:"Ana Maria"},ana));
    assert.equal(okay.status,200);
    assert.equal(users.get("ana@example.com").name,"Ana Maria");
  });
  await test("Cookie adulterado não autentica",async()=>{
    const fake=ana.replace(/.$/,"X");
    const r=await listing.GET(req("/api/forms/list?ownerEmail=ana%40example.com","GET",undefined,fake));
    assert.equal(r.status,401);
  });
  let bruno="";
  await test("Segundo professor entra de forma independente",async()=>{
    const r=await auth.POST(req("/api/forms/auth","POST",{
      action:"register",name:"Bruno",email:"bruno@example.com",passwordHash:hashB
    }));
    bruno=cookieOf(r);assert.ok(bruno);
  });
  await test("Listagem não pode ser consultada só pelo e-mail",async()=>{
    const noSession=await listing.GET(req("/api/forms/list?ownerEmail=ana%40example.com"));
    assert.equal(noSession.status,401);
    const wrongEmail=await listing.GET(req("/api/forms/list?ownerEmail=ana%40example.com","GET",undefined,bruno));
    assert.equal(wrongEmail.status,403);
  });
  const form={
    id:"form_12345678",title:"Diagnóstico de Matemática",description:"Teste",published:false,
    settings:{collectName:true,collectEmail:false,allowAnother:true},
    sections:[{id:"sec_1",title:"Questões",description:"",questions:[{id:"q_1",type:"short",required:true,title:"Quanto é 6x7?"}]}]
  };
  await test("Professor cria seu formulário e o salva no banco",async()=>{
    const r=await listing.POST(req("/api/forms/list","POST",{ownerEmail:"ana@example.com",forms:[form]},ana));
    assert.equal(r.status,200);assert.equal(forms.get(form.id).owner_email,"ana@example.com");
  });
  await test("Outro professor não pode sobrescrever formulário alheio",async()=>{
    const r=await listing.POST(req("/api/forms/list","POST",{ownerEmail:"bruno@example.com",forms:[{...form,title:"Roubo de dados"}]},bruno));
    assert.equal(r.status,403);assert.equal(forms.get(form.id).title,"Diagnóstico de Matemática");
  });
  await test("Formulário não publicado não é exposto publicamente",async()=>{
    const r=await publicForm.GET(req("/api/forms/public?id="+form.id));
    assert.equal(r.status,404);
  });
  await test("Respostas anônimas para rascunhos não são aceitas",async()=>{
    const r=await responses.POST(req("/api/forms/responses","POST",{formId:form.id,participant:{name:"Criança"},answers:{"q_1":"42"}}));
    assert.equal(r.status,403);
  });
  await test("Publicar preserva controle do dono",async()=>{
    const r=await listing.POST(req("/api/forms/list","POST",{forms:[{...form,published:true}]},ana));
    assert.equal(r.status,200);
    const publicResponse=await publicForm.GET(req("/api/forms/public?id="+form.id));
    assert.equal(publicResponse.status,200);
    const payload=await publicResponse.json();
    assert.equal(payload.form.ownerEmail,undefined);assert.equal(payload.form.ownerId,undefined);
  });
  await test("Aluno envia resposta válida sem modificar registros existentes",async()=>{
    const data={id:"resp_existing",formId:form.id,formSnapshot:{secret:"unauthorized"},participant:{name:"Estudante"},answers:{"q_1":"42"}};
    const a=await responses.POST(req("/api/forms/responses","POST",data));
    const b=await responses.POST(req("/api/forms/responses","POST",{...data,answers:{"q_1":"43"}}));
    assert.equal(a.status,200);assert.equal(b.status,200);
    assert.equal(answers.size,2);assert.ok(!answers.has("resp_existing"));
    assert.ok([...answers.values()].every(x=>!x.form_snapshot?.secret));
  });
  await test("Visitante e outro professor não podem ler respostas",async()=>{
    const visitor=await responses.GET(req("/api/forms/responses?formId="+form.id));
    const brunoView=await responses.GET(req("/api/forms/responses?formId="+form.id,"GET",undefined,bruno));
    assert.equal(visitor.status,401);assert.equal(brunoView.status,403);
    const mine=await responses.GET(req("/api/forms/responses?formId="+form.id,"GET",undefined,ana));
    assert.equal(mine.status,200);assert.equal((await mine.json()).responses.length,2);
  });
  await test("Respostas inválidas e origem externa são rejeitadas",async()=>{
    const incomplete=await responses.POST(req("/api/forms/responses","POST",{formId:form.id,participant:{name:"Ana"},answers:{}}));
    const malicious=await responses.POST(req("/api/forms/responses","POST",{formId:form.id,participant:{name:"Ana"},answers:{"q_1":"42",other:"leak"}}));
    const cors=await listing.POST(req("/api/forms/list","POST",{forms:[form]},ana,"https://evil.example"));
    assert.equal(incomplete.status,400);assert.equal(malicious.status,400);assert.equal(cors.status,403);
  });
  await test("Recuperação produz código forte e invalida sessões antigas",async()=>{
    const recovered=await auth.POST(req("/api/forms/auth","POST",{action:"recover",email:"ana@example.com"}));
    assert.equal(recovered.status,200);assert.match(lastMailCode,/^\d{8}$/);
    assert.equal(users.get("ana@example.com").reset_code,nodeCrypto.createHash("sha256").update(lastMailCode).digest("hex"));
    const wrong=await auth.POST(req("/api/forms/auth","POST",{action:"reset",email:"ana@example.com",resetCode:"12345678",passwordHash:hashB}));
    assert.equal(wrong.status,400);
    const ok=await auth.POST(req("/api/forms/auth","POST",{action:"reset",email:"ana@example.com",resetCode:lastMailCode,passwordHash:hashB}));
    assert.equal(ok.status,200);
    const previous=await listing.GET(req("/api/forms/list","GET",undefined,ana));
    assert.equal(previous.status,401);
    ana=cookieOf(ok);
    const after=await listing.GET(req("/api/forms/list","GET",undefined,ana));
    assert.equal(after.status,200);
  });
  await test("Logout remove cookie HttpOnly",async()=>{
    const r=await auth.POST(req("/api/forms/auth","POST",{action:"logout"},ana));
    assert.equal(r.status,200);assert.match(r.headers.get("set-cookie"),/Max-Age=0/);
  });
  assert.ok(security.readFormsSession(req("/api/forms/list","GET",undefined,ana)));
  console.log("\n"+count+" testes de segurança Forms concluídos.");
}
main().catch(error=>{console.error(error);process.exitCode=1});
