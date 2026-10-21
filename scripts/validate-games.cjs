"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
let passed = 0;
function test(name, callback) {
  try { callback(); passed++; console.log("✓ " + name); }
  catch (error) { console.error("✗ " + name); throw error; }
}
const multiply = "public/games/guardioes-multiplicacao/";
const division = read("public/games/guardioes-divisao/index.html");
const arena = read("public/games/arena-revisao/index.html");

test("Multiplicação: 10 mundos, 91 questões e alternativas válidas", () => {
  const result = spawnSync(process.execPath, [path.join(root, multiply, "tests/validate_project.js")], { encoding:"utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const window = {};
  window.window = window;
  const context = vm.createContext({ window, console });
  ["js/config.js", "js/questionDatabase.js", "js/diagnostics.js"].forEach(file => {
    vm.runInContext(read(multiply + file), context, { filename:file });
  });
  const diagnostic = window.Guardioes.Diagnostics.validate();
  assert.equal(diagnostic.ok, true, diagnostic.errors.join("\n"));
  assert.equal(diagnostic.total, 91);
});

test("Multiplicação: game over reinicia o mundo sem duplicar os pontos", () => {
  const window = {};
  window.window = window;
  const context = vm.createContext({
    window, console, performance:{now:()=>0},
    requestAnimationFrame:()=>1, cancelAnimationFrame:()=>{}
  });
  ["js/config.js", "js/questionDatabase.js", "js/engine.js"].forEach(file => {
    vm.runInContext(read(multiply + file), context, { filename:file });
  });
  const G = window.Guardioes;
  const save = { worldId:2, lives:0, bombs:0, score:500,
    totalCrystals:5, solvedIds:["w2-1","w2-2"], stageComplete:false };
  G.Progress = { load:()=>save };
  const game = Object.create(G.Game.prototype);
  game.loadWorld = (id, ids) => { game.world=G.getWorld(id); game.solved=ids; };
  game.ensureLoop = () => {};
  game.saveProgress = () => { game.saved=true; };
  game.continueSaved();
  assert.equal(game.lives, G.Config.startLives);
  assert.equal(game.bombs, G.Config.startBombs);
  assert.deepEqual(Array.from(game.solved), []);
  assert.equal(game.score, 300);
  assert.equal(game.totalCrystals, 3);
  assert.equal(game.saved, true);
});

test("Divisão: 9 fases numéricas válidas e uma fase de chefão", () => {
  const start = division.indexOf("const LEVELS = [");
  const end = division.indexOf("\n];", start);
  assert.ok(start >= 0 && end > start);
  const levels = vm.runInNewContext(division.slice(start,end+3)+"\nLEVELS");
  assert.equal(levels.length, 10);
  assert.equal(levels.filter(level => level.mode==="boss").length, 1);
  levels.filter(level => level.mode!=="boss").forEach(level => {
    assert.ok(level.divisor > 0);
    assert.equal(level.total, level.divisor*level.quotient+level.rest, level.title);
    assert.ok(level.rest >= 0 && level.rest < level.divisor);
  });
});

test("Divisão: 4 alternativas distintas inclusive com quociente 0 ou 1", () => {
  const start=division.indexOf("function challengeOptions(ans){");
  const end=division.indexOf("\n/* DIASMATH V46",start);
  assert.ok(start>=0 && end>start);
  const choose=vm.runInNewContext(division.slice(start,end)+"\nchallengeOptions");
  ["0","1","2","3","5","17","0, resto 0","1, resto 0","4, resto 2","5, resto 0"].forEach(correct => {
    for(let i=0;i<80;i++){
      const choices=Array.from(choose(correct));
      assert.equal(choices.length,4,correct);
      assert.equal(new Set(choices).size,4,correct);
      assert.ok(choices.includes(correct),correct);
    }
  });
});

test("Divisão: controles são soltos ao perder foco", () => {
  assert.match(division, /addEventListener\("blur",clearHeldControls\)/);
  assert.match(division, /document\.addEventListener\("visibilitychange"/);
});

test("Arena: 40 questões com quatro alternativas únicas", () => {
  const match=arena.match(/const Q=(\[[\s\S]*?\]);\s*let teams/);
  assert.ok(match,"Banco de questões não encontrado");
  const questions=JSON.parse(match[1]);
  assert.equal(questions.length,40);
  questions.forEach((question,index)=>{
    assert.ok(question.q && question.c,"Questão "+(index+1));
    assert.equal(question.o.length,4,"Questão "+(index+1));
    assert.equal(new Set(question.o).size,4,"Questão "+(index+1));
    assert.ok(Number.isInteger(question.a) && question.a>=0 && question.a<4);
    assert.equal(question.r.length,2,"Questão "+(index+1));
  });
});

test("Arena: nomes de equipes não são interpretados como HTML", () => {
  const match=arena.match(/function escapeHtml\(value\)\{[^\n]+\}/);
  assert.ok(match);
  const sanitize=vm.runInNewContext(match[0]+"\nescapeHtml");
  const result=sanitize("<img src=x onerror=\"alert('X')\">&");
  assert.ok(result.startsWith("&lt;img "));
  assert.ok(result.endsWith("&amp;"));
  assert.ok(result.includes("&quot;") && result.includes("&#39;"));
  assert.ok(arena.includes("${escapeHtml(n)}"));
  assert.ok(arena.includes("${escapeHtml(teams[r.k])}"));
});

test("Arena: evita vazamento de áudio e duplo avanço", () => {
  assert.match(arena,/audioContext=null/);
  assert.doesNotMatch(arena,/const A=new \(window\.AudioContext\|\|window\.webkitAudioContext\)/);
  assert.match(arena,/function next\(\)\{if\(!locked\)return;locked=false;/);
  assert.match(arena,/score\.fill\(0\);stars\.fill\(0\)/);
});
console.log("\n"+passed+" testes de games concluídos.");
