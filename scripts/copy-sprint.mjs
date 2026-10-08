import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const candidates = [
  path.join(root, "apps/sprint/.output/public"),
  path.join(root, "apps/sprint/dist/client"),
  path.join(root, "apps/sprint/dist"),
];

let source = null;
for (const candidate of candidates) {
  try {
    await fs.access(candidate);
    source = candidate;
    break;
  } catch {}
}

if (!source) {
  throw new Error("Não foi possível localizar a saída estática do DIASMATH Sprint.");
}

const destination = path.join(root, "public/sprint");
await fs.rm(destination, { recursive: true, force: true });
await fs.mkdir(destination, { recursive: true });
await fs.cp(source, destination, { recursive: true });
console.log("DIASMATH Sprint copiado para public/sprint");
