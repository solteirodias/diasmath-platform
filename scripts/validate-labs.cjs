"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p), "utf8");
const lab = name => read("public/labs/"+name+"/index.html");
const section = (source,start,end) => {
  const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
  assert.ok(a>=0 && b>a,"Trecho não encontrado: "+start+" ... "+end);
  return source.slice(a,b);
};
let tested=0;
function test(label,fn){fn();tested++;console.log("✓ "+label)}

const samples=[
  "divisao","laboratorio-virtual-divisao","subtracao","fraciona-lab",
  "integraz","xadrez","laboratorio-virtual-xadrez","geotessela","prancha-trigonometrica"
];
test("JavaScript embutido dos laboratórios é sintaticamente válido",()=>{
  samples.forEach(name=>{
    const src=lab(name);
    const blocks=[...src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
    blocks.filter(match=>match[1].trim()).forEach(match=>new vm.Script(match[1],{filename:name}));
  });
  new vm.Script(read("public/labs/subtracao/app.js"));
});
test("Aliases dos laboratórios são idênticos aos arquivos oficiais",()=>{
  assert.equal(lab("divisao"),lab("laboratorio-virtual-divisao"));
  assert.equal(lab("xadrez"),lab("laboratorio-virtual-xadrez"));
  assert.equal(lab("fraciona-lab"),read("public/labs/fraciona-lab/diasmath_laboratorio_fracoes_5ano_v2.html"));
});
test("Divisão: entradas decimais, texto ou sinal negativo são recusados",()=>{
  const s=lab("divisao");
  const parser=vm.runInNewContext(section(s,"function inteiroPositivo(","function usarDivisor(")+";inteiroPositivo");
  assert.equal(parser("123"),123);
  assert.equal(parser(" 999999 "),999999);
  ["3.5","2,5","-5","12abc","","2e2"].forEach(x=>assert.ok(Number.isNaN(parser(x)),x));
});
test("Divisão: divisor 1 nunca gera divisão classificada como não exata",()=>{
  const s=lab("divisao");
  const body=section(s,"function novo(reset=true){","function abrir(");
  const elements={
    tipo:{value:"nonexact"},atual:{textContent:""},
    btnAnim:{classList:{remove(){}}},btnMethod:{classList:{remove(){}}},
    viewer:{innerHTML:""}
  };
  const ctx=vm.createContext({divisor:1,digits:2,dividendo:12,quociente:0,resto:0,modo:null,timer:null,
    $:id=>elements[id],clearInterval(){},mark(){},rand:(a,b)=>a});
  vm.runInContext(body+"\nnovo();",ctx);
  assert.equal(elements.tipo.value,"exact");
  assert.equal(ctx.resto,0);
  assert.equal(ctx.dividendo%ctx.divisor,0);
});
test("Divisão: seleção de exata ajusta a quantidade de algarismos ao divisor",()=>{
  const s=lab("divisao"),body=section(s,"function novo(reset=true){","function abrir(");
  const elements={
    tipo:{value:"exact"},atual:{textContent:""},
    btnAnim:{classList:{remove(){}}},btnMethod:{classList:{remove(){}}},
    viewer:{innerHTML:""}
  };
  const ctx=vm.createContext({divisor:245,digits:1,dividendo:12,quociente:0,resto:0,modo:null,timer:null,
    $:id=>elements[id],clearInterval(){},mark(){},rand:(a,b)=>a});
  vm.runInContext(body+"\nnovo();",ctx);
  assert.equal(ctx.digits,3);
  assert.equal(ctx.dividendo%245,0);
  assert.equal(ctx.dividendo,245);
});
test("Subtração: entradas não inteiras não são transformadas silenciosamente",()=>{
  const src=read("public/labs/subtracao/app.js");
  const parse=vm.runInNewContext(section(src,"function sanitizeNumber(","function getDigits(")+"\nsanitizeNumber");
  assert.equal(parse("125"),125);
  assert.equal(parse(" 0 "),0);
  ["5.5","-12","12abc","3,5",""].forEach(v=>assert.ok(Number.isNaN(parse(v)),v));
});
test("Prancha Trigonométrica: ângulos de referência em quatro quadrantes",()=>{
  const s=lab("prancha-trigonometrica");
  const fn=vm.runInNewContext(section(s,"function referenceAngle(","function drawAngle(")+";referenceAngle");
  for(const [angle,expected] of [[0,0],[30,30],[90,90],[120,60],[180,0],[225,45],[270,90],[315,45],[360,0],[720,0],[-30,30]]){
    assert.equal(fn(angle),expected,String(angle));
  }
  assert.match(s,/angle===360\?\x60M /);
});
test("FracionaLab: placares ficam separados por estudante e acertos não duplicam",()=>{
  const s=lab("fraciona-lab");
  const code=section(s,"function profileKey(","function updateStatus(");
  const memory=new Map();
  const state={player:"",score:0,quizCorrect:0,quizSolved:new Set(),visited:new Set()};
  const input={value:""};
  const ctx=vm.createContext({state,localStorage:{
    getItem:key=>memory.get(key)||null,setItem:(key,val)=>memory.set(key,val)
  },$:id=>input,console});
  vm.runInContext(code,ctx);
  vm.runInContext("loadState('Ana');state.score=70;state.quizSolved.add(2);state.quizCorrect=1;saveState();loadState('Bruno');",ctx);
  assert.equal(state.score,0);
  assert.equal(state.quizCorrect,0);
  vm.runInContext("loadState('Ana')",ctx);
  assert.equal(state.score,70);assert.equal(state.quizCorrect,1);
  assert.match(s,/if\(!state.quizSolved.has\(state.quizIndex\)\)/);
  assert.match(s,/localStorage\.removeItem\(\x27diasmath-fractions-v2\x27\)/);
});
test("IntegraZ: relatórios de estudantes diferentes não se misturam",()=>{
  const s=lab("integraz");
  const code=section(s,"function sessionKey(","function record(");
  const store=new Map();const ctx=vm.createContext({console,localStorage:{
    getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,val)
  }});
  vm.runInContext("let session={};\n"+code,ctx);
  vm.runInContext("loadSession('Ana');session.attempts=7;session.correct=5;saveSession();loadSession('Bruno');",ctx);
  assert.equal(vm.runInContext("session.attempts",ctx),0);
  vm.runInContext("loadSession('Ana')",ctx);
  assert.equal(vm.runInContext("session.correct",ctx),5);
});
test("GeoTessela: não aceita configurações com palavras disfarçadas",()=>{
  const s=lab("geotessela"),code=section(s,"function parseTypedConfig(){","function nextSolution(){");
  const input={value:"abc4-8-8",focus(){}},types={value:"2"};
  let classified=0;const messages=[];
  const ctx=vm.createContext({els:{customConfig:input,typeCount:types},showToast:x=>messages.push(x),
    classifyConfig:x=>{classified++;return {config:x,kind:"classic",exact:true}},updateAnalysis(){},
    startAnimation(){},rebuildSelectors(){},solutions:[],solutionIndex:0});
  vm.runInContext(code+"\nparseTypedConfig();",ctx);
  assert.equal(classified,0);assert.ok(messages.length);
  input.value="(4,8,8)";
  vm.runInContext("parseTypedConfig()",ctx);
  assert.equal(classified,1);
});
test("Xadrez: promoção pendente é cancelada ao desfazer/reiniciar",()=>{
  const s=lab("xadrez");
  assert.match(s,/if\(state\.pendingPromotion\)return;/);
  assert.match(s,/if\(state\.pendingPromotion\)\{state\.pendingPromotion=null;/);
  assert.match(s,/state\.pendingPromotion = null;\s*\$\('promotionModal'\)\.classList\.add\('hidden'\)/);
  const code=section(s,"function undo() {","function showExample() {");
  const modal={hidden:false,classList:{add(cls){if(cls==="hidden")this.hidden=true}}};
  const board={id:"original"},state={board:{id:"after"},history:[{board,turn:"white",lastMove:null,missionDone:false}],
    pendingPromotion:{r:0,c:0},stats:{moves:1},selected:{r:0,c:0},legalMoves:[1],currentTurn:"black",
    missionDone:true,lastMove:{},};
  const card={classList:{toggle(){}},querySelector:()=>({textContent:""})};
  const ctx=vm.createContext({state,$:id=>id==="promotionModal"?modal:card,toast(){},setCoach(){},playTone(){},render(){}});
  vm.runInContext(code+"\nundo();",ctx);
  assert.equal(state.board,board);assert.equal(state.pendingPromotion,null);
  assert.equal(modal.classList.hidden,true);
});
console.log("\n"+tested+" verificações de laboratórios concluídas.");
