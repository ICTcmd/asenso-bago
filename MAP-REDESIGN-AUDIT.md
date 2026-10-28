# Bago City Explorer Map - Redesign Audit Report

**Date:** October 28, 2026  
**Current Map:** https://asenso-bago.vercel.app/map.html  
**Status:** Inspection Complete

---

## Current Implementation Analysis

### 1. Mapping Library ✅
- **Library:** Mapbox GL JS v3.3.0
- **Access Token:** Present (pk.eyJ1IjoiaWN0YmFnby...)
- **Map Style:** streets-v12 (light), dark-v11 (dark mode), outdoors-v12 (light mode fallback)
- **Terrain:** Mapbox DEM with 0.3x exaggeration
- **Fog Effects:** Enabled with custom colors

### 2. Geographic Configuration ✅
- **Center:** [122.950, 10.510] (Central Bago City)
- **Initial Zoom:** 11.2
- **Min Zoom:** 10.5
- **Max Zoom:** 17
- **Bounds:** [[122.67, 10.28], [123.25, 10.70]]
- **Padding:** {top: 120, bottom: 75, left: 0, right: 0}

### 3. Data Sources ✅

**Barangays (24 total):**
- Stored in `BARANGAYS` array
- Contains: num, name, type (u/r/t), lng, lat, dist, area, pop, fiesta, desc, spots
- Types: u=urban (8), r=rural (16), t=tourist (overlaps with urban/rural)
- Tourist barangays: Busay, Ilijan, Ma-ao, Mailum, Poblacion (5 verified)

**Landmarks/Spots (20 total):**
- Stored in `SPOTS` array
- Contains: name, icon, cat, tier, lng, lat, desc, spots, image
- Tiers: star (must-see), heritage, city
- Categories: Waterfall, Mountain Resort, Nature Park, Heritage, Government, etc.
- Images: Unsplash placeholder URLs

### 4. Existing Features ✅

**Working Features:**
- ✅ Search with autocomplete dropdown
- ✅ Quick picks (popular destinations)
- ✅ Map legend
- ✅ Dark mode toggle
- ✅ 3D view toggle
- ✅ Current location (geolocation)
- ✅ Weather widget (mock data)
- ✅ Detail panel (bottom sheet)
- ✅ Zoom-dependent marker visibility
- ✅ Marker clustering logic (opacity-based)
- ✅ Smooth animations
- ✅ Navigation controls
- ✅ Attribution

**Interactive Elements:**
- Barangay pill markers (urban/rural/tourist colors)
- Landmark icon markers (star/heritage/city)
- FAB buttons (location, dark mode, 3D view)
- Search with debounce (300ms)
- Click-to-detail for all markers

### 5. Current Design Issues ❌

**Branding:**
- ❌ Uses red-to-orange gradient header (not Asenso Bago Navy/Gold/Orange)
- ❌ Theme color: #c0392b (red) instead of Navy #0A2E5C
- ❌ Rainbow gradients for barangay categories
- ❌ Title: "🌟 Bago City Explorer" (emoji in title)
- ❌ Not using Montserrat/Inter fonts

**UI/UX:**
- ❌ Header too large (reduces map visibility)
- ❌ Weather widget may not be necessary (not core tourism feature)
- ❌ Legend fixed at bottom-left (overlaps FABs on mobile)
- ❌ No category filters (was removed from original design)
- ❌ Search dropdown doesn't show images
- ❌ No "Show All Attractions" or "Reset Map" button
- ❌ 3D button uses confusing label ("🏔️ 3D View")

**Data:**
- ⚠️ Tourist barangays: Only 5 verified (Busay, Ilijan, Ma-ao, Mailum, Poblacion)
- ⚠️ Don Jorge L. Araneta marked as urban but has tourist spots (heritage site)
- ✅ All coordinates appear accurate
- ✅ All 24 barangays present
- ✅ 20 landmarks/spots documented

### 6. Mobile Responsiveness Issues ⚠️

**Not Tested At:**
- 320px, 360px, 375px, 390px, 430px, 480px (mobile)
- 768px (tablet)
- 1024px, 1280px, 1440px (desktop)

**Potential Issues:**
- Header gradient may be too tall on small screens
- FABs may overlap legend
- Search dropdown may exceed viewport height
- Detail panel may cover too much map
- Touch targets not verified to meet 44px minimum

### 7. Performance Notes ✅
- Terrain and fog effects enabled (may impact low-end devices)
- Debounced search (300ms)
- Animation delays for marker pop-in (30ms increments)
- Smooth easing functions
- Event listeners properly managed

### 8. Security Notes ✅
- Mapbox access token exposed in HTML (standard practice, token restricted by domain)
- No user data collection
- Geolocation requires user permission
- External links use rel="noopener"

---

## Recommended Changes

### High Priority
1. **Rebrand to Asenso Bago Design System**
   - Replace red-orange gradient with Navy/Gold/Orange
   - Update theme-color to #0A2E5C
   - Apply Montserrat for headings, Inter for body
   - Remove emoji from main title

2. **Compact Header**
   - Reduce height to ~60px on mobile
   - Move search below header (sticky)
   - Simplify header content

3. **Add Category Filters**
   - Nature & Waterfalls
   - Historical & Heritage
   - Parks & Outdoor
   - Cultural Attractions
   - All Places (default)

4. **Improve Search**
   - Show images in search results
   - Better empty state
   - Category badges in results

5. **Add Map Controls**
   - "Reset Map" button
   - "Show All Attractions" button
   - Improve 3D toggle label

### Medium Priority
6. **Redesign Legend**
   - Make it collapsible
   - Move to better position (not overlapping FABs)
   - Use design system colors

7. **Improve Detail Panel**
   - Add images to landmark details
   - Better typography
   - Consistent with Asenso Bago design

8. **Weather Widget**
   - Consider removing (not core feature)
   - Or redesign to match branding
   - Or move to detail panel

### Low Priority
9. **Mobile Testing**
   - Test all specified breakpoints
   - Verify touch targets
   - Check landscape orientation

10. **Performance**
    - Consider reducing terrain exaggeration
    - Test on low-end devices

---

## Verified Data Integrity

**All 24 Barangays Present:** ✅
- 8 Urban: Abuanan, Atipuluan, Balingasag, Caridad, Don Jorge L. Araneta, Ma-ao, Poblacion, Taloc
- 16 Rural: All others

**Tourist Barangays (data-tourist="true" from Barangays page):**
- Busay ✅ (marked as 't')
- Don Jorge L. Araneta ✅ (marked as 'u' but has heritage spot)
- Ilijan ✅ (marked as 't')
- Ma-ao ✅ (marked as 't')
- Mailum ✅ (marked as 't')
- Poblacion ✅ (marked as 't')

**Discrepancy:** Don Jorge L. Araneta is marked as urban ('u') in map data but should have tourist flag since it has heritage attractions.

**20 Landmarks/Spots Verified:**
- 7 Star (must-see)
- 6 Heritage
- 7 City services

---

## Implementation Strategy

### Phase 1: Branding & Design System (Priority)
- Update colors to Navy/Gold/Orange
- Apply Montserrat/Inter fonts
- Redesign header (compact)
- Update theme-color
- Remove emoji from title

### Phase 2: Functionality (Priority)
- Add category filter chips
- Improve search UI
- Add Reset Map button
- Add Show All Attractions button
- Improve 3D toggle

### Phase 3: Polish (Medium)
- Redesign legend
- Improve detail panel
- Add images to search results
- Weather widget decision

### Phase 4: Testing (Required)
- Mobile breakpoint testing
- Touch target verification
- Cross-browser testing
- Performance testing

---

## Files to Modify

### Primary File:
- `map.html` - Complete redesign (HTML, CSS, JavaScript all inline)

### Assets Referenced:
- `assets/images/bago-city-logo.png` - City seal (preserve)

### No External Files:
- All CSS is inline in `<style>` tag
- All JavaScript is inline in `<script>` tag
- No separate .js or .css files

---

## Preservation Requirements

**Must Preserve:**
- ✅ Mapbox GL JS implementation
- ✅ All 24 barangay coordinates and data
- ✅ All 20 landmark coordinates and data
- ✅ Search functionality
- ✅ Dark mode
- ✅ 3D view
- ✅ Current location
- ✅ Detail panel
- ✅ Google Maps links
- ✅ Map bounds and center
- ✅ Attribution

**Can Replace:**
- ❌ Header gradient (red-orange → Navy)
- ❌ Rainbow barangay markers (use consistent colors)
- ❌ Weather widget (optional)
- ❌ FAB styling
- ❌ Legend styling
- ❌ Search dropdown styling

---

**Next Step:** Implement redesign based on this audit.

