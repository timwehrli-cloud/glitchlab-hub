import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from spec import MODS, OPT
from playwright.sync_api import sync_playwright
OUT = "/home/claude/glitchlab-hub/games/hoerspiel"; os.makedirs(OUT, exist_ok=True)
ED = open("/home/claude/glitchlab-hub/editor/glitch-editor.html", encoding="utf-8").read()
res = {}
with sync_playwright() as pw:
    b = pw.chromium.launch(); errs = []
    for M in MODS:
        p = b.new_page(); p.on("pageerror", lambda e: errs.append(str(e)[:200]))
        p.route("**fonts.g*/**", lambda r: r.abort()); p.route("**cdnjs**", lambda r: r.abort())
        p.route("**/editor/glitch-editor.html", lambda r: r.fulfill(body=ED, content_type="text/html; charset=utf-8"))
        p.goto("http://localhost:8765/editor/glitch-editor.html"); p.wait_for_timeout(500)
        D = dict(typenV2=True, typenV3=True, titel=M["titel"], fach="de", hubThema="", hubNeu="Spektakel fürs Ohr", klasse="6", minuten=M["minuten"], etappen=str(len(M["inhalt"])), rahmen="auto", ideen="", material=[], links="", belIdeen="",
                 diplome=M["diplome"], outfits=[], emotes=[], zimmer=[], hintergruende=[], skins=[], plan=M["plan"], inhalt=M["inhalt"], step=4, opt=OPT, art="modul", sterne="")
        p.evaluate("d => localStorage.setItem('gle.draft.v1', JSON.stringify(d))", D); p.reload(); p.wait_for_timeout(1200)
        p.click('.step[data-step="4"]'); p.wait_for_timeout(1500)
        html = p.evaluate("document.getElementById('pv').srcdoc")
        assert html and len(html) > 1000, M["key"]
        open(f"{OUT}/{M['key']}.html", "w", encoding="utf-8").write(html)
        man = p.evaluate("""h => { const d = new DOMParser().parseFromString(h, 'text/html'); return JSON.parse(d.querySelector('#glitchlab-modul').textContent); }""", html)
        res[M["key"]] = dict(aufgaben=man["aufgaben"], sterne=man["sterne"])
        p.close()
    print(json.dumps(res, ensure_ascii=False)); print("errs", errs)
