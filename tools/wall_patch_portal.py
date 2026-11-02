# Diplome aus M&I (Prompt-Labor, Fake-News, KI-Bilder) und aus hochgeladenen Modulen
# werden – wie die NMG-Diplome – Gegenstände ohne Hintergrund, die an der Chalet-Wand hängen.
# Läuft innerhalb von build_lab.py (Variable `portal`).
import math

def _gear(cx, cy, r1, r2, n=8):
    pts = []
    for k in range(n * 2):
        a0 = math.pi * k / n
        r = r2 if k % 2 == 0 else r1
        for da in (-math.pi / n * .42, math.pi / n * .42):
            pts.append(f"{cx + r * math.cos(a0 + da):.2f} {cy + r * math.sin(a0 + da):.2f}")
    return "M" + "L".join(pts) + "z"

def _star(cx, cy, ro, ri):
    pts = []
    for k in range(10):
        a = -math.pi / 2 + math.pi * k / 5
        r = ro if k % 2 == 0 else ri
        pts.append(f"{cx + r * math.cos(a):.2f} {cy + r * math.sin(a):.2f}")
    return "M" + "L".join(pts) + "z"

NAIL = '<circle cx="10" cy="1.2" r=".8" fill="#3A2410"/>'
def STR(x1, x2, y): return f'<path d="M{x1} {y}L10 1.2L{x2} {y}" stroke="#3A2410" stroke-width=".35" fill="none"/>'
def FRAME(inner, c="#7A4A22"): return STR(4, 16, 5) + f'<rect x="2.5" y="5" width="15" height="13" rx=".6" fill="{c}"/><rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#F6EFDF"/>' + inner + NAIL
SHELF = '<rect x="2.4" y="16" width="15.2" height="1.3" rx=".3" fill="#8B5A2B"/><path d="M4.4 17.3l1.4 1.6M15.6 17.3l-1.4 1.6" stroke="#5D3A1A" stroke-width=".6"/>'
def SPARK(x, y, d=0): return f'<path class="wl-flake" style="animation-delay:-{d}s" d="M{x} {y-.9}v1.8M{x-.9} {y}h1.8" stroke="#FFF3B0" stroke-width=".35"/>'

W = {
  # ---------- Prompt-Labor ----------
  "erfinder": '<g class="wl-sway"><path d="M10 1.2V6.2" stroke="#3A2410" stroke-width=".4"/><rect x="8.5" y="6" width="3" height="2.2" rx=".4" fill="#7A7F8C"/><path d="M8.5 7h3M8.5 7.7h3" stroke="#5A6475" stroke-width=".25"/>'
              '<circle cx="10" cy="12.4" r="4.3" fill="#FFE680" stroke="#C98A00" stroke-width=".4"/><path d="M8.3 12.6l.85-1.2.85 1.2.85-1.2.85 1.2" stroke="#C98A00" stroke-width=".4" fill="none"/>'
              '<path d="M8 10.2a2.6 2.6 0 0 1 1.6-1.4" stroke="#fff" stroke-width=".5" fill="none"/></g>'
              '<g class="wl-glow"><path d="M3 12.4h-1.4M18.4 12.4H17M4.4 7.4l-1-1M15.6 7.4l1-1M4.4 17.4l-1 1M15.6 17.4l1 1" stroke="#FFC21A" stroke-width=".6"/></g>',
  "namen": '<g class="wl-sway">' + STR(5, 15, 6.5) + '<rect x="2.4" y="6.5" width="15.2" height="7.4" rx="1" fill="#C68A4E" stroke="#7A4A22" stroke-width=".5"/><path d="M3.4 8.4h13.2M3.4 12h13.2" stroke="#A86F38" stroke-width=".3"/>'
           '<text x="10" y="11.6" font-size="3.6" font-weight="800" text-anchor="middle" fill="#3A2410" font-family="system-ui,sans-serif">ABC</text></g>' + SPARK(16.6, 15.8, .4) + NAIL,
  "logo": FRAME(f'<rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#2A1A4A"/><path d="{_star(10, 11.6, 4, 1.7)}" fill="#FFC21A" stroke="#C98A00" stroke-width=".3"/>' + SPARK(5.6, 8, 0) + SPARK(14.4, 15, 1.2) + SPARK(14.6, 8.2, .6), "#5D3A1A"),
  "daten": STR(6, 14, 4.6) + '<g class="wl-sway"><path d="M10 4.4l5.2 1.9v4.2c0 3.6-2.5 5.9-5.2 7.1-2.7-1.2-5.2-3.5-5.2-7.1V6.3z" fill="#1F9D68" stroke="#0F5A3A" stroke-width=".45"/>'
           '<path d="M10 5.6l4 1.5v3.4c0 2.8-1.9 4.6-4 5.6z" fill="#3CC48A"/><path d="M8.9 10.6V9.5a1.1 1.1 0 0 1 2.2 0v1.1" stroke="#FFC21A" stroke-width=".6" fill="none"/>'
           '<rect x="8.1" y="10.5" width="3.8" height="3.1" rx=".5" fill="#FFC21A" stroke="#C98A00" stroke-width=".3"/><circle cx="10" cy="11.8" r=".45" fill="#3A2410"/><path d="M10 12.1v.8" stroke="#3A2410" stroke-width=".3"/></g>' + NAIL,
  "buehne": FRAME('<rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#24123F"/><path class="wl-glow" d="M10 6.1 6.2 16.9h7.6z" fill="#FFF3B0" fill-opacity=".35"/>'
            '<path d="M3.6 6.1h4c-.6 3.4-.4 7 .6 10.8H3.6z" fill="#D52B1E"/><path d="M16.4 6.1h-4c.6 3.4.4 7-.6 10.8h4.6z" fill="#D52B1E"/><path d="M3.6 6.1h12.8v1.4H3.6z" fill="#A61E14"/>'
            '<rect x="3.6" y="15.6" width="12.8" height="1.3" fill="#8B5A2B"/><path class="wl-fly" d="M10 10.6l.5 1 1.1.1-.8.8.2 1.1-1-.5-1 .5.2-1.1-.8-.8 1.1-.1z" fill="#FFC21A"/>', "#5D3A1A"),
  "worte": STR(5, 15, 4) + '<rect x="4.4" y="4" width="11.2" height="13.4" rx=".4" fill="#FFFDF6" stroke="#C9B79C" stroke-width=".4"/><path d="M6 7h7.2M6 9h8M6 11h6.4M6 13h7.2" stroke="#8A94A6" stroke-width=".4"/>'
           '<g class="wl-fly"><path d="M17.4 4.2c-3.4 1-5.6 4.4-7 9.4l.7.3c2-4.2 4.4-6.8 6.3-9.7z" fill="#E8F3FF" stroke="#5A6475" stroke-width=".3"/><path d="M17 4.6 10.8 13.8" stroke="#5A6475" stroke-width=".25"/><path d="M10.5 13.6l-.5 1.4" stroke="#2E3A55" stroke-width=".4"/></g>' + NAIL,
  "tester": '<rect x="4" y="3.6" width="12" height="15.2" rx="1" fill="#B5793F" stroke="#7A4A22" stroke-width=".4"/><rect x="5.2" y="5.4" width="9.6" height="12.2" fill="#fff"/><rect x="7.6" y="2.4" width="4.8" height="2.2" rx=".5" fill="#8A94A6" stroke="#5A6475" stroke-width=".3"/>'
            + "".join(f'<path class="wl-glow" style="animation-delay:-{k*.5}s" d="M6.1 {7.6+k*2.8}l.7.7 1.3-1.4" stroke="#1F9D68" stroke-width=".6" fill="none"/><path d="M9.4 {7.4+k*2.8}h4.2" stroke="#C9B79C" stroke-width=".5"/>' for k in range(4)) + NAIL.replace('cy="1.2"', 'cy="3.4"'),
  "bug": FRAME('<circle cx="10" cy="6.9" r=".55" fill="#DD4646"/><g class="wl-wig"><path d="M7.6 9.6 5.4 8.4M7.4 11.6H5M7.6 13.6l-2.2 1.2M12.4 9.6l2.2-1.2M12.6 11.6H15M12.4 13.6l2.2 1.2M9.4 7.6 8.4 6.6M10.6 7.6l1-1" stroke="#3A2410" stroke-width=".4" fill="none"/></g>'
              '<ellipse cx="10" cy="11.8" rx="2.6" ry="3.4" fill="#DD4646" stroke="#7A1E1E" stroke-width=".3"/><circle cx="10" cy="8.1" r="1.3" fill="#3A2410"/><path d="M10 8.9v6.3" stroke="#3A2410" stroke-width=".35"/>'
              '<circle cx="8.9" cy="10.8" r=".5" fill="#3A2410"/><circle cx="11.1" cy="11.4" r=".5" fill="#3A2410"/><circle cx="9" cy="13.2" r=".45" fill="#3A2410"/><circle cx="11" cy="13.6" r=".4" fill="#3A2410"/>', "#3A4A5A"),
  "feature": STR(7, 13, 6.4) + f'<g class="wl-spin"><path d="{_gear(10, 12, 3.6, 5)}" fill="#8A94A6" stroke="#5A6475" stroke-width=".35"/><circle cx="10" cy="12" r="2.6" fill="#5A6475"/></g>'
             '<path d="M9.4 10.4h1.2v1h1v1.2h-1v1h-1.2v-1h-1v-1.2h1z" fill="#FFC21A"/>' + NAIL,
  "zielgruppe": STR(5, 15, 6) + '<circle cx="10" cy="12" r="6.3" fill="#3A2410"/><circle cx="10" cy="12" r="5.5" fill="#fff"/><circle cx="10" cy="12" r="4.1" fill="#DD4646"/><circle cx="10" cy="12" r="2.7" fill="#fff"/><circle cx="10" cy="12" r="1.3" fill="#DD4646"/>'
                '<g class="wl-quiv"><path d="M10 12 16.2 5.8" stroke="#3A2410" stroke-width=".55"/><path d="M16.2 5.8l1.6-.4-.4 1.6-1.4.2zM15.4 5.2l.8-1.4.6 1z" fill="#2E6BE6"/></g>' + NAIL,
  "gourmet": '<g class="wl-sway"><rect x="9.2" y=".8" width="1.6" height="7.6" rx=".7" fill="#5D3A1A"/><circle cx="10" cy="1.9" r=".55" fill="#2A1A0E"/><circle cx="10" cy="13.4" r="5.2" fill="#2E2E36"/><circle cx="10" cy="13.4" r="4.2" fill="#4A4A55"/>'
             '<path d="M7.4 13.2c-.6-1.8 1-3 2.4-2.6 1.6-.8 3.4.4 2.8 2 .8 1.4-.6 3-2.2 2.6-1.4.8-3.2-.4-3-2z" fill="#fff"/><circle cx="10.1" cy="13.2" r="1.15" fill="#FFC21A"/><path class="wl-glow" d="M8 7.6c-.6-.8.4-1.4-.2-2.2M12 7.4c-.6-.8.4-1.4-.2-2.2" stroke="#E8E2D0" stroke-width=".35" fill="none"/></g>',
  "lexikon": SHELF + '<path d="M10 9c-2-1.3-4.6-1.5-6.8-.9v7.4c2.2-.6 4.8-.4 6.8.9 2-1.3 4.6-1.5 6.8-.9V8.1C14.6 7.5 12 7.7 10 9z" fill="#2E6BE6"/>'
             '<path d="M10 8.6c-1.8-1.1-4-1.3-6-.8v7.1c2-.5 4.2-.3 6 .8z" fill="#FFFDF6" stroke="#C9B79C" stroke-width=".25"/><path class="wl-wave" d="M10 8.6c1.8-1.1 4-1.3 6-.8v7.1c-2-.5-4.2-.3-6 .8z" fill="#FFFDF6" stroke="#C9B79C" stroke-width=".25"/>'
             '<path d="M5 9.4c1.4-.3 2.6-.1 3.8.4M5 11c1.4-.3 2.6-.1 3.8.4M5 12.6c1.4-.3 2.6-.1 3.8.4M11.2 9.8c1.2-.5 2.4-.7 3.8-.4M11.2 11.4c1.2-.5 2.4-.7 3.8-.4" stroke="#8A94A6" stroke-width=".3" fill="none"/>',
  "lexmeister": SHELF + '<rect x="4.4" y="13.6" width="11.2" height="2.4" rx=".3" fill="#D52B1E"/><rect x="5" y="11.2" width="10" height="2.4" rx=".3" fill="#2E6BE6"/><rect x="5.6" y="8.8" width="8.8" height="2.4" rx=".3" fill="#1F9D68"/>'
                '<path d="M14.8 14v1.6M14.2 11.6v1.6M13.8 9.2v1.6" stroke="#FFFDF6" stroke-width=".5"/><path d="M6 14.8h4M6.6 12.4h3.4M7.2 10h3" stroke="#FFC21A" stroke-width=".35"/>'
                '<g class="wl-fly"><path d="M6.4 7.6 6 3.6l2.2 1.8L10 2.6l1.8 2.8L14 3.6l-.4 4z" fill="#FFC21A" stroke="#C98A00" stroke-width=".3"/><circle cx="10" cy="5.8" r=".5" fill="#D52B1E"/></g>',
  "detektiv": '<g class="wl-sway"><path d="M10 1.2 8.8 5.4" stroke="#3A2410" stroke-width=".35"/><circle cx="8.6" cy="9.8" r="4.4" fill="#CFEAF7" stroke="#7A4A22" stroke-width="1"/><path d="M6.6 8.6a2.4 2.4 0 0 1 1.8-1.6" stroke="#fff" stroke-width=".6" fill="none"/>'
              '<path d="M11.8 13l4.4 4.4" stroke="#5D3A1A" stroke-width="1.8" stroke-linecap="round"/></g>' + NAIL,
  "tierfreund": FRAME('<ellipse cx="10" cy="13.6" rx="2.7" ry="2.2" fill="#C0705A"/><circle cx="6.8" cy="10.8" r="1.15" fill="#C0705A"/><circle cx="8.9" cy="9" r="1.15" fill="#C0705A"/><circle cx="11.1" cy="9" r="1.15" fill="#C0705A"/><circle cx="13.2" cy="10.8" r="1.15" fill="#C0705A"/>'
                      '<path class="wl-fly" d="M14.6 8.2c-.5-.6-1.4-.3-1.4.4 0 .7 1.4 1.5 1.4 1.5s1.4-.8 1.4-1.5c0-.7-.9-1-1.4-.4z" fill="#FF4F8B"/>', "#8B5A2B"),
  "meister": SHELF + '<path d="M6.4 4.6h7.2v3.2c0 2.4-1.6 4-3.6 4s-3.6-1.6-3.6-4z" fill="#F2C94C" stroke="#8B6914" stroke-width=".35"/><path d="M6.4 5.6H4.8c0 2 .8 3 2 3.2M13.6 5.6h1.6c0 2-.8 3-2 3.2" stroke="#C9A227" stroke-width=".55" fill="none"/>'
             '<rect x="9.3" y="11.6" width="1.4" height="2" fill="#C9A227"/><rect x="7.2" y="13.6" width="5.6" height="2.4" rx=".3" fill="#5D3A1A"/>' + f'<path d="{_star(10, 7.6, 1.6, .7)}" fill="#fff"/>' + SPARK(4.4, 3.4, 0) + SPARK(15.6, 10.4, 1),
  # ---------- Fake-News-Detektiv ----------
  "fn_spuren": FRAME("".join(f'<g class="wl-flake" style="animation-delay:-{k*.6}s"><ellipse cx="{x}" cy="{y}" rx=".9" ry="1.4" fill="#6B4A2B"/><circle cx="{x-.5}" cy="{y-1.9}" r=".3" fill="#6B4A2B"/><circle cx="{x+.1}" cy="{y-2.1}" r=".3" fill="#6B4A2B"/><circle cx="{x+.6}" cy="{y-1.8}" r=".3" fill="#6B4A2B"/></g>'
                           for k, (x, y) in enumerate([(5.6, 15.4), (8, 13.6), (10, 11.6), (12.4, 10.2)])) + '<circle cx="14" cy="9.4" r="1.6" fill="#CFEAF7" stroke="#5D3A1A" stroke-width=".4"/><path d="M15.1 10.5l1 1" stroke="#5D3A1A" stroke-width=".6"/>', "#3A4A5A"),
  "fn_bild": '<g transform="rotate(-5 10 10)"><rect x="4" y="3.6" width="12" height="14.4" fill="#fff" stroke="#D7D2C6" stroke-width=".3"/><rect x="5" y="4.6" width="10" height="9.4" fill="#9CD0EE"/><path d="M5 14l3.4-4.4 2.2 2.6 1.6-1.8L15 14z" fill="#1F9D68"/><circle cx="13" cy="6.6" r="1" fill="#FFC21A"/>'
             '<rect x="8" y="2.4" width="4" height="2" fill="#F4E7C8" fill-opacity=".9"/></g><g class="wl-fly"><circle cx="13.4" cy="14.4" r="2.2" fill="#CFEAF7" fill-opacity=".8" stroke="#5D3A1A" stroke-width=".5"/><path d="M15 16l1.8 1.8" stroke="#5D3A1A" stroke-width=".9" stroke-linecap="round"/></g>',
  "fn_quellen": STR(5, 15, 4) + '<g class="wl-sway"><rect x="3.4" y="4" width="13.2" height="14" fill="#F6F3EA" stroke="#B9B2A2" stroke-width=".3"/><rect x="4.8" y="5.2" width="10.4" height="1.8" fill="#3A3A44"/><rect x="4.8" y="8" width="5" height="4" fill="#C9D6E6"/>'
                '<path d="M10.8 8.4h4.4M10.8 9.8h4.4M10.8 11.2h4.4M4.8 13.4h10.4M4.8 14.8h10.4M4.8 16.2h7" stroke="#8A8478" stroke-width=".4"/></g><g class="wl-glow"><circle cx="15.4" cy="16.4" r="2" fill="#1F9D68"/><path d="M14.5 16.4l.7.7 1.2-1.3" stroke="#fff" stroke-width=".5" fill="none"/></g>' + NAIL,
  "fn_urteil": '<rect x="3" y="6.4" width="14" height="11" rx="2" fill="#7A4A22" stroke="#5A3412" stroke-width=".4"/><rect x="4.4" y="14.4" width="7" height="1.6" rx=".4" fill="#5D3A1A"/>' + STR(5, 15, 6.4)
               + '<g class="wl-knock"><rect x="6" y="9.6" width="5.4" height="2.6" rx=".6" fill="#C68A4E" stroke="#5A3412" stroke-width=".3" transform="rotate(-20 8.7 10.9)"/><path d="M9.4 11.8l5.4 3.4" stroke="#C68A4E" stroke-width=".9" stroke-linecap="round"/></g>' + NAIL,
  "fn_karte": '<g class="wl-sway"><g transform="rotate(3 10 11)"><rect x="3.4" y="5" width="13.2" height="11.6" fill="#FFF8D6" stroke="#E3C770" stroke-width=".3"/><path d="M3.4 7.4h13.2" stroke="#DD4646" stroke-width=".4"/><path d="M4.8 9.6h10.4M4.8 11.4h10.4M4.8 13.2h10.4M4.8 15h10.4" stroke="#B9D2EE" stroke-width=".25"/>'
              '<path d="M5.2 11l1 1 2-2" stroke="#1F9D68" stroke-width=".7" fill="none"/><path d="M11.4 10l2 2M13.4 10l-2 2" stroke="#DD4646" stroke-width=".7"/></g><circle cx="10" cy="5" r="1.1" fill="#DD4646"/><circle cx="9.7" cy="4.7" r=".35" fill="#fff"/></g>',
  "fn_alle": STR(5, 15, 5.6) + '<path d="M3 6.4h4.6l1 1.2H17v10.2H3z" fill="#D99A2B" stroke="#9A6A12" stroke-width=".35"/><rect x="3" y="7.8" width="14" height="10" fill="#F2B84B" stroke="#9A6A12" stroke-width=".35"/><rect x="5" y="9.4" width="6.4" height="3.2" fill="#fff"/><path d="M5.8 10.4h4.8M5.8 11.6h3.4" stroke="#8A94A6" stroke-width=".35"/>'
             f'<g class="wl-glow"><path d="M13 16.4l-.8 2.6 1.4-.6.8 1.2.6-2.8zM15.2 16.4l.8 2.6-1.4-.6" fill="#DD4646"/><circle cx="14" cy="15" r="2.4" fill="#FFC21A" stroke="#C98A00" stroke-width=".35"/><path d="{_star(14, 15, 1.3, .55)}" fill="#fff"/></g>' + NAIL,
  # ---------- KI-Bild oder echt? ----------
  "ki_theorie": '<g class="wl-sway"><path d="M10 1.2 4.4 8.2M10 1.2l5.6 7" stroke="#3A2410" stroke-width=".55" fill="none"/><rect x="6" y="6.6" width="4" height="2" rx=".4" fill="#3A3A44"/><rect x="3" y="8" width="14" height="9" rx="1.2" fill="#3A3A44"/>'
                '<circle cx="10" cy="12.6" r="3.1" fill="#8A94A6"/><circle cx="10" cy="12.6" r="2.2" fill="#2E3A55"/><circle cx="9.3" cy="11.9" r=".6" fill="#fff"/><rect class="wl-glow" x="13.4" y="9.2" width="2.2" height="1.3" rx=".3" fill="#FFE680"/></g>' + NAIL,
  "ki_fehler": FRAME('<rect x="3.6" y="6.1" width="12.8" height="10.8" fill="#DFF0FA"/><rect x="6.8" y="11.4" width="6.4" height="5" rx="1.6" fill="#F2C9A0"/>'
                     + "".join(f'<rect x="{6.8 + k*1.1:.1f}" y="{8.2 + (0 if k in (2,3) else .6):.1f}" width=".9" height="4" rx=".45" fill="#F2C9A0"/>' for k in range(6))
                     + '<ellipse class="wl-glow" cx="10" cy="10.6" rx="4.6" ry="3.4" fill="none" stroke="#DD4646" stroke-width=".55"/>', "#5D3A1A"),
  "ki_adler": '<g class="wl-sway"><path d="M10 1.2 5 7.4M10 1.2l5 6.2" stroke="#3A2410" stroke-width=".5" fill="none"/><rect x="3.6" y="7" width="5.4" height="9" rx="1.4" fill="#2E3A55"/><rect x="11" y="7" width="5.4" height="9" rx="1.4" fill="#2E3A55"/><rect x="8.6" y="9" width="2.8" height="3" fill="#3A4A6A"/>'
              '<circle cx="6.3" cy="14.6" r="2" fill="#9CD0EE" stroke="#1C2438" stroke-width=".4"/><circle cx="13.7" cy="14.6" r="2" fill="#9CD0EE" stroke="#1C2438" stroke-width=".4"/>' + SPARK(5.7, 14, 0) + SPARK(13.1, 14, .8) + '</g>' + NAIL,
  "ki_plakat": '<rect x="3.4" y="3" width="13.2" height="15.6" fill="#fff" stroke="#D7D2C6" stroke-width=".3"/><rect x="4.6" y="4.2" width="10.8" height="2.6" rx=".3" fill="#7B4CEF"/><path d="M6 5.5h8" stroke="#fff" stroke-width=".6"/>'
               + "".join(f'<circle cx="5.6" cy="{8.8+k*2.4}" r=".6" fill="#1F9D68"/><path d="M7 {8.8+k*2.4}h7.4" stroke="#8A94A6" stroke-width=".45"/>' for k in range(3))
               + '<rect x="4.6" y="15.6" width="5" height="1.6" rx=".3" fill="#FFC21A"/><path class="wl-wave" d="M16.6 18.6h-2.6l2.6-2.6z" fill="#E8E2D0"/>'
               '<rect x="2.4" y="2.2" width="3" height="1.4" fill="#F4E7C8" fill-opacity=".9" transform="rotate(-30 3.9 2.9)"/><rect x="14.6" y="2.2" width="3" height="1.4" fill="#F4E7C8" fill-opacity=".9" transform="rotate(30 16.1 2.9)"/>',
}

def _js(s): return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
WALL_JS = "const MI_WALL = {\n" + ",\n".join(f'  {k}: `{_js(v)}`' for k, v in W.items()) + "\n};\n"

CSS = (".wl-glow{animation:wlGlow 2.2s ease-in-out infinite}"
       ".wl-spin{transform-box:fill-box; transform-origin:50% 50%; animation:wlSpin 7s linear infinite}"
       ".wl-wig{transform-origin:10px 11px; animation:wlWig .9s ease-in-out infinite}"
       ".wl-quiv{transform-origin:10px 12px; animation:wlQuiv 2.6s ease-in-out infinite}"
       ".wl-knock{transform-origin:15px 15px; animation:wlKnock 2.8s ease-in-out infinite}"
       ".wl-medal{transform-origin:10px 1.2px; animation:wlMedal 3.4s ease-in-out infinite}"
       "@keyframes wlGlow{0%,100%{opacity:1}50%{opacity:.35}}"
       "@keyframes wlSpin{to{transform:rotate(360deg)}}"
       "@keyframes wlWig{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.9)}}"
       "@keyframes wlQuiv{0%,86%,100%{transform:rotate(0)}90%{transform:rotate(-4deg)}94%{transform:rotate(3deg)}}"
       "@keyframes wlKnock{0%,70%,100%{transform:rotate(0)}80%{transform:rotate(-16deg)}88%{transform:rotate(2deg)}}"
       "@keyframes wlMedal{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}"
       "@media (prefers-reduced-motion: reduce){.wl-glow,.wl-spin,.wl-wig,.wl-quiv,.wl-knock,.wl-medal{animation:none}}")

# 1) hochgeladene Diplome: Medaille am Band statt Urkunde mit Hintergrund
i = portal.index("const dipArt = ")
j = portal.index("\n", i)
portal = portal[:i] + WALL_JS + """const dipArt = (emoji, c) => { const e = String(emoji || "🏅").replace(/[<>&"]/g, ""), col = String(c || "#7B4CEF").replace(/[^#\\w(),.% -]/g, "");
  return `<svg viewBox="0 0 20 20" aria-hidden="true"><g class="wl-medal"><path d="M10 1.2 5.8 9.6h2.6L10 5.2z" fill="${col}"/><path d="M10 1.2l4.2 8.4h-2.6L10 5.2z" fill="${col}" fill-opacity=".75"/>`
    + `<circle cx="10" cy="13.4" r="5.2" fill="#F2C94C" stroke="#8B6914" stroke-width=".5"/><circle cx="10" cy="13.4" r="4" fill="#FFE680" stroke="#C98A00" stroke-width=".3"/>`
    + `<text x="10" y="13.7" font-size="4.6" text-anchor="middle" dominant-baseline="central">${e}</text><path class="wl-glow" d="M6.6 11.2a4.2 4.2 0 0 1 2-2" stroke="#fff" stroke-width=".6" fill="none"/></g><circle cx="10" cy="1.2" r=".8" fill="#3A2410"/></svg>`; };
(function(){ if (document.getElementById("wlMiCss")) return; const st = document.createElement("style"); st.id = "wlMiCss"; st.textContent = """ + repr(CSS) + """; (document.head || document.documentElement).appendChild(st); })();""" + portal[j:]

# 2) M&I-Diplome bekommen ihren Wand-Gegenstand
a = "  CU.dips.forEach(b=>{ if (!BADGES.some(x=>x.id === b.id)) BADGES.push("
assert a in portal
portal = portal.replace(a, """  BADGES.forEach((b, k)=>{ if (!b.art) BADGES[k] = Object.assign({}, b, {art: MI_WALL[b.id] ? `<svg viewBox="0 0 20 20" aria-hidden="true">${MI_WALL[b.id]}</svg>` : dipArt("🏅", "#7B4CEF")}); });
""" + a, 1)

# ---------- Mehrere Lehrpersonen: jeder Freigabe-Code der Klasse gilt ----------
a = '''  D.cls = {id:"hub", name: ctx.className, code: ctx.code, rev:0, students: [ctx.me].concat(ctx.team), groups:{}, kiQuiz: ctx.quiz || []};'''
assert a in portal
portal = portal.replace(a, a + '''
  window.GLAB_EXTRA_CODES = (ctx.codes || []).map(String);''', 1)
portal = portal.replace("let D = {cls:null, prog:{}, me:null};", '''let D = {cls:null, prog:{}, me:null};
window.GLAB_CODE_OK = (v, primary) => { const x = String(v || "").trim().toLowerCase(); return !!x && [primary || "4313"].concat(window.GLAB_EXTRA_CODES || []).some(c => String(c).trim().toLowerCase() === x); };''', 1)


# ---------- Diplome aus hochgeladenen Modulen: gleiche Wand-Gegenstände wie im Editor (editor/src/wallart.js) ----------
_wall = (pathlib.Path(__file__).parent.parent / "editor" / "src" / "wallart.js").read_text(encoding="utf-8")
a = "const dipArt = (emoji, c) => {"
assert a in portal
portal = portal.replace(a, "window.GLWALL_NOCSS = true;\n" + _wall + "\nconst dipArtOld = (emoji, c) => {", 1)
portal = portal.replace("const dipArtOld = (emoji, c) => {", "const dipArt = (emoji, c, wand, id) => window.GLWall ? GLWall.svg(wand || (id ? \"\" : \"medaille\"), emoji, c, id) : dipArtOld(emoji, c);\nconst dipArtOld = (emoji, c) => {", 1)
a = "art:dipArt(b.emoji, b.c)}"
assert a in portal
portal = portal.replace(a, "art:dipArt(b.emoji, b.c, b.wand, b.id)}", 1)
