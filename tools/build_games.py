"""Baut games/<spiel>/index.html aus einem Abenteuer-Game (Einzeldatei) und hängt eine kleine Brücke zum Glitchlab an.
Aufruf: python3 tools/build_games.py <game.html> [wueste|dschungel|tundra|lava]
- Der Spielstand wird pro Team gespeichert (statt fix im Browser).
- Die Gruppe wird mit den Namen aus dem Glitchlab vorausgefüllt.
- Pro Level gibt es bis zu 10 Sterne (Wasserstand / 10)."""
import sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
GAME = sys.argv[2] if len(sys.argv) > 2 else "wueste"
KEYS = {"wueste": ("wuestenGame.v2", "wuestenGame.v1"), "dschungel": ("dschungelGame.v1", "dschungelGame.v1.old"),
        "tundra": ("tundraGame.v1", "tundraGame.v1.old"), "lava": ("lavaGame.v1", "lavaGame.v1.old")}
K2, K1 = KEYS[GAME]
assert K2 in src and K1 in src, "Speicher-Schlüssel nicht gefunden"
out = pathlib.Path(__file__).resolve().parent.parent / "games" / GAME
out.mkdir(parents=True, exist_ok=True)
pre = """<script>
/* Brücke zum Glitchlab (Teil 1): Spielstand pro Team */
(function(){ var HB = null; try { HB = window.parent !== window && window.parent.GLHubBridge; } catch(e){}
  if (!HB) return; var ctx = HB.context("@G"); window.__GLCTX = ctx; var K = ctx.workKey("@G");
  var gi = Storage.prototype.getItem, si = Storage.prototype.setItem;
  var map = function(k){ return k === "@K2" ? K : k === "@K1" ? K + ".alt" : k; };
  Storage.prototype.getItem = function(k){ return gi.call(this, map(k)); };
  Storage.prototype.setItem = function(k, v){ return si.call(this, map(k), v); };
})();
</script>
"""
post = """<script>
/* Brücke zum Glitchlab (Teil 2): Namen vorausfüllen und Sterne melden */
(function(){ var HB = null; try { HB = window.parent !== window && window.parent.GLHubBridge; } catch(e){}
  var ctx = window.__GLCTX; if (!HB || !ctx) return;
  var W = window.__WG; if (!W) return;
  try {
    var S = W.S;
    if (!S.group.members.some(function(m){ return m && m.trim(); })) {
      var names = [ctx.me.n].concat(ctx.team.map(function(t){ return t.n; }));
      S.group.nr = ctx.group; S.group.members = names.concat(["", "", "", ""]).slice(0, Math.max(4, names.length));
      W.save(); W.render();
    }
    if ("name" in S.group && !String(S.group.name || "").trim()) { S.group.name = ctx.me.n; W.save(); W.render(); }
  } catch(e){}
  var best = {};
  setInterval(function(){
    try {
      var w = W.water(), st = Math.max(0, Math.min(10, Math.floor(w / 10))), lv = W.G.level;
      if (st > (best[lv] || 0)) { best[lv] = st; HB.score("de-@G", "level" + lv, st); }
    } catch(e){}
  }, 3000);
})();
</script>
"""
pre = pre.replace("@G", GAME).replace("@K2", K2).replace("@K1", K1)
post = post.replace("@G", GAME)
# Spielzustand für die Brücke sichtbar machen (das Spiel steckt in einer Funktion)
end = src.rindex("</script>")
k = src.rindex("})();", 0, end)
src = src[:k] + "window.__WG = { get S(){ return S; }, get G(){ return G; }, save: save, render: render, waterParts: waterParts, water: water };\n" + src[k:]
i = src.index("<body>") + len("<body>")
page = src[:i] + "\n" + pre + src[i:]
j = page.rindex("</body>") if "</body>" in page else len(page)
page = page[:j] + post + page[j:]
(out / "index.html").write_text(page, encoding="utf-8")
print("ok", len(page))
