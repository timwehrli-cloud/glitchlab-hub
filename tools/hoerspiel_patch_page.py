# Patch für lab/index.html: Deutsch-Module (lab/hoerspiel.js) im NMG-Ablauf (GLAB_GE).
# Wird von build_lab.py auf `page` ausgeführt; kann auch direkt laufen: python3 tools/hoerspiel_patch_page.py
# Idempotent.
import re as _re, pathlib as _pl

def hoerspiel_patch(page):
    if "hoerspiel.js" not in page:
        a = "Object.assign(window.GLAB_GE_MODS, window.GLAB_GE_MODS2);"
        i = page.index(a); j = page.index("</script>", i) + len("</script>")
        page = page[:j] + '\n<script src="hoerspiel.js"></script>' + page[j:]
    if "function geBadge(){" not in page:
        k = page.index('<span class="nmg-badge" aria-label="NMG">')
        e = page.index("</svg></span>", k) + len("</svg></span>")
        orig = page[k:e]
        page = page[:k] + "${geBadge()}" + page[e:]
        s = page.rfind("function shell(){", 0, k)
        de = ('<span class="nmg-badge de-badge" aria-label="Deutsch"><svg viewBox="0 0 60 22" aria-hidden="true">'
              '<rect x="0" y="0" width="60" height="22" rx="3" fill="#F28C28"/>'
              '<path d="M0 22 L12 13 L20 17 L31 9 L42 16 L60 11 L60 22Z" fill="#C2621A"/>'
              '<text x="30" y="16.5" text-anchor="middle" font-family="Silkscreen, monospace" font-size="13" fill="#fff">DE</text></svg></span>')
        fn = 'function geBadge(){ return (M && M.fach === "de") ? `' + de + '` : `' + orig.replace("`", "\\`") + '`; }\n'
        page = page[:s] + fn + page[s:]
    if "M.fachKurz" not in page: page = page.replace("gLiTCh-Lab NMG", "gLiTCh-Lab ${M.fachKurz || \"NMG\"}", 2)
    page = page.replace('Object.assign({}, m, {fach:"nmg"})', 'Object.assign({}, m, {fach: m.fach || "nmg"})')
    page = page.replace('const FACH = {mi:"Medien & Informatik", nmg:"Natur, Mensch, Gesellschaft"};',
                        'const FACH = {mi:"Medien & Informatik", nmg:"Natur, Mensch, Gesellschaft", de:"Deutsch"};')
    # Eigenes Futter pro Modul (M.foods), sonst das Schweizer Essen
    page = page.replace("const S = o.state, foods = BFOODS.map(", "const S = o.state, foods = (o.foods || BFOODS).map(", 1)
    page = page.replace('B = window.GLAB_BUDDY({prefix:"ge", state:()=>BD,', 'B = window.GLAB_BUDDY({prefix:"ge", foods:M.foods, state:()=>BD,', 1)
    return page

HSP_PORTAL = '  {id:"hsp_tonstudio", live:true, n:"Auftakt: Im Tonstudio", y:"Deutsch · Spektakel fürs Ohr", d:"Wie entsteht ein Hörspiel? Wer spricht, wer coacht, wer schneidet? Am Schluss gestaltet ihr ein Hörspiel-Plakat.", c:"#F28C28", c2:"#4A1D00",\n   i:\'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8 21h8"/>\'},\n  {id:"hsp_geschichte", live:true, n:"Alles beginnt mit einer guten Geschichte", y:"Deutsch · Audio 1", d:"Vom Buch zum Hörspiel: «Norde isch, wo obe isch» mit Paul und Mel. Am Schluss schreibt ihr eine Hörspiel-Kritik.", c:"#1FA3C7", c2:"#06364A",\n   i:\'<path d="M3 16h18l-3 4H6zM12 4v12M12 5l6 8h-6"/>\'},\n  {id:"hsp_skript", live:true, n:"Das Hörspielskript", y:"Deutsch · Audio 2", d:"Finn und Jola fahren Traktor: Regieanweisungen verstehen und ein eigenes Mini-Skript schreiben.", c:"#E0533A", c2:"#4A1208",\n   i:\'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h3M13 7h3M8 11h3M13 11h3M8 15h3M13 15h2"/>\'}'

def hoerspiel_portal(js):
    # Die drei Deutsch-Module in der Modulliste von hub-portal.js (nach «ebenen»)
    if "hsp_tonstudio" in js: return js
    a = js.index('{id:"ebenen"'); e = js.index("\n];", a)
    return js[:e] + ",\n" + HSP_PORTAL + js[e:]

_root = _pl.Path(__file__).resolve().parent.parent if "__file__" in globals() else _pl.Path.cwd()
if "page" in globals():
    page = hoerspiel_patch(page)
    _pp = _pl.Path(globals().get("out_dir", _root / "lab")) / "hub-portal.js"
    if _pp.exists(): _pp.write_text(hoerspiel_portal(_pp.read_text(encoding="utf-8")), encoding="utf-8")
elif __name__ == "__main__":
    for name, fn in (("index.html", hoerspiel_patch), ("hub-portal.js", hoerspiel_portal)):
        p = _root / "lab" / name
        p.write_text(fn(p.read_text(encoding="utf-8")), encoding="utf-8")
    print("ok")
