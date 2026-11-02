import pathlib
S = pathlib.Path(__file__).parent / "src"
t = (S / "editor.html").read_text(encoding="utf-8")
rep = {"/*@GLITCH_CSS@*/": (S / "glitch.css").read_text(encoding="utf-8"), "/*@RUNTIME_CSS@*/": (S / "runtime.css").read_text(encoding="utf-8"),
       "/*@GLITCH_JS@*/": (S / "glitch.js").read_text(encoding="utf-8") + "\n" + (S / "wallart.js").read_text(encoding="utf-8") + "\n" + (S / "mascot.js").read_text(encoding="utf-8"), "/*@RUNTIME_JS@*/": (S / "runtime.js").read_text(encoding="utf-8"),
       "/*@EDITOR_JS@*/": (S / "editor.js").read_text(encoding="utf-8")}
for k, v in rep.items():
    assert "</script" not in v.lower(), k
    assert k in t, k
    t = t.replace(k, v)
out = pathlib.Path(__file__).parent / "dist"; out.mkdir(exist_ok=True)
(out / "glitch-editor.html").write_text(t, encoding="utf-8")
print("ok", len(t))
