// Build script — runs on every Vercel deploy
const fs = require('fs');

// Inject service worker cache version (timestamp)
const version = Date.now().toString();
const swPath = './sw.js';
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace('__CACHE_VERSION__', version);
fs.writeFileSync(swPath, sw);
console.log('Service worker cache version set to:', version);

// Verify environment variables are set (for logging purposes)
const groqKey = process.env.GROQ_API_KEY || '';
const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

if (groqKey) {
  console.log('✓ GROQ_API_KEY is configured');
  console.log('✓ GROQ_MODEL:', groqModel);
  console.log('✓ Chatbot will use secure backend API endpoint');
} else {
  console.warn('⚠ Warning: GROQ_API_KEY not set. Chatbot will not work.');
}

// Clean up old chatbot-config.js if it exists (no longer needed)
const oldConfigPath = './assets/js/chatbot-config.js';
if (fs.existsSync(oldConfigPath)) {
  fs.unlinkSync(oldConfigPath);
  console.log('✓ Removed old chatbot-config.js (no longer needed - using secure backend)');
}
