# BAGO CITY EXPLORER 2.0 — QUICK REFERENCE GUIDE

**Live Map:** https://asenso-bago.vercel.app/map.html  
**Version:** 2.0 (October 29, 2026)

---

## 🎮 MAP CONTROLS

### Main Actions (FAB Buttons):
- **🏠 Reset Map** — Return to initial Bago City view
- **📍 Show All** — Fit all 28 attractions in viewport
- **📍 My Location** — Use GPS to find your current location
- **🌙 Dark / ☀️ Light** — Toggle dark mode (switches map style)
- **🏔️ 3D / 🗺️ Flat** — Enable dramatic 3D terrain (1.8x exaggeration)
- **🏢 Buildings** — Show 3D buildings (only visible if supported, zoom 14+)

### Camera Controls:
- **Zoom:** Pinch or scroll wheel
- **Pan:** Drag with one finger/mouse
- **Rotate:** Two-finger rotate or Ctrl+drag
- **Tilt:** Two-finger drag up/down or right-click drag
- **Compass:** Click compass to reset north

---

## 🔍 SEARCH & FILTERS

### Search Bar:
- Type attraction name, category, or description
- Debounced 300ms for smooth typing
- Shows up to 8 results
- Highlights matching text in results
- Click result to fly to location

### Category Filters:
- **All Places** (28 attractions) — Show everything
- **Nature & Waterfalls** (14) — Waterfalls, resorts, farms
- **Historical & Heritage** (7) — Churches, ancestral houses, monuments
- **City Services** (7) — Government, markets, transport

### Quick Picks:
- Pre-selected popular destinations
- Click to instantly fly to location
- Includes: Kipot Falls, Bantayan Park, Pataan Resort, Tinago Falls, etc.

---

## 📍 28 VERIFIED ATTRACTIONS

### Nature & Waterfalls (14):
1. Kipot Twin Falls
2. Pataan Mountain Resort
3. Tinago Falls ⭐ NEW
4. Gianna's Mountain Resort ⭐ NEW
5. Bala-an Hills ⭐ NEW
6. Bungyod Agri Tourism Park ⭐ NEW
7. Mailum Organic Village (MOVA) ⭐ NEW
8. Torresta Infinity Farm ⭐ NEW
9. Kipot Summer Resort
10. Maragandang Falls ⭐ NEW
11. Buenos Aires Mountain Resort
12. Buen Tierra Beach House ⭐ NEW
13. OISCA Sunflower Farm
14. Nana's Place ⭐ NEW

### Historical & Heritage (7):
1. Manuel Y. Torres Memorial Coliseum
2. Saint John the Baptist Parish ⭐ NEW
3. Bantayan Park (Al Cinco de Noviembre monument)
4. Balay ni Tan Juan (ancestral house)
5. Javellana Mansion / Balay Daku
6. Bago City Cathedral
7. Ma-ao Sugar Central

### City Services (7):
1. Ma-ao Sugar Central Public Market ⭐ NEW
2. Ma-ao Public Plaza ⭐ NEW
3. Bago Public Market
4. Bago City Hall
5. Bago City Hospital
6. Bago Bus Terminal
7. Bago City Police
8. Bago City Library

⭐ = New in version 2.0 with verified coordinates

---

## 🗺️ 3D TERRAIN FEATURES

### Terrain Modes:
- **2D Mode:** 1.5x terrain exaggeration, 0° pitch
- **3D Mode:** 1.8x terrain exaggeration, 60° pitch, -25° bearing
- **Smooth transitions:** 1-1.2 second animations with natural easing

### What You'll See:
- Mt. Kanlaon and mountain ranges with proper elevation
- Mailum/Ilijan mountain regions clearly visible
- Coastal areas vs. highland distinctions
- Natural terrain contours and valleys
- Enhanced atmospheric fog effects

### 3D Buildings:
- Appears at zoom level 14+
- Height-based building extrusions
- Best visibility in Poblacion and urban areas
- Auto-enables 3D mode when activated
- Limited data in rural areas (Mapbox coverage)

---

## 📱 MOBILE TIPS

### Touch Gestures:
- **Tap marker:** View attraction details
- **Tap map:** Close detail panel
- **Pinch:** Zoom in/out
- **Two-finger drag:** Tilt map
- **Two-finger rotate:** Rotate view
- **Long press:** Access additional options (browser dependent)

### Responsive Sizes:
- Works on screens from 320px (iPhone SE) to 1440px+ (desktop)
- FAB buttons resize automatically on small screens
- Detail panel optimized for mobile scrolling
- Safe area insets handle notches and home indicators

### Performance:
- Smooth 60fps animations on modern devices
- Progressive terrain tile loading
- Efficient marker rendering (no clustering needed)
- Optimized for 3G+ connections

---

## 📸 DETAIL PANELS

### What You'll See:
- **Hero Image:** Full-width photo (220px height)
- **Attraction Name:** Bold, clear typography
- **Category Badge:** Star/Heritage/City service indicator
- **Description:** Detailed information about the attraction
- **Facts:** Distance, population, area, fiesta (for barangays)
- **Highlights:** Key features and activities
- **Directions:** "Open in Google Maps" button

### Interaction:
- Click any marker to open
- Drag handle at top to close
- Click overlay background to close
- Click X button to close
- Scroll within panel for full content

---

## 🌙 DARK MODE

### Features:
- Switches to Mapbox dark style (`dark-v11`)
- Inverts UI colors for readability
- Maintains marker visibility
- Preserves terrain and 3D effects
- Saves preference to localStorage

### Use Cases:
- Night time viewing
- Reduced eye strain
- Better battery life on OLED screens
- Improved contrast in low light

---

## 🎯 GEOLOCATION

### My Location Button:
1. Click "📍 My Location"
2. Browser requests permission
3. Blue marker appears at your location
4. Camera flies to your position
5. Popup shows "You are here"

### Troubleshooting:
- **Permission denied:** Enable location in browser settings
- **Position unavailable:** Check GPS/network connection
- **Timeout:** Try again with better signal
- **Accuracy:** May vary based on GPS quality

---

## 🔧 TECHNICAL SPECS

### Mapping Library:
- **Mapbox GL JS:** v3.3.0
- **Terrain Source:** Mapbox DEM (30m resolution)
- **Map Styles:** `streets-v12` (light), `dark-v11` (dark)

### Map Configuration:
- **Center:** [122.950, 10.510] (Bago City)
- **Initial Zoom:** 11.2
- **Min Zoom:** 10.5
- **Max Zoom:** 17
- **Bounds:** Bago City municipal limits

### Performance:
- **Initial Load:** < 3 seconds (typical)
- **Terrain Tiles:** Progressive loading
- **Search Debounce:** 300ms
- **Animation FPS:** 60fps target
- **Marker Count:** 28 (no clustering needed)

---

## 🐛 KNOWN ISSUES & LIMITATIONS

### 3D Buildings:
- Limited coverage in rural barangays
- Depends on Mapbox data availability
- Best in Poblacion and urban centers
- Button auto-hides if unavailable

### Images:
- Currently using Unsplash placeholders
- Should be replaced with real Bago City photos
- Single image per attraction (no carousel yet)
- No fullscreen view

### Routes:
- No sightseeing routes implemented yet
- "Open in Google Maps" redirects for navigation
- Would require Mapbox Directions API integration

### Data:
- No opening hours information
- No user ratings/reviews
- No real-time attraction status
- No offline support

---

## 📊 BROWSER COMPATIBILITY

### Fully Supported:
- ✅ Chrome 90+ (desktop/mobile)
- ✅ Firefox 88+ (desktop/mobile)
- ✅ Safari 14+ (desktop/iOS)
- ✅ Edge 90+
- ✅ Samsung Internet 14+

### Requirements:
- WebGL support (required for Mapbox GL)
- Modern JavaScript (ES6+)
- Geolocation API (optional, for My Location)
- LocalStorage (optional, for dark mode preference)

### Not Supported:
- ❌ Internet Explorer (any version)
- ❌ Opera Mini
- ❌ Very old mobile browsers

---

## 🚀 FUTURE ENHANCEMENTS

### Coming Soon:
- Real Bago City photography
- Image carousels (multiple photos per attraction)
- Fullscreen image view
- Enhanced attribution

### Planned:
- Sightseeing route suggestions
- Marker clustering (if attractions exceed 50+)
- Share attraction functionality
- Offline map support

### Potential:
- User ratings and reviews
- Opening hours and contact info
- Multilingual support (Tagalog/Hiligaynon)
- 360° panoramic views
- Virtual tours

---

## 📞 SUPPORT & FEEDBACK

**Issues or Suggestions?**
- Repository: https://github.com/ICTcmd/asenso-bago
- Submit issues via GitHub
- Contact: LGU Bago ICT Office

**Documentation:**
- `MAP-UPGRADE-PLAN.md` — Technical planning
- `MAP-3D-UPGRADE-COMPLETE.md` — Full implementation details
- `TASK-3-SUMMARY.md` — Project summary

---

## 🎓 QUICK START GUIDE

### First Time Users:
1. **Open the map** at https://asenso-bago.vercel.app/map.html
2. **Wait for load** (terrain tiles progressively load)
3. **Try 3D mode** by clicking "🏔️ 3D" button
4. **Explore attractions** by clicking category filters
5. **Search** for specific places in the search bar
6. **Click markers** to see detailed information
7. **Enable dark mode** for night viewing

### Power Users:
- Use keyboard shortcuts (if available in Mapbox)
- Right-click drag to tilt map quickly
- Ctrl+scroll for precise zoom control
- Bookmark specific attractions in browser
- Share map URL with friends/tourists

---

**Enjoy exploring Bago City in stunning 3D!** 🏔️🌊🏛️
