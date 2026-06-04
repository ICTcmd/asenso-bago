const fs = require('fs');

// Each barangay: name, type (u=urban, r=rural, t=tourist), top polygon points, side offset
const barangays = [
  { name:'Dulao',           type:'r', cx:183, cy:72,  pts:[[162,52],[208,46],[218,88],[202,108],[158,103],[143,78]] },
  { name:'Abuanan',         type:'u', cx:236, cy:70,  pts:[[208,46],[262,40],[274,82],[258,108],[218,108],[208,86]] },
  { name:'Tabunan',         type:'r', cx:134, cy:90,  pts:[[118,74],[143,54],[162,99],[155,124],[112,111]] },
  { name:'Sagasa',          type:'r', cx:122, cy:132, pts:[[100,112],[118,104],[155,124],[150,158],[104,154],[92,132]] },
  { name:'Bagroy',          type:'r', cx:114, cy:175, facts:'📊 Smallest population (1,305)', cx:114, cy:175, pts:[[90,158],[104,154],[150,158],[145,196],[98,192],[84,172]] },
  { name:'Balingasag',      type:'u', cx:288, cy:66,  pts:[[262,36],[314,32],[326,74],[312,108],[270,104],[258,74]] },
  { name:'Atipuluan',       type:'u', cx:338, cy:68,  pts:[[314,36],[364,40],[376,80],[360,112],[322,108],[312,74]] },
  { name:'Napoles',         type:'r', cx:238, cy:126, pts:[[218,104],[256,100],[270,126],[260,154],[224,157],[208,132]] },
  { name:'Pacol',           type:'r', cx:272, cy:126, pts:[[256,100],[272,96],[292,104],[294,136],[272,154],[258,150],[248,126]] },
  { name:'Caridad',         type:'u', cx:308, cy:130, pts:[[292,104],[324,102],[336,132],[328,160],[290,162],[280,134]] },
  { name:'Taloc',           type:'u', cx:346, cy:130, pts:[[324,102],[364,100],[376,132],[364,162],[330,164],[318,132]] },
  { name:'Poblacion',       type:'t', cx:292, cy:176, facts:'📊 City center • Smallest area (311 ha)', spots:'⭐ Bantayan Park (1898 Revolution)|⭐ Balay ni Tan Juan|⭐ Bago City Cathedral|⭐ Javellana Mansion', pts:[[258,152],[292,144],[328,155],[336,180],[318,200],[284,206],[256,192],[250,170]] },
  { name:'Don Jorge L. Araneta', type:'u', cx:350, cy:182, spots:'⭐ Araneta Heritage Site', pts:[[328,158],[370,154],[382,182],[370,210],[334,212],[320,184]] },
  { name:'Ma-ao',           type:'t', cx:322, cy:232, facts:'📊 Most populated (14,916 residents)', spots:'⭐ Ma-ao Sugar Central', pts:[[284,206],[322,198],[358,202],[372,232],[358,262],[322,270],[286,256],[272,228]] },
  { name:'Alianza',         type:'r', cx:254, cy:222, pts:[[254,192],[286,204],[278,238],[252,252],[226,234],[222,206]] },
  { name:'Lag-Asan',        type:'r', cx:223, cy:268, pts:[[222,234],[252,252],[246,290],[222,302],[196,282],[192,256]] },
  { name:'Malingin',        type:'r', cx:398, cy:228, pts:[[372,200],[412,196],[430,226],[418,256],[380,260],[362,230]] },
  { name:'Calumangan',      type:'r', cx:344, cy:296, pts:[[322,268],[358,264],[374,292],[362,322],[326,326],[312,296]] },
  { name:'Binubuhan',       type:'r', cx:290, cy:300, pts:[[252,284],[286,268],[322,278],[326,316],[298,330],[256,318]] },
  { name:'Busay',           type:'t', cx:446, cy:285, spots:'⭐ Near Buenos Aires Mountain Resort', pts:[[418,252],[460,248],[480,280],[468,314],[430,318],[412,284]] },
  { name:'Mailum',          type:'t', cx:387, cy:358, spots:'⭐ Kipot Twin Falls (220 steps)|⭐ Pataan Mountain Resort', pts:[[360,322],[396,314],[420,330],[430,366],[412,398],[374,402],[346,378],[342,348]] },
  { name:'Sampinit',        type:'r', cx:452, cy:392, pts:[[430,364],[466,354],[488,386],[474,422],[436,424],[414,392]] },
  { name:'Bacong-Montilla', type:'r', cx:395, cy:446, facts:'📊 Largest land area (4,827 ha)', pts:[[374,402],[412,396],[436,424],[432,472],[398,488],[366,476],[348,446],[352,412]] },
  { name:'Ilijan',          type:'t', cx:208, cy:314, facts:'📊 Farthest barangay (30.5 km)', spots:'⭐ WWII Historical Site (Pres. Quezon 1942)', pts:[[192,280],[226,268],[244,284],[244,324],[222,348],[186,344],[166,314],[168,288]] },
];

const colors = {
  u: { top1:'#ff6b6b', top2:'#c0392b', side:'#8b1a1a' },
  r: { top1:'#55efc4', top2:'#27ae60', side:'#145a32' },
  t: { top1:'#ffd27d', top2:'#e67e22', side:'#a04000' },
};

const DEPTH = 7; // 3D extrusion depth in pixels

function offsetPts(pts, dx, dy) {
  return pts.map(([x,y]) => [x+dx, y+dy]);
}

function ptStr(pts) {
  return pts.map(([x,y]) => `${x},${y}`).join(' ');
}

// Build side faces: for each edge of the top polygon, draw a quad going down+right
function buildSides(pts, c) {
  const n = pts.length;
  let html = '';
  for (let i = 0; i < n; i++) {
    const [x1,y1] = pts[i];
    const [x2,y2] = pts[(i+1)%n];
    // Only draw "bottom/right" facing sides (where the edge faces down-right)
    const mx = (x1+x2)/2, my = (y1+y2)/2;
    // Normal pointing outward
    const nx = -(y2-y1), ny = (x2-x1);
    if (nx + ny > 0) { // faces down-right = visible in 3D
      html += `<polygon points="${x1},${y1} ${x2},${y2} ${x2+DEPTH},${y2+DEPTH} ${x1+DEPTH},${y1+DEPTH}" fill="${c.side}" stroke="${c.side}" stroke-width="0.5"/>`;
    }
  }
  return html;
}

function brgyHTML(b) {
  const c = colors[b.type];
  const topPts = b.pts;
  const sidePts = offsetPts(b.pts, DEPTH, DEPTH);
  const gradId = `grad_${b.name.replace(/\W/g,'_')}`;
  const desc = {
    u: 'An urban barangay of Bago City.',
    r: 'A rural barangay of Bago City.',
    t: 'A barangay of Bago City with notable tourist destinations.',
  }[b.type];

  const factsArg = (b.facts||'').replace(/'/g,"&#39;");
  const spotsArg = (b.spots||'').replace(/'/g,"&#39;");
  const nameArg = b.name.replace(/'/g,"&#39;");
  const typeLabel = b.type==='u'?'Urban':'Rural';

  return `
<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0.3" y2="1">
  <stop offset="0%" stop-color="${c.top1}"/>
  <stop offset="100%" stop-color="${c.top2}"/>
</linearGradient></defs>
<g class="brgy-group" onclick="showInfo('${nameArg}','${typeLabel}','${desc}','${factsArg}','${spotsArg}')">
  ${buildSides(topPts, c)}
  <polygon class="brgy-top" points="${ptStr(topPts)}" fill="url(#${gradId})" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
  <text x="${b.cx}" y="${b.cy}" class="brgy-label">${b.name.length>12?b.name.replace(' ','\n'):b.name}</text>
</g>`;
}

// Landmark pins
const landmarks = [
  { name:'Bantayan Park', x:270, y:168, color:'#e74c3c', icon:'★', desc:'Historic riverside park — site of the 1898 bloodless revolution led by Gen. Juan Araneta.' },
  { name:'Bago City Cathedral', x:258, y:158, color:'#9b59b6', icon:'✝', desc:'Spanish-colonial cathedral dedicated to San Sebastian. One of the oldest landmarks in Bago City.' },
  { name:'Ma-ao Sugar Central', x:340, y:230, color:'#e67e22', icon:'★', desc:'Historic sugar mill and heritage industrial landmark in Barangay Ma-ao.' },
  { name:'Kipot Twin Falls', x:376, y:366, color:'#3498db', icon:'★', desc:'Stunning twin waterfalls in Brgy. Mailum. 220 steps to reach the cascades.' },
  { name:'Javellana Mansion', x:280, y:190, color:'#8e44ad', icon:'⌂', desc:'Built in 1920 on a 440-ha sugar plantation. Designed by an Italian architect. One of Bago Citys most prized heritage sites.' },
];

function pinHTML(p) {
  const nameArg = p.name.replace(/'/g,"&#39;");
  const descArg = p.desc.replace(/'/g,"&#39;");
  return `<g class="landmark-pin" onclick="showInfo('${nameArg}','Landmark','${descArg}','','')">
  <circle cx="${p.x}" cy="${p.y}" r="9" fill="${p.color}" stroke="#fff" stroke-width="2" filter="url(#glow)"/>
  <text x="${p.x}" y="${p.y+3}" text-anchor="middle" font-size="9" fill="#fff" font-weight="900" pointer-events="none">${p.icon}</text>
</g>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title>Bago City 3D Map</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0d0d0d;min-height:100vh}
.header{background:linear-gradient(135deg,#6b2200,#a03800);padding:max(16px,env(safe-area-inset-top)) 16px 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100;box-shadow:0 4px 20px rgba(0,0,0,.5)}
.back-btn{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.15);border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0}
.hinfo{flex:1}.hinfo h1{font-size:16px;font-weight:800;color:#fff}.hinfo p{font-size:11px;color:rgba(255,255,255,.65)}
.header img{width:36px;height:36px;border-radius:50%}
.legend{display:flex;gap:10px;flex-wrap:wrap;padding:10px 16px;background:#1a1a1a;border-bottom:1px solid #333;font-size:11px;font-weight:600}
.leg{display:flex;align-items:center;gap:5px;color:#ccc}.leg-dot{width:11px;height:11px;border-radius:3px}
.map-wrap{background:linear-gradient(160deg,#0a1628,#0d2137 60%,#0a1628);padding:16px 8px 24px;overflow-x:auto}
.map-wrap svg{display:block;margin:0 auto;max-width:100%}
.brgy-group{cursor:pointer}
.brgy-top{transition:filter .2s ease, transform .2s ease;transform-box:fill-box;transform-origin:center}
.brgy-group:hover .brgy-top{filter:brightness(1.5) saturate(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.5));transform:translateY(-4px) translateX(-4px)}
.brgy-group:hover polygon[class="brgy-side"]{}
.brgy-label{font-size:7px;font-weight:800;fill:#fff;pointer-events:none;text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:#000;stroke-width:2.5px;stroke-linejoin:round}
.landmark-pin{cursor:pointer;transition:transform .2s ease;transform-box:fill-box;transform-origin:center}
.landmark-pin:hover{transform:scale(1.4) translateY(-2px)}
.sea-label{font-size:11px;font-weight:800;fill:#7ec8e3;opacity:.55;font-style:italic}
.river{fill:none;stroke:#4fc3f7;stroke-width:2;stroke-linecap:round;opacity:.5}
.land-bg{fill:url(#landGrad);stroke:#2d5a3d;stroke-width:1.5}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:199;display:none;backdrop-filter:blur(4px)}
.overlay.show{display:block}
.panel{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:#1c1c1e;border-radius:24px 24px 0 0;padding:20px 20px 32px;box-shadow:0 -8px 40px rgba(0,0,0,.7);display:none;z-index:200;border-top:3px solid #a03800}
.panel.show{display:block;animation:up .3s ease}
@keyframes up{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
.ph{width:40px;height:4px;background:#444;border-radius:2px;margin:0 auto 16px}
.pc{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:#333;border:none;font-size:20px;cursor:pointer;color:#fff;line-height:32px;text-align:center}
.pn{font-size:20px;font-weight:900;color:#fff;margin-bottom:6px}
.pb{display:inline-block;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:12px}
.pd{font-size:13px;color:#aaa;line-height:1.6;margin-bottom:10px}
.pr{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}
.fp{background:#1e3a5f;color:#7ec8e3;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px}
.sp{background:#3d1f00;color:#ffb74d;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px}
.gm{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;padding:14px;background:linear-gradient(135deg,#0369a1,#0284c7);color:#fff;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none}
.bot{display:block;margin:12px 16px 28px;padding:14px;background:linear-gradient(135deg,#6b2200,#a03800);color:#fff;text-align:center;border-radius:12px;font-weight:700;font-size:13px;text-decoration:none}
</style>
</head>
<body>
<div class="header">
  <a href="javascript:history.back()" class="back-btn">&#8592;</a>
  <div class="hinfo"><h1>Bago City 3D Map</h1><p>Tap any barangay for details</p></div>
  <img src="assets/images/bago-city-logo.png" alt="">
</div>
<div class="legend">
  <div class="leg"><div class="leg-dot" style="background:#c0392b"></div>Urban</div>
  <div class="leg"><div class="leg-dot" style="background:#27ae60"></div>Rural</div>
  <div class="leg"><div class="leg-dot" style="background:#e67e22"></div>Tourist Spot</div>
  <div class="leg"><div class="leg-dot" style="background:#e74c3c;border-radius:50%"></div>Landmark</div>
</div>
<div class="map-wrap">
<svg viewBox="50 20 590 520" xmlns="http://www.w3.org/2000/svg" width="760" style="max-width:100%">
<defs>
  <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0d47a1"/>
    <stop offset="100%" stop-color="#1a237e"/>
  </linearGradient>
  <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#1b4332"/>
    <stop offset="100%" stop-color="#2d6a4f"/>
  </linearGradient>
  <filter id="glow">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="shadow">
    <feDropShadow dx="3" dy="5" stdDeviation="4" flood-color="#000" flood-opacity="0.6"/>
  </filter>
</defs>
<rect width="780" height="700" fill="url(#seaGrad)"/>
<polygon class="land-bg" points="138,28 200,20 262,28 312,24 356,38 400,34 446,48 492,44 526,58 556,78 578,108 587,150 582,192 566,234 544,274 521,314 498,354 473,394 441,434 409,474 376,514 343,552 308,586 276,616 246,638 216,650 193,638 170,625 146,595 124,562 106,525 96,488 101,448 106,408 110,368 105,328 100,288 95,248 100,208 105,168 110,128 113,88 116,58 126,40"/>
<path d="M 556,78 Q 528,118 508,158 Q 486,200 463,238 Q 440,278 413,308 Q 383,338 353,358 Q 320,378 290,388 Q 260,398 230,393 Q 200,388 176,368 Q 156,350 146,328" class="river"/>
<text x="66" y="330" class="sea-label" transform="rotate(-90,66,330)">GUIMARAS STRAIT</text>
${barangays.map(brgyHTML).join('\n')}
<!-- MT KANLAON -->
<g onclick="showInfo('Mt. Kanlaon','Landmark','Active stratovolcano and the highest peak in the Visayas at 2,465m. Part of Mt. Kanlaon Natural Park within Bago City territory.','📊 Highest peak in Visayas (2,465m)','⭐ Mt. Kanlaon Natural Park')">
  <polygon points="462,268 508,258 532,300 520,348 478,358 450,318" fill="#8d6e63" stroke="#6d4c41" stroke-width="1.5"/>
  <polygon points="458,264 504,254 528,296 516,344 474,354 446,314" fill="url(#mtGrad)" stroke="#795548" stroke-width="1"/>
  <text x="487" y="305" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" paint-order="stroke" stroke="#000" stroke-width="2px">MT. KANLAON</text>
  <text x="487" y="316" text-anchor="middle" font-size="6.5" fill="rgba(255,255,255,0.8)" paint-order="stroke" stroke="#000" stroke-width="1.5px">2,465m ▲</text>
</g>
<defs>
  <linearGradient id="mtGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#bcaaa4"/>
    <stop offset="60%" stop-color="#8d6e63"/>
    <stop offset="100%" stop-color="#5d4037"/>
  </linearGradient>
</defs>
${landmarks.map(pinHTML).join('\n')}
<!-- Compass -->
<g transform="translate(605,50)">
  <circle cx="0" cy="0" r="22" fill="rgba(0,0,0,0.5)" stroke="#555" stroke-width="1.5"/>
  <text x="0" y="-10" text-anchor="middle" font-size="11" font-weight="900" fill="#e74c3c">N</text>
  <text x="0" y="16" text-anchor="middle" font-size="9" fill="#aaa">S</text>
  <text x="-14" y="4" text-anchor="middle" font-size="9" fill="#aaa">W</text>
  <text x="14" y="4" text-anchor="middle" font-size="9" fill="#aaa">E</text>
  <polygon points="0,-8 3,2 0,0 -3,2" fill="#e74c3c"/>
  <polygon points="0,8 3,-2 0,0 -3,-2" fill="#666"/>
</g>
<!-- City label -->
<text x="340" y="570" text-anchor="middle" font-size="13" font-weight="900" fill="rgba(255,200,100,0.35)">CITY OF BAGO</text>
<text x="340" y="583" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.2)">Negros Occidental, Philippines</text>
</svg>
</div>
<a class="bot" href="https://maps.google.com/?q=Bago+City+Negros+Occidental+Philippines" target="_blank" rel="noopener">📍 Explore on Google Maps</a>
<div class="overlay" id="ov" onclick="hide()"></div>
<div class="panel" id="pn">
  <button class="pc" onclick="hide()">&#215;</button>
  <div class="ph"></div>
  <div class="pn" id="pname"></div>
  <span class="pb" id="ptype"></span>
  <p class="pd" id="pdesc"></p>
  <div class="pr" id="pfacts"></div>
  <div class="pr" id="pspots"></div>
  <a class="gm" id="pgm" href="#" target="_blank" rel="noopener">📍 View on Google Maps</a>
</div>
<script>
function showInfo(name,type,desc,facts,spots){
  document.getElementById('pname').textContent=name;
  var t=document.getElementById('ptype');
  var isU=type==='Urban', isR=type==='Rural';
  t.textContent=isU?'🏙️ Urban Barangay':isR?'🌿 Rural Barangay':'📍 '+type;
  t.style.background=isU?'rgba(192,57,43,0.2)':isR?'rgba(39,174,96,0.2)':'rgba(230,126,34,0.2)';
  t.style.color=isU?'#e74c3c':isR?'#2ecc71':'#f39c12';
  document.getElementById('pdesc').textContent=desc;
  document.getElementById('pfacts').innerHTML=facts?facts.split('|').map(f=>'<span class="fp">'+f+'</span>').join(''):'';
  document.getElementById('pspots').innerHTML=spots?spots.split('|').map(s=>'<span class="sp">'+s+'</span>').join(''):'';
  document.getElementById('pgm').href='https://maps.google.com/?q='+encodeURIComponent(name+' Bago City Negros Occidental');
  document.getElementById('pn').classList.add('show');
  document.getElementById('ov').classList.add('show');
}
function hide(){
  document.getElementById('pn').classList.remove('show');
  document.getElementById('ov').classList.remove('show');
}
</script>
</body>
</html>`;

fs.writeFileSync('map.html', html, 'utf8');
console.log('map.html written — ' + html.length + ' bytes');
