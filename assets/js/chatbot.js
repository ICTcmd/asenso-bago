// ═══════════════════════════════════════════════════════════
// BAGO CITY AI ASSISTANT
// Powered by Groq (llama-3.3-70b-versatile) - Fast & Reliable
// Answers questions about Bago City government services only
// ═══════════════════════════════════════════════════════════

// ── CONFIG — API key injected at build time ────────────────
const GROQ_API_KEY = (typeof CHATBOT_CONFIG !== 'undefined') ? CHATBOT_CONFIG.groqKey : '__GROQ_API_KEY__';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-70b-versatile';

// ── System prompt — strictly limits chatbot to Bago City services ──
const SYSTEM_PROMPT = `You are "Bago Buddy" — the friendly, fun, and helpful AI assistant of the City Government of Bago, Negros Occidental, Philippines.

Your personality:
- Warm, friendly, and conversational — like a helpful kabayan (fellow citizen)
- Use light Hiligaynon phrases naturally: "Maayong adlaw!", "Salamat!", "Okay lang!" 
- Add relevant emojis to make responses more readable and engaging
- Keep answers practical and easy to understand
- Celebrate when you help someone: "Great! Here's what you need 🎉"
- Be encouraging: "No worries, I've got you covered! 😊"

You ONLY answer questions about:

**ASENSO BAGO APP GUIDE:**
- The app has these sections: Home, Health Programs, Caravan, SOCA, News, Services, Profile
- HOME: Shows greeting, quick service shortcuts, health program chips, news feed, Daily Bible Verse
- HEALTH PROGRAMS: Heart Warriors (cardiac), Wheels of Love (wheelchair), Smile Bright Bago (dental) — tap any to request service via health-request form
- CARAVAN (Asenso Caravan): Serbisyo sa Barangay Caravan — free government services brought to barangays. Check schedule at caravan-blond.vercel.app
- SOCA: State of the City Address archive and major announcements
- NEWS: Live Facebook feed from The Citybridge — official Bago City government page
- SERVICES: Full list of all city services (E-Services, Health, Caravan, SOCA, Be In Bago, Tourism, Bago Safe, Transparency, Barangays, City Map)
- PROFILE: Sign in/Sign up, My Applications, Notifications, Privacy settings
- TOURISM: 9 tourist spots with photos, official tourism video, annual festivals
- BARANGAYS: All 24 barangays with history, land area, tourist spots
- BAGO SAFE: Report non-emergency incidents (flooding, fallen trees, road damage) — goes to DRRMO
- BE IN BAGO: Tourism website for Bago City
- E-SERVICES: Online government transactions at eservices.bagocity.gov.ph
- CITY MAP: Interactive map with points of interest
- INSTALL AS APP: Users can add to home screen from browser for full app experience

**BAGO CITY GOVERNMENT SERVICES:**
- Business permits and licensing (Mayor's permit)
- Civil registry (birth/marriage/death certificates, CENOMAR)
- Barangay clearance and certificates
- Community Tax Certificate (Cedula)
- Building permits
- PhilHealth, SSS, PAG-IBIG, PhilSys enrollment
- TESDA programs
- DTI business name registration
- COMELEC voter registration
- Tourism information

**HEALTH PROGRAMS:**
- Heart Warriors: free cardiac screening, blood pressure, ECG, medicines
- Wheels of Love: free wheelchairs for PWD beneficiaries
- Smile Bright Bago: free dental care

**CONTACT INFO:**
- City Hall: General Luna St., Bago City, Negros Occidental
- Hotline: (034) 446-1319
- DRRMO (24/7): (034) 473-0043
- Office hours: Monday–Friday, 8:00 AM – 5:00 PM
- Facebook: The Citybridge

For questions NOT about Bago City, say warmly: "Ay, that's outside my area of expertise! 😄 I'm only your Bago City guide. Ask me about city services, the app, or government requirements — I'm happy to help! 🏛️"

Always end responses with a follow-up prompt like:
- "Anything else I can help you with? 😊"
- "May iba pa ka questions? 🙋"
- "Need more details about any of these? Just ask! 💬"`;

// ═══════════════════════════════════════════════════════════
// RESPONSE CACHE
// Stores AI answers in localStorage for 7 days
// Same question → instant answer, no API call needed
// ═══════════════════════════════════════════════════════════
const CACHE_KEY    = 'bago_chatbot_cache';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function normalizeQuestion(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')   // remove punctuation
    .replace(/\s+/g, ' ')          // collapse spaces
    // normalize common Filipino/English variants
    .replace(/\b(paano|how to|how do i|how can i|pano)\b/g, 'how')
    .replace(/\b(kumuha|makakuha|get|obtain|apply for|request)\b/g, 'get')
    .replace(/\b(requirement|requirements|req|kakailanganin|kailangan)\b/g, 'requirements')
    .replace(/\b(birth cert|birth certificate|bc)\b/g, 'birth certificate')
    .replace(/\b(biz permit|business permit|mayors permit|mayor permit)\b/g, 'business permit')
    .replace(/\b(brgy|barangay) (clearance|certificate|cert)\b/g, 'barangay clearance')
    .replace(/\b(cedula|community tax|ctc)\b/g, 'cedula')
    .trim();
}

function getCachedAnswer(question) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const key   = normalizeQuestion(question);
    const entry = cache[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      delete cache[key];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    return entry.answer;
  } catch { return null; }
}

function setCachedAnswer(question, answer) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const key   = normalizeQuestion(question);
    cache[key]  = { answer, ts: Date.now() };
    // Keep only last 50 entries to avoid bloating localStorage
    const keys  = Object.keys(cache);
    if (keys.length > 50) {
      const oldest = keys.sort((a, b) => cache[a].ts - cache[b].ts)[0];
      delete cache[oldest];
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

// ── Pre-built answers for the most common questions ────────
// These are served instantly — no API call ever needed
const INSTANT_ANSWERS = {
  'business permit requirements': `**Business Permit (Mayor's Permit) Requirements — Bago City**

**New Business:**
1. Barangay Clearance
2. DTI Business Name Registration (for sole proprietors)
3. SEC Registration (for corporations/partnerships)
4. Cedula (Community Tax Certificate)
5. Sketch/Location Map of business
6. Contract of Lease (if renting)
7. Fire Safety Inspection Certificate
8. Sanitary Permit
9. Building Permit (for new structures)

**Renewal:**
1. Previous year's Mayor's Permit
2. Latest Barangay Clearance
3. Cedula
4. Official Receipt of previous payments

**Where:** Bago City Hall, Business Permits & Licensing Office
**Hours:** Monday–Friday, 8:00 AM – 5:00 PM
**Contact:** (034) 446-1319`,

  'birth certificate requirements': `**Birth Certificate — Bago City Civil Registry**

**How to get a copy:**
1. Go to the Bago City Civil Registry Office, City Hall
2. Fill out the request form
3. Present valid ID
4. Pay the processing fee

**Requirements:**
- Valid government-issued ID
- Filled request form
- Payment of fees

**PSA Birth Certificate (National copy):**
- Apply at PSA Bacolod or online at **serbilis.psa.gov.ph**
- Requirements: valid ID + payment (₱365 per copy)

**Processing time:** 1–3 business days (local), 1–2 weeks (PSA)
**Office hours:** Monday–Friday, 8:00 AM – 5:00 PM`,

  'barangay clearance requirements': `**Barangay Clearance Requirements**

Go to your **home barangay hall** and bring:
1. Valid government-issued ID
2. Proof of residency (utility bill, lease contract)
3. Cedula (Community Tax Certificate)
4. Completed application form (available at barangay)

**Processing:** Same day, 15–30 minutes
**Fee:** ₱50–₱100 (varies per barangay)
**Hours:** Monday–Friday, 8:00 AM – 5:00 PM

The clearance is valid for **6 months** from date of issue.`,

  'cedula requirements': `**Cedula (Community Tax Certificate) — Bago City**

**Requirements:**
1. Valid government-issued ID
2. Fill out the application form at the City Treasurer's Office

**Where:** City Treasurer's Office, Bago City Hall
**Fee:** Based on income (minimum ₱5.00)
**Processing:** Same day, 10–15 minutes
**Hours:** Monday–Friday, 8:00 AM – 5:00 PM`,

  'heart warriors requirements': `**Heart Warriors Program — Requirements**

Heart Warriors provides **free cardiac screening** to Bagonhons.

**Requirements:**
1. Valid ID
2. Referral from your barangay health center (optional but helpful)
3. Must be a resident of Bago City

**How to apply:**
1. Open the Asenso Bago app
2. Go to Health Services → Heart Warriors
3. Fill out the request form
4. Wait for confirmation via your mobile number

**Services provided:**
- Blood pressure monitoring
- ECG/EKG screening
- Cardiac consultation
- Free medicines (when available)

**Contact:** Bago City Health Office — (034) 446-1319`,

  'wheels of love requirements': `**Wheels of Love Program — Requirements**

Wheels of Love provides **free wheelchairs** to qualified PWD beneficiaries.

**Requirements:**
1. PWD ID (issued by Bago City OSWD)
2. Medical certificate from a licensed physician
3. Proof of residency in Bago City
4. Filled application form

**How to apply:**
1. Open the Asenso Bago app → Health Services → Wheels of Love
2. Fill the form and upload your PWD ID photo
3. You will be contacted for verification

**Contact:** Bago City CSWDO — (034) 446-1319`,

  'smile bright bago requirements': `**Smile Bright Bago — Dental Program Requirements**

Free dental services for all Bagonhons.

**Services available:**
- Tooth extraction
- Oral cleaning/prophylaxis
- Check-up and consultation
- Tooth restoration

**Requirements:**
1. Valid ID or Barangay Certificate
2. Must be a Bago City resident

**How to apply:**
1. Go to the Asenso Bago app → Health Services → Smile Bright Bago
2. Fill out the dental request form
3. Select preferred date and time
4. Wait for confirmation via mobile

**Contact:** Bago City Health Office — (034) 446-1319`,

  'how does the app work': `**📱 Asenso Bago App Guide**

Here's everything you can do in the app:

**🏠 Home**
Quick access to all services, health programs, and city news. Shows the daily Bible verse and a live Facebook feed from The Citybridge.

**💚 Health Programs**
Request free health services:
- ❤️ Heart Warriors — cardiac screening
- ♿ Wheels of Love — free wheelchairs
- 🦷 Smile Bright Bago — dental care
Tap any program → fill the form → done!

**🚐 Asenso Caravan**
Mobile government services brought directly to your barangay. Check the schedule to know when it's coming to your area.

**🎓 SOCA**
Watch the State of the City Address and major announcements from Mayor Mayette Javellana Yao.

**📰 News**
Live updates from The Citybridge — official Bago City Facebook page.

**⚙️ City Services**
Access all government services:
- E-Services (online forms)
- Tourism guide
- Bago Safe (incident reporting)
- Barangay directory
- City Map
- And more!

**👤 Profile**
Sign in to track your health service requests and manage your account.

**🤖 This Chatbot (Bago Buddy!)**
Tap the orange chat button anytime to ask about services, requirements, or how to use the app!

Anything specific you want to know more about? 😊`,

  'asenso caravan': `**🚐 Asenso Caravan — Serbisyo sa Barangay**

The Asenso Caravan brings FREE government services directly to your barangay!

**Services at the caravan:**
- PhilHealth, SSS, PAG-IBIG, PhilSys (National ID)
- Civil Registry (birth/marriage/death certificates)
- CSWDO (social welfare)
- City Health Office (medical/dental)
- DTI, TESDA, COMELEC
- Legal services
- And more!

**2026 Completed Stops:**
✅ Brgy. Sagasa — July 25
✅ Brgy. Bacong — August 29
✅ Brgy. Tabunan — September 26
✅ Brgy. Pacol — October 24

**Upcoming:**
📅 Brgy. Binubuhan — November 28, 2026
📅 Brgy. Alianza — December 19, 2026

**Website:** caravan-blond.vercel.app

Just bring valid IDs and any specific requirements for the service you need! 😊`,

  'tourist spots bago city': `**🗺️ Tourist Spots in Bago City**

Bago City has 9 amazing attractions!

**🌿 Nature & Adventure:**
1. 💧 **Kipot Twin Falls** — Brgy. Mailum. 220 steps down to stunning twin waterfalls. Cold, refreshing water!
2. ⛰️ **Buenos Aires Mountain Resort** — Brgy. Ilijan. Scenic mountain views, perfect for hiking.
3. 🌳 **Rafael Salas Park & Nature Center** — City center green sanctuary for families.

**🏛️ Heritage & Culture:**
4. ⛪ **Saint John the Baptist Parish** — Historic Spanish-colonial church, one of Bago's oldest landmarks.
5. 🏡 **Javellana Mansion (Balay Daku)** — Built in 1920, Italian-inspired architecture on 440-hectare sugar plantation.
6. 🏛️ **Balay ni Tan Juan** — Well-preserved ancestral house showcasing Bago City's heritage.
7. 🏭 **Sugar Mill Heritage Sites** — Ma-ao Sugar Central, remnants of Bago's sugar industry history.
8. 🌿 **Bantayan Park** — Historic riverside park where the 1898 revolution against Spain began.
9. 🏢 **Bago City Hall** — Iconic civic landmark in the heart of the city.

**📅 Best time to visit:** November to April (dry season)
**✈️ Getting here:** 30-45 min from Bacolod-Silay Airport

Want details about any specific spot? 🗺️`,
};

// Pre-load instant answers into cache on startup
function preloadCache() {
  Object.entries(INSTANT_ANSWERS).forEach(([question, answer]) => {
    if (!getCachedAnswer(question)) {
      setCachedAnswer(question, answer);
    }
  });
}
// ── Conversation history + runtime state ──────────────────
let conversationHistory = [];
let isChatOpen = false;
let isTyping = false;
const SUGGESTED_QUESTIONS = [
  "🏢 Business permit requirements",
  "📋 Birth certificate — how to get",
  "🏥 Heart Warriors program",
  "📱 How does the app work?",
  "♿ Wheels of Love — how to apply",
  "🗺️ Tourist spots in Bago City",
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
          Maayong adlaw! 👋 I'm <strong>Bago Buddy</strong>, your Asenso Bago AI assistant!<br><br>
          I can help you with:<br>
          🏛️ Government service requirements<br>
          📱 How to use the Asenso Bago app<br>
          🏥 Health programs (Heart Warriors, Wheels of Love, Smile Bright)<br>
          🗺️ Tourism and attractions<br>
          📋 Permits, certificates, and more<br><br>
          What do you need help with today? 😊
        </div>
      </div>
    </div>

    <div id="chatbot-suggestions"></div>

    <div id="chatbot-no-key">
      &#x26A0;&#xFE0F; API key not configured. Please add your Groq API key in chatbot.js.
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

  // Pre-load common answers into cache
  preloadCache();

  // Check API key
  if (!GROQ_API_KEY || GROQ_API_KEY === '__GROQ_API_KEY__') {
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

  // Render markdown for bot messages
  let formatted = text;
  if (role === 'bot') {
    formatted = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')   // **bold**
      .replace(/\*(.+?)\*/g, '<em>$1</em>')               // *italic*
      .replace(/^###\s+(.+)$/gm, '<strong>$1</strong>')   // ### heading
      .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0;">')  // ---
      .replace(/^\d+\.\s/gm, '<br>$&')                    // numbered lists
      .replace(/^[\*\-]\s/gm, '<br>• ')                   // bullet lists
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  msg.innerHTML = `<div class="msg-bubble">${formatted}</div>`;
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
  if (!GROQ_API_KEY || GROQ_API_KEY === '__GROQ_API_KEY__') return;

  const input = document.getElementById('chatbot-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';
  document.getElementById('chatbot-suggestions').innerHTML = '';
  addMessage(text, 'user');
  conversationHistory.push({ role: 'user', parts: [{ text }] });

  // ── Check cache first ──────────────────────────────────
  const cached = getCachedAnswer(text);
  if (cached) {
    addMessage(cached + '\n\n<em style="font-size:11px;color:#9ca3af;">Instant answer from cache</em>', 'bot');
    conversationHistory.push({ role: 'model', parts: [{ text: cached }] });
    return;
  }

  // ── Cache miss — call Gemini ───────────────────────────
  isTyping = true;
  document.getElementById('chatbot-send').disabled = true;
  showTyping();

  try {
    const response = await callGroq(text);
    hideTyping();
    addMessage(response, 'bot');
    conversationHistory.push({ role: 'model', parts: [{ text: response }] });
    // Save to cache for next time
    setCachedAnswer(text, response);
  } catch (err) {
    hideTyping();
    addMessage('Sorry, I had trouble connecting. Please try again in a moment.', 'bot');
    console.error('Chatbot error:', err);
  } finally {
    isTyping = false;
    document.getElementById('chatbot-send').disabled = false;
  }
}

// ── Call Groq API ──────────────────────────────────────────
async function callGroq(userMessage, retryCount = 0) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000); // 45 seconds

  // Build messages array for OpenAI-style format
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text
    }))
  ];

  const body = {
    model: GROQ_MODEL,
    messages: messages,
    temperature: 0.4,
    max_tokens: 2048,
    top_p: 0.9,
  };

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content
      || 'I could not generate a response. Please try again.';

  } catch (err) {
    clearTimeout(timeout);
    // Retry once on timeout
    if (err.name === 'AbortError' && retryCount < 1) {
      return callGroq(userMessage, retryCount + 1);
    }
    throw err;
  }
}

// ── Initialize when DOM is ready ───────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildChatbot);
} else {
  buildChatbot();
}
