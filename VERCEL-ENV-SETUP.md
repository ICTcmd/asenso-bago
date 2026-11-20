# Vercel Environment Variables Setup

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `GROQ_API_KEY` | Your Groq API key from console.groq.com | Production, Preview |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | Production, Preview |

## Security Notes

✅ **What's Now Secure:**
- API key is stored server-side only (not in JavaScript)
- Visitors cannot see or extract the API key
- All AI requests go through `/api/chat` backend endpoint
- Backend validates requests and rate limits (basic)

⚠️ **Still Recommended:**
- Rotate the old Gemini API key (it was exposed in screenshots)
- If the Groq key was ever in public GitHub, rotate it
- Monitor Groq API usage dashboard
- Consider adding rate limiting with Upstash Redis

## Architecture

```
User Browser → /api/chat (Vercel Function) → Groq API
              ↑ API key here (secure)
```

The chatbot.js file NO LONGER contains any API keys!
