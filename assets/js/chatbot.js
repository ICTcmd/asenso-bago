// ═══════════════════════════════════════════════════════════
// BAGO CITY AI ASSISTANT
// Powered by Google Gemini
// Answers questions about Bago City government services only
// ═══════════════════════════════════════════════════════════

// ── CONFIG — API key injected at build time ────────────────
const GEMINI_API_KEY = (typeof CHATBOT_CONFIG !== 'undefined') ? CHATBOT_CONFIG.geminiKey : '__GEMINI_API_KEY__';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-3.8-flash:generateContent';

// ── System prompt — strictly limits chatbot to Bago City services ──
const SYSTEM_PROMPT = `You are the official AI assistant of the City Government of Bago, Negros Occidental, Philippines. Your name is "Bago City Assistant".

You ONLY answer questions about Bago City government services, requirements, and procedures. 

Topics you can answer:
- Business permits and licensing (Mayor's permit, business registration)
- Civil registry services (birth certificate, marriage certificate, death certificate, CENOMAR)
- Barangay clearance and barangay certificates
- Community Tax Certificate (Cedula)
- Building permits and construction clearance
- Health programs: Heart Warriors (cardiac screening), Wheels of Love (wheelchair assistance), Smile Bright Bago (dental care)
- PhilHealth, SSS, PAG-IBIG, PhilSys (National ID) enrollment and requirements
- TESDA TVET programs and registration
- DTI business name registration
- COMELEC voter registration
- Bago City tourism and attractions
- Bago City contact information and office hours
- Asenso Caravan schedules and services
- How to access Bago City e-services

For any question NOT related to Bago City government services, politely say: "I can only assist with Bago City government services and requirements. Please ask me about permits, certificates, health programs, or other city services."

Always be helpful, friendly, and answer in English or Filipino depending on the question language.
Keep answers concise and practical — focus on requirements and steps.
Office hours for most city services: Monday to Friday, 8:00 AM to 5:00 PM.
City Hall address: General Luna St., Bago City, Negros Occidental.
City Hall hotline: (034) 446-1319.`;

// ── Conversation history ───────────────────────────────────
let conversationHistory = [];
let isChatOpen = false;
let isTyping = false;

// ── Suggested questions ────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  "What are the requirements for a business permit?",
  "How do I get a birth certificate?",
  "How to apply for Wheels of Love?",
  "What is the Asenso Caravan?",
  "How to get a barangay clearance?",
  "Heart Warriors program requirements",
];

// ═══════════════════════════════════════════════════════════
// BUILD THE CHATBOT UI
// ═══════════════════════════════════════════════════════════
function buildChatbot() {
  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    /* Floating button */
    #chatbot-btn {
      position: fixed;
      bottom: 90px;
      right: 16px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D97732, #F3A65A);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(217,119,50,0.4), 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9000;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }
    #chatbot-btn:hover { transform: scale(1.08); }
    #chatbot-btn:active { transform: scale(0.95); }
    #chatbot-btn svg { width: 28px; height: 28px; color: white; }

    /* Notification dot */
    #chatbot-btn .notif-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid white;
    }

    /* Backdrop */
    #chatbot-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 9001;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    #chatbot-backdrop.open {
      display: block;
      opacity: 1;
    }

    /* Chat window — bottom sheet on mobile */
    #chatbot-window {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-width: 480px;
      margin: 0 auto;
      height: 85vh;
      max-height: 680px;
      background: #fff;
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -8px 32px rgba(0,0,0,0.15);
      z-index: 9002;
      display: flex;
      flex-direction: column;
      transform: translateY(100%);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    #chatbot-window.open {
      transform: translateY(0);
    }

    /* Header */
    #chatbot-header {
      background: linear-gradient(135deg, #D97732, #F3A65A);
      padding: 16px 20px;
      border-radius: 24px 24px 0 0;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    #chatbot-header .bot-avatar {
      width: 42px;
      height: 42px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    #chatbot-header .bot-info { flex: 1; }
    #chatbot-header .bot-name {
      font-size: 16px;
      font-weight: 700;
      color: white;
      margin: 0;
      line-height: 1.2;
    }
    #chatbot-header .bot-status {
      font-size: 12px;
      color: rgba(255,255,255,0.85);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    #chatbot-header .bot-status::before {
      content: '';
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
    }
    #chatbot-close {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      font-size: 20px;
      line-height: 1;
      -webkit-tap-highlight-color: transparent;
    }

    /* Messages area */
    #chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      -webkit-overflow-scrolling: touch;
    }

    /* Message bubbles */
    .chat-msg {
      display: flex;
      gap: 8px;
      max-width: 90%;
      animation: msgIn 0.25s ease;
    }
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .chat-msg.bot { align-self: flex-start; }
    .chat-msg.user { align-self: flex-end; flex-direction: row-reverse; }

    .msg-bubble {
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.6;
      max-width: 100%;
      word-break: break-word;
    }
    .chat-msg.bot .msg-bubble {
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }
    .chat-msg.user .msg-bubble {
      background: linear-gradient(135deg, #D97732, #F3A65A);
      color: white;
      border-bottom-right-radius: 4px;
    }

    /* Typing indicator */
    .typing-bubble {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: #f3f4f6;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
    }
    .typing-dot {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: typingBounce 1.2s infinite;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* Suggested questions */
    #chatbot-suggestions {
      padding: 0 16px 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex-shrink: 0;
    }
    .suggestion-chip {
      background: #fff4e8;
      border: 1px solid #f3a65a;
      color: #c56620;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .suggestion-chip:hover { background: #D97732; color: white; border-color: #D97732; }

    /* Input area */
    #chatbot-input-area {
      padding: 12px 16px;
      padding-bottom: max(16px, env(safe-area-inset-bottom));
      border-top: 1px solid #f3f4f6;
      display: flex;
      gap: 8px;
      align-items: flex-end;
      flex-shrink: 0;
      background: white;
    }
    #chatbot-input {
      flex: 1;
      border: 2px solid #e5e7eb;
      border-radius: 20px;
      padding: 10px 16px;
      font-size: 14px;
      font-family: inherit;
      resize: none;
      outline: none;
      max-height: 100px;
      min-height: 42px;
      line-height: 1.4;
      transition: border-color 0.2s;
    }
    #chatbot-input:focus { border-color: #D97732; }
    #chatbot-send {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D97732, #F3A65A);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.15s, opacity 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    #chatbot-send:disabled { opacity: 0.4; cursor: not-allowed; }
    #chatbot-send:not(:disabled):active { transform: scale(0.9); }
    #chatbot-send svg { width: 20px; height: 20px; }

    /* No API key warning */
    #chatbot-no-key {
      text-align: center;
      padding: 20px;
      font-size: 13px;
      color: #6b7280;
      display: none;
    }
  `;
  document.head.appendChild(style);

  // Create floating button
  const btn = document.createElement('button');
  btn.id = 'chatbot-btn';
  btn.setAttribute('aria-label', 'Open Bago City Assistant');
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
    </svg>
    <span class="notif-dot"></span>
  `;

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'chatbot-backdrop';

  // Create chat window
  const chatWindow = document.createElement('div');
  chatWindow.id = 'chatbot-window';
  chatWindow.setAttribute('role', 'dialog');
  chatWindow.setAttribute('aria-label', 'Bago City Assistant');
  chatWindow.innerHTML = `
    <div id="chatbot-header">
      <div class="bot-avatar">&#x1F3DB;&#xFE0F;</div>
      <div class="bot-info">
        <p class="bot-name">Bago City Assistant</p>
        <p class="bot-status">Online • Ask me about city services</p>
      </div>
      <button id="chatbot-close" aria-label="Close chat">&#x2715;</button>
    </div>

    <div id="chatbot-messages">
      <div class="chat-msg bot">
        <div class="msg-bubble">
          Maayong adlaw! I'm the Bago City Government Assistant.<br><br>
          I can help you with requirements and procedures for city services like permits, certificates, health programs, and more.<br><br>
          What do you need help with today?
        </div>
      </div>
    </div>

    <div id="chatbot-suggestions"></div>

    <div id="chatbot-no-key">
      &#x26A0;&#xFE0F; API key not configured. Please add your Gemini API key in chatbot.js.
    </div>

    <div id="chatbot-input-area">
      <textarea id="chatbot-input" placeholder="Ask about city services..." rows="1"></textarea>
      <button id="chatbot-send" aria-label="Send message">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5"/>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(backdrop);
  document.body.appendChild(chatWindow);

  // Show suggestions
  buildSuggestions();

  // Check API key
  if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    document.getElementById('chatbot-no-key').style.display = 'block';
    document.getElementById('chatbot-input-area').style.display = 'none';
  }

  // Event listeners
  btn.addEventListener('click', openChat);
  backdrop.addEventListener('click', closeChat);
  document.getElementById('chatbot-close').addEventListener('click', closeChat);
  document.getElementById('chatbot-send').addEventListener('click', sendMessage);
  document.getElementById('chatbot-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  // Auto-resize textarea
  document.getElementById('chatbot-input').addEventListener('input', (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  });
}

// ── Build suggestion chips ─────────────────────────────────
function buildSuggestions() {
  const container = document.getElementById('chatbot-suggestions');
  container.innerHTML = '';
  SUGGESTED_QUESTIONS.forEach(q => {
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip';
    chip.textContent = q;
    chip.addEventListener('click', () => {
      document.getElementById('chatbot-input').value = q;
      sendMessage();
      container.innerHTML = ''; // hide suggestions after first use
    });
    container.appendChild(chip);
  });
}

// ── Open / Close ───────────────────────────────────────────
function openChat() {
  isChatOpen = true;
  document.getElementById('chatbot-backdrop').classList.add('open');
  document.getElementById('chatbot-window').classList.add('open');
  // Remove notification dot
  const dot = document.querySelector('#chatbot-btn .notif-dot');
  if (dot) dot.remove();
  // Focus input
  setTimeout(() => {
    const input = document.getElementById('chatbot-input');
    if (input) input.focus();
  }, 350);
}

function closeChat() {
  isChatOpen = false;
  document.getElementById('chatbot-backdrop').classList.remove('open');
  document.getElementById('chatbot-window').classList.remove('open');
}

// ── Add message bubble ─────────────────────────────────────
function addMessage(text, role) {
  const messages = document.getElementById('chatbot-messages');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${role}`;
  msg.innerHTML = `<div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

// ── Typing indicator ───────────────────────────────────────
function showTyping() {
  const messages = document.getElementById('chatbot-messages');
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.id = 'typing-indicator';
  typing.innerHTML = `
    <div class="typing-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();
}

// ── Send message ───────────────────────────────────────────
async function sendMessage() {
  if (isTyping) return;
  if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') return;

  const input = document.getElementById('chatbot-input');
  const text = input.value.trim();
  if (!text) return;

  // Clear input
  input.value = '';
  input.style.height = 'auto';

  // Hide suggestions permanently
  document.getElementById('chatbot-suggestions').innerHTML = '';

  // Show user message
  addMessage(text, 'user');

  // Add to history
  conversationHistory.push({ role: 'user', parts: [{ text }] });

  // Show typing
  isTyping = true;
  document.getElementById('chatbot-send').disabled = true;
  showTyping();

  try {
    const response = await callGemini(text);
    hideTyping();
    addMessage(response, 'bot');
    conversationHistory.push({ role: 'model', parts: [{ text: response }] });
  } catch (err) {
    hideTyping();
    addMessage('Sorry, I had trouble connecting. Please try again in a moment.', 'bot');
    console.error('Chatbot error:', err);
  } finally {
    isTyping = false;
    document.getElementById('chatbot-send').disabled = false;
  }
}

// ── Call Google Gemini API ─────────────────────────────────
async function callGemini(userMessage) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  // Build contents with system prompt prepended as first user turn
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + userMessage }] },
    ...conversationHistory.slice(1) // skip the first entry we just included
  ];

  // For subsequent messages use full history
  const requestContents = conversationHistory.length <= 1
    ? [{ role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + userMessage }] }]
    : [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Understood. I will only answer questions about Bago City government services.' }] },
        ...conversationHistory
      ];

  const body = {
    contents: requestContents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 500,
      topP: 0.9,
    },
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text
    || 'I could not generate a response. Please try again.';
}

// ── Initialize when DOM is ready ───────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildChatbot);
} else {
  buildChatbot();
}
