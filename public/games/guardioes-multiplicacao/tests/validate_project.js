const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const sandbox={window:{},console};sandbox.window.window=sandbox.window;sandbox.window.Guardioes={};vm.createContext(sandbox);
for(const file of ['js/config.js','js/questionDatabase.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
const G=sandbox.window.Guardioes,errors=[],ids=new Set();let total=0;
if(G.Worlds.length!==10)errors.push(`Mundos: ${G.Worlds.length}`);
for(const world of G.Worlds){const qs=G.QuestionDatabase.getWorld(world.id),expected=world.targetChallenges||9;total+=qs.length;if(qs.length!==expected)errors.push(`Mundo ${world.id}: ${qs.length}/${expected}`);for(const q of qs){const answer=q.fact[0]*q.fact[1];if(ids.has(q.id))errors.push(`ID duplicado: ${q.id}`);ids.add(q.id);if(!q.alternatives.includes(answer))errors.push(`Resposta ausente: ${q.id}`);if(q.practice.groups!==q.fact[0]||q.practice.perGroup!==q.fact[1])errors.push(`Prática divergente: ${q.id}`);if(!q.text.includes('?'))errors.push(`Sem pergunta: ${q.id}`)}}
if(total!==91)errors.push(`Total: ${total}/91`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log(`OK: ${G.Worlds.length} mundos, ${total} desafios, IDs únicos, alternativas e práticas válidas.`);
