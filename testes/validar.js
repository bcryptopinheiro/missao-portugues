/* Verifica o conteúdo do jogo antes de publicar.
   Uso (na pasta do projeto):  node testes/validar.js
   Termina com erro se encontrar algum problema. */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");
const problemas = [];
const mal = msg => problemas.push(msg);

/* 1. index.html: ficheiros e versão (?v=) */
const html = fs.readFileSync(path.join(raiz, "index.html"), "utf8");
const refs = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)\?v=([^"]+)"/g)].map(m => ({ f: m[1], v: m[2] }));
const versoes = new Set(refs.map(r => r.v));
if (versoes.size !== 1) mal(`index.html: o ?v= não é igual em todos os ficheiros (${[...versoes].join(", ")})`);
refs.forEach(r => { if (!fs.existsSync(path.join(raiz, r.f))) mal(`index.html: o ficheiro ${r.f} não existe`); });

/* 2. Carregar o conteúdo pela mesma ordem do index.html */
const scripts = refs.filter(r => r.f.startsWith("js/conteudo/")).map(r => fs.readFileSync(path.join(raiz, r.f), "utf8"));
const { M, JUST, BANK, LINES } = new Function(scripts.join("\n") + ";return {M,JUST,BANK,LINES}")();

/* 3. Perguntas */
let nPerg = 0;
for (const [id, m] of Object.entries(M)) {
  if (!Array.isArray(m.rows) || !m.tip || !Array.isArray(m.qs)) mal(`${id}: falta rows, tip ou qs`);
  m.qs.forEach((q, i) => {
    nPerg++;
    const onde = `${id} pergunta ${i + 1} («${(q.p || "").replace(/<[^>]+>/g, "").slice(0, 50)}…»)`;
    if (!q.p) return mal(`${onde}: sem enunciado`);
    if (q.s) { if (typeof q.a !== "string" || !q.a) mal(`${onde}: resposta breve sem solução`); return; }
    if (q.t === "m") { if (new Set(q.pairs.map(p => p[1])).size !== q.pairs.length) mal(`${onde}: associação com respostas repetidas`); return; }
    if (q.t === "f") { q.b.forEach(b => { if (!(b[1] >= 0 && b[1] < b[0].length)) mal(`${onde}: espaço com resposta inválida`); }); return; }
    if (q.t === "t") { if (!(q.a >= 0 && q.a < q.w.length)) mal(`${onde}: palavra certa fora da frase`); return; }
    if (!Array.isArray(q.o) || q.o.length !== 4) mal(`${onde}: não tem 4 opções`);
    else if (new Set(q.o).size !== 4) mal(`${onde}: opções repetidas`);
    if (!(q.a >= 0 && q.a < 4)) mal(`${onde}: índice da resposta certa inválido`);
    if (!q.e) mal(`${onde}: sem explicação`);
  });
}

/* 4. Exames: cada «citação» (linha N) existe mesmo nessa linha do texto */
let nRefs = 0;
const limpa = t => t.replace(/\[d\]/g, "d").replace(/[\[\]…“”"«»]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
for (const [id, m] of Object.entries(M)) {
  if (!m.text || !m.text.prose) continue;
  const L = m.text.lines;
  for (const q of m.qs) for (const txt of [q.p, ...(q.o || [])]) {
    for (const r of txt.matchAll(/«((?:[^«»]|«[^»]*»)+)»[^«]*?\(linhas? (\d+)(?:\s*(?:e|-|a)\s*(\d+))?\)/g)) {
      const a = +r[2], b = +(r[3] || r[2]);
      const zona = limpa(L.slice(a - 1, b + 1).join(" ").replace(/-\s+/g, ""));
      nRefs++;
      if (!zona.includes(limpa(r[1]).slice(0, 14))) mal(`${id}: «${r[1]}» não está na linha ${a}`);
    }
  }
}

/* 5. Bancos de frases */
let nFrases = 0;
for (const [b, B] of Object.entries(BANK)) {
  const vistas = new Set();
  for (const it of B.items) {
    nFrases++;
    if (vistas.has(it[0])) mal(`banco ${b}: frase repetida «${it[0]}»`);
    vistas.add(it[0]);
    if (B.labels && !B.labels.includes(it[1])) mal(`banco ${b}: resposta «${it[1]}» não está na lista de respostas`);
  }
  const respostas = new Set(B.labels || B.items.map(x => x[1]));
  if (respostas.size < 4) mal(`banco ${b}: precisa de pelo menos 4 respostas diferentes`);
}

/* 6. Mapa: cada estação aponta para conteúdo que existe */
for (const L of LINES) L.st.forEach((s, i) => {
  if (s[0] === "m") {
    if (!M[s[1]]) return mal(`mapa ${L.id} estação ${i + 1}: a missão «${s[1]}» não existe`);
    if (s[2] && !M[s[1]].qs.some(q => q.lv === s[2])) mal(`mapa ${L.id} estação ${i + 1}: não há perguntas de nível ${s[2]}`);
  }
  if (s[0] === "j" && !JUST[s[1]]) mal(`mapa ${L.id} estação ${i + 1}: «Justifica» ${s[1]} não existe`);
});

console.log(`Missões: ${Object.keys(M).length} · perguntas: ${nPerg} · referências a linhas: ${nRefs} · frases nos bancos: ${nFrases} · estações: ${LINES.reduce((n, L) => n + L.st.length, 0)}`);
if (problemas.length) {
  console.log(`\n✗ ${problemas.length} problema(s):`);
  problemas.forEach(p => console.log("  - " + p));
  process.exit(1);
}
console.log("✓ Tudo certo.");
