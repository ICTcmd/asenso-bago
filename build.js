// Build script — runs on every Vercel deploy
const fs = require('fs');

// Inject service worker cache version (timestamp)
const version = Date.now().toString();
const swPath = './sw.js';
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('__CACHE_VERSION__', version);
fs.writeFileSync(swPath, sw);
console.log('Service worker cache version set to:', version);
