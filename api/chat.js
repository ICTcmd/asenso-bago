// ═══════════════════════════════════════════════════════════
// SECURE CHATBOT API ENDPOINT
// Handles AI requests server-side to protect API keys
// ═══════════════════════════════════════════════════════════

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
- CARAVAN: Free government services brought to barangays
- SOCA: State of the City Address archive
- NEWS: Live Facebook feed from The Citybridge
- SERVICES: E-Services, Health, Tourism, Bago Safe, Barangays, City Map
- TOURISM: 9 tourist spots, festivals
- BAGO SAFE: Report non-emergency incidents

**BAGO CITY GOVERNMENT SERVICES:**
- Business permits, Civil registry, Barangay clearance, Cedula
- Building permits, PhilHealth, SSS, PAG-IBIG, PhilSys enrollment
- TESDA programs, DTI registration, COMELEC voter registration

**HEALTH PROGRAMS:**
- Heart Warriors: free cardiac screening
- Wheels of Love: free wheelchairs for PWD
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

    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(Array.isArray(conversationHistory) ? conversationHistory : []),
      { role: 'user', content: message.trim() }
    ];

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
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, errorData);
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
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
