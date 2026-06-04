const fs = require('fs');

// ============================================================
// BARANGAY DATA — coordinates derived from the real official
// Bago City map photos. ViewBox: 0 0 1000 750
// Origin: top-left. X increases east. Y increases south.
// Borders: N=Bacolod/Murcia, W=Guimaras Strait, S=La Carlota/San Carlos, E=Mt.Kanlaon
// ============================================================

// type: u=urban, r=rural, t=tourist(rural with spots)
const barangays = [
  // ── NORTHERN TIER (border with Bacolod/Murcia) ──
  {
    name:'Calumangan', type:'r',
    desc:'A rural barangay in the northern part of Bago City known for its rice mills and agricultural lands.',
    facts:'📊 6.40 km from city • 1,007 ha • Pop. 7,979',
    spots:'',
    pts:[[55,55],[185,45],[200,130],[170,165],[80,165],[50,130]]
  },
  {
    name:'Taloc', type:'u',
    desc:'An urban barangay in the north, bordered by Calumangan and Dulao. Known for its schools and local commerce.',
    facts:'📊 Urban barangay',
    spots:'',
    pts:[[185,45],[310,42],[330,120],[310,160],[200,130]]
  },
  {
    name:'Tabunan', type:'r',
    desc:'A rural barangay in the northeastern part of the city with mangrove forests and rice fields.',
    facts:'📊 Borders Bacolod City to the north',
    spots:'',
    pts:[[310,42],[430,38],[455,100],[440,145],[330,120]]
  },
  {
    name:'Dulao', type:'r',
    desc:'A rural barangay in the north with fertile agricultural land, traversed by the Bago River tributaries.',
    facts:'📊 17.8 km from city • 2,439 ha • Pop. 10,111',
    spots:'',
    pts:[[430,38],[560,35],[590,95],[570,150],[455,100]]
  },
  {
    name:'Abuanan', type:'u',
    desc:'One of the 8 urban barangays, located in the northeast. Known for its quarries, rice mills and proximity to Bacong-Montilla.',
    facts:'📊 25 km from city • 1,040 ha • Pop. 5,700',
    spots:'',
    pts:[[560,35],[700,40],[730,110],[700,165],[590,95]]
  },
  {
    name:'Bacong-Montilla', type:'r',
    desc:'The largest barangay in Bago City by land area. A vast rural barangay with extensive agricultural and forest lands bordering Murcia.',
    facts:'📊 Largest area: 4,827 ha • 29.50 km • Pop. 7,844',
    spots:'',
    pts:[[700,40],[870,45],[900,130],[870,200],[730,185],[700,165]]
  },

  // ── SECOND TIER ──
  {
    name:'Balingasag', type:'u',
    desc:'An urban barangay with commercial establishments. Borders Calumangan, Napoles and Busay.',
    facts:'📊 1.25 km from city • 436 ha • Pop. 4,498',
    spots:'',
    pts:[[55,165],[80,165],[170,165],[185,240],[155,285],[65,285],[50,225]]
  },
  {
    name:'Napoles', type:'r',
    desc:'A rural barangay known for its rice mills, rice fields, and the Napoles Elementary School.',
    facts:'📊 9.26 km from city • 1,279 ha • Pop. 6,564',
    spots:'',
    pts:[[170,165],[310,160],[330,235],[310,280],[185,240]]
  },
  {
    name:'Busay', type:'t',
    desc:'A large rural barangay stretching from the lowlands to the upland areas, known for its resort and scenic views.',
    facts:'📊 7.26 km from city • 1,463 ha • Pop. 6,896',
    spots:'⭐ Near Buenos Aires Mountain Resort',
    pts:[[310,160],[440,145],[465,205],[445,265],[330,235]]
  },
  {
    name:'Malingin', type:'r',
    desc:'A rural barangay in the central area of the city. Known for its rice mills, quarry sites and farming communities.',
    facts:'📊 12.20 km from city • 1,495 ha • Pop. 6,649',
    spots:'',
    pts:[[440,145],[570,150],[600,215],[575,268],[465,205]]
  },
  {
    name:'Atipuluan', type:'u',
    desc:'An urban barangay along the main highway. Key commercial and residential area with the Atipuluan Elementary School.',
    facts:'📊 17.46 km from city • 562 ha • Pop. 4,269',
    spots:'',
    pts:[[570,150],[700,165],[730,225],[700,270],[600,215]]
  },
  {
    name:'Sampinit', type:'r',
    desc:'A rural barangay east of the city center, bordering Poblacion and extending toward Mt. Kanlaon Natural Park.',
    facts:'📊 11 km from city • 553 ha • Pop. 6,856',
    spots:'',
    pts:[[700,165],[870,200],[900,275],[870,330],[730,310],[700,270]]
  },

  // ── THIRD TIER (City Center) ──
  {
    name:'Pacol', type:'r',
    desc:'A rural barangay near the city center with rice fields and the Pacol Elementary School.',
    facts:'📊 7.20 km from city • Pop. 3,999',
    spots:'',
    pts:[[55,285],[65,285],[155,285],[170,355],[145,395],[60,395],[48,340]]
  },
  {
    name:'Caridad', type:'u',
    desc:'An urban barangay forming part of the Bago City urban core with schools, churches, and local businesses.',
    facts:'📊 12 km from city • Pop. 4,901',
    spots:'',
    pts:[[155,285],[185,240],[310,240],[330,310],[300,360],[170,355]]
  },
  {
    name:'Poblacion', type:'t',
    desc:'The main downtown barangay and seat of local government. Smallest land area (311 ha). Home to City Hall, the Cathedral, and key heritage sites.',
    facts:'📊 City center • Smallest area: 311 ha • Pop. 11,794',
    spots:'⭐ Bantayan Park (1898 Revolution)|⭐ Balay ni Tan Juan|⭐ Bago City Cathedral|⭐ Javellana Mansion|⭐ Bago City Hall',
    pts:[[330,235],[445,235],[465,280],[450,345],[410,380],[330,370],[300,320]]
  },
  {
    name:'Alianza', type:'r',
    desc:'A rural barangay known for its agricultural lands, rice production and the Alianza Elementary School.',
    facts:'📊 15 km from city • 365 ha • Pop. 3,211',
    spots:'',
    pts:[[300,360],[330,310],[410,345],[415,415],[380,450],[295,430],[285,390]]
  },
  {
    name:'Don Jorge L. Araneta', type:'u',
    desc:'Named after Gen. Juan A. Araneta who led the bloodless revolution of November 5, 1898 in Bago City.',
    facts:'📊 16.90 km from city • 2,143 ha • Pop. 9,457',
    spots:'⭐ Araneta Family Heritage Site',
    pts:[[170,355],[300,360],[285,390],[295,430],[265,490],[160,480],[150,420]]
  },
  {
    name:'Lag-Asan', type:'r',
    desc:'A rural barangay south of Poblacion, known for its health center and peaceful farming community.',
    facts:'📊 1.60 km from city • 456 ha • Pop. 11,794',
    spots:'',
    pts:[[450,280],[575,268],[600,330],[575,390],[510,420],[455,410],[430,350]]
  },
  {
    name:'Ma-ao', type:'t',
    desc:'The most populated barangay (14,916 residents). Home to the historic Ma-ao Sugar Central — a major sugar mill in Negros Occidental.',
    facts:'📊 Most populated: 14,916 • 21.70 km • 5,998 ha',
    spots:'⭐ Ma-ao Sugar Central (Heritage site)|⭐ MSC Ruins (Lacson Mansion)',
    pts:[[575,268],[730,255],[760,330],[730,400],[690,430],[600,400],[575,330]]
  },
  {
    name:'Binubuhan', type:'r',
    desc:'A rural barangay in Cluster 8 with Ma-ao and Mailum. Known for rice production and the Binubuhan Elementary School.',
    facts:'📊 29.50 km from city • 2,352 ha • Pop. 5,581',
    spots:'',
    pts:[[730,310],[870,330],[900,415],[870,470],[800,490],[730,455],[700,395]]
  },

  // ── SOUTHERN TIER ──
  {
    name:'Bagroy', type:'r',
    desc:'Smallest population in Bago City (1,694 residents). A coastal barangay along the Guimaras Strait.',
    facts:'📊 Smallest population: 1,694 • 399 ha • Coastal',
    spots:'',
    pts:[[48,395],[60,395],[145,395],[150,460],[120,500],[50,500],[40,450]]
  },
  {
    name:'Sagasa', type:'r',
    desc:'A coastal rural barangay along the Guimaras Strait, known for its fishing community and mangrove forest areas.',
    facts:'📊 Coastal barangay • Municipality of Pulupandan border',
    spots:'',
    pts:[[150,460],[145,395],[160,480],[265,490],[270,555],[220,580],[155,560],[148,510]]
  },
  {
    name:'Mailum', type:'t',
    desc:'Prime ecotourism destination at the foot of Kanlaon Volcano. Home to the famous Kipot Twin Falls and Pataan Mountain Resort.',
    facts:'📊 29.46 km from city • 3,200 ha • Pop. 8,844',
    spots:'⭐ Kipot Twin Falls (220 steps to twin cascades)|⭐ Pataan Mountain Resort',
    pts:[[510,420],[600,400],[690,430],[720,510],[690,570],[620,595],[545,575],[500,505]]
  },
  {
    name:'Ilijan', type:'t',
    desc:'The farthest barangay from city proper (36.99 km). A coastal barangay along Guimaras Strait where President Quezon stayed in 1942.',
    facts:'📊 Farthest barangay: 36.99 km • 1,489 ha • Pop. 5,581',
    spots:'⭐ WWII Historical Site (President Quezon 1942)|⭐ Coastal ecotourism',
    pts:[[265,490],[380,450],[415,480],[430,560],[390,610],[310,630],[265,595],[258,535]]
  },
];

// Depth for 3D extrusion
const D = 9;

// Color palettes
const pal = {
  u: { t1:'#ff7675', t2:'#d63031', side:'#922b21' },
  r: { t1:'#00b894', t2:'#00856c', side:'#006651' },
  t: { t1:'#fdcb6e', t2:'#e17055', side:'#a04000' },
};

function ptStr(pts) {
  return pts.map(p => p[0]+','+p[1]).join(' ');
}

function extrudePts(pts) {
  return pts.map(p => [p[0]+D, p[1]+D]);
}

// Build visible side faces (those facing down-right)
function buildSides(pts, side) {
  const n = pts.length;
  let out = '';
  for (let i = 0; i < n; i++) {
    const [x1,y1] = pts[i];
    const [x2,y2] = pts[(i+1)%n];
    // Edge normal pointing direction — show bottom/right faces only
    const nx = y2 - y1;  // perpendicular x
    const ny = x1 - x2;  // perpendicular y
    if (nx + ny < 0) {   // facing down-right = visible
      out += `<polygon points="${x1},${y1} ${x2},${y2} ${x2+D},${y2+D} ${x1+D},${y1+D}" fill="${side}" stroke="${side}" stroke-width="0.5" opacity="0.9"/>`;
    }
  }
  return out;
}

function centroid(pts) {
  const n = pts.length;
  let cx = 0, cy = 0;
  pts.forEach(([x,y]) => { cx+=x; cy+=y; });
  return [cx/n, cy/n];
}

function brgyHTML(b) {
  const c = pal[b.type];
  const gId = 'g'+b.name.replace(/\W/g,'');
  const [cx, cy] = centroid(b.pts);
  const nameEsc = b.name.replace(/'/g,'&#39;');
  const typeLabel = b.type==='u'?'Urban':'Rural';
  const factsEsc = (b.facts||'').replace(/'/g,'&#39;');
  const spotsEsc = (b.spots||'').replace(/'/g,'&#39;');
  const descEsc  = (b.desc||'').replace(/'/g,'&#39;');

  // Split label for long names
  const words = b.name.split(' ');
  let labelLines = [];
  if (b.name.length <= 9) {
    labelLines = [b.name];
  } else if (words.length === 2) {
    labelLines = words;
  } else if (words.length >= 3) {
    // split at midpoint
    const mid = Math.ceil(words.length/2);
    labelLines = [words.slice(0,mid).join(' '), words.slice(mid).join(' ')];
  } else {
    labelLines = [b.name];
  }

  const lineH = 9;
  const startY = cy - ((labelLines.length-1) * lineH / 2);
  const labelHTML = labelLines.map((l,i) =>
    `<text x="${cx}" y="${startY + i*lineH}" class="bl">${l}</text>`
  ).join('');

  return `
<!-- ${b.name} -->
<defs><linearGradient id="${gId}" x1="0" y1="0" x2="0.4" y2="1">
  <stop offset="0%" stop-color="${c.t1}"/>
  <stop offset="100%" stop-color="${c.t2}"/>
</linearGradient></defs>
<g class="bg" onclick="showInfo('${nameEsc}','${typeLabel}','${descEsc}','${factsEsc}','${spotsEsc}')">
  ${buildSides(b.pts, c.side)}
  <polygon class="bt" points="${ptStr(b.pts)}" fill="url(#${gId})" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
  ${labelHTML}
</g>`;
}

// Landmark pins
const pins = [
  { name:'City Hall & Bantayan Park', x:385, y:295, color:'#e74c3c', icon:'★',
    desc:'Bago City Hall and the historic Bantayan Park — site of the November 5, 1898 revolution led by Gen. Juan Araneta.', spots:'⭐ Al Cinco de Noviembre celebration' },
  { name:'Bago City Cathedral', x:365, y:315, color:'#9b59b6', icon:'✝',
    desc:'Spanish-colonial cathedral dedicated to San Sebastian, patron saint of Bago City. One of the oldest landmarks.', spots:'⭐ Religious heritage landmark' },
  { name:'Javellana Mansion (Balay Daku)', x:340, y:330, color:'#8e44ad', icon:'⌂',
    desc:'Built in 1920 on a 440-hectare sugar plantation, designed by an Italian architect. One of Bago Citys most prized heritage landmarks.', spots:'⭐ Heritage ancestral house tour' },
  { name:'Ma-ao Sugar Central', x:645, y:360, color:'#e67e22', icon:'⚙',
    desc:'Historic sugar mill — Ma-ao Sugar Central (MSC). A heritage industrial landmark in the most populated barangay.', spots:'⭐ MSC Ruins|⭐ Lacson Mansion ruins' },
  { name:'Kipot Twin Falls', x:585, y:510, color:'#3498db', icon:'★',
    desc:'Stunning twin waterfalls in Brgy. Mailum at the foot of Mt. Kanlaon. Reached via 220 steps. Cold, refreshing water.', spots:'⭐ Nature trip / family picnic destination' },
  { name:'Buenos Aires Mountain Resort', x:490, y:250, color:'#27ae60', icon:'⛰',
    desc:'A scenic mountain resort in Brgy. Busay with breathtaking views. Ideal for hiking and relaxation.', spots:'⭐ Mountain resort & hiking' },
  { name:'Rafael Salas Park', x:410, y:320, color:'#16a085', icon:'🌿',
    desc:'Named after Rafael Salas, UN Under-Secretary General from Bago City. A nature center and green sanctuary.', spots:'⭐ Nature center & park' },
];

function pinHTML(p) {
  const n = p.name.replace(/'/g,'&#39;');
  const d = p.desc.replace(/'/g,'&#39;');
  const s = (p.spots||'').replace(/'/g,'&#39;');
  return `<g class="lp" onclick="showInfo('${n}','Landmark','${d}','','${s}')">
  <circle cx="${p.x}" cy="${p.y}" r="10" fill="${p.color}" stroke="#fff" stroke-width="2.5" filter="url(#glow)"/>
  <text x="${p.x}" y="${p.y+3.5}" text-anchor="middle" font-size="10" fill="#fff" font-weight="900" pointer-events="none">${p.icon}</text>
</g>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title>Bago City Map</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;min-height:100vh;overflow-x:hidden}

/* Header */
.hdr{background:linear-gradient(135deg,#6b2200,#a03800);padding:max(16px,env(safe-area-inset-top)) 16px 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100;box-shadow:0 4px 20px rgba(0,0,0,.5)}
.bk{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.15);border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0}
.hi{flex:1}.hi h1{font-size:16px;font-weight:800;color:#fff;letter-spacing:-0.3px}.hi p{font-size:11px;color:rgba(255,255,255,.65);margin-top:1px}
.hdr img{width:36px;height:36px;border-radius:50%}

/* Legend */
.leg-bar{display:flex;gap:10px;flex-wrap:wrap;padding:9px 16px;background:#111;border-bottom:1px solid #222;font-size:11px;font-weight:600}
.leg{display:flex;align-items:center;gap:5px;color:#bbb}
.leg-dot{width:11px;height:11px;border-radius:3px}

/* Map area */
.mw{background:linear-gradient(160deg,#071428 0%,#0d2040 40%,#071428 100%);padding:12px 0 20px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.mw svg{display:block;width:100%;height:auto;min-width:380px}

/* Barangay styles */
.bg{cursor:pointer}
.bt{transition:filter .22s ease, transform .22s ease;transform-box:fill-box;transform-origin:center}
.bg:hover .bt{
  filter:brightness(1.55) saturate(1.5) drop-shadow(0 0 12px rgba(255,255,200,0.7));
  transform:translate(-5px,-5px)
}
.bl{font-size:7.5px;font-weight:800;fill:#fff;text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:#000;stroke-width:3px;stroke-linejoin:round;pointer-events:none;letter-spacing:0.3px}

/* Landmark pins */
.lp{cursor:pointer;transition:transform .2s ease;transform-box:fill-box;transform-origin:center}
.lp:hover{transform:scale(1.5) translateY(-3px)}

/* Map text */
.sea-lbl{font-size:13px;font-weight:800;fill:#5dade2;opacity:.5;font-style:italic;letter-spacing:1px}
.border-lbl{font-size:9px;font-weight:700;fill:rgba(255,255,255,0.25);text-anchor:middle;letter-spacing:1px;font-style:italic}
.river{fill:none;stroke:#5dade2;stroke-width:2.5;stroke-linecap:round;stroke-dasharray:none;opacity:.55}

/* Info panel */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:199;display:none;backdrop-filter:blur(6px)}
.ov.on{display:block}
.pn{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:500px;background:#1c1c1e;border-radius:22px 22px 0 0;padding:20px 20px 36px;box-shadow:0 -8px 40px rgba(0,0,0,.8);z-index:200;display:none;border-top:3px solid #a03800}
.pn.on{display:block;animation:sup .3s cubic-bezier(.2,.8,.3,1)}
@keyframes sup{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
.ph{width:36px;height:4px;background:#3a3a3c;border-radius:2px;margin:0 auto 18px}
.pc{position:absolute;top:18px;right:18px;width:30px;height:30px;border-radius:50%;background:#2c2c2e;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:30px;text-align:center}
#pname{font-size:21px;font-weight:900;color:#fff;margin-bottom:5px;line-height:1.2}
#ptype{display:inline-block;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:12px}
#pdesc{font-size:13px;color:#ababab;line-height:1.65;margin-bottom:10px}
.pr{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.fp{background:#1a3050;color:#74b9ff;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px}
.sp{background:#3d1500;color:#fdcb6e;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px}
.gm{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;padding:14px;background:linear-gradient(135deg,#0369a1,#0ea5e9);color:#fff;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none}
.bot{display:block;margin:10px 14px 32px;padding:15px;background:linear-gradient(135deg,#6b2200,#a03800);color:#fff;text-align:center;border-radius:14px;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.3px}
</style>
</head>
<body>

<div class="hdr">
  <a href="javascript:history.back()" class="bk">&#8592;</a>
  <div class="hi"><h1>Bago City 3D Map</h1><p>Tap any barangay for details</p></div>
  <img src="assets/images/bago-city-logo.png" alt="Bago City">
</div>

<div class="leg-bar">
  <div class="leg"><div class="leg-dot" style="background:#d63031;border-radius:3px"></div>Urban (8)</div>
  <div class="leg"><div class="leg-dot" style="background:#00856c;border-radius:3px"></div>Rural (16)</div>
  <div class="leg"><div class="leg-dot" style="background:#e17055;border-radius:3px"></div>Has Tourist Spot</div>
  <div class="leg"><div class="leg-dot" style="background:#e74c3c;border-radius:50%"></div>Landmark</div>
</div>

<div class="mw">
<svg viewBox="-20 0 1000 760" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="seaG" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0d47a1"/>
    <stop offset="100%" stop-color="#1a237e"/>
  </linearGradient>
  <linearGradient id="landG" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#1a3d2b"/>
    <stop offset="100%" stop-color="#2d6a4f"/>
  </linearGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="deepshadow">
    <feDropShadow dx="5" dy="8" stdDeviation="6" flood-color="#000" flood-opacity="0.55"/>
  </filter>
</defs>

<!-- Ocean background -->
<rect x="-20" y="0" width="1040" height="760" fill="url(#seaG)"/>

<!-- City land mass (matches real map outline) -->
<polygon fill="url(#landG)" stroke="#1e5631" stroke-width="2" opacity="0.7"
  points="35,30 880,30 930,200 910,450 870,560 800,640 700,700 560,730 400,740 270,710 170,670 95,600 50,520 30,420 25,300 32,150"/>

<!-- Bago River -->
<path class="river" d="M 570,35 Q 560,100 540,150 Q 510,210 480,260 Q 450,310 415,350 Q 375,390 330,415 Q 285,438 240,450 Q 200,460 165,475 Q 140,488 118,510"/>

<!-- Border labels -->
<text x="450" y="18" class="border-lbl">CITY OF BACOLOD ↑</text>
<text x="830" y="90" class="border-lbl" transform="rotate(15,830,90)">MUNICIPALITY OF MURCIA →</text>
<text x="200" y="690" class="border-lbl" transform="rotate(-5,200,690)">CITY OF LA CARLOTA ↓</text>
<text x="700" y="730" class="border-lbl" transform="rotate(-3,700,730)">CITY OF SAN CARLOS ↓</text>
<text x="30" y="500" class="border-lbl" transform="rotate(-90,30,500)">MUNICIPALITY OF PULUPANDAN</text>

<!-- Sea label -->
<text x="-15" y="370" class="sea-lbl" transform="rotate(-90,-15,370)">GUIMARAS STRAIT</text>

${barangays.map(brgyHTML).join('\n')}

<!-- MT KANLAON -->
<g class="bg" onclick="showInfo('Mt. Kanlaon Natural Park','Landmark','Active stratovolcano at 2,465m — highest peak in Visayas. Mt. Kanlaon Natural Park covers 3,651 ha within Bago City territory.','📊 Highest peak in Visayas: 2,465m • 3,651 ha inside Bago City','⭐ Mt. Kanlaon Natural Park|⭐ Hiking & mountaineering')">
<defs><linearGradient id="mtG" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#d7ccc8"/>
  <stop offset="40%" stop-color="#8d6e63"/>
  <stop offset="100%" stop-color="#4e342e"/>
</linearGradient></defs>
<polygon points="880,310 950,295 980,390 960,460 900,470 870,390" fill="#4e342e" stroke="#3e2723" stroke-width="1.5"/>
<polygon class="bt" points="876,305 946,290 976,385 956,455 896,465 866,385" fill="url(#mtG)" stroke="#5d4037" stroke-width="1.5"/>
<text x="921" y="378" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" paint-order="stroke" stroke="#000" stroke-width="3px" pointer-events="none">MT. KANLAON</text>
<text x="921" y="390" text-anchor="middle" font-size="7" fill="rgba(255,255,255,0.75)" paint-order="stroke" stroke="#000" stroke-width="2px" pointer-events="none">NATURAL PARK ▲ 2,465m</text>
</g>

${pins.map(pinHTML).join('\n')}

<!-- Compass Rose -->
<g transform="translate(930,55)">
  <circle r="28" fill="rgba(0,0,0,0.6)" stroke="#444" stroke-width="1.5"/>
  <line x1="0" y1="-20" x2="0" y2="20" stroke="#555" stroke-width="1"/>
  <line x1="-20" y1="0" x2="20" y2="0" stroke="#555" stroke-width="1"/>
  <polygon points="0,-18 4,0 0,-4 -4,0" fill="#e74c3c"/>
  <polygon points="0,18 4,0 0,4 -4,0" fill="#666"/>
  <polygon points="-18,0 0,4 -4,0 0,-4" fill="#666"/>
  <polygon points="18,0 0,4 4,0 0,-4" fill="#666"/>
  <text y="-20" text-anchor="middle" font-size="11" font-weight="900" fill="#e74c3c" dominant-baseline="auto">N</text>
  <text y="28" text-anchor="middle" font-size="9" fill="#aaa" dominant-baseline="auto">S</text>
  <text x="-22" y="4" text-anchor="middle" font-size="9" fill="#aaa">W</text>
  <text x="22" y="4" text-anchor="middle" font-size="9" fill="#aaa">E</text>
</g>

<!-- City label watermark -->
<text x="480" y="680" text-anchor="middle" font-size="18" font-weight="900" fill="rgba(255,220,130,0.2)" letter-spacing="3">CITY OF BAGO</text>
<text x="480" y="698" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.15)" letter-spacing="2">NEGROS OCCIDENTAL, PHILIPPINES</text>

</svg>
</div>

<a class="bot" href="https://maps.google.com/?q=Bago+City+Negros+Occidental+Philippines" target="_blank" rel="noopener">📍 Explore on Google Maps</a>

<!-- Overlay + Panel -->
<div class="ov" id="ov" onclick="hide()"></div>
<div class="pn" id="pn">
  <button class="pc" onclick="hide()">&#215;</button>
  <div class="ph"></div>
  <div id="pname"></div>
  <span id="ptype"></span>
  <p id="pdesc"></p>
  <div class="pr" id="pfacts"></div>
  <div class="pr" id="pspots"></div>
  <a class="gm" id="pgm" href="#" target="_blank" rel="noopener">📍 View on Google Maps</a>
</div>

<script>
function showInfo(name,type,desc,facts,spots){
  document.getElementById('pname').textContent = name;
  var t = document.getElementById('ptype');
  var u = type==='Urban', r = type==='Rural';
  t.textContent = u ? '🏙️ Urban Barangay' : r ? '🌿 Rural Barangay' : '📍 '+type;
  t.style.background = u ? 'rgba(214,48,49,0.2)' : r ? 'rgba(0,134,108,0.2)' : 'rgba(230,126,34,0.2)';
  t.style.color = u ? '#ff7675' : r ? '#55efc4' : '#fdcb6e';
  document.getElementById('pdesc').textContent = desc;
  document.getElementById('pfacts').innerHTML = facts ? facts.split('|').map(f=>'<span class="fp">'+f+'</span>').join('') : '';
  document.getElementById('pspots').innerHTML = spots ? spots.split('|').map(s=>'<span class="sp">'+s+'</span>').join('') : '';
  document.getElementById('pgm').href = 'https://maps.google.com/?q='+encodeURIComponent(name+' Bago City Negros Occidental Philippines');
  document.getElementById('pn').classList.add('on');
  document.getElementById('ov').classList.add('on');
}
function hide(){
  document.getElementById('pn').classList.remove('on');
  document.getElementById('ov').classList.remove('on');
}
</script>
</body>
</html>`;

fs.writeFileSync('map.html', html, 'utf8');
console.log('Done — ' + html.length + ' bytes, ' + html.split('\n').length + ' lines');
