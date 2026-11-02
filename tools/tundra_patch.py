# Wird von build_games.py ausgeführt (exec), wenn das Tundra-Game gebaut wird.
# Stufe 2 «Meine Meinung»: Knopf «Auflösen» mit Musterlösung (zeigen, einsetzen; eingesetzt zählt halb für den Tank)
def _rep(a, b):
    global src
    assert src.count(a) == 1, "Tundra-Patch: Stelle nicht gefunden: " + a[:60]
    src = src.replace(a, b)

_rep("R.meinung=()=>{", r"""const SOLVE_ORDER=["zu","wider","erg","frag"];
const SOLVE_OP="Ich finde, dass es Vorteile und Nachteile hat, weil nicht alle Kinder gleich sind.";
function solveTxt(f,id){const w=f.who;return id==="zu"?`Da hast du recht, ${w}, denn das sehe ich genauso.`:id==="wider"?`Das sehe ich anders, ${w}, weil man das nicht für alle Kinder so sagen kann.`:id==="erg"?`Du hast gesagt: «${f.t}» Dazu möchte ich ergänzen, dass es auf die Situation ankommt.`:`Wie meinst du das, ${w}? Kannst du ein Beispiel nennen?`}
function solveBox(name){S.opShow=S.opShow||{};if(!S.opShow[name])return `<div class="row" style="margin:0 0 10px"><button class="btn small" data-a="opSolve">💡 Auflösen: Musterlösung zeigen</button></div>`;
 return `<div class="box solid solvebox"><h3>💡 Musterlösung</h3><p class="hint" style="margin:0 0 8px">So könntest du reagieren. Jede Art kommt genau einmal vor. Eigene Sätze sind noch besser!</p>
 <ol class="solve-l">${CUR.fit.map((f,k)=>{const id=SOLVE_ORDER[k%4];const t=T_TECH.find(x=>x.id===id);return `<li><b>${esc(f.who)}</b> → <span class="rmtag">${esc(t.t)}</span><br>«${esc(solveTxt(f,id))}»</li>`}).join("")}</ol>
 <p class="hint" style="margin:8px 0">Deine Meinung, zum Beispiel: «${esc(SOLVE_OP)}»</p>
 <div class="row"><button class="btn small" data-a="opFill">Musterlösung einsetzen</button><button class="btn small" data-a="opSolve">Ausblenden</button><span class="hint">Eingesetzte Antworten zählen nur halb für den Tank.</span></div></div>`}
R.meinung=()=>{""")
_rep('Jede Art genau einmal!</p>', 'Jede Art genau einmal!</p>${solveBox(name)}')
_rep(' if(a==="opUncover"){S.opCover=false;save();render();say(TIPS.meinung);return}',
     ' if(a==="opUncover"){S.opCover=false;save();render();say(TIPS.meinung);return}\n'
     ' if(a==="opSolve"||a==="opFill"){const ms=members(),n=ms[Math.min(S.opIdx||0,ms.length-1)];if(!n)return;S.op=S.op||{};\n'
     '  if(a==="opSolve"){S.opShow=S.opShow||{};S.opShow[n]=!S.opShow[n];save();render();return}\n'
     '  const o=S.op[n]||(S.op[n]={side:"",text:"",fit:{}});o.fit=o.fit||{};o.solved=true;if(!o.side)o.side="Teils, teils";if(!opOk(o.text))o.text=SOLVE_OP;\n'
     '  CUR.fit.forEach((f,k)=>{const id=SOLVE_ORDER[k%4];o.fit[k]={tech:id,text:solveTxt(f,id)}});save();render();say("Die Musterlösung ist eingesetzt. Ändere sie ruhig in deine eigenen Worte!");return}')
_rep('if(fx&&fx.tech&&(fx.text||"").trim().length>=15)b++', 'if(fx&&fx.tech&&(fx.text||"").trim().length>=15)b+=o.solved?.5:1')
_rep("</style>", ".solvebox{border:2px dashed var(--e2);margin:0 0 14px}.solve-l{margin:0;padding-left:20px}.solve-l li{margin:8px 0;line-height:1.4}\n</style>")
