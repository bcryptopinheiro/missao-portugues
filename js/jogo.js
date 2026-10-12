/* Lógica do jogo: estado guardado, mapa, perguntas, estações, treino, simulado, cábula e escrita. */
/* ===== Estado ===== */
let S = {xp:0, ans:{}, stars:{}, hp:{}, best:0};
try{ const raw = localStorage.getItem("mp11b"); if(raw) S = Object.assign(S, JSON.parse(raw));
     else { const old = localStorage.getItem("mp11"); if(old){ S.xp = JSON.parse(old).xp||0; } } }catch(e){}
function save(){ try{ localStorage.setItem("mp11b", JSON.stringify(S)); }catch(e){} }
const LV = ["Aprendiz","Explorador","Detetive da gramática","Mestre das orações","Lenda do PRI"];
function starTotal(){ return Object.values(S.stars).reduce((a,b)=>a+b,0); }
function updXP(){
  document.getElementById("xpTxt").textContent = S.xp+" XP";
  const l = Math.min(LV.length-1, Math.floor(S.xp/150));
  document.getElementById("xpBar").style.width = (l===LV.length-1?100:(S.xp%150)/150*100)+"%";
  document.getElementById("lvl").textContent = "Nível "+(l+1)+" · "+LV[l];
  const maxStars = LINES.reduce((n,L)=>n+L.st.filter(s=>s[0]==="m"||s[0]==="j").length*3,0);
  document.getElementById("starsTxt").textContent = "★ "+starTotal()+" / "+maxStars;
}
const shuffle = a => a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const L4 = ["A","B","C","D"];
const stars = n => `<span class="ss">${[1,2,3].map(i=>`<span class="${i<=n?"on":""}">★</span>`).join("")}</span>`;

/* Confirmação com 2 toques (alguns browsers dentro de apps bloqueiam o confirm()) */
function confirmTap(btn, msg, action){
  const label = btn.textContent; let armed = false, t;
  btn.onclick = ()=>{
    if(armed){ clearTimeout(t); action(); return; }
    armed = true; btn.textContent = msg; btn.style.fontWeight = "800";
    t = setTimeout(()=>{ armed = false; btn.textContent = label; btn.style.fontWeight = ""; }, 4000);
  };
}

/* ===== Mapa ===== */
function home(){
  const box = document.getElementById("lines"); box.innerHTML="";
  LINES.forEach(L=>{
    const sec = document.createElement("section"); sec.className="line"; sec.style.setProperty("--mc",`var(${L.c})`);
    const got = L.st.reduce((n,s,i)=>n+(S.stars[L.id+":"+i]||0),0);
    const rated = L.st.filter(s=>s[0]==="m"||s[0]==="j").length;
    sec.innerHTML = `<div class="lhead"><span class="ln"><i></i><span><small>${L.tag}</small><br><b>${L.name}</b></span></span>${rated?`<span class="ls">★ ${got} / ${rated*3}</span>`:""}</div><div class="stations"></div>`;
    const row = sec.querySelector(".stations");
    L.st.forEach((s,i)=>{
      const k = L.id+":"+i, n = S.stars[k]||0;
      const b = document.createElement("button"); b.className="st"+(n===3?" full":"");
      const rated1 = s[0]==="m"||s[0]==="j";
      b.innerHTML = `<span class="node">${s[0]==="inf"?"∞":s[0]==="cab"?"✎":s[0]==="w"?"✍":i+1}</span><span class="sl">${s[3]}</span>${rated1?stars(n):""}`;
      b.onclick = ()=>openStation(L,i);
      row.append(b);
    });
    box.append(sec);
  });
  /* apagar tudo: respostas, estrelas, XP, vidas, rascunhos e checklist */
  const wipe = document.createElement("div"); wipe.className="btns"; wipe.style.justifyContent="center";
  const wb = document.createElement("button"); wb.className="btn nob"; wb.textContent="Apagar todo o progresso";
  confirmTap(wb, "Toca outra vez para apagar TUDO", ()=>{
    try{ Object.keys(localStorage).filter(x=>x.startsWith("mp11")).forEach(x=>localStorage.removeItem(x)); }catch(e){}
    try{ sessionStorage.clear(); }catch(e){}
    S = {xp:0, ans:{}, stars:{}, hp:{}, best:0, rounds:{}};
    location.reload();
  });
  wipe.append(wb); box.append(wipe);
  document.getElementById("home").hidden=false;
  document.getElementById("mission").hidden=true;
  updXP();
}

function openStation(L,i){
  const s = L.st[i];
  if(s[0]==="m") return openM(L,i,M[s[1]],s[2]);
  if(s[0]==="j") return openJ(L,i,JUST[s[1]]);
  if(s[0]==="w") return openWrite(L);
  if(s[0]==="inf") return openInf(L);
  if(s[0]==="sim") return openSim(L);
  if(s[0]==="cab") return openCab(L);
}

function shell(L, title, sub, color){
  const sec = document.getElementById("mission");
  sec.innerHTML=""; sec.style.setProperty("--mc",`var(${color||L.c})`);
  const back = document.createElement("button"); back.className="back"; back.textContent="← Voltar ao mapa";
  back.onclick = ()=>{ home(); window.scrollTo(0,0); };
  const h = document.createElement("div"); h.className="mhead";
  h.innerHTML = `<span class="tag">${L.tag} · ${L.name}</span><h2>${title}</h2>${sub?`<p style="color:var(--muted)">${sub}</p>`:""}`;
  sec.append(back,h);
  document.getElementById("home").hidden=true; sec.hidden=false; window.scrollTo(0,0);
  return sec;
}
function navBtns(L,i){
  const nav = document.createElement("div"); nav.className="btns"; nav.style.margin="16px 0 0";
  const bk = document.createElement("button"); bk.className="btn ghost"; bk.textContent="← Mapa";
  bk.onclick=()=>{ home(); window.scrollTo(0,0); };
  nav.append(bk);
  const li = LINES.indexOf(L);
  let nL=L, nI=i+1; if(nI>=L.st.length){ nL=LINES[li+1]; nI=0; }
  if(nL){ const nx=document.createElement("button"); nx.className="btn"; nx.textContent="Seguinte: "+(nL===L? L.st[nI][3] : nL.name)+" →"; nx.onclick=()=>openStation(nL,nI); nav.append(nx); }
  return nav;
}

/* ===== Perguntas ===== */
function lessonBlock(m){
  const idea = document.createElement("div"); idea.className="idea";
  idea.innerHTML = `<p class="pic">${m.pic}</p><div class="rows">${m.rows.map(r=>`<div class="r${r[0]===r[0].toUpperCase()&&/[A-Z]/.test(r[0])?" sec":""}"><b>${r[0]}</b><span>${r[1]}</span></div>`).join("")}</div><p class="tip">${m.tip}</p>`;
  return idea;
}
function textBlock(m){
  const t = document.createElement("div"); t.className="text";
  if(m.text.prose){ t.innerHTML = `<p class="h">${m.text.h}</p><ol>${m.text.lines.map(l=>`<li>${l}</li>`).join("")}</ol>`; }
  else if(m.text===true){ t.innerHTML = `<p class="h">Texto · lê com atenção</p><ol>${TEXT.map(l=>`<li>${l}</li>`).join("")}</ol>`; }
  else { t.innerHTML = `<p class="h">${m.text.h}</p><ol style="list-style:none;padding-left:14px">${m.text.lines.map(l=>/^\d+$/.test(l)?`<li style="margin-top:8px;font-family:var(--body);font-size:13px;color:var(--muted)">Estância ${l}</li>`:`<li>${l}</li>`).join("")}</ol>`; }
  return t;
}

/* ctx = {hpKey, onAnswer(ok)} — devolve elemento */
function qBlock(q, key, num, ctx){
  const d = document.createElement("div"); d.className="q";
  const kind = q.s?"resposta breve":q.t==="m"?"associação":q.t==="f"?"completar":q.t==="t"?"identificar":"escolha múltipla";
  d.innerHTML = `<span class="n">Pergunta ${num} · ${kind}${q.lv?` <span class="lvb l${q.lv}">${LVN[q.lv]}</span>`:""}</span><p class="p">${q.p}</p>`;
  const fb = document.createElement("div"); fb.className="fb"; fb.hidden=true;
  const done = (ok,pick) => { S.ans[key]={ok,pick}; if(ok) S.xp+=10; save(); updXP(); ctx.onAnswer(ok); };
  const showFb = (ok, extra) => { fb.hidden=false; fb.className="fb "+(ok?"ok":"no"); fb.innerHTML = `<strong>${ok?"Certo! +10 XP":"Ainda não."}</strong>${extra||""}${q.e||""}`; };
  const locked = () => ctx.dead();
  const prev = S.ans[key];

  if(q.s){
    const wrap = document.createElement("div"); wrap.className="short";
    wrap.innerHTML = `<label class="n" style="display:block;margin-bottom:4px">A tua resposta</label><textarea placeholder="Escreve como escreverias no teste…"></textarea>`;
    const ta = wrap.querySelector("textarea");
    try{ ta.value = localStorage.getItem("mp11b_"+key)||""; }catch(e){}
    ta.oninput = ()=>{ try{ localStorage.setItem("mp11b_"+key, ta.value);}catch(e){} };
    const see = document.createElement("button"); see.className="btn"; see.textContent="Ver solução";
    const sol = document.createElement("div"); sol.className="fb ok"; sol.hidden=true;
    see.onclick = ()=>{
      sol.hidden=false; see.hidden=true;
      sol.innerHTML = `<strong>Solução:</strong>${q.a}<div class="btns" style="margin-top:8px"></div>`;
      const bb = sol.querySelector(".btns");
      if(S.ans[key]){ bb.innerHTML = `<span>${S.ans[key].ok?"Marcaste: acertei ✓":"Marcaste: errei"}</span>`; return; }
      const y = document.createElement("button"); y.className="btn okb"; y.textContent="Acertei";
      const n = document.createElement("button"); n.className="btn nob"; n.textContent="Errei";
      y.onclick=()=>{ if(locked()) return; bb.innerHTML="<span>Boa! +10 XP</span>"; done(true); };
      n.onclick=()=>{ if(locked()) return; bb.innerHTML="<span>Relê a lição e a solução.</span>"; done(false); };
      bb.append(y,n);
    };
    const bt = document.createElement("div"); bt.className="btns"; bt.append(see); wrap.append(bt);
    d.append(wrap, sol); if(prev) see.click();
    return d;
  }

  if(q.t==="m"){
    const rights = shuffle(q.pairs.map(p=>p[1]));
    const sels = q.pairs.map(p=>{
      const r = document.createElement("div"); r.className="mrow";
      r.innerHTML = `<b>${p[0]}</b>`;
      const s = document.createElement("select");
      s.innerHTML = `<option value="">— escolhe —</option>`+rights.map(x=>`<option>${x}</option>`).join("");
      r.append(s); d.append(r); return s;
    });
    const go = document.createElement("button"); go.className="btn"; go.textContent="Verificar";
    const paint = ()=>{ sels.forEach((s,i)=>{ s.disabled=true; const ok=s.value===q.pairs[i][1]; s.className= ok?"right":"wrong"; if(!ok){ s.value=q.pairs[i][1]; } }); go.hidden=true; };
    go.onclick = ()=>{
      if(locked()||S.ans[key]) return;
      if(sels.some(s=>!s.value)){ fb.hidden=false; fb.className="fb no"; fb.innerHTML="<strong>Liga todas antes de verificar.</strong>"; return; }
      const ok = sels.every((s,i)=>s.value===q.pairs[i][1]);
      paint(); showFb(ok, ok?"":"As certas ficaram marcadas. "); done(ok);
    };
    const bt=document.createElement("div"); bt.className="btns"; bt.append(go); d.append(bt, fb);
    if(prev){ sels.forEach((s,i)=>s.value=q.pairs[i][1]); paint(); showFb(prev.ok); }
    return d;
  }

  if(q.t==="f"){
    const p = document.createElement("p"); p.className="fill";
    const parts = q.x.split(/\{(\d)\}/);
    const sels=[];
    parts.forEach((part,i)=>{
      if(i%2===0){ p.append(document.createTextNode(part)); }
      else { const b=q.b[+part]; const s=document.createElement("select"); s.innerHTML=`<option value="">…</option>`+shuffle(b[0].map((o,j)=>[o,j])).map(([o,j])=>`<option value="${j}">${o}</option>`).join(""); s._a=b[1]; sels.push(s); p.append(s); }
    });
    d.append(p);
    const go = document.createElement("button"); go.className="btn"; go.textContent="Verificar";
    const paint=()=>{ sels.forEach(s=>{ s.disabled=true; const ok=+s.value===s._a&&s.value!==""; s.className=ok?"right":"wrong"; if(!ok) s.value=String(s._a); }); go.hidden=true; };
    go.onclick=()=>{
      if(locked()||S.ans[key]) return;
      if(sels.some(s=>s.value==="")){ fb.hidden=false; fb.className="fb no"; fb.innerHTML="<strong>Preenche todos os espaços.</strong>"; return; }
      const ok = sels.every(s=>+s.value===s._a); paint(); showFb(ok); done(ok);
    };
    const bt=document.createElement("div"); bt.className="btns"; bt.append(go); d.append(bt, fb);
    if(prev){ sels.forEach(s=>s.value=String(s._a)); paint(); showFb(prev.ok); }
    return d;
  }

  if(q.t==="t"){
    const box=document.createElement("div"); box.className="chunks";
    const bs = q.w.map((w,i)=>{ const b=document.createElement("button"); b.className="chunk"; b.textContent=w;
      b.onclick=()=>{ if(locked()||S.ans[key]) return; const ok=i===q.a; paint(i); showFb(ok); done(ok,i); }; box.append(b); return b; });
    const paint=(pick)=>{ bs.forEach((b,i)=>{ b.disabled=true; if(i===q.a) b.classList.add("right"); else if(i===pick) b.classList.add("wrong"); }); };
    d.append(box, fb);
    if(prev){ paint(prev.pick); showFb(prev.ok); }
    return d;
  }

  /* escolha múltipla */
  const box = document.createElement("div"); box.className="opts";
  /* baralha as opções (a ordem fica guardada para a pergunta não mudar ao voltar) */
  let ord = prev && prev.ord ? prev.ord : (q.keep ? q.o.map((_,i)=>i) : shuffle(q.o.map((_,i)=>i)));
  const posA = ord.indexOf(q.a);
  const btns = ord.map((oi,pos)=>{
    const b = document.createElement("button"); b.className="opt";
    b.innerHTML = `<span class="l">(${L4[pos]})</span><span>${q.o[oi]}</span>`;
    b.onclick = ()=>{ if(locked()||S.ans[key]) return; const ok=oi===q.a; paint(pos); showFb(ok, ok?"":`A certa é a (${L4[posA]}). `); done(ok,pos); if(S.ans[key]){ S.ans[key].ord=ord; save(); } };
    box.appendChild(b); return b;
  });
  const paint=(pick)=>{ btns.forEach((b,pos)=>{ b.disabled=true; if(pos===posA) b.classList.add("right"); else if(pos===pick) b.classList.add("wrong"); }); };
  d.append(box, fb);
  if(prev){ paint(prev.pick); showFb(prev.ok, prev.ok?"":`A certa é a (${L4[posA]}). `); }
  return d;
}

function heartsHTML(n,max){ return `<span class="hearts" aria-label="${n} vidas">${Array.from({length:max},(_,i)=>`<span class="${i<n?"":"off"}">❤️</span>`).join("")}</span>`; }

/* ===== Perguntas sorteadas =====
   Cada estação de gramática mistura perguntas fixas (sorteadas do nível) com perguntas
   geradas a partir dos bancos do treino infinito. A ronda fica guardada até acabar
   ou recomeçar; a seguinte é diferente. */
const BANK_OF = {classes:["cls"], funcoes:["fun","suj"], oracoes:["ora"], coesao:["coe"], relacoes:["rel"], formacao:["for"], lusiadas:["lusEp","lusPlano","lusEst"], opiniao:["opi"]};
function bankQ(b, avoid){
  const B = BANK[b];
  const labels = B.labels || [...new Set(B.items.map(x=>x[1]))];
  let it, t=0; do{ it = B.items[Math.floor(Math.random()*B.items.length)]; t++; } while(avoid.has(it[0]) && t<50);
  avoid.add(it[0]);
  const correct = it[1], pool = labels.filter(x=>x!==correct);
  const near = shuffle(pool.filter(x=>x.split(" ")[0]===correct.split(" ")[0])).slice(0,2);
  const rest = shuffle(pool.filter(x=>!near.includes(x))).slice(0,3-near.length);
  return {p:`${B.q}<br><span style="font-weight:400">«${it[0].replace(/\[(.+?)\]/g,"<mark>$1</mark>")}»</span>`, o:[correct,...near,...rest], a:0, e:"<b>Truque:</b> "+B.tip};
}
/* Formatos dos testes e exames: «…, respetivamente,» e «… exceto» */
const RESP = {fun:"as partes destacadas desempenham a função sintática de", suj:"os sujeitos são", cls:"as palavras destacadas são", ora:"as orações destacadas são", coe:"as partes destacadas asseguram a coesão", rel:"as relações entre as palavras são de", for:"as palavras formaram-se por", lusEp:"os episódios estão, respetivamente, no", lusPlano:"os momentos pertencem ao plano", lusEst:"os versos pertencem à parte", opi:"os conectores servem para"};
const EXC = {fun:L=>`A parte destacada desempenha a função de ${L} em todas as opções, exceto em`, suj:L=>`O sujeito é ${L} em todas as frases, exceto em`, cls:L=>`A palavra destacada é ${L} em todas as opções, exceto em`, ora:L=>`A oração destacada é ${L} em todas as opções, exceto em`, coe:L=>`A parte destacada assegura a coesão ${L} em todas as opções, exceto em`, rel:L=>`A relação entre as palavras é de ${L} em todos os pares, exceto em`, for:L=>`A palavra formou-se por ${L} em todos os casos, exceto em`, lusEp:L=>`Todos estes episódios estão no ${L}, exceto`, lusPlano:L=>`Todos estes momentos pertencem ao plano «${L}», exceto`, lusEst:L=>`Todos estes versos pertencem à ${L}, exceto`, opi:L=>`Todos estes conectores servem para ${L}, exceto`};
const hlB = t => t.replace(/\[(.+?)\]/g,"<mark>$1</mark>");
function bankPick(B, avoid, ok){ const pool = B.items.filter(x=>!avoid.has(x[0]) && (!ok || ok(x))); if(!pool.length) return null; const it = pool[Math.floor(Math.random()*pool.length)]; avoid.add(it[0]); return it; }
function bankResp(b, avoid){
  const B = BANK[b], labels = B.labels || [...new Set(B.items.map(x=>x[1]))];
  const i1 = bankPick(B, avoid); const i2 = i1 && bankPick(B, avoid, x=>x[1]!==i1[1]);
  if(!i1 || !i2) return bankQ(b, avoid);
  const z = shuffle(labels.filter(x=>x!==i1[1] && x!==i2[1]));
  const f = (x,y) => `${x}, no primeiro caso, e ${y}, no segundo caso.`;
  const o = [f(i1[1],i2[1]), f(i2[1],i1[1]), f(i1[1],z[0]), f(z[1]||z[0],i2[1])];
  if(new Set(o).size<4 || z.length<1) return bankQ(b, avoid);
  return {p:`Nas frases 1) e 2), ${RESP[b]}, respetivamente,<br><span style="font-weight:400">1) «${hlB(i1[0])}»<br>2) «${hlB(i2[0])}»</span>`, o, a:0, e:`1) ${i1[1]}; 2) ${i2[1]}. <b>Truque:</b> ${B.tip}`};
}
function bankExc(b, avoid){
  const B = BANK[b], count = {};
  B.items.forEach(x=>{ if(!avoid.has(x[0])) count[x[1]]=(count[x[1]]||0)+1; });
  const Ls = Object.keys(count).filter(L=>count[L]>=3); if(!Ls.length) return bankQ(b, avoid);
  const L = Ls[Math.floor(Math.random()*Ls.length)];
  const same = [0,1,2].map(()=>bankPick(B, avoid, x=>x[1]===L)), odd = bankPick(B, avoid, x=>x[1]!==L);
  if(same.some(x=>!x) || !odd) return bankQ(b, avoid);
  return {p:EXC[b](L), o:[odd,...same].map(x=>`«${hlB(x[0])}»`), a:0, e:`Na opção certa é ${odd[1]}; nas outras é ${L}. <b>Truque:</b> ${B.tip}`};
}
function genQ(b, avoid){ const r = Math.random(); return r<0.5 ? bankQ(b, avoid) : r<0.75 ? bankResp(b, avoid) : bankExc(b, avoid); }
function getRound(k, m, lv){
  S.rounds = S.rounds || {};
  const old = S.rounds[k];
  if(old && old.items.every(it=>it.g || m.qs[it.j])){
    /* ronda a meio: continua (não se perdem respostas); acabada ou por começar: sorteia outra */
    const feitas = old.items.filter((_,n)=>S.ans[k+"#"+old.id+"#"+n]).length;
    if(!lv || (feitas>0 && feitas<old.items.length)) return old;
    old.items.forEach((_,n)=>delete S.ans[k+"#"+old.id+"#"+n]);
  }
  const pool = m.qs.map((q,j)=>({q,j})).filter(x=>!lv || x.q.lv===lv);
  let items;
  if(!lv){ items = pool.map(x=>({j:x.j})); }            /* testes tipo: todas, pela ordem do texto */
  else {
    const banks = BANK_OF[Object.keys(M).find(x=>M[x]===m)] || [];
    const shorts = shuffle(pool.filter(x=>x.q.s)), others = shuffle(pool.filter(x=>!x.q.s));
    const fixed = (banks.length ? others.slice(0,4) : others).map(x=>({j:x.j}));
    const gen = [], avoid = new Set();
    if(banks.length) while(fixed.length+gen.length < 8) gen.push({g: genQ(banks[Math.floor(Math.random()*banks.length)], avoid)});
    items = [...shuffle([...fixed, ...gen]), ...(banks.length ? shorts.slice(0,1) : shorts).map(x=>({j:x.j}))];
  }
  S.rounds[k] = {id: Date.now().toString(36), items}; save();
  return S.rounds[k];
}

/* ===== Estação de missão ===== */
function openM(L,i,m,lv){
  const k = L.id+":"+i;
  const label = L.st[i][3];
  const sec = shell(L, lv? `Estação ${i+1} · ${lv===1?"Lição + Fácil":LVN[lv]}` : label, m.exam? m.pic : "", m.c);
  const R = getRound(k, m, lv);
  const list = R.items.map((it,n)=>({q: it.g || m.qs[it.j], key: k+"#"+R.id+"#"+n}));
  if(S.hp[k]===undefined) S.hp[k]=5;
  const bar = document.createElement("div"); bar.className="stbar";
  sec.append(bar);
  if(lv===1 || m.exam){ sec.append(lessonBlock(m)); }
  else { const det=document.createElement("details"); det.className="lesson"; det.innerHTML="<summary>Rever a lição e o truque</summary>"; det.append(lessonBlock(m)); sec.append(det); }
  if(m.text) sec.append(textBlock(m));
  const h3 = document.createElement("h3"); h3.textContent = m.exam ? "Questões" : "Exercícios"; h3.style.margin="0 0 10px";
  const qs = document.createElement("div"); qs.className="qs";
  const sc = document.createElement("div"); sc.className="score"; sc.hidden=true;
  const dead = document.createElement("div"); dead.className="dead"; dead.hidden=true;
  const keys = list.map(x=>x.key);
  function refresh(){
    const answered = keys.filter(x=>S.ans[x]).length, right = keys.filter(x=>S.ans[x]&&S.ans[x].ok).length;
    bar.innerHTML = `${heartsHTML(S.hp[k],5)}<span style="font-variant-numeric:tabular-nums;color:var(--muted)">${answered} / ${keys.length} · ${right} certas</span>${stars(S.stars[k]||0)}`;
    dead.hidden = S.hp[k]>0 || answered===keys.length;
    if(answered===keys.length){
      const r = right/keys.length, n = r===1?3:r>=.75?2:r>=.5?1:0;
      if(n>(S.stars[k]||0)){ S.stars[k]=n; save(); }
      sc.hidden=false;
      sc.innerHTML = `<div><span class="big">${right} / ${keys.length}</span> ${stars(n)}<p>${n===3?"Estação perfeita!":n===2?"Muito bem! Revê só as que falhaste.":n===1?"Quase: relê a lição e repete.":"Relê a lição e tenta outra vez."}</p></div>`;
      const again = document.createElement("button"); again.className="btn ghost"; again.textContent="Repetir estação";
      again.onclick=reset; sc.append(again);
      bar.innerHTML = `${heartsHTML(S.hp[k],5)}<span style="color:var(--muted)">Concluída</span>${stars(S.stars[k]||0)}`;
    }
  }
  function reset(){ keys.forEach(x=>{ delete S.ans[x]; try{ localStorage.removeItem("mp11b_"+x); }catch(e){} }); S.hp[k]=5; delete S.rounds[k]; save(); openM(L,i,m,lv); }
  /* recomeçar a qualquer momento: apaga só as respostas desta estação (o XP e as estrelas ficam) */
  const rs = document.createElement("div"); rs.className="btns"; rs.style.margin="0 0 12px";
  const rsb = document.createElement("button"); rsb.className="btn ghost"; rsb.textContent="↺ Recomeçar estação";
  confirmTap(rsb, "Toca outra vez para recomeçar", reset);
  rs.append(rsb);
  dead.innerHTML = `<b>Ficaste sem vidas 💔</b><p>Relê a lição (o truque resolve quase tudo) e recomeça a estação.</p>`;
  const rb = document.createElement("button"); rb.className="btn"; rb.textContent="Rever a lição e recomeçar"; rb.onclick=reset; dead.append(rb);
  const ctx = { dead:()=>S.hp[k]<=0, onAnswer:(ok)=>{ if(!ok){ S.hp[k]=Math.max(0,S.hp[k]-1); save(); } refresh(); } };
  list.forEach((x,n)=> qs.append(qBlock(x.q, x.key, n+1, ctx)));
  sec.append(h3, rs, qs, dead, sc, navBtns(L,i)); refresh();
}

/* ===== Justifica ===== */
function openJ(L,i,J){
  const k = L.id+":"+i;
  const sec = shell(L, "J"+(i+1)+" · "+J.name, J.ref);
  if(J.text){ sec.append(textBlock({text:true})); }
  const box = document.createElement("div"); box.className="q";
  box.innerHTML = `<span class="n">Resposta restrita · 13 pontos (10 conteúdo + 3 correção linguística)</span><p class="p">${J.p}</p>
   <p style="color:var(--muted);font-size:15px">Como no teste: 2 a 4 frases, ideia principal + citação + explicação.</p>
   <textarea style="width:100%;min-height:130px;border:2px solid var(--line);border-radius:10px;padding:9px 11px;background:var(--bg);color:var(--ink);font:inherit"></textarea>
   <div class="btns"><button class="btn" id="seeM">Ver resposta-modelo e corrigir</button></div>
   <div id="corr" hidden>
     <p class="model"><b>Resposta-modelo:</b> ${J.model}</p>
     <h3 style="margin:12px 0 6px">Marca o que a tua resposta tem</h3>
     <ul class="crit">${J.crit.map((c,j)=>`<li><label><input type="checkbox" data-p="${c[1]}"> <span>${c[0]} <b>(${c[1]} pts)</b></span></label></li>`).join("")}</ul>
     <h3 style="margin:12px 0 6px">Correção linguística (erros de ortografia, acentos, pontuação, frases mal construídas)</h3>
     <ul class="crit">${[["0 erros",3],["1 erro",2],["2 erros",1],["3 ou mais erros",0]].map((c,j)=>`<li><label><input type="radio" name="cl" data-p="${c[1]}"${j===0?" checked":""}> <span>${c[0]} <b>(${c[1]} pts)</b></span></label></li>`).join("")}</ul>
     <div class="score" style="margin-top:12px"><div><span class="big" id="pts">0 / 13</span><p id="ptsMsg"></p></div><button class="btn okb" id="saveJ">Guardar resultado</button></div>
   </div>`;
  sec.append(box, navBtns(L,i));
  const ta = box.querySelector("textarea");
  try{ ta.value = localStorage.getItem("mp11b_"+J.id)||""; }catch(e){}
  ta.oninput=()=>{ try{ localStorage.setItem("mp11b_"+J.id, ta.value);}catch(e){} };
  const corr = box.querySelector("#corr");
  box.querySelector("#seeM").onclick=(e)=>{ if(!ta.value.trim()){ alert("Escreve primeiro a tua resposta 🙂"); return; } corr.hidden=false; e.target.hidden=true; calc(); };
  function calc(){
    let c = [...corr.querySelectorAll('input[type=checkbox]')].reduce((n,x)=>n+(x.checked?+x.dataset.p:0),0);
    const cl = c===0 ? 0 : +corr.querySelector('input[name=cl]:checked').dataset.p;
    const t = c+cl;
    corr.querySelector("#pts").textContent = t+" / 13";
    corr.querySelector("#ptsMsg").textContent = c===0 ? "Sem conteúdo certo, a correção linguística também fica a 0 (como nos critérios)." : t>=11?"Resposta de nível máximo.":t>=7?"Boa base: acrescenta o que falta.":"Compara com o modelo e reescreve.";
    return t;
  }
  corr.querySelectorAll("input").forEach(x=>x.onchange=calc);
  box.querySelector("#saveJ").onclick=(e)=>{
    const t=calc(), n = t>=12?3:t>=9?2:t>=6?1:0;
    if(n>(S.stars[k]||0)){ S.stars[k]=n; }
    if(!S.ans["j:"+J.id]){ S.ans["j:"+J.id]={ok:t>=9}; S.xp+= t; }
    save(); updXP(); e.target.textContent="Guardado ✓ "+["","★","★★","★★★"][n];
  };
}

/* ===== Treino infinito ===== */
function openInf(L){
  const sec = shell(L, "Treino infinito", "Perguntas novas de gramática a cada clique. 3 vidas: até onde chegas?");
  const pick = document.createElement("div"); pick.className="temas";
  let on = new Set(Object.keys(BANK_NAMES));
  Object.keys(BANK_NAMES).forEach(b=>{ const c=document.createElement("button"); c.className="chip"; c.textContent=BANK_NAMES[b]; c.setAttribute("aria-pressed","true");
    c.onclick=()=>{ if(on.has(b)&&on.size>1){on.delete(b);c.setAttribute("aria-pressed","false");} else {on.add(b);c.setAttribute("aria-pressed","true");} }; pick.append(c); });
  const bar = document.createElement("div"); bar.className="stbar";
  const area = document.createElement("div"); area.className="qs";
  sec.append(pick, bar, area);
  let hp=3, streak=0, recent=[];
  function draw(){ bar.innerHTML = `${heartsHTML(hp,3)}<span style="font-variant-numeric:tabular-nums">Seguidas: <b>${streak}</b> · Recorde: <b>${S.best}</b></span>`; }
  function labelsOf(b){ return BANK[b].labels || [...new Set(BANK[b].items.map(x=>x[1]))]; }
  function next(){
    draw();
    const bs=[...on]; const b = bs[Math.floor(Math.random()*bs.length)];
    let it, tries=0; do{ it = BANK[b].items[Math.floor(Math.random()*BANK[b].items.length)]; tries++; } while(recent.includes(it[0]) && tries<30);
    recent.push(it[0]); if(recent.length>20) recent.shift();
    const correct = it[1];
    const pool = labelsOf(b).filter(x=>x!==correct);
    const near = shuffle(pool.filter(x=>x.split(" ")[0]===correct.split(" ")[0])).slice(0,2);
    const rest = shuffle(pool.filter(x=>!near.includes(x))).slice(0,3-near.length);
    const opts = shuffle([correct,...near,...rest]);
    const html = it[0].replace(/\[(.+?)\]/g,"<mark>$1</mark>");
    const q = {p:`${BANK[b].q}<br><span style="font-weight:400">«${html}»</span>`, o:opts, a:opts.indexOf(correct), e:"<br><b>Truque:</b> "+BANK[b].tip};
    area.innerHTML="";
    const key = "inf_tmp";
    delete S.ans[key];
    const el = qBlock(q, key, streak+1, {dead:()=>hp<=0, onAnswer:(ok)=>{
      delete S.ans[key];
      if(ok){ streak++; if(streak>S.best){S.best=streak;} } else { hp--; }
      save(); draw();
      const bt=document.createElement("div"); bt.className="btns";
      if(hp>0){ const n=document.createElement("button"); n.className="btn"; n.textContent="Próxima →"; n.onclick=next; bt.append(n); }
      else { const over=document.createElement("div"); over.className="dead"; over.innerHTML=`<b>Fim de jogo!</b><p>Fizeste ${streak} seguidas. Recorde: ${S.best}.</p>`; const r=document.createElement("button"); r.className="btn"; r.textContent="Jogar outra vez"; r.onclick=()=>{hp=3;streak=0;next();}; over.append(r); bt.append(over); }
      area.append(bt);
    }});
    el.querySelector(".n").innerHTML = `${BANK_NAMES[b]}`;
    area.append(el);
  }
  next();
  sec.append(navBtns(L,0));
}

/* ===== Simulado ===== */
function openSim(L){
  const sec = shell(L, "Simulado PRI 1", "12 perguntas: 2 de cada conteúdo de gramática da matriz, misturadas. Sem espreitar.");
  const avoid = new Set();
  const pickQ = shuffle(["classes","funcoes","oracoes","coesao","relacoes","formacao"].flatMap(id=>[shuffle(M[id].qs.filter(q=>!q.s&&!q.t))[0], genQ(BANK_OF[id][Math.floor(Math.random()*BANK_OF[id].length)], avoid)]));
  const qs = document.createElement("div"); qs.className="qs";
  const sc = document.createElement("div"); sc.className="score"; sc.hidden=true;
  let done=0, right=0;
  pickQ.forEach((q,n)=>{ delete S.ans["sim"+n]; });
  pickQ.forEach((q,n)=> qs.append(qBlock(q, "sim"+n, n+1, {dead:()=>false, onAnswer:(ok)=>{ done++; if(ok) right++; if(done===12){ sc.hidden=false; sc.innerHTML=`<div><span class="big">${right} / 12</span><p>≈ ${Math.round(right/12*200)} pontos em 200. ${right>=11?"Pronto para o teste!":right>=8?"Bom resultado. Volta às linhas onde erraste.":"Refaz as estações 2 e 3 das linhas de gramática."}</p></div>`; const a=document.createElement("button"); a.className="btn"; a.textContent="Novo simulado"; a.onclick=()=>openSim(L); sc.append(a);} }})));
  sec.append(qs, sc, navBtns(L,1));
}

/* ===== Cábula ===== */
function openCab(L){
  const sec = shell(L, "Cábula final", "Lê na véspera e 10 minutos antes do teste.");
  const C = [
   ["--c8","Os Lusíadas",["Camões, 1572, epopeia, 10 cantos, oitava rima (ABABABCC), decassílabos.","Proposição · Invocação (Tágides) · Dedicatória (D. Sebastião) · Narração (in medias res).","4 planos: viagem, história de Portugal, mitologia (Vénus ajuda, Baco atrapalha), reflexões do poeta.","Inês (III) · Velho do Restelo (IV) · Adamastor (V) · Ilha dos Amores (IX).","Recurso + efeito: apóstrofe, metáfora, anáfora, enumeração, hipérbole, interrogação retórica."]],
   ["--c7","Leitura",["Volta sempre à linha indicada.","A resposta certa é a que o TEXTO diz.","Desconfia de «sempre», «nunca», «apenas»."]],
   ["--c1","Classes e subclasses",["Antes do nome = determinante; no lugar do nome = pronome.","«que» = «o qual»? pronome relativo; senão, conjunção.","contudo, todavia, no entanto, portanto = advérbios conectivos.","também = advérbio de inclusão; só/apenas = exclusão.","todos/cada = quantificador universal; alguns/muitos = existencial.","ser/estar/parecer/ficar = verbo copulativo; ter + particípio = auxiliar."]],
   ["--c2","Funções sintáticas",["o/a = complemento direto · lhe = complemento indireto.","Verbo precisa, com preposição, sem «lhe» = complemento oblíquo (não é só lugar!).","ser + particípio + por… = agente da passiva.","Depois de verbo copulativo = predicativo do sujeito; acho-o fácil = predicativo do CD.","Pode sair = modificador; entre vírgulas a chamar = vocativo."]],
   ["--c3","Orações",["Coordenadas: e, mas, ou, logo, pois.","Troca por «isso» = substantiva (diz a função!).","Depois de um nome = relativa: sem vírgulas restritiva, com vírgulas explicativa.","porque causal · para que final · quando temporal · embora concessiva · se condicional · tão…que consecutiva · mais…do que comparativa."]],
   ["--c4","Coesão",["Diz tipo + mecanismo: «coesão referencial, por anáfora».","Anáfora ⬅ · catáfora ➡ · elipse = omissão.","Interfrásica = conectores · frásica = concordância · temporal = tempos verbais e advérbios.","Lexical: reiteração, sinonímia, hiperonímia, holonímia."]],
   ["--c5","Relações semânticas",["Tipo de = hiperonímia/hiponímia (flor → rosa).","Parte de = holonímia/meronímia (casa → telhado).","Sinonímia = mesmo sentido · antonímia = opostos."]],
   ["--c6","Formação de palavras",["in+feliz prefixação · feliz+mente sufixação.","infelizmente = prefixação e sufixação · entristecer = parassíntese.","luta ← lutar = derivação não afixal · o jantar = conversão.","geografia, luso-brasileiro = composição morfológica · guarda-chuva = morfossintática."]],
   ["--c8","Texto de opinião (250-350 palavras)",["Introdução: tema + opinião.","2 argumentos + 2 exemplos, parágrafos separados.","«É certo que…; no entanto,…»","Conclusão: «Em suma,…» sem ideias novas.","Nunca vírgula entre sujeito e verbo. Conta as palavras. Linguagem formal."]],
   ["--c3","No dia do teste",["Lê as perguntas antes do texto.","Respostas breves: frase completa.","Guarda 45 minutos para o texto de opinião se estiver no mesmo dia.","Revê acentos: à/há, tem/têm, é/e."]]
  ];
  const cab = document.createElement("div"); cab.className="cab";
  cab.innerHTML = C.map(c=>`<section style="--mc:var(${c[0]})"><h3>${c[1]}</h3><ul>${c[2].map(x=>`<li>${x}</li>`).join("")}</ul></section>`).join("");
  sec.append(cab, navBtns(L,2));
}

/* ===== Escrita ===== */
function openWrite(L){
  const sec = shell(L, "Escrever o texto de opinião", "250 a 350 palavras · PRI 2 vale 200 pontos");
  const temas = ["Os telemóveis deviam ser proibidos nas escolas?","Ainda faz sentido ler livros na era digital?","A ambição é uma qualidade ou um defeito? (pensa no Velho do Restelo)","As redes sociais aproximam ou afastam as pessoas?","Vale a pena correr riscos para alcançar um sonho?"];
  let tema = 0; try{ tema = +localStorage.getItem("mp11_tema")||0; }catch(e){}
  const w = document.createElement("div");
  w.innerHTML = `
  <div class="idea">
    <p class="pic">Pão, carne, carne, pão</p>
    <div class="burger">
      <div class="layer bun"><b>Introdução</b><span class="w">± 50 palavras</span><span style="width:100%">Apresenta o tema e diz logo a tua opinião (a tese).</span></div>
      <div class="layer meat"><b>Argumento 1 + exemplo</b><span class="w">± 80 palavras</span><span style="width:100%">«Em primeiro lugar, …. Por exemplo, …»</span></div>
      <div class="layer meat"><b>Argumento 2 + exemplo</b><span class="w">± 80 palavras</span><span style="width:100%">«Além disso, …. É o caso de …»</span></div>
      <div class="layer"><b>O outro lado</b><span class="w">± 40 palavras</span><span style="width:100%">«É certo que …; no entanto, …»</span></div>
      <div class="layer bun"><b>Conclusão</b><span class="w">± 50 palavras</span><span style="width:100%">«Em suma, …»: reafirma a opinião, sem ideias novas.</span></div>
    </div>
  </div>
  <h3>1. Escolhe um tema</h3>
  <div class="temas" id="temas"></div>
  <h3>2. Escreve aqui</h3>
  <p style="color:var(--muted);font-size:15px;margin:4px 0 8px">Toca num conector para o acrescentar. O rascunho fica guardado neste aparelho. No teste escreves à mão: treina também em papel!</p>
  <div class="conns" id="conns"></div>
  <label for="draft" class="n" style="display:block;margin:10px 0 4px;font-weight:700">O teu texto</label>
  <textarea id="draft" placeholder="Hoje em dia, …"></textarea>
  <div class="count"><span id="wc" class="pill low">0 palavras</span><span id="wmsg" style="color:var(--muted)">Mínimo 250, máximo 350</span></div>
  <h3>3. Antes de entregar</h3>
  <ul class="check">
    ${["A minha opinião está clara no 1.º parágrafo","Tenho 2 argumentos, cada um com um exemplo","Usei conectores diferentes (Em primeiro lugar, Além disso, No entanto, Em suma)","A conclusão reafirma a opinião, sem ideias novas","Linguagem formal: nada de «tipo», «bué», «tá»","Nenhuma vírgula entre sujeito e verbo","Revi acentos (à/há, tem/têm) e ortografia","Estou entre 250 e 350 palavras"].map((t,i)=>`<li><label><input type="checkbox" id="ck${i}"> <span>${t}</span></label></li>`).join("")}
  </ul>
  <details class="lesson" style="margin-top:16px"><summary>Ver um texto-modelo (280 palavras)</summary><div class="idea" style="white-space:pre-line">${MODEL}</div></details>`;
  sec.append(w, navBtns(L,3));
  const tw = w.querySelector("#temas");
  temas.forEach((t,i)=>{ const b=document.createElement("button"); b.className="chip"; b.textContent=t; b.setAttribute("aria-pressed", i===tema);
    b.onclick=()=>{ tema=i; try{localStorage.setItem("mp11_tema",i);}catch(e){} tw.querySelectorAll(".chip").forEach((c,j)=>c.setAttribute("aria-pressed", j===i)); }; tw.append(b); });
  const ta = w.querySelector("#draft");
  try{ ta.value = localStorage.getItem("mp11_draft")||""; }catch(e){}
  const cn = w.querySelector("#conns");
  ["Na minha opinião,","Em primeiro lugar,","Por exemplo,","Além disso,","É o caso de","Ora,","É certo que","No entanto,","Por isso,","Em suma,"].forEach(c=>{
    const b=document.createElement("button"); b.textContent=c;
    b.onclick=()=>{ const p=ta.selectionStart; const sp = p>0 && !/\s$/.test(ta.value.slice(0,p)) ? " " : ""; ta.value = ta.value.slice(0,p)+sp+c+" "+ta.value.slice(ta.selectionEnd); ta.focus(); ta.selectionStart=ta.selectionEnd=p+sp.length+c.length+1; count(); };
    cn.append(b);
  });
  function count(){
    try{ localStorage.setItem("mp11_draft", ta.value);}catch(e){}
    const n = (ta.value.trim().match(/\S+/g)||[]).filter(x=>/[\p{L}\p{N}]/u.test(x)).length;
    const wc = w.querySelector("#wc"), msg = w.querySelector("#wmsg");
    wc.textContent = n+" palavras";
    const good = n>=250 && n<=350;
    wc.className = "pill "+(good?"good":"low");
    msg.textContent = n<250 ? `Faltam ${250-n} palavras` : n>350 ? `Tens ${n-350} a mais: corta` : "Dentro do limite ✓";
  }
  ta.oninput = count; count();
  for(let i=0;i<8;i++){ const c=w.querySelector("#ck"+i); try{ c.checked = localStorage.getItem("mp11_ck"+i)==="1"; }catch(e){} c.onchange=()=>{ try{localStorage.setItem("mp11_ck"+i, c.checked?"1":"0");}catch(e){} }; }
}

home();
