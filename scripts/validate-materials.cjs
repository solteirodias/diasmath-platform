"use strict";

// Prevent the redundant 56px DIASMATH banner from returning to any embedded material.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "app");
const expected = [
  "play/guardioes-multiplicacao/page.tsx",
  "play/guardioes-divisao/page.tsx",
  "play/arena-revisao/page.tsx",
  "labs/divisao/page.tsx",
  "labs/laboratorio-virtual-divisao/page.tsx",
  "labs/fraciona-lab/page.tsx",
  "labs/geotessela/page.tsx",
  "labs/integraz/page.tsx",
  "labs/prancha-trigonometrica/page.tsx",
  "labs/subtracao/page.tsx",
  "labs/xadrez/page.tsx",
  "professor/forms/page.tsx",
  "escolas/sap-avaliacoes-2026/page.tsx"
];

const srcPaths = [];
function scan(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) scan(full);
    else if (item.name === "page.tsx") srcPaths.push(full);
  }
}
scan(root);

const framed = srcPaths.filter(p => /<iframe\b/.test(fs.readFileSync(p, "utf8")));
const found = framed.map(p => path.relative(root, p).split(path.sep).join("/"));
for (const p of expected) assert.ok(found.includes(p), "Material ausente: " + p);

for (const file of framed) {
  const src = fs.readFileSync(file, "utf8");
  const name = path.relative(root, file);
  assert.doesNotMatch(src, /h-14 items-center|calc\(100vh-56px\)/,
    "Faixa adicional encontrada em " + name);
  assert.doesNotMatch(src, /← DIASMATH™? (Play|Labs|Professor)|Abrir em outra aba/,
    "Controles da faixa adicional encontrados em " + name);
  assert.match(src, /className="block h-screen h-\[100dvh\] w-full border-0"/,
    "Material deve ocupar a altura completa em " + name);
  assert.match(src, /allowFullScreen/, "A tela cheia deve permanecer disponível: " + name);
  assert.match(src, /<iframe[^>]*\bsrc=/s, "Caminho da aplicação não encontrado: " + name);
  if (/import \{ CommentBox \}/.test(src)) {
    assert.match(src, /<CommentBox\s/, "Comentários desaparecidos do material: " + name);
  }
  console.log("✓ Material sem faixa extra: " + name);
}
console.log("\n" + framed.length + " páginas com iframe verificadas.");
