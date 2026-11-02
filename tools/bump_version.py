"""Setzt eine neue Versionsnummer, damit Browser nach einem Update sofort die neuen Dateien laden
(statt bis zu 10 Minuten die alten aus dem Zwischenspeicher zu zeigen).
Aufruf vor jedem Hochladen: python3 tools/bump_version.py"""
import pathlib, re, time
root = pathlib.Path(__file__).resolve().parent.parent
v = time.strftime("%Y%m%d%H%M")
idx = root / "index.html"; s = idx.read_text(encoding="utf-8")
s = re.sub(r'((?:src|href)="(?:js|css)/[^"?]+\.(?:js|css))(?:\?v=\w+)?"', rf'\1?v={v}"', s)
s = re.sub(r'<script>window\.GL_V = "\w*";</script>\n?', "", s)
s = s.replace('<script src="js/config.js', f'<script>window.GL_V = "{v}";</script>\n<script src="js/config.js', 1)
idx.write_text(s, encoding="utf-8")
lab = root / "lab" / "index.html"; t = lab.read_text(encoding="utf-8")
t = re.sub(r'<script src="hub-portal\.js(?:\?v=\w+)?"', f'<script src="hub-portal.js?v={v}"', t)
lab.write_text(t, encoding="utf-8")
print("Version", v)
