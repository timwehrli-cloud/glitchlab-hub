/* =====================================================================
   Maskottchen für Editor-Module: gLiTCh (Standard), Fenni der Wüstenfuchs
   oder ein eigenes Pixel-Maskottchen (Raster mit Farbpalette).
   ===================================================================== */
window.GLMascot = window.GLMascot || (function () {
  let fenniCache = "";
  function fenni() {
    if (fenniCache) return fenniCache;

 const N=40,C={body:"#e9cd98",shade:"#d2a96b",light:"#fbf1dc",ear:"#f1b3a0",out:"#5a3b1f",eye:"#1b1210",hl:"#ffffff",nose:"#1b1210",tip:"#5a3b1f",mark:"#b07c45"};
 const ell=(cx,cy,rx,ry,rot=0)=>(x,y)=>{const a=rot*Math.PI/180,dx=x-cx,dy=y-cy,u=dx*Math.cos(a)+dy*Math.sin(a),v=-dx*Math.sin(a)+dy*Math.cos(a);return (u*u)/(rx*rx)+(v*v)/(ry*ry)<=1};
 const tri=(p)=>(x,y)=>{let s=0;for(let i=0;i<3;i++){const [x1,y1]=p[i],[x2,y2]=p[(i+1)%3];const c=(x2-x1)*(y-y1)-(y2-y1)*(x-x1);if(c===0)continue;if(!s)s=Math.sign(c);else if(Math.sign(c)!==s)return false}return true};
 const rect=(x0,y0,x1,y1)=>(x,y)=>x>=x0&&x<=x1&&y>=y0&&y<=y1;
 const mir=f=>(x,y)=>f(N-x,y);
 const L=[ /* hinten nach vorne: [Test, Farbe, Ebene] */
  [ell(31,33,8,4,-25),"body"],[ell(37,29.5,2.6,2.6),"tip"],
  [ell(20,31,9,7.5),"body"],
  [rect(14.5,32,18.5,38.6),"body"],[rect(21.5,32,25.5,38.6),"body"],
  [ell(16.5,38,2.6,1.4),"light"],[ell(23.5,38,2.6,1.4),"light"],
  [ell(20,29,4.6,6),"light"],
  [tri([[2.5,0.5],[17,10],[9,17]]),"body"],[mir(tri([[2.5,0.5],[17,10],[9,17]])),"body"],
  [tri([[5,3.5],[14.5,10.5],[9.5,14.5]]),"ear"],[mir(tri([[5,3.5],[14.5,10.5],[9.5,14.5]])),"ear"],
  [ell(20,17,8.6,6.8),"body"],
  [ell(20,21.4,5.2,3.4),"light"],[ell(13.5,19.5,2.2,1.6),"light"],[ell(26.5,19.5,2.2,1.6),"light"],
 ];
 const grid=[];for(let y=0;y<N;y++){grid[y]=[];for(let x=0;x<N;x++){let c=null;const px=x+.5,py=y+.5;for(const [f,col] of L)if(f(px,py))c=col;grid[y][x]=c}}
 // Schattierung am Körperrand und Hinterkopf
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const c=grid[y][x];if(c==="body"&&((y>=26&&Math.abs(x+.5-20)>6.3)||(y>=11&&y<=13&&Math.abs(x+.5-20)<5)))grid[y][x]="shade"}
 // Augenstreifen (typisch Fennek)
 [[15,19],[14,20],[25,19],[26,20]].forEach(([x,y])=>{if(grid[y][x])grid[y][x]="mark"});
 // Umriss
 const fill=(x,y)=>y>=0&&y<N&&x>=0&&x<N&&grid[y][x];
 const out=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(grid[y][x]&&grid[y][x]!=="tip"&&(!fill(x-1,y)||!fill(x+1,y)||!fill(x,y-1)||!fill(x,y+1)))out.push([x,y])}
 out.forEach(([x,y])=>grid[y][x]="out");
 // Mittellinie zwischen Brust und Beinen
 for(let y=33;y<39;y++){if(grid[y][19]&&grid[y][19]!=="out")grid[y][19]="shade";if(grid[y][20]&&grid[y][20]!=="out")grid[y][20]="shade"}
 let r="";for(let y=0;y<N;y++){let x=0;while(x<N){const c=grid[y][x];if(!c){x++;continue}let w=1;while(x+w<N&&grid[y][x+w]===c)w++;r+=`<rect x="${x}" y="${y}" width="${w+.02}" height="1.02" fill="${C[c]}"/>`;x+=w}}
 // Augen, Nase, Mund separat (Augen blinzeln)
 const px=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
 const eyes=`<g class="f-eyes">${px(15,15,3,3,C.eye)}${px(22,15,3,3,C.eye)}${px(15,15,1,1,C.hl)}${px(22,15,1,1,C.hl)}</g>`;
 const face=px(19,21,2,1.6,C.nose)+px(18.5,20.6,3,1,C.nose)+px(19.5,22.6,1,1,C.out)+px(18,23.4,1.5,.8,C.out)+px(20.5,23.4,1.5,.8,C.out);
 const blush=`<g class="f-blush" opacity="0">${px(12,20,2,1,"#f19a8c")}${px(26,20,2,1,"#f19a8c")}</g>`;
 
    fenniCache = `<svg viewBox="-1 -1 42 42" shape-rendering="crispEdges" aria-hidden="true">${r}${eyes}${face}${blush}</svg>`;
    return fenniCache;
  }
  /* Eigenes Maskottchen: pixel = Zeilen aus Buchstaben (Punkt = leer), palette = {Buchstabe: "#hex"} */
  function clean(pix, pal) {
    const P = {}; Object.entries(pal || {}).forEach(([k, v]) => { if (/^[a-z]$/i.test(k) && /^#[0-9a-f]{6}$/i.test(String(v))) P[k] = v; });
    let rows = (Array.isArray(pix) ? pix : []).map(r => String(r).replace(/\s/g, "")).filter(r => r.length).slice(0, 24);
    const n = Math.max(8, Math.min(24, Math.max(rows.length, ...rows.map(r => r.length))));
    rows = rows.map(r => (r + ".".repeat(n)).slice(0, n).split("").map(c => P[c] ? c : ".").join(""));
    while (rows.length < n) rows.push(".".repeat(n));
    return { pix: rows, pal: P, n };
  }
  function pixel(pix, pal) {
    const c = clean(pix, pal); let r = "";
    c.pix.forEach((row, y) => { let x = 0; while (x < c.n) { const ch = row[x]; if (ch === ".") { x++; continue; } let w = 1; while (row[x + w] === ch) w++; r += `<rect x="${x}" y="${y}" width="${w + .02}" height="1.02" fill="${c.pal[ch]}"/>`; x += w; } });
    return `<svg viewBox="-1 -1 ${c.n + 2} ${c.n + 2}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  }
  /* Bild für ein Modul-Maskottchen (null = gLiTCh) */
  function svg(m) {
    if (!m || m.typ === "glitch") return null;
    if (m.typ === "fenni") return fenni();
    if (m.typ === "eigen" && m.pix) return pixel(m.pix, m.pal);
    return null;
  }
  const nameOf = m => !m || m.typ === "glitch" ? "gLiTCh" : m.typ === "fenni" ? (m.name || "Fenni") : (String(m.name || "").trim().slice(0, 24) || "Mascotti");
  return { fenni, pixel, clean, svg, nameOf };
})();
