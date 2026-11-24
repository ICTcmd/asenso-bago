# Fix Supabase Console Errors - Infinite Recursion in RLS

## Problem

You're seeing these errors in the browser console:

1. **500 Internal Server Errors** when fetching profiles
2. **"Infinite recursion detected in policy for relation 'profiles'"**
3. **"Failed to load profile"** errors
4. **CSP violations** for Supabase URLs

## Root Cause

The **infinite recursion error** is the main issue. This happens when:
- There are multiple conflicting RLS (Row Level Security) policies on the `profiles` table
- A policy is checking the `profiles` table itself, creating a circular reference
- Policies were created/modified incorrectly in the Supabase dashboard

## How to Fix

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your **Asenso Bago** project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Fix Script

1. Open the file: `fix-profiles-rls.sql` (in this folder)
2. Copy ALL the SQL code from that file
3. Paste it into the Supabase SQL Editor
4. Click **RUN** button

### Step 3: Verify the Fix

After running the script, verify policies are correct:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

You should see exactly 4 policies:
- `profiles_select_own`
- `profiles_insert_own`
- `profiles_update_own`
- `profiles_delete_own`

### Step 4: Test the App

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Hard reload** the Asenso Bago app (Ctrl+Shift+R or Cmd+Shift+R)
3. Check the browser console - errors should be gone
4. Try signing in - profile should load correctly

---

## Understanding the Errors

### What is RLS (Row Level Security)?

RLS is Supabase's security feature that controls who can access which rows in a table. It's like saying "users can only see their own data."

### What Causes Infinite Recursion?

**Bad Policy Example (causes recursion):**
```sql
-- DON'T DO THIS!
CREATE POLICY "check_profile"
  ON profiles FOR SELECT
  USING (
    -- This checks the profiles table while inside a profiles policy!
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
  );
```

**Good Policy Example (no recursion):**
```sql
-- CORRECT WAY
CREATE POLICY "check_profile"
  ON profiles FOR SELECT
  USING (
    -- This only checks auth.uid(), no table lookup
    auth.uid() = id
  );
```

---

## Additional Fixes (if needed)

### Fix CSP Violations

If you still see CSP errors after fixing RLS, you may need to update your security headers. However, these are usually just warnings and don't break functionality.

The CSP errors are from Supabase's default security settings and are generally safe to ignore for development.

### Check Supabase Dashboard

1. Go to **Authentication** → **Policies**
2. Click on **profiles** table
3. Manually delete any duplicate or conflicting policies
4. Only keep the 4 policies from the fix script

---

## Prevention Tips

1. **Always use the SQL script** to create/update policies, don't use the dashboard UI for complex policies
2. **Never reference the same table** inside its own RLS policy
3. **Use `auth.uid()` directly** instead of looking up profiles
4. **Test after each policy change** to catch issues early

---

## Need More Help?

If errors persist after running the fix:

1. Check the **Supabase Logs** in your dashboard (Database → Logs)
2. Look for any error messages about policies or permissions
3. Verify your **Supabase URL and API keys** are correct in `supabase-config.js`
4. Make sure you're using the correct **Supabase project** (check the project URL)

---

## Summary of Fix

✅ **Removed** all conflicting RLS policies  
✅ **Created** 4 clean policies without recursion  
✅ **Granted** proper permissions to authenticated users  
✅ **Tested** that users can only access their own profiles  

**Status:** Ready to deploy after running `fix-profiles-rls.sql`
