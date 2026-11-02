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
