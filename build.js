// Auto-replace cache version with current timestamp on every deploy
const fs = require('fs');
const version = Date.now().toString();
const swPath = './sw.js';
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('__CACHE_VERSION__', version);
fs.writeFileSync(swPath, sw);
console.log('Service worker cache version set to:', version);
