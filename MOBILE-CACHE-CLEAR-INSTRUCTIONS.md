# Clear Mobile Cache to Fix Blue Theme Issue

## Problem
Mobile devices (iOS/Android) are showing the **OLD BLUE THEME** while desktop shows the correct **ORANGE THEME**.

## Cause
PWA (Progressive Web App) cached the old CSS files. The service worker needs to be updated.

## Solution Deployed ✅
- Updated service worker to v20261124-orange
- CSS files now NEVER cached (always fetch fresh)
- Bumped all CSS versions to v4.0
- This forces complete cache refresh

## Steps to Fix on Your iPhone:

### Method 1: Clear Safari Cache (Recommended)
1. **Close the Asenso Bago app** completely (swipe up to close)
2. Open **Settings** app on iPhone
3. Scroll down and tap **Safari**
4. Scroll down and tap **"Clear History and Website Data"**
5. Confirm by tapping **"Clear History and Data"**
6. Wait for Vercel deployment to complete (2-3 minutes after push)
7. **Reopen** the Asenso Bago app
8. ✅ Orange theme should now appear!

### Method 2: Force Refresh in Browser
If using Safari browser (not installed app):
1. Open https://asenso-bago.vercel.app in Safari
2. Tap the **refresh button** in address bar
3. Hold the refresh button for 2 seconds
4. Select **"Request Desktop Website"** then switch back to mobile
5. This forces a complete reload

### Method 3: Reinstall PWA (If above doesn't work)
1. Find the **Asenso Bago** app icon on home screen
2. **Long press** the icon
3. Tap **"Remove App"** or **"Delete"**
4. Confirm deletion
5. Open Safari and go to: https://asenso-bago.vercel.app
6. Tap the **Share** button (square with arrow)
7. Scroll and tap **"Add to Home Screen"**
8. Tap **"Add"**
9. ✅ Fresh install with orange theme!

## What We Changed

### Service Worker Updates:
```javascript
// OLD:
const CACHE = 'bago-pwa-v__CACHE_VERSION__';

// NEW:
const CACHE = 'bago-pwa-v20261124-orange';

// ADDED: Never cache CSS
if (url.pathname.endsWith('.css')) {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  return;
}
```

### CSS Version Bumps:
- `app.css?v=3.6` → `app.css?v=4.0`
- `mobile-fixes.css?v=1.1` → `mobile-fixes.css?v=1.2`
- `manifest.json?v=2.2` → `manifest.json?v=4.0`

## Verification

After clearing cache, you should see:
- ✅ **Hero section background**: Orange gradient (not blue)
- ✅ **Service icons**: Tourism and other services in orange
- ✅ **Primary buttons**: Orange (#D97732)
- ✅ **Navigation highlights**: Orange accents
- ✅ **CTA sections**: Orange backgrounds

## Why This Happened

PWAs are VERY aggressive with caching for offline support. When we updated the theme from blue to orange, mobile devices kept using the cached blue CSS files. The service worker didn't know to update because:
1. Old service worker version wasn't forcing CSS refresh
2. CSS wasn't in the "never cache" list
3. Version numbers weren't updated

Now all three issues are fixed!

## Troubleshooting

**Q: I cleared cache but still see blue theme**
- Wait 5 minutes after clearing cache for DNS/CDN to propagate
- Try Method 3 (reinstall PWA)
- Check if you're on the correct URL: https://asenso-bago.vercel.app

**Q: Desktop shows orange but mobile shows blue**
- This confirms it's a caching issue
- Follow the steps above to clear mobile cache

**Q: Both desktop and mobile show blue**
- Clear browser cache on both devices
- Hard refresh (Ctrl+Shift+R on desktop)

## Prevention
Going forward, any CSS changes will auto-update on mobile because:
- Service worker now has CSS in "never cache" list
- Always fetches fresh CSS files
- No more theme caching issues!
