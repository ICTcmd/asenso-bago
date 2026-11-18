// Build script — runs on every Vercel deploy
const fs = require('fs');

// Inject service worker cache version (timestamp)
const version = Date.now().toString();
const swPath = './sw.js';
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('__CACHE_VERSION__', version);
fs.writeFileSync(swPath, sw);
console.log('Service worker cache version set to:', version);

// Generate chatbot-config.js from Vercel environment variable
// Set GEMINI_API_KEY in Vercel Dashboard → Settings → Environment Variables
const geminiKey = process.env.GEMINI_API_KEY || '';
if (geminiKey) {
  const configContent = `// Auto-generated during build — do not edit manually\nconst CHATBOT_CONFIG = { geminiKey: '${geminiKey}' };\n`;
  fs.writeFileSync('./assets/js/chatbot-config.js', configContent);
  console.log('Chatbot config generated successfully.');

  // Also inject directly into chatbot.js for reliability
  let chatbot = fs.readFileSync('./assets/js/chatbot.js', 'utf8');
  chatbot = chatbot.replace('__GEMINI_API_KEY__', geminiKey);
  fs.writeFileSync('./assets/js/chatbot.js', chatbot);
  console.log('Gemini API key injected into chatbot.js');
} else {
  const placeholder = `// API key not set — add GEMINI_API_KEY in Vercel environment variables\nconst CHATBOT_CONFIG = { geminiKey: '' };\n`;
  fs.writeFileSync('./assets/js/chatbot-config.js', placeholder);
  console.log('Warning: GEMINI_API_KEY not set. Chatbot will show placeholder.');
}
