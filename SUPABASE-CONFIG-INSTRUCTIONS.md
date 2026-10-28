# Supabase Configuration Instructions 🔐

**Time:** 2 minutes  
**File to edit:** `assets/js/health-request.js`

---

## 🎯 What You Need

You need **2 values** from your Bago Safe Supabase project:

1. **SUPABASE_URL** 
2. **SUPABASE_ANON_KEY**

---

## 📍 Where to Find These Values

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Click on your **Bago Safe** project

### Step 2: Get Your Credentials
1. Click **⚙️ Settings** (gear icon in left sidebar)
2. Click **API** (under Project Settings)
3. You'll see:

```
Project URL
├─ https://xxxxxxxxxxxxx.supabase.co  ← This is your SUPABASE_URL

Project API keys
├─ anon public
   └─ eyJhbGciOiJIUzI1NiIsInR5cCI6...  ← This is your SUPABASE_ANON_KEY
```

---

## ✏️ How to Add Them

### Method 1: Edit JavaScript File Directly

1. Open file: `assets/js/health-request.js`
2. Find lines 8-9:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

3. Replace with your actual values:
```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

4. Save the file

---

## ⚠️ Security Notes

### Is it safe to put these in JavaScript?

**YES** - The `anon` key is designed to be public:
- ✅ Safe to expose in frontend code
- ✅ Protected by Row-Level Security (RLS)
- ✅ Can only do what RLS policies allow
- ✅ Cannot access admin functions

**DO NOT** use the `service_role` key in frontend code!

---

## ✅ Verify It Works

After adding your credentials:

1. Open `health-request.html` in browser
2. Fill out the form
3. Submit
4. Check Supabase Table Editor → `health_service_requests`
5. You should see your test request!

---

## 🔍 Example (Fake Values)

**Before:**
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

**After:**
```javascript
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU5MjQwMCwiZXhwIjoxOTU4MTY4NDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

---

## 🚨 Troubleshooting

### Error: "supabase is not defined"
**Solution:** Make sure the Supabase CDN script is loaded in HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Error: "Invalid API key"
**Solution:** 
1. Double-check you copied the **anon** key (not service_role)
2. Make sure there are no extra spaces
3. Check the key is complete (they're very long!)

### Error: "Failed to fetch"
**Solution:**
1. Check your internet connection
2. Verify the SUPABASE_URL is correct
3. Make sure you ran the database schema

### Form submits but nothing in database
**Solution:**
1. Check browser console for errors (F12)
2. Verify RLS policies are enabled
3. Test with a simple SQL insert query first

---

## 📝 Quick Copy Template

Copy this and fill in your values:

```javascript
// YOUR CREDENTIALS (fill these in)
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_VERY_LONG_ANON_KEY_HERE';
```

---

**Once configured, you're ready to test the form!** 🎉
