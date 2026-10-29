# BAGO CITY EXPLORER 2.0 — 3D TOURISM MAP UPGRADE PLAN

**Status:** In Progress  
**Started:** October 29, 2026  
**Repository:** `c:\Users\OJTBEEG\Desktop\LGU-Bago-App\bago-city-pwa`

---

## PHASE 1 — INSPECTION COMPLETE ✅

### Current Implementation Analysis

**Mapping Library:**
- Mapbox GL JS v3.3.0
- Style: `mapbox://styles/mapbox/streets-v12` (light), `mapbox://styles/mapbox/dark-v11` (dark)
- Initial center: [122.950, 10.510]
- Initial zoom: 11.2
- Map padding: top 190px, bottom 85px

**Existing 3D Features:**
- ✅ DEM terrain source: `mapbox://mapbox.mapbox-terrain-dem-v1`
- ✅ Terrain enabled with 0.3x exaggeration
- ✅ Fog effects with custom colors
- ✅ 3D toggle button changes pitch to 58° and bearing to -20°
- ❌ No 3D buildings layer
- ❌ Terrain exaggeration not dynamically controlled

**Data Structure:**
- 24 Barangays in `BARANGAYS` array
  - 8 Urban (`type: "u"`)
  - 16 Rural (`type: "r"`)
  - 5 Tourist (`type: "t"`)
- 20 Landmarks in `SPOTS` array
  - 7 Star attractions (Nature & Waterfalls)
  - 6 Heritage sites
  - 7 City services
- All spots have Unsplash placeholder images
- All coordinates verified

**Current Features:**
- ✅ Search with debounce (300ms)
- ✅ Category filters (All, Nature & Waterfalls, Heritage, City Services)
- ✅ Quick picks / Popular places
- ✅ Reset Map function
- ✅ Show All function
- ✅ My Location with geolocation
- ✅ Dark mode toggle with style switching
- ✅ Detail panel (bottom sheet)
- ✅ Marker animations and interactions
- ✅ Zoom-based marker visibility
- ❌ No photo galleries
- ❌ No marker clustering
- ❌ No sightseeing routes

---

## PHASE 2 — ENHANCE 3D TERRAIN

### Objectives:
1. Increase terrain exaggeration for more dramatic 3D effect
2. Add smooth terrain transitions
3. Improve camera controls for 3D exploration
4. Add terrain quality toggle

### Implementation:
```javascript
// Enhanced terrain with better exaggeration
map.setTerrain({
  source: "dem",
  exaggeration: 1.5  // Increased from 0.3 to 1.5
});

// Improved 3D toggle with terrain awareness
function do3D() {
  is3D = !is3D;
  if (is3D) {
    map.easeTo({
      pitch: 60,
      bearing: -25,
      duration: 1200,
      easing: t => 1 - Math.pow(1 - t, 3)
    });
    // Optionally increase exaggeration in 3D mode
    map.setTerrain({ source: "dem", exaggeration: 1.8 });
  } else {
    map.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 1000
    });
    map.setTerrain({ source: "dem", exaggeration: 1.5 });
  }
}
```

---

## PHASE 3 — ADD OPTIONAL 3D BUILDINGS

### Objectives:
1. Investigate Mapbox building layer support
2. Add 3D buildings toggle button
3. Ensure buildings don't obscure attraction markers
4. Compatible with light/dark modes

### Implementation:
```javascript
// Add 3D buildings layer (appears at zoom > 15)
map.on('load', () => {
  // Add 3D building layer if style supports it
  const layers = map.getStyle().layers;
  const labelLayerId = layers.find(
    layer => layer.type === 'symbol' && layer.layout['text-field']
  ).id;

  map.addLayer({
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'min_height'],
      'fill-extrusion-opacity': 0.6
    }
  }, labelLayerId);
});
```

---

## PHASE 4 — IMPROVE ATTRACTION DISCOVERY

### Objectives:
1. Unified data model for barangays + spots
2. Enhanced search with better ranking
3. Improved detail panel with more information
4. Better mobile UX

### Current Issues:
- Detail panel basic implementation
- No photo galleries
- Limited attraction information display

### Enhancements:
- Add image carousel to detail panel
- Show related attractions nearby
- Add "Share" functionality
- Improve typography and spacing

---

## PHASE 5 — ENHANCED MAP MARKERS

### Objectives:
1. Add marker clustering for better performance
2. Improve marker animations
3. Better selected state visualization

### Implementation:
- Use Mapbox's built-in clustering for spots when zoomed out
- Expand clusters on zoom in
- Maintain current custom marker styling

---

## PHASE 6 — PHOTO-RICH ATTRACTION DETAILS

### Objectives:
1. Add image carousel/gallery to detail panel
2. Display multiple photos per attraction
3. Lazy load images for performance
4. Add image credits/attribution

### Current State:
- Single image per spot in SPOTS array
- Images are Unsplash placeholders
- No gallery functionality

### Implementation:
- Add swipeable image carousel
- Use Unsplash API or verified local photos
- Add image modal for fullscreen view
- Proper attribution for Unsplash images

---

## PHASE 7 — SIGHTSEEING ROUTES

### Objectives:
1. Create predefined tourism routes
2. Allow custom route creation
3. Display route on map with directions
4. Show estimated travel time/distance

### Proposed Routes:
1. **Heritage & History Route**
   - Bantayan Park → Balay ni Tan Juan → Javellana Mansion → Bago City Cathedral → Ma-ao Sugar Central
   
2. **Nature & Waterfalls Route**
   - Kipot Twin Falls → Pataan Mountain Resort → Buenos Aires Resort → Balaan Hills
   
3. **City Centre Exploration**
   - Poblacion (Bago City Hall → Market → Cathedral → Bantayan Park)

### Implementation Notes:
- Use verified coordinates only
- No fabricated distances/times without routing service
- Directions open in Google Maps
- Route visualization with polylines

---

## PHASE 8 — REDESIGN MAP CONTROLS (MOBILE FIRST)

### Objectives:
1. Consolidate FAB buttons for mobile
2. Add control menu/drawer
3. Improve touch targets (minimum 44×44px)
4. Better safe area handling

### Current Controls:
- Reset Map
- Show All
- My Location
- Dark Mode
- 3D Toggle

### Proposed Changes:
- Keep primary actions visible
- Secondary controls in expandable menu
- Add: Buildings toggle, Routes, Cluster toggle

---

## PHASE 9 — MOBILE PERFORMANCE OPTIMIZATION

### Test Viewports:
- 320px (iPhone SE)
- 360px (Android small)
- 375px (iPhone standard)
- 390px (iPhone 12/13/14)
- 430px (iPhone 14 Pro Max)
- 480px (Large phones)
- 768px (iPad portrait)
- 1024px (iPad landscape)
- 1280px (Desktop)
- 1440px (Large desktop)

### Performance Targets:
- Map loads < 3 seconds
- Smooth 60fps animations
- No janky scrolling
- Efficient marker rendering
- Proper image lazy loading
- Graceful terrain fallback on slow devices

---

## PHASE 10 — TESTING & DOCUMENTATION

### Testing Checklist:
- [ ] All viewports tested
- [ ] Portrait and landscape modes
- [ ] Touch interactions work smoothly
- [ ] Geolocation permission handling
- [ ] Dark mode in all states
- [ ] Search functionality
- [ ] Category filters
- [ ] 3D terrain rendering
- [ ] Buildings layer (if implemented)
- [ ] Detail panel all data types
- [ ] Image loading and display
- [ ] Routes (if implemented)
- [ ] Marker clustering (if implemented)
- [ ] Console errors checked
- [ ] Network requests optimized
- [ ] Mapbox tile loading
- [ ] Safe area insets (notches)

### Documentation:
- [ ] Feature overview
- [ ] Data sources documented
- [ ] API keys and configuration
- [ ] Known limitations
- [ ] Browser compatibility
- [ ] Performance notes
- [ ] Future enhancements

---

## IMPLEMENTATION PRIORITY

### HIGH PRIORITY (Phase 2-3):
1. ✅ Enhance 3D terrain exaggeration
2. ✅ Improve 3D toggle with smoother transitions
3. 🔄 Add optional 3D buildings layer
4. 🔄 Test on multiple devices

### MEDIUM PRIORITY (Phase 4-6):
1. Enhance detail panel with better layout
2. Add image carousel/gallery
3. Improve search result ranking
4. Add marker clustering
5. Mobile control menu consolidation

### LOW PRIORITY (Phase 7):
1. Sightseeing routes (requires routing service)
2. Share functionality
3. Offline support
4. Custom route builder

---

## TECHNICAL NOTES

**Mapbox GL JS v3.3.0 Capabilities:**
- ✅ 3D terrain with DEM
- ✅ 3D building extrusions
- ✅ Custom markers (HTML elements)
- ✅ Marker clustering (built-in)
- ✅ Fog effects
- ✅ Camera controls (pitch, bearing, zoom)
- ✅ Style switching
- ✅ Geolocation API integration
- ⚠️  Directions API requires separate Mapbox Directions API
- ⚠️  Routes require polyline rendering + external routing service

**Browser Compatibility:**
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Android Chrome 80+
- No IE11 support (Mapbox GL JS v2+ dropped support)

**Performance Considerations:**
- Terrain exaggeration > 2.0 may cause visual artifacts
- 3D buildings add rendering overhead (disable on slow devices)
- Marker clustering improves performance with many markers
- Image optimization crucial for mobile data usage
- Fog effects have minimal performance impact

---

**Next Step:** Implement Phase 2 (Enhanced 3D Terrain)
