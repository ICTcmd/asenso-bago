// Auto-replace cache version with current timestamp on every deploy
const fs = require('fs');
const version = Date.now().toString();

// 1. Inject service worker cache version
const swPath = './sw.js';
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('__CACHE_VERSION__', version);
fs.writeFileSync(swPath, sw);
console.log('Service worker cache version set to:', version);

// 2. Inject Mapbox token into map.html from environment variable
const mapboxToken = process.env.MAPBOX_TOKEN;
if (mapboxToken) {
  const mapPath = './map.html';
  let map = fs.readFileSync(mapPath, 'utf8');
  map = map.replace('MAPBOX_TOKEN_PLACEHOLDER', mapboxToken);
  fs.writeFileSync(mapPath, map);
  console.log('Mapbox token injected into map.html');
} else {
  console.warn('Warning: MAPBOX_TOKEN env var not set — map.html will not work');
}
