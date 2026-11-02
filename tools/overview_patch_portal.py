# Wird von build_lab.py ausgeführt (exec), nach skin_patch_portal.py.
# Bessere Übersicht in Garderobe und Zimmer:
#  - Umschalter «Meine Sachen» / «Noch zu holen» / «Alle» (mit Anzahl)
#  - «Nächste Belohnung» (welches Level, wie viele Sterne fehlen)
#  - «NEU» an allem, was seit dem letzten Öffnen dazugekommen ist
#  - Skin und Hintergrund als aufklappbare Abschnitte, Freigeschaltetes zuerst

def _cut(src, start, end):
    a = src.index(start); b = src.index(end, a)
    return a, b

# ---------- gemeinsame Helfer (vor «Zimmer einrichten») ----------
HELP = r'''/* ---- Übersicht für Garderobe und Zimmer ---- */
window.GLAB_VF = window.GLAB_VF || {wd:"mine", rm:"mine"};
const NEWSET = {wd:new Set(), rm:new Set()};
function markNew(kind){
  const s = student(D.me), p = prog(s.id), T = totalsFor(s.id), li = LIB.levelOf(T.stars);
  const ids = kind === "wd"
    ? LIB.OUTFITS.filter(x=>outfitOpenFor(x, T)).map(x=>x.id).concat((window.GLAB_SKINS || []).filter(x=>x.id !== "gold" && skinOpen(x, T)).map(x=>"sk:" + x.id))
    : window.GLAB_R.ROOM.filter(x=>roomOpen(x, li)).map(x=>x.id).concat(CU.bgs.filter(x=>bgOpen(x, T)).map(x=>"bg:" + x.id));
  const key = kind === "wd" ? "seenW" : "seenR", had = Array.isArray(p[key]) ? new Set(p[key]) : null;
  NEWSET[kind] = had ? new Set(ids.filter(i=>!had.has(i))) : new Set();
  p[key] = ids;
}
function vfBar(kind, nOpen, nAll){
  const f = window.GLAB_VF[kind], b = (v, t) => `<button type="button" class="vf-b${f === v ? " on" : ""}" data-pt-vf="${kind}:${v}" aria-pressed="${f === v}">${t}</button>`;
  return `<div class="vf-bar" role="group" aria-label="Was anzeigen?">${b("mine", `✓ Meine Sachen <i>${nOpen}</i>`)}${b("todo", `🔒 Noch zu holen <i>${nAll - nOpen}</i>`)}${b("all", `Alle <i>${nAll}</i>`)}</div>`;
}
const vfShow = (kind, open, on) => { const f = window.GLAB_VF[kind]; return on || f === "all" || (f === "mine" ? open : !open); };
const vfSort = (its, isOpen) => its.slice().sort((a, b) => (isOpen(b) - isOpen(a)) || ((a.lv == null ? 9999 : a.lv) - (b.lv == null ? 9999 : b.lv)));
const vfEmpty = kind => `<p class="vf-empty">${window.GLAB_VF[kind] === "mine" ? "Hier ist noch nichts frei. Unter «🔒 Noch zu holen» siehst du, wie du etwas bekommst." : "Hier hast du schon alles! 🎉"}</p>`;
const vfNew = on => on ? '<span class="vf-new">NEU</span>' : "";
function nextGift(kind, T){
  const li = LIB.levelOf(T.stars);
  const L = kind === "wd"
    ? LIB.OUTFITS.filter(x=>x.lv != null && !x.badge && !x.sw && x.lv > li).map(x=>({n:x.n, lv:x.lv})).concat((window.GLAB_SKINS || []).filter(x=>x.lv != null && !x.badge && x.lv > li).map(x=>({n:"Skin «" + x.n + "»", lv:x.lv})))
    : window.GLAB_R.ROOM.filter(x=>!x.badge && !x.sw && x.lv > li && x.lv < 9999).map(x=>({n:x.n, lv:x.lv}));
  if (!L.length){
    if (kind !== "rm") return "";
    const tip = window.GLAB_R.ROOM.filter(x=>x.badge && !roomOpen(x, li) && x.reqTxt).sort((a, b)=>(b.id.startsWith("hr_") - a.id.startsWith("hr_"))).slice(0, 2);
    return tip.length ? `<div class="vf-next"><span aria-hidden="true">🎁</span><span><b>Als Nächstes zum Beispiel:</b> ${tip.map(x=>esc(x.n)).join(", ")}<small>${tip.map(x=>esc(x.reqTxt)).join(" · ")}</small></span></div>` : "";
  }
  const lv = Math.min(...L.map(x=>x.lv)), g = L.filter(x=>x.lv === lv), need = LIB.LEVELS[lv] ? Math.max(0, LIB.LEVELS[lv].s - T.stars) : 0;
  return `<div class="vf-next"><span aria-hidden="true">🎁</span><span><b>Nächste Belohnung:</b> ${g.map(x=>esc(x.n)).join(", ")}<small>ab Level ${lv + 1}${need ? ` · noch ${need} ★` : ""}</small></span></div>`;
}
document.addEventListener("click", e=>{ const b = e.target.closest && e.target.closest("[data-pt-vf]"); if (!b) return; e.preventDefault();
  const [kind, v] = b.dataset.ptVf.split(":"); window.GLAB_VF[kind] = v;
  const ov = document.getElementById(kind === "wd" ? "ptWd" : "ptRm"); if (ov){ const sc = ov.scrollTop; ov.innerHTML = kind === "wd" ? wardrobeHTML() : roomHTML(); ov.scrollTop = sc; } });
(function(){ if (document.getElementById("vfCss")) return; const st = document.createElement("style"); st.id = "vfCss";
  st.textContent = ".vf-bar{position:sticky;top:-20px;z-index:3;display:flex;gap:6px;flex-wrap:wrap;margin:10px -20px 8px;padding:10px 20px;background:#14062E;border-bottom:1px solid rgba(139,92,255,.35)}"
  + ".vf-b{all:unset;cursor:pointer;box-sizing:border-box;padding:7px 12px;border-radius:999px;border:2px solid #4A23A0;background:#2A0F66;font:800 .85rem/1.1 system-ui,sans-serif;color:#fff}"
  + ".vf-b i{font-style:normal;opacity:.75;margin-left:4px}.vf-b.on{background:#FFC21A;border-color:#FFC21A;color:#14062E}.vf-b:focus-visible{outline:3px solid #00E5FF;outline-offset:2px}"
  + ".vf-next{display:flex;gap:10px;align-items:center;margin:0 0 12px;padding:10px 12px;border-radius:14px;background:rgba(255,194,26,.12);border:1px dashed rgba(255,194,26,.6);font-size:.92rem}"
  + ".vf-next > span:first-child{font-size:1.4rem}.vf-next small{display:block;opacity:.8;font-size:.8rem;margin-top:2px}"
  + ".vf-new{position:absolute;top:6px;left:6px;padding:1px 6px;border-radius:999px;background:#FF2BD6;color:#fff;font:900 .62rem/1.4 system-ui,sans-serif;letter-spacing:.04em}"
  + ".vf-empty{margin:0;padding:6px 14px 16px;opacity:.8;font-size:.9rem}.wd-sk{position:relative}.wd-sk .vf-new{top:2px;left:2px}"
  + ".acc-emo{font-size:26px;line-height:1;display:grid;place-items:center;width:100%;height:100%}";
  (document.head || document.documentElement).appendChild(st); })();
'''
a = portal.index("/* ---- Zimmer einrichten ---- */")
portal = portal[:a] + HELP + portal[a:]

# ---------- Zimmer ----------
a, b = _cut(portal, "function bgHTML(T){", "function pickBg(id){")
portal = portal[:a] + r'''function bgList(T){
  return [{id:"pixel", n:"Pixel-Zimmer", ic:"🟪", open:true, req:""}, {id:"chalet", n:"Schweizer Chalet", ic:"🏔️", open:T.badges.has(CHALET_BADGE), req:"nach dem ersten NMG-Modul (Alte Eidgenossenschaft)"}]
    .concat(CU.bgs.map(x=>({id:x.id, n:x.n, ic:x.ic || "🖼️", open:bgOpen(x, T), req:x.reqTxt || ""})));
}
function bgHTML(T){
  const cur = window.GLAB_ROOMBG || "pixel", L = bgList(T), NW = NEWSET.rm, c = L.find(x=>x.id === cur) || L[0];
  const show = vfSort(L.filter(x=>vfShow("rm", x.open, cur === x.id)), x=>x.open);
  return window.GLAB_ACC("rm", "bg", "Hintergrund", {cur: esc(c.n), prev: `<span class="acc-emo">${c.ic}</span>`, n: L.filter(x=>x.open).length, t: L.length, isNew: L.some(x=>NW.has("bg:" + x.id))}, true)
    + (show.length ? `<div class="wd-grid">${show.map(x=>`<button type="button" class="wd-item${cur === x.id ? " on" : ""}${x.open ? "" : " locked"}" data-pt="bg-${x.id}" ${x.open ? "" : 'aria-disabled="true"'} aria-pressed="${cur === x.id}">${vfNew(NW.has("bg:" + x.id))}<span class="pt-emo-ic" aria-hidden="true">${x.ic}</span><b>${esc(x.n)}</b><small>${x.open ? (cur === x.id ? "aktiv" : "antippen") : esc(x.req)}</small>${x.open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`).join("")}</div>` : vfEmpty("rm")) + `</details>`;
}
''' + portal[b:]

a, b = _cut(portal, "function roomHTML(){", "function openRoom(){")
portal = portal[:a] + r'''function roomHTML(){
  const s = student(D.me), p = prog(s.id), T = totalsFor(s.id), li = LIB.levelOf(T.stars), RR = window.GLAB_R, items = roomOf(p), NW = NEWSET.rm;
  const BL = bgList(T), nOpen = RR.ROOM.filter(x=>roomOpen(x, li)).length + BL.filter(x=>x.open).length, nAll = RR.ROOM.length + BL.length;
  return `<div class="wd-box" role="dialog" aria-modal="true" aria-labelledby="ptRmT">
    <div class="wd-head"><div><small>${esc(s.n)} · Level ${li+1}</small><h2 id="ptRmT">Zimmer einrichten</h2><p>Pro Platz einen Gegenstand antippen, nochmals tippen räumt ihn weg. Neues gibt es mit höheren Leveln und für Diplome aus den Modulen.</p></div>
      <button type="button" class="btn" data-pt="rm-close">Fertig</button></div>
    <div class="pt-room" style="margin-top:14px">${RR.roomSVG(items)}<span class="pt-room-g glitch"><span>${LIB.glitchSVG("cool", {outfit: p.outfit || {}})}</span></span></div>
    ${vfBar("rm", nOpen, nAll)}${nextGift("rm", T)}
    ${bgHTML(T)}
    ${RR.ROOM_SLOTS.map(sl=>{
      const its = RR.ROOM.filter(x=>x.slot === sl.id), cur = its.find(x=>items[sl.id] === x.id), isOpen = x=>roomOpen(x, li);
      const show = vfSort(its.filter(x=>vfShow("rm", isOpen(x), items[sl.id] === x.id)), isOpen);
      return window.GLAB_ACC("rm", sl.id, sl.n, {cur: cur ? esc(cur.n) : "", prev: cur ? RR.thumb(cur) : "", n: its.filter(isOpen).length, t: its.length, isNew: its.some(x=>NW.has(x.id))}, false) + (show.length ? `<div class="wd-grid">${show.map(x=>{
      const open = isOpen(x), on = items[sl.id] === x.id;
      return `<button type="button" class="wd-item${on ? " on" : ""}${open ? "" : " locked"}" data-pt-room="${x.id}" ${open ? "" : 'aria-disabled="true"'} aria-pressed="${on}">${vfNew(NW.has(x.id))}
        <span class="pt-thumb wd-mini">${RR.thumb(x)}</span><b>${esc(x.n)}</b><small>${open ? (on ? "im Zimmer" : "antippen") : (x.reqTxt ? esc(x.reqTxt) : `ab Level ${x.lv+1}`)}</small>${open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`;
    }).join("")}</div>` : vfEmpty("rm")) + `</details>`; }).join("")}</div>`;
}
''' + portal[b:]
_o = '''function openRoom(){
  closeOv("ptRm"); const p = prog(D.me), li = LIB.levelOf(totalsFor(D.me).stars);'''
assert _o in portal
portal = portal.replace(_o, '''function openRoom(){
  closeOv("ptRm"); markNew("rm"); const p = prog(D.me), li = LIB.levelOf(totalsFor(D.me).stars);''', 1)

# ---------- Garderobe ----------
a, b = _cut(portal, "function wardrobeHTML(){", "function skinPickHTML(o){")
portal = portal[:a] + r'''function wardrobeHTML(){
  const s = student(D.me), p = prog(s.id), T = totalsFor(s.id), o = p.outfit || {}, NW = NEWSET.wd;
  const li = LIB.levelOf(T.stars), isOpen = x=>outfitOpenFor(x, T), LP = !!window.GLAB_IS_LP;
  const SK = (window.GLAB_SKINS || []).filter(x=>x.id !== "gold"), skOpen = SK.filter(x=>skinOpen(x, T)).length;
  const nOpen = LIB.OUTFITS.filter(isOpen).length + (LP ? 0 : skOpen), nAll = LIB.OUTFITS.length + (LP ? 0 : SK.length);
  return `<div class="wd-box" role="dialog" aria-modal="true" aria-labelledby="ptWdT">
    <div class="wd-head"><div><small>${esc(s.n)} · Level ${li+1}</small><h2 id="ptWdT">Garderobe</h2><p>Dein gLiTCh trägt das auch in den Modulen. Pro Körperteil eines antippen, nochmals tippen nimmt es wieder ab.</p></div>
      <button type="button" class="btn" data-pt="wd-close">Fertig</button></div>
    <div class="wd-stage"><span class="glitch wd-g">${LIB.glitchSVG("cool", {outfit:o})}</span></div>
    ${vfBar("wd", nOpen, nAll)}${nextGift("wd", T)}
    ${skinPickHTML(o)}
    ${LIB.SLOTS.map(sl=>{
      const its = LIB.OUTFITS.filter(x=>x.slot === sl.id), cur = its.find(x=>o[sl.id] === x.id);
      const show = vfSort(its.filter(x=>vfShow("wd", isOpen(x), o[sl.id] === x.id)), isOpen);
      return window.GLAB_ACC("wd", sl.id, sl.n, {cur: cur ? esc(cur.n) : "", glitch:true, prev: LIB.glitchSVG("normal", {outfit: cur ? {[sl.id]:cur.id} : {}}), n: its.filter(isOpen).length, t: its.length, isNew: its.some(x=>NW.has(x.id))}, false) + (show.length ? `<div class="wd-grid">${show.map(x=>{
      const open = isOpen(x), on = o[sl.id] === x.id;
      return `<button type="button" class="wd-item${on ? " on" : ""}${open ? "" : " locked"}" data-pt-outfit="${x.id}" ${open ? "" : 'aria-disabled="true"'} aria-pressed="${on}">${vfNew(NW.has(x.id))}
        <span class="glitch wd-mini">${LIB.glitchSVG("normal", {outfit:{[sl.id]:x.id}})}</span>
        <b>${esc(x.n)}</b><small>${open ? (on ? "angezogen" : "antippen") : esc(LIB.outfitReq(x))}</small>${open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`;
    }).join("")}</div>` : vfEmpty("wd")) + `</details>`; }).join("")}</div>`;
}
''' + portal[b:]

a, b = _cut(portal, "function skinPickHTML(o){", "const skinOpen = ")
portal = portal[:a] + r'''function skinPickHTML(o){
  const SK = (window.GLAB_SKINS || []).filter(x=>x.id !== "gold"), cur = o.skin || "violett", NW = NEWSET.wd;
  if (window.GLAB_IS_LP) return window.GLAB_ACC("wd", "skin", "Skin", {cur: "Gold", glitch:true, prev: LIB.glitchSVG("happy"), n: 1, t: 1}, true)
    + `<div class="wd-skin" style="padding:4px 14px 14px"><div class="wd-skins"><span class="wd-sk on gold" style="--sk:#F2B705" aria-label="Gold"><span class="glitch">${LIB.glitchSVG("happy")}</span><small>Gold</small></span></div><p class="wd-skin-note">✨ Lehrpersonen sind immer golden. Diese Farbe gibt es nur für Lehrpersonen.</p></div></details>`;
  const T = totalsFor(D.me), c = SK.find(x=>x.id === cur) || SK[0], isOpen = x=>skinOpen(x, T);
  const show = vfSort(SK.filter(x=>vfShow("wd", isOpen(x), cur === x.id)), isOpen);
  return window.GLAB_ACC("wd", "skin", "Skin", {cur: esc(c ? c.n : "Violett"), glitch:true, prev: LIB.glitchSVG("normal", {outfit:{skin:cur}}), n: SK.filter(isOpen).length, t: SK.length, isNew: SK.some(x=>NW.has("sk:" + x.id))}, true)
    + (show.length ? `<div class="wd-skin" style="padding:4px 14px 14px"><div class="wd-skins" role="radiogroup" aria-label="Skin von gLiTCh">${show.map(x=>{ const open = isOpen(x); return `<button type="button" class="wd-sk${cur === x.id ? " on" : ""}${open ? "" : " locked"}" data-pt-skin="${x.id}" role="radio" aria-checked="${cur === x.id}" ${open ? "" : 'aria-disabled="true"'} style="--sk:${x.base}">${vfNew(NW.has("sk:" + x.id))}<span class="glitch">${LIB.glitchSVG("normal", {outfit:{skin:x.id}})}</span><small>${esc(x.n)}</small>${open ? "" : `<em>${esc(skinReq(x))}</em>`}</button>`; }).join("")}</div></div>` : vfEmpty("wd")) + `</details>`;
}
''' + portal[b:]
_o = '''function openWardrobe(){
  closeOv("ptWd");'''
assert _o in portal
portal = portal.replace(_o, '''function openWardrobe(){
  closeOv("ptWd"); markNew("wd");''', 1)

# «NEU»-Merker mitspeichern (geht mit den Zimmer-Einstellungen aufs Konto)
_o = "wall: p.wall || null, bg: window.GLAB_ROOMBG"
assert _o in portal
portal = portal.replace(_o, "wall: p.wall || null, seenW: p.seenW || null, seenR: p.seenR || null, bg: window.GLAB_ROOMBG", 1)

# «Alle Level»: die alte Zeile «51+ Weitere Level · bald» fällt weg (die Level sind jetzt nach oben offen)
import re as _re
portal, _n = _re.subn(r"const LV_TEASER = `[^`]*`;", 'const LV_TEASER = "";', portal, count=1)
assert _n == 1

# Sterne-Anzeige unten beim Level: gleiche Grafik wie früher oben in der Kopfleiste (goldene Pixel-Pille)
_o = '<span class="pt-stars" aria-label="${T.stars} Sterne">★ ${T.stars}</span>'
assert _o in portal
portal = portal.replace(_o, '<span class="pt-stars" title="Deine Sterne" aria-label="${T.stars} Sterne"><i aria-hidden="true">★</i>${T.stars}</span>', 1)
_o = '+ ".acc-emo{'
assert _o in portal
portal = portal.replace(_o, '''+ ".pt-stars{font-family:Silkscreen,ui-monospace,monospace!important;font-size:1.15rem!important;color:#FFE08A!important;background:rgba(255,204,51,.2);border:2px solid rgba(255,204,51,.6);border-radius:999px;padding:6px 14px;gap:8px!important;font-variant-numeric:tabular-nums;box-shadow:0 0 14px rgba(255,204,51,.25)}.pt-stars i{font-style:normal;color:#FFCC33}"
  + ".acc-emo{''', 1)

# ---------- Eigener Knopf «Hintergrund» (zwischen Diplome und Lexikon) ----------
_o = "const bgOpen = (b, T) => !b.badge || T.badges.has(b.badge);"
assert _o in portal
portal = portal.replace(_o, "const bgOpen = (b, T) => (b.lv == null || LIB.levelOf(T.stars) >= b.lv) && (!b.badge || T.badges.has(b.badge));", 1)
_o = '    .concat(CU.bgs.map(x=>({id:x.id, n:x.n, ic:x.ic || "🖼️", open:bgOpen(x, T), req:x.reqTxt || ""})));'
assert _o in portal
portal = portal.replace(_o, '''    .concat(CU.bgs.map(x=>({id:x.id, n:x.n, ic:x.ic || "🖼️", open:bgOpen(x, T), req:x.reqTxt || "", lv:x.lv, wand:x.wand, svg:x.svg, grp: x.lv != null ? 0 : String(x.id).startsWith("bg_p") ? 2 : 1})))
    .map((x,i)=>Object.assign({i}, x)).sort((a,b)=>((a.grp == null ? -1 : a.grp) - (b.grp == null ? -1 : b.grp)) || ((a.lv || 0) - (b.lv || 0)) || (a.i - b.i));''', 1)
# Zimmer-Dialog: Hintergrund-Abschnitt raus (hat jetzt einen eigenen Knopf)
_o = "    ${bgHTML(T)}\n    ${RR.ROOM_SLOTS.map(sl=>{"
assert _o in portal
portal = portal.replace(_o, "    ${RR.ROOM_SLOTS.map(sl=>{", 1)
_o = "const BL = bgList(T), nOpen = RR.ROOM.filter(x=>roomOpen(x, li)).length + BL.filter(x=>x.open).length, nAll = RR.ROOM.length + BL.length;"
assert _o in portal
portal = portal.replace(_o, "const nOpen = RR.ROOM.filter(x=>roomOpen(x, li)).length, nAll = RR.ROOM.length;", 1)
_o = 'Neues gibt es mit höheren Leveln und für Diplome aus den Modulen.</p>'
assert _o in portal
portal = portal.replace(_o, 'Neues gibt es mit höheren Leveln und für Diplome aus den Modulen. Den Hintergrund wählst du rechts unter «Hintergrund».</p>', 1)
# Dialog «Hintergrund»
_o = "function pickBg(id){"
assert _o in portal
portal = portal.replace(_o, r'''function bgThumb(x){
  const w = x.id === "pixel" ? ["#241052","#4B2696"] : x.id === "chalet" ? ["#6B3F1F","#9C6534"] : (x.wand || ["#241052","#4B2696"]), u = "bgt_" + String(x.id).replace(/[^\w-]/g, "");
  return `<svg viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${u}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${w[0]}"/><stop offset="1" stop-color="${w[1] || w[0]}"/></linearGradient></defs><rect width="160" height="64" fill="url(#${u})"/>${x.svg || (x.id === "chalet" ? '<path d="M0 40h160M0 52h160M40 28v36M120 28v36" stroke="#4A2A12" stroke-width="2"/>' : "")}</svg>`;
}
function bgsHTML(){
  const s = student(D.me), T = totalsFor(s.id), li = LIB.levelOf(T.stars), L = bgList(T), cur = window.GLAB_ROOMBG || "pixel", NW = NEWSET.bg || new Set();
  const show = vfSort(L.filter(x=>vfShow("bg", x.open, cur === x.id)), x=>x.open), nOpen = L.filter(x=>x.open).length;
  const nx = L.filter(x=>!x.open && x.lv != null && x.lv > li).sort((a,b)=>a.lv - b.lv)[0];
  const need = nx && LIB.LEVELS[nx.lv] ? Math.max(0, LIB.LEVELS[nx.lv].s - T.stars) : 0;
  return `<div class="wd-box" role="dialog" aria-modal="true" aria-labelledby="ptBgT">
    <div class="wd-head"><div><small>${esc(s.n)} · Level ${li+1}</small><h2 id="ptBgT">Hintergrund</h2><p>Wähle den Hintergrund für gLiTChs Zimmer. Neue gibt es mit den Leveln, für Module und für Prestige.</p></div>
      <button type="button" class="btn" data-pt="bgs-close">Fertig</button></div>
    ${vfBar("bg", nOpen, L.length)}${nx ? `<div class="vf-next"><span aria-hidden="true">🎁</span><span><b>Nächster Hintergrund:</b> ${nx.ic} ${esc(nx.n)}<small>ab Level ${nx.lv + 1}${need ? ` · noch ${need} ★` : ""}</small></span></div>` : ""}
    ${show.length ? `<div class="bg-grid">${show.map(x=>`<button type="button" class="bg-card${cur === x.id ? " on" : ""}${x.open ? "" : " locked"}" data-pt="bg-${x.id}" ${x.open ? "" : 'aria-disabled="true"'} aria-pressed="${cur === x.id}">${vfNew(NW.has("bg:" + x.id))}<span class="bg-th">${bgThumb(x)}</span><b>${x.ic} ${esc(x.n)}</b><small>${x.open ? (cur === x.id ? "aktiv" : "antippen") : esc(x.req)}</small>${x.open ? "" : '<span class="wd-lock" aria-hidden="true"></span>'}</button>`).join("")}</div>` : vfEmpty("bg")}
  </div>`;
}
function openBgs(){
  closeOv("ptBg"); const T = totalsFor(D.me), p = prog(D.me), ids = bgList(T).filter(x=>x.open).map(x=>"bg:" + x.id);
  const had = Array.isArray(p.seenB) ? new Set(p.seenB) : null; NEWSET.bg = had ? new Set(ids.filter(i=>!had.has(i))) : new Set(); p.seenB = ids; saveD();
  const ov = document.createElement("div"); ov.className = "wd-ov"; ov.id = "ptBg"; ov.innerHTML = bgsHTML();
  document.body.appendChild(ov); document.body.style.overflow = "hidden"; ov.querySelector('[data-pt="bgs-close"]').focus({preventScroll:true});
}
(function(){ if (document.getElementById("bgCss")) return; const st = document.createElement("style"); st.id = "bgCss";
  st.textContent = ".bg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:6px}"
  + ".bg-card{all:unset;box-sizing:border-box;cursor:pointer;position:relative;display:grid;gap:4px;padding:8px;border-radius:14px;background:#2A0F66;border:2px solid #4A23A0;text-align:center}"
  + ".bg-card.on{border-color:#FFC21A;box-shadow:0 0 0 2px rgba(255,194,26,.35)}.bg-card:focus-visible{outline:3px solid #00E5FF;outline-offset:2px}"
  + ".bg-th{display:block;aspect-ratio:160/64;border-radius:9px;overflow:hidden;background:#14062E}.bg-th svg{width:100%;height:100%;display:block}"
  + ".bg-card b{font:800 .86rem/1.2 system-ui,sans-serif}.bg-card small{font-size:.74rem;opacity:.8}.bg-card.locked .bg-th{filter:grayscale(.7) brightness(.55)}.bg-card.locked b{opacity:.7}";
  (document.head || document.documentElement).appendChild(st); })();
''' + _o, 1)
_o = "  const ov = document.getElementById(\"ptRm\"); if (ov){ const sc = ov.scrollTop; ov.innerHTML = roomHTML(); ov.scrollTop = sc; }\n}"
assert _o in portal, "pickBg Ende"
portal = portal.replace(_o, "  const ov = document.getElementById(\"ptRm\"); if (ov){ const sc = ov.scrollTop; ov.innerHTML = roomHTML(); ov.scrollTop = sc; }\n  const ob = document.getElementById(\"ptBg\"); if (ob){ const sc = ob.scrollTop; ob.innerHTML = bgsHTML(); ob.scrollTop = sc; render(); }\n}", 1)
_o = "const el = document.querySelector('[data-pt=\"bg-chalet\"]');"
# Knopf in der Leiste
_o = '${railBtn("lexikon", "📖", "Lexikon", "als PDF", false, "#8B5CFF", 4)}'
assert _o in portal
portal = portal.replace(_o, '${railBtn("bgs", "🖼️", "Hintergrund", `${bgList(T).filter(x=>x.open).length} / ${bgList(T).length}`, bgList(T).filter(x=>x.open).length > ((prog(D.me).seenB || []).length || 99), "#00E5FF", 4)}\n        ' + _o, 1)
_o = '  if (a === "diplome") return openDiplomas();'
assert _o in portal
portal = portal.replace(_o, _o + '\n  if (a === "bgs") return openBgs();\n  if (a === "bgs-close"){ closeOv("ptBg"); render(); return; }', 1)
_o = 'seenW: p.seenW || null, seenR: p.seenR || null,'
assert _o in portal
portal = portal.replace(_o, 'seenW: p.seenW || null, seenR: p.seenR || null, seenB: p.seenB || null,', 1)
_o = 'window.GLAB_VF = window.GLAB_VF || {wd:"mine", rm:"mine"};'
assert _o in portal
portal = portal.replace(_o, 'window.GLAB_VF = window.GLAB_VF || {wd:"mine", rm:"mine", bg:"all"};', 1)
_o = '''const ov = document.getElementById(kind === "wd" ? "ptWd" : "ptRm"); if (ov){ const sc = ov.scrollTop; ov.innerHTML = kind === "wd" ? wardrobeHTML() : roomHTML(); ov.scrollTop = sc; } });'''
assert _o in portal
portal = portal.replace(_o, '''const ov = document.getElementById(kind === "wd" ? "ptWd" : kind === "bg" ? "ptBg" : "ptRm"); if (ov){ const sc = ov.scrollTop; ov.innerHTML = kind === "wd" ? wardrobeHTML() : kind === "bg" ? bgsHTML() : roomHTML(); ov.scrollTop = sc; } });''', 1)

# ---------- Umbau: «Hintergrund» = Hintergrund der ganzen Seite (Level und Prestige), Zimmer behält seine eigenen ----------
_isSite = 'const isSiteBg = id => /^bg_(l|p)\\d/.test(String(id));\n'
_o = "function bgList(T){\n  return [{id:\"pixel\""
assert _o in portal
portal = portal.replace(_o, _isSite + "function bgList(T, site){\n  if (site) return [{id:\"std\", n:\"Standard\", ic:\"🌌\", open:true, req:\"\", grp:-1}].concat(CU.bgs.filter(x=>isSiteBg(x.id)).map(x=>({id:x.id, n:x.n, ic:x.ic || \"🖼️\", open:bgOpen(x, T), req:x.reqTxt || \"\", lv:x.lv, wand:x.wand, svg:x.svg, grp: String(x.id).startsWith(\"bg_p\") ? 2 : 0}))).map((x,i)=>Object.assign({i}, x)).sort((a,b)=>(a.grp - b.grp) || ((a.lv || 0) - (b.lv || 0)) || (a.i - b.i));\n  return [{id:\"pixel\"", 1)
_o = '    .concat(CU.bgs.map(x=>({id:x.id, n:x.n, ic:x.ic || "🖼️", open:bgOpen(x, T), req:x.reqTxt || "", lv:x.lv, wand:x.wand, svg:x.svg, grp:'
assert _o in portal
portal = portal.replace(_o, '    .concat(CU.bgs.filter(x=>!isSiteBg(x.id)).map(x=>({id:x.id, n:x.n, ic:x.ic || "🖼️", open:bgOpen(x, T), req:x.reqTxt || "", lv:x.lv, wand:x.wand, svg:x.svg, grp:', 1)
# Zimmer: Hintergrund-Abschnitt wieder da (nur Zimmer-Hintergründe)
_o = "    ${RR.ROOM_SLOTS.map(sl=>{\n      const its = RR.ROOM.filter(x=>x.slot === sl.id), cur = its.find(x=>items[sl.id] === x.id), isOpen = x=>roomOpen(x, li);"
assert _o in portal
portal = portal.replace(_o, "    ${bgHTML(T)}\n" + _o, 1)
portal = portal.replace(' Den Hintergrund wählst du rechts unter «Hintergrund».</p>', ' Unter «Hintergrund» rechts wählst du den Hintergrund der ganzen Seite.</p>', 1)
# Dialog «Hintergrund»: Seiten-Hintergründe
_o = 'const s = student(D.me), T = totalsFor(s.id), li = LIB.levelOf(T.stars), L = bgList(T), cur = window.GLAB_ROOMBG || "pixel", NW = NEWSET.bg || new Set();'
assert _o in portal
portal = portal.replace(_o, 'const s = student(D.me), T = totalsFor(s.id), li = LIB.levelOf(T.stars), L = bgList(T, true), cur = window.GLAB_SITEBG || "std", NW = NEWSET.bg || new Set();', 1)
_o = '<p>Wähle den Hintergrund für gLiTChs Zimmer. Neue gibt es mit den Leveln, für Module und für Prestige.</p>'
assert _o in portal
portal = portal.replace(_o, '<p>Wähle den Hintergrund für die ganze Seite. Neue gibt es mit den Leveln und mit Prestige. Den Hintergrund von gLiTChs Zimmer wählst du unter «Zimmer».</p>', 1)
_o = '<button type="button" class="bg-card${cur === x.id ? " on" : ""}${x.open ? "" : " locked"}" data-pt="bg-${x.id}"'
assert _o in portal
portal = portal.replace(_o, '<button type="button" class="bg-card${cur === x.id ? " on" : ""}${x.open ? "" : " locked"}" data-pt="sbg-${x.id}"', 1)
_o = 'const w = x.id === "pixel" ? ["#241052","#4B2696"]'
assert _o in portal
portal = portal.replace(_o, 'const w = x.id === "pixel" || x.id === "std" ? ["#241052","#4B2696"]', 1)
_o = "function openBgs(){\n  closeOv(\"ptBg\"); const T = totalsFor(D.me), p = prog(D.me), ids = bgList(T).filter"
assert _o in portal
portal = portal.replace(_o, r'''function pickSiteBg(id){
  const T = totalsFor(D.me), x = bgList(T, true).find(b=>b.id === id); if (!x) return;
  if (!x.open){ const el = document.querySelector(`[data-pt="sbg-${id}"]`); if (el) el.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}], {duration:300}); return; }
  window.GLAB_SITEBG = id === "std" ? "" : id; saveD();
  const ob = document.getElementById("ptBg"); if (ob){ const sc = ob.scrollTop; ob.innerHTML = bgsHTML(); ob.scrollTop = sc; }
}
''' + "function openBgs(){\n  closeOv(\"ptBg\"); const T = totalsFor(D.me), p = prog(D.me), ids = bgList(T, true).filter", 1)
_o = '${railBtn("bgs", "🖼️", "Hintergrund", `${bgList(T).filter(x=>x.open).length} / ${bgList(T).length}`, bgList(T).filter(x=>x.open).length > ((prog(D.me).seenB || []).length || 99),'
assert _o in portal
portal = portal.replace(_o, '${railBtn("bgs", "🖼️", "Hintergrund", `${bgList(T, true).filter(x=>x.open).length} / ${bgList(T, true).length}`, bgList(T, true).filter(x=>x.open).length > ((prog(D.me).seenB || []).length || 99),', 1)
_o = '  if (a === "bgs") return openBgs();'
portal = portal.replace(_o, _o + '\n  if (a && a.startsWith("sbg-")) return pickSiteBg(a.slice(4));', 1)
_o = 'seenB: p.seenB || null,'
portal = portal.replace(_o, 'seenB: p.seenB || null, siteBg: window.GLAB_SITEBG || "",', 1)
_o = 'window.GLAB_ROOMBG = (ctx && ctx.extras && (ctx.extras.bg === "chalet" || CU.bgs.some(b=>b.id === ctx.extras.bg))) ? ctx.extras.bg : "pixel";'
assert _o in portal
portal = portal.replace(_o, 'window.GLAB_ROOMBG = (ctx && ctx.extras && (ctx.extras.bg === "chalet" || CU.bgs.some(b=>b.id === ctx.extras.bg && !/^bg_(l|p)\\d/.test(b.id)))) ? ctx.extras.bg : "pixel";\nwindow.GLAB_SITEBG = (ctx && ctx.extras && ctx.extras.siteBg) || "";', 1)
