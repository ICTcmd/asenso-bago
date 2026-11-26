// ═══════════════════════════════════════════════════════════
// SECURE CHATBOT API ENDPOINT
// Handles AI requests server-side to protect API keys
// ═══════════════════════════════════════════════════════════

// Fast, non-blocking Supabase Knowledge Base lookup (Bago Buddy 2.0 RAG)
async function fetchKnowledgeContext(queryText) {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://esvbibxavfrxkkfujhmz.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzdmJpYnhhdmZyeGtrZnVqaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NDgyMjIsImV4cCI6MjEwODIyNDIyMn0.8cbpFhsettaK9lXD7YKZLlQA3YG4o-9xvrx_jrY_Hro';

  const keywords = String(queryText || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4)
    .slice(0, 3);

  if (!keywords.length) return '';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);

  try {
    const orFilter = keywords.map(k => `title.ilike.*${k}*,full_text.ilike.*${k}*`).join(',');
    const url = `${supabaseUrl}/rest/v1/knowledge_base_documents?select=title,responsible_office,full_text&status=eq.published&or=(${encodeURIComponent(orFilter)})&limit=3`;
    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return '';
    const docs = await res.json();
    if (!Array.isArray(docs) || docs.length === 0) return '';

    return docs.map(d =>
      `[${d.title}${d.responsible_office ? ` — ${d.responsible_office}` : ''}]\n${String(d.full_text || '').slice(0, 800)}`
    ).join('\n\n');
  } catch {
    clearTimeout(timer);
    return '';
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory } = req.body || {};

    // Validate message
    if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return res.status(400).json({ error: 'Invalid message' });
    }

    // Get API credentials from environment variables (secure!)
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    if (!apiKey) {
      console.error('GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'AI service is not configured' });
    }

    // System prompt - defines Bago Buddy's personality and scope
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
- HEALTH PROGRAMS: Heart Warriors (cardiac), Wheels of Love (wheelchair), Smile Bright Bago (dental)
- CARAVAN: Free government services brought to barangays - PhilHealth, SSS, PAG-IBIG, PhilSys enrollment done here
- SOCA: State of the City Address archive
- NEWS: Live Facebook feed from The Citybridge
- SERVICES: E-Services, Health, Tourism, Bago Safe, Barangays, City Map
- TOURISM: 9 tourist spots, festivals
- BAGO SAFE: Report non-emergency incidents

**BAGO CITY E-SERVICES (Online Portal):**
IMPORTANT: E-Services currently has ONLINE PAYMENT SYSTEM only. Users can pay online for:
- Business permits
- Real property taxes
- Community tax certificates (Cedula)
Other services require IN-PERSON visits to City Hall or the Asenso Caravan.

**SERVICES AVAILABLE IN-PERSON ONLY (NOT online):**
- PhilHealth enrollment → Visit Action Center at City Hall, Asenso Caravan, or PhilHealth office
- SSS enrollment → Visit Action Center at City Hall, Asenso Caravan, or SSS office
- PAG-IBIG enrollment → Visit Action Center at City Hall, Asenso Caravan, or PAG-IBIG office
- PhilSys (National ID) → Visit Action Center at City Hall or Asenso Caravan
- Birth/Death/Marriage certificates → Visit Civil Registry Office at City Hall
- Barangay clearance → Visit your barangay hall

**ACTION CENTER (City Hall, General Luna St.):**
The Action Center is your one-stop shop for government assistance and public services including:
- National ID (PhilSys) registration
- PhilHealth, SSS, PAG-IBIG enrollment assistance
- General government inquiries and assistance
- Other public service transactions
Location: Bago City Hall, General Luna St.
Hours: Monday–Friday, 8:00 AM – 5:00 PM
Contact: (034) 446-1319

**ASENSO CARAVAN - Mobile government services:**
The Asenso Caravan brings PhilHealth, SSS, PAG-IBIG, PhilSys, and other government services directly to barangays. Check the schedule in the app.
Note: If you can't wait for the caravan, visit the Action Center at City Hall anytime during office hours!

**HEALTH PROGRAMS (Apply via Asenso Bago App):**
- Heart Warriors: free cardiac screening - apply through the app
- Wheels of Love: free wheelchairs for PWD - apply through the app
- Smile Bright Bago: free dental care - apply through the app

**CONTACT INFO:**
- City Hall: General Luna St., Bago City, Negros Occidental
- Main Hotline: (034) 446-1319
- Action Center: Located at City Hall (for National ID, PhilHealth, SSS, PAG-IBIG assistance)
- DRRMO Emergency (24/7): (034) 473-0043
- Office hours: Monday–Friday, 8:00 AM – 5:00 PM
- Facebook: The Citybridge
- E-Services Portal: https://eservices.bagocity.gov.ph

**IMPORTANT RULES:**
- NEVER tell users they can do PhilHealth/SSS/PAG-IBIG online - they CANNOT
- ALWAYS direct them to Asenso Caravan or in-person offices for government ID services
- E-Services is ONLY for online payments, not enrollment/registration
- If unsure about a service availability, say "For the most accurate info, please contact City Hall at (034) 446-1319"

For questions NOT about Bago City, say warmly: "Ay, that's outside my area of expertise! 😄 I'm only your Bago City guide. Ask me about city services, the app, or government requirements — I'm happy to help! 🏛️"

Always end responses with a follow-up prompt like:
- "Anything else I can help you with? 😊"
- "May iba pa ka questions? 🙋"
- "Need more details about any of these? Just ask! 💬"`;

    // Sanitize & cap conversation history to last 10 turns
    const sanitizedHistory = Array.isArray(conversationHistory)
      ? conversationHistory
          .slice(-10)
          .map(item => {
            const role = item?.role === 'model' ? 'assistant' : item?.role;
            const rawContent = item?.parts?.[0]?.text ?? item?.content;
            if ((role !== 'user' && role !== 'assistant') || typeof rawContent !== 'string') {
              return null;
            }
            const content = rawContent.trim().slice(0, 2000);
            return content ? { role, content } : null;
          })
          .filter(Boolean)
      : [];

    // Build messages array (optionally enriched with Supabase Knowledge Base)
    const trimmedMessage = message.trim();
    const kbContext = await fetchKnowledgeContext(trimmedMessage);
    const systemPrompt = kbContext
      ? `${SYSTEM_PROMPT}\n\n**VERIFIED KNOWLEDGE BASE REFERENCES:**\n${kbContext}`
      : SYSTEM_PROMPT;

    const lastMsg = sanitizedHistory[sanitizedHistory.length - 1];
    if (lastMsg && lastMsg.role === 'user' && lastMsg.content === trimmedMessage) {
      sanitizedHistory.pop();
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...sanitizedHistory,
      { role: 'user', content: trimmedMessage }
    ];

    const wantStream = Boolean(req.body?.stream);

    // Call Groq API (server-side, secure)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 2048,
        top_p: 0.9,
        stream: wantStream
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, errorData);
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
    }

    if (wantStream && response.body) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') {
            res.write('data: [DONE]\n\n');
            continue;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            }
          } catch (_) {}
        }
      }
      return res.end();
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({ error: 'No response generated' });
    }

    return res.status(200).json({ answer });

  } catch (error) {
    console.error('Chat backend error:', error.message);
    return res.status(500).json({ error: 'Unable to process your request' });
  }
}
