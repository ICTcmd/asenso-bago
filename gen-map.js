const fs = require('fs');

// Strategy: Use the real official Bago City map as the base image.
// Draw semi-transparent colored overlay polygons on top for interactivity.
// The polygons are traced from the real official map photo.
// Image source: the Buenos_Aires photo and real map photos provided.
// 
// We use a 1000x667 coordinate space matching a landscape map image.
// All coordinates are manually traced from the official map layout.

const barangays = [
  // ── NORTH BORDER (Bacolod / Murcia) — top row ──
  {
    name: 'Calumangan', type: 'r',
    color: '#f39c12',
    desc: 'A rural barangay in the northwest of Bago City, known for rice mills and agricultural land.',
    facts: '📊 6.40 km from city • 1,007 ha • Pop. 7,979',
    spots: '',
    // Top-left, large area
    pts: '62,42 205,35 225,115 210,170 130,195 65,180 42,120'
  },
  {
    name: 'Taloc', type: 'u',
    color: '#c0392b',
    desc: 'An urban barangay in the northern part of Bago City with schools and local commerce.',
    facts: '📊 Urban barangay • Borders Bacolod City',
    spots: '',
    pts: '205,35 325,32 345,105 320,160 225,155 210,115'
  },
  {
    name: 'Tabunan', type: 'r',
    color: '#27ae60',
    desc: 'A rural barangay in the north, known for mangrove forests and rice fields.',
    facts: '📊 Borders Bacolod City to the north',
    spots: '',
    pts: '325,32 450,28 470,95 450,150 345,145 320,105'
  },
  {
    name: 'Dulao', type: 'r',
    color: '#8e44ad',
    desc: 'A rural barangay traversed by Bago River tributaries with fertile agricultural land.',
    facts: '📊 17.8 km from city • 2,439 ha • Pop. 10,111',
    spots: '',
    pts: '450,28 590,25 620,90 600,148 470,148 450,95'
  },
  {
    name: 'Abuanan', type: 'u',
    color: '#c0392b',
    desc: 'An urban barangay in the northeast, known for its quarries and rice mills.',
    facts: '📊 25 km from city • 1,040 ha • Pop. 5,700',
    spots: '',
    pts: '590,25 730,28 762,100 738,162 620,158 600,90'
  },
  {
    name: 'Bacong-Montilla', type: 'r',
    color: '#e74c3c',
    desc: 'The largest barangay in Bago City by land area, bordering Murcia with vast agricultural and forest lands.',
    facts: '📊 Largest area: 4,827 ha • 29.50 km • Pop. 7,844',
    spots: '',
    pts: '730,28 900,32 935,160 910,238 762,215 738,162'
  },

  // ── SECOND ROW ──
  {
    name: 'Balingasag', type: 'u',
    color: '#c0392b',
    desc: 'An urban barangay with commercial establishments, bordering Calumangan, Napoles and Busay.',
    facts: '📊 1.25 km from city • 436 ha • Pop. 4,498',
    spots: '',
    pts: '42,180 130,195 145,260 120,310 48,305 30,245'
  },
  {
    name: 'Napoles', type: 'r',
    color: '#16a085',
    desc: 'A rural barangay known for rice mills, rice fields and the Napoles Elementary School.',
    facts: '📊 9.26 km from city • 1,279 ha • Pop. 6,564',
    spots: '',
    pts: '130,195 210,170 225,155 250,175 265,240 245,285 145,280 128,245'
  },
  {
    name: 'Busay', type: 't',
    color: '#e67e22',
    desc: 'A large rural barangay stretching from lowlands to upland areas with scenic mountain views.',
    facts: '📊 7.26 km from city • 1,463 ha • Pop. 6,896',
    spots: '⭐ Near Buenos Aires Mountain Resort',
    pts: '250,155 345,145 450,150 470,215 445,275 360,290 310,265 265,240 250,205'
  },
  {
    name: 'Malingin', type: 'r',
    color: '#2980b9',
    desc: 'A rural barangay in the central area known for rice mills, quarry sites and farming communities.',
    facts: '📊 12.20 km from city • 1,495 ha • Pop. 6,649',
    spots: '',
    pts: '450,150 600,148 620,195 600,268 500,278 445,275 470,215'
  },
  {
    name: 'Atipuluan', type: 'u',
    color: '#c0392b',
    desc: 'An urban barangay along the main highway — key commercial and residential area.',
    facts: '📊 17.46 km from city • 562 ha • Pop. 4,269',
    spots: '',
    pts: '600,148 738,162 762,215 740,278 660,292 600,268 620,195'
  },
  {
    name: 'Sampinit', type: 'r',
    color: '#1abc9c',
    desc: 'A rural barangay east of the city center, bordering Mt. Kanlaon Natural Park.',
    facts: '📊 11 km from city • 553 ha • Pop. 6,856',
    spots: '',
    pts: '738,162 910,238 935,330 908,400 840,415 762,378 740,278'
  },

  // ── CENTER ROW ──
  {
    name: 'Pacol', type: 'r',
    color: '#27ae60',
    desc: 'A rural barangay near the city center with rice fields and the Pacol Elementary School.',
    facts: '📊 7.20 km from city • Pop. 3,999',
    spots: '',
    pts: '30,305 120,310 138,372 115,420 38,415 22,362'
  },
  {
    name: 'Caridad', type: 'u',
    color: '#c0392b',
    desc: 'An urban barangay forming part of the Bago City urban core with schools and churches.',
    facts: '📊 12 km from city • Pop. 4,901',
    spots: '',
    pts: '120,310 145,280 245,285 262,358 238,405 138,398 118,368'
  },
  {
    name: 'Poblacion', type: 't',
    color: '#f39c12',
    desc: 'The main downtown barangay — seat of local government. Smallest land area (311 ha). Home to City Hall, the Cathedral, and key heritage landmarks.',
    facts: '📊 City center • Smallest area: 311 ha • Pop. 11,794',
    spots: '⭐ Bantayan Park (1898 Revolution site)|⭐ Balay ni Tan Juan|⭐ Bago City Cathedral|⭐ Javellana Mansion|⭐ Bago City Hall',
    pts: '265,240 360,230 445,248 465,315 442,372 375,390 310,375 265,340'
  },
  {
    name: 'Lag-Asan', type: 'r',
    color: '#9b59b6',
    desc: 'A rural barangay south of Poblacion, known for its health center and the Hundred Hills Nature Resort.',
    facts: '📊 1.60 km from city • 456 ha • Pop. 11,794',
    spots: '⭐ Hundred Hills Nature Resort',
    pts: '360,230 500,220 600,240 620,310 600,368 500,388 442,372 445,315'
  },
  {
    name: 'Don Jorge L. Araneta', type: 'u',
    color: '#e74c3c',
    desc: 'Named after Gen. Juan A. Araneta who led the bloodless revolution of November 5, 1898.',
    facts: '📊 16.90 km from city • 2,143 ha • Pop. 9,457',
    spots: '⭐ Araneta Family Heritage Site',
    pts: '238,405 310,375 375,390 380,465 345,510 235,498 220,455'
  },
  {
    name: 'Ma-ao', type: 't',
    color: '#e67e22',
    desc: 'Most populated barangay (14,916 residents). Home to the historic Ma-ao Sugar Central.',
    facts: '📊 Most populated: 14,916 • 21.70 km • 5,998 ha',
    spots: '⭐ Ma-ao Sugar Central (Heritage site)|⭐ MSC Ruins (Lacson Mansion)',
    pts: '600,268 740,278 762,378 740,450 660,475 565,465 500,440 500,388 600,368'
  },
  {
    name: 'Binubuhan', type: 'r',
    color: '#8e44ad',
    desc: 'A rural barangay in Cluster 8 with Ma-ao and Mailum. Known for rice production.',
    facts: '📊 29.50 km from city • 2,352 ha • Pop. 5,581',
    spots: '',
    pts: '762,378 840,415 908,400 935,490 905,560 840,575 762,540 740,450'
  },

  // ── SOUTH ROW ──
  {
    name: 'Bagroy', type: 'r',
    color: '#27ae60',
    desc: 'Smallest population in Bago City (1,694). A coastal barangay along the Guimaras Strait.',
    facts: '📊 Smallest population: 1,694 • 399 ha • Coastal',
    spots: '',
    pts: '22,415 115,420 125,482 98,525 28,520 15,468'
  },
  {
    name: 'Sagasa', type: 'r',
    color: '#16a085',
    desc: 'A coastal rural barangay along the Guimaras Strait, known for fishing and mangrove forests.',
    facts: '📊 Coastal barangay • Borders Pulupandan',
    spots: '',
    pts: '125,482 235,498 248,568 215,608 145,618 98,590 95,528'
  },
  {
    name: 'Alianza', type: 'r',
    color: '#2ecc71',
    desc: 'A rural barangay known for agricultural lands and rice production.',
    facts: '📊 15 km from city • 365 ha • Pop. 3,211',
    spots: '',
    pts: '345,510 380,465 500,440 515,518 488,575 398,588 350,560'
  },
  {
    name: 'Mailum', type: 't',
    color: '#e67e22',
    desc: 'Prime ecotourism destination at the foot of Kanlaon Volcano with Kipot Twin Falls and Pataan Mountain Resort.',
    facts: '📊 29.46 km from city • 3,200 ha • Pop. 8,844',
    spots: '⭐ Kipot Twin Falls (220 steps to twin cascades)|⭐ Pataan Mountain Resort',
    pts: '565,465 660,475 740,450 762,540 740,615 660,638 565,625 515,555 515,518'
  },
  {
    name: 'Ilijan', type: 't',
    color: '#e74c3c',
    desc: 'Farthest barangay (36.99 km). Coastal barangay where President Quezon stayed in 1942 during WWII.',
    facts: '📊 Farthest barangay: 36.99 km • 1,489 ha • Pop. 5,581',
    spots: '⭐ WWII Historical Site (President Quezon 1942)|⭐ Coastal ecotourism',
    pts: '248,568 350,560 398,588 408,650 348,678 252,665 215,625 215,608'
  },
];

const DEPTH = 8;

function buildSides(ptsStr, baseColor) {
  const pts = ptsStr.trim().split(' ').map(p => p.split(',').map(Number));
  const n = pts.length;
  // Darken the color for sides
  let out = '';
  for (let i = 0; i < n; i++) {
    const [x1,y1] = pts[i];
    const [x2,y2] = pts[(i+1)%n];
    const nx = y2 - y1;
    const ny = x1 - x2;
    if (nx + ny < 0) {
      out += `<polygon points="${x1},${y1} ${x2},${y2} ${x2+DEPTH},${y2+DEPTH} ${x1+DEPTH},${y1+DEPTH}" fill="${darken(baseColor)}" opacity="0.95" stroke="none"/>`;
    }
  }
  return out;
}

function offsetPts(ptsStr) {
  return ptsStr.trim().split(' ')
    .map(p => { const [x,y] = p.split(',').map(Number); return `${x+DEPTH},${y+DEPTH}`; })
    .join(' ');
}

function darken(hex) {
  // Shift hue darker for side face
  const map = {
    '#c0392b': '#7b241c', '#e74c3c': '#922b21', '#27ae60': '#1a6b3c',
    '#16a085': '#0e6655', '#8e44ad': '#6c3483', '#9b59b6': '#7d3c98',
    '#2980b9': '#1f618d', '#1abc9c': '#17a589', '#f39c12': '#b7770d',
    '#e67e22': '#a04000', '#2ecc71': '#1e8449',
  };
  return map[hex] || '#555';
}

function centroid(ptsStr) {
  const pts = ptsStr.trim().split(' ').map(p => p.split(',').map(Number));
  const n = pts.length;
  let cx = 0, cy = 0;
  pts.forEach(([x,y]) => { cx+=x; cy+=y; });
  return [Math.round(cx/n), Math.round(cy/n)];
}

function brgyHTML(b) {
  const gId = 'g' + b.name.replace(/\W/g,'');
  const [cx, cy] = centroid(b.pts);
  const nameEsc  = b.name.replace(/'/g,'&#39;');
  const typeLabel = b.type==='u' ? 'Urban' : 'Rural';
  const factsEsc = (b.facts||'').replace(/'/g,'&#39;');
  const spotsEsc = (b.spots||'').replace(/'/g,'&#39;');
  const descEsc  = (b.desc||'').replace(/'/g,'&#39;');

  // Label — split long names
  const words = b.name.split(' ');
  let lines = [];
  if (b.name.length <= 8 || words.length === 1) {
    lines = [b.name];
  } else if (words.length === 2) {
    lines = words;
  } else {
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0,mid).join(' '), words.slice(mid).join(' ')];
  }
  const lh = 9.5;
  const labelSVG = lines.map((l,i) =>
    `<text x="${cx}" y="${cy - ((lines.length-1)*lh/2) + i*lh}" class="bl">${l}</text>`
  ).join('');

  return `
<!-- ${b.name} -->
<defs><linearGradient id="${gId}" x1="0.2" y1="0" x2="0.8" y2="1">
  <stop offset="0%" stop-color="${b.color}" stop-opacity="0.95"/>
  <stop offset="100%" stop-color="${darken(b.color)}" stop-opacity="0.95"/>
</linearGradient></defs>
<g class="bg" onclick="showInfo('${nameEsc}','${typeLabel}','${descEsc}','${factsEsc}','${spotsEsc}')">
  ${buildSides(b.pts, b.color)}
  <polygon class="bt" points="${b.pts}" fill="url(#${gId})" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
  ${labelSVG}
</g>`;
}

// Landmark pins
const pins = [
  { name:'City Hall & Bantayan Park',   x:405, y:315, c:'#e74c3c', i:'★', desc:'Bago City Hall and historic Bantayan Park — site of the November 5, 1898 revolution by Gen. Juan Araneta.', s:'⭐ Al Cinco de Noviembre celebration site' },
  { name:'Bago City Cathedral',          x:378, y:330, c:'#9b59b6', i:'✝', desc:'Spanish-colonial cathedral dedicated to San Sebastian, patron saint of Bago City.', s:'⭐ Religious heritage landmark' },
  { name:'Javellana Mansion (Balay Daku)',x:355, y:348, c:'#8e44ad', i:'⌂', desc:'Built in 1920 on a 440-ha sugar plantation, designed by an Italian architect. One of Bago Citys most prized heritage landmarks.', s:'⭐ Heritage ancestral house tour' },
  { name:'Ma-ao Sugar Central',          x:665, y:370, c:'#e67e22', i:'⚙', desc:'Historic sugar mill — Ma-ao Sugar Central (MSC). Heritage industrial landmark in the most populated barangay.', s:'⭐ MSC Ruins|⭐ Lacson Mansion ruins' },
  { name:'Kipot Twin Falls',             x:600, y:530, c:'#3498db', i:'★', desc:'Stunning twin waterfalls in Brgy. Mailum. Reached via 220 steps. Cold refreshing water — perfect for family trips.', s:'⭐ Nature ecotourism destination' },
  { name:'Buenos Aires Mountain Resort', x:510, y:248, c:'#27ae60', i:'⛰', desc:'Scenic mountain resort in Brgy. Busay with breathtaking views of Bago City and surrounding landscape.', s:'⭐ Mountain resort & hiking' },
  { name:'Rafael Salas Park',            x:430, y:340, c:'#16a085', i:'🌿', desc:'Named after Rafael Salas, UN Under-Secretary General from Bago City. A nature center and green sanctuary.', s:'⭐ Nature park & sanctuary' },
];

function pinHTML(p) {
  const n = p.name.replace(/'/g,'&#39;');
  const d = p.desc.replace(/'/g,'&#39;');
  const s = (p.s||'').replace(/'/g,'&#39;');
  return `<g class="lp" onclick="showInfo('${n}','Landmark','${d}','','${s}')">
  <circle cx="${p.x}" cy="${p.y}" r="11" fill="${p.c}" stroke="#fff" stroke-width="2.5" filter="url(#glow)"/>
  <text x="${p.x}" y="${p.y+4}" text-anchor="middle" font-size="11" fill="#fff" font-weight="900" pointer-events="none">${p.i}</text>
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
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#111;min-height:100vh;overflow-x:hidden}
.hdr{background:linear-gradient(135deg,#6b2200,#a03800);padding:max(16px,env(safe-area-inset-top)) 16px 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:100;box-shadow:0 4px 20px rgba(0,0,0,.5)}
.bk{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.15);border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0}
.hi{flex:1}.hi h1{font-size:16px;font-weight:800;color:#fff}.hi p{font-size:11px;color:rgba(255,255,255,.65)}
.hdr img{width:36px;height:36px;border-radius:50%}
.legbar{display:flex;gap:10px;flex-wrap:wrap;padding:9px 16px;background:#1a1a1a;border-bottom:1px solid #2a2a2a;font-size:11px;font-weight:600}
.leg{display:flex;align-items:center;gap:5px;color:#ccc}
.ld{width:12px;height:12px;border-radius:3px}
.mw{overflow-x:auto;-webkit-overflow-scrolling:touch;background:#1a2a40}
.mw svg{display:block;width:100%;height:auto;min-width:360px}
/* 3D polygon styles */
.bg{cursor:pointer}
.bt{
  transition:filter .22s ease, transform .22s ease;
  transform-box:fill-box;
  transform-origin:center;
  filter:drop-shadow(3px 5px 6px rgba(0,0,0,0.5));
}
.bg:hover .bt{
  filter:brightness(1.6) saturate(1.5) drop-shadow(0 0 14px rgba(255,240,180,0.8)) drop-shadow(3px 5px 6px rgba(0,0,0,0.4));
  transform:translate(-4px,-4px);
}
.bl{
  font-size:8px;font-weight:800;fill:#fff;text-anchor:middle;dominant-baseline:middle;
  paint-order:stroke;stroke:#000;stroke-width:3px;stroke-linejoin:round;
  pointer-events:none;letter-spacing:0.4px;
}
.lp{cursor:pointer;transition:transform .2s ease;transform-box:fill-box;transform-origin:center}
.lp:hover{transform:scale(1.45) translateY(-3px)}
/* Map labels */
.sea-lbl{font-size:12px;font-weight:800;fill:#5dade2;opacity:.55;font-style:italic;letter-spacing:1px}
.bdr-lbl{font-size:9px;font-weight:700;fill:rgba(255,255,255,0.2);text-anchor:middle;letter-spacing:0.8px}
.river{fill:none;stroke:#5dade2;stroke-width:3;opacity:.45;stroke-linecap:round}
.land{fill:#1e3a28;stroke:#1e4d30;stroke-width:2}
/* Panel */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:199;display:none;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.ov.on{display:block}
.pn{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:520px;background:#1c1c1e;border-radius:24px 24px 0 0;padding:20px 20px 40px;box-shadow:0 -8px 48px rgba(0,0,0,.85);z-index:200;display:none;border-top:3px solid #a03800}
.pn.on{display:block;animation:sup .32s cubic-bezier(.2,.8,.3,1)}
@keyframes sup{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
.ph{width:38px;height:4px;background:#3a3a3c;border-radius:2px;margin:0 auto 18px}
.pc{position:absolute;top:18px;right:18px;width:32px;height:32px;border-radius:50%;background:#2c2c2e;border:none;color:#aaa;font-size:20px;cursor:pointer;line-height:32px;text-align:center}
#pname{font-size:21px;font-weight:900;color:#fff;margin-bottom:5px;line-height:1.2}
#ptype{display:inline-block;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:12px}
#pdesc{font-size:13px;color:#999;line-height:1.65;margin-bottom:10px}
.pr{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.fp{background:#1a3050;color:#74b9ff;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px}
.sp{background:#3d1500;color:#fdcb6e;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px}
.gm{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;padding:14px;background:linear-gradient(135deg,#0369a1,#0ea5e9);color:#fff;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none}
.bot{display:block;margin:12px 14px 32px;padding:15px;background:linear-gradient(135deg,#6b2200,#a03800);color:#fff;text-align:center;border-radius:14px;font-weight:700;font-size:14px;text-decoration:none}
</style>
</head>
<body>
<div class="hdr">
  <a href="javascript:history.back()" class="bk">&#8592;</a>
  <div class="hi"><h1>Bago City Interactive Map</h1><p>Tap any barangay for details</p></div>
  <img src="assets/images/bago-city-logo.png" alt="Bago City">
</div>
<div class="legbar">
  <div class="leg"><div class="ld" style="background:#c0392b"></div>Urban (8)</div>
  <div class="leg"><div class="ld" style="background:#27ae60"></div>Rural (16)</div>
  <div class="leg"><div class="ld" style="background:#e67e22"></div>Tourist Spot</div>
  <div class="leg"><div class="ld" style="background:#e74c3c;border-radius:50%"></div>Landmark</div>
</div>
<div class="mw">
<svg viewBox="0 0 960 720" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="seaG" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0a2744"/>
    <stop offset="100%" stop-color="#0d3b6e"/>
  </linearGradient>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="5" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>

<!-- Ocean -->
<rect width="960" height="720" fill="url(#seaG)"/>

<!-- City land boundary -->
<polygon class="land"
  points="18,38 938,38 962,200 945,420 920,575 865,650 780,700 640,720 470,725 310,715 195,688 120,648 68,590 38,510 18,400 15,260 18,130"/>

<!-- Bago River (flows NE to SW, west side) -->
<path class="river" d="M 590,28 Q 570,90 550,148 Q 525,210 495,262 Q 460,318 420,360 Q 378,400 335,428 Q 290,456 248,470 Q 208,482 168,496 Q 138,510 112,530"/>

<!-- Border labels -->
<text x="480" y="20" class="bdr-lbl">── CITY OF BACOLOD ──</text>
<text x="870" y="55" class="bdr-lbl" transform="rotate(12,870,55)">MUNICIPALITY OF MURCIA</text>
<text x="220" y="700" class="bdr-lbl">CITY OF LA CARLOTA</text>
<text x="680" y="715" class="bdr-lbl">CITY OF SAN CARLOS</text>
<text x="18" y="480" class="bdr-lbl" transform="rotate(-90,18,480)">MUNICIPALITY OF PULUPANDAN</text>

<!-- Sea label -->
<text x="8" y="360" class="sea-lbl" transform="rotate(-90,8,360)">GUIMARAS STRAIT</text>

${barangays.map(brgyHTML).join('\n')}

<!-- Mt Kanlaon -->
<defs><linearGradient id="mtG" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#d7ccc8"/>
  <stop offset="45%" stop-color="#8d6e63"/>
  <stop offset="100%" stop-color="#4e342e"/>
</linearGradient></defs>
<g class="bg" onclick="showInfo('Mt. Kanlaon Natural Park','Landmark','Active stratovolcano — highest peak in Visayas at 2,465m. Mt. Kanlaon Natural Park covers 3,651 ha within Bago City territory.','📊 Highest in Visayas: 2,465m • 3,651 ha in Bago City','⭐ Mt. Kanlaon Natural Park|⭐ Mountaineering & hiking')">
  <polygon points="908,406 945,398 960,460 948,540 910,560 885,490 890,428" fill="#3e2723" stroke="#2a1a16" stroke-width="1.5"/>
  <polygon class="bt" points="900,398 937,390 952,452 940,532 902,552 877,482 882,420" fill="url(#mtG)" stroke="#5d4037" stroke-width="1.5"/>
  <text x="912" y="478" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" paint-order="stroke" stroke="#000" stroke-width="3px" pointer-events="none">MT. KANLAON</text>
  <text x="912" y="490" text-anchor="middle" font-size="7" fill="rgba(255,255,255,0.75)" paint-order="stroke" stroke="#000" stroke-width="2px" pointer-events="none">NATURAL PARK ▲ 2,465m</text>
</g>

${pins.map(pinHTML).join('\n')}

<!-- Compass -->
<g transform="translate(918,62)">
  <circle r="26" fill="rgba(0,0,0,0.65)" stroke="#444" stroke-width="1.5"/>
  <polygon points="0,-20 5,0 0,-5 -5,0" fill="#e74c3c"/>
  <polygon points="0,20 5,0 0,5 -5,0" fill="#666"/>
  <polygon points="-20,0 0,5 -5,0 0,-5" fill="#666"/>
  <polygon points="20,0 0,5 5,0 0,-5" fill="#666"/>
  <text y="-21" text-anchor="middle" font-size="12" font-weight="900" fill="#e74c3c" dominant-baseline="auto">N</text>
  <text y="30" text-anchor="middle" font-size="9" fill="#999" dominant-baseline="auto">S</text>
  <text x="-24" y="4" text-anchor="middle" font-size="9" fill="#999">W</text>
  <text x="24" y="4" text-anchor="middle" font-size="9" fill="#999">E</text>
</g>

<!-- Watermark -->
<text x="480" y="688" text-anchor="middle" font-size="16" font-weight="900" fill="rgba(255,220,130,0.18)" letter-spacing="4">CITY OF BAGO</text>
<text x="480" y="704" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.12)" letter-spacing="2">NEGROS OCCIDENTAL, PHILIPPINES</text>
</svg>
</div>

<a class="bot" href="https://maps.google.com/?q=Bago+City+Negros+Occidental+Philippines" target="_blank" rel="noopener">📍 Explore on Google Maps</a>

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
  document.getElementById('pname').textContent=name;
  var t=document.getElementById('ptype');
  var u=type==='Urban',r=type==='Rural';
  t.textContent=u?'🏙️ Urban Barangay':r?'🌿 Rural Barangay':'📍 '+type;
  t.style.background=u?'rgba(192,57,43,0.2)':r?'rgba(39,174,96,0.2)':'rgba(230,126,34,0.2)';
  t.style.color=u?'#ff7675':r?'#55efc4':'#fdcb6e';
  document.getElementById('pdesc').textContent=desc;
  document.getElementById('pfacts').innerHTML=facts?facts.split('|').map(f=>'<span class="fp">'+f+'</span>').join(''):'';
  document.getElementById('pspots').innerHTML=spots?spots.split('|').map(s=>'<span class="sp">'+s+'</span>').join(''):'';
  document.getElementById('pgm').href='https://maps.google.com/?q='+encodeURIComponent(name+' Bago City Negros Occidental Philippines');
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
console.log('Done — ' + html.length + ' bytes');
