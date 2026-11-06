# Festival Videos Setup Instructions

## Required Video Files

To display the festival videos on the Tourism page, please place the following video files in this directory (`assets/videos/`):

### 1. Bugana Festival Video
**Original filename:** `bugana 2026 dionela.mp4`  
**Rename to:** `bugana-2026-dionela.mp4`  
**Location:** Place in `assets/videos/`

### 2. Al Cinco Festival Video
**Original filename:** `al cinco 2026.mp4`  
**Rename to:** `al-cinco-2026.mp4`  
**Location:** Place in `assets/videos/`

## Steps to Add Videos

1. Copy both video files from your computer
2. Rename them to remove spaces (use hyphens instead):
   - `bugana 2026 dionela.mp4` → `bugana-2026-dionela.mp4`
   - `al cinco 2026.mp4` → `al-cinco-2026.mp4`
3. Paste them into this folder: `c:\Users\OJTBEEG\Desktop\LGU-Bago-App\bago-city-pwa\assets\videos\`
4. Commit and push to GitHub

## What's Already Done

✅ Created `assets/videos/` folder  
✅ Added video players to Tourism page for both festivals  
✅ Video players will automatically display once files are added  

## Result

Once the videos are in place, users will see:
- **Bugana Festival card** with embedded video player (February 19)
- **Al Cinco Festival card** with embedded video player (November 5)

The videos will have:
- Native browser controls (play, pause, volume, fullscreen)
- Responsive sizing (fits mobile and desktop)
- Professional rounded corners
- Black background for letterboxing

## Technical Details

- Video format: MP4 (already supported)
- Controls: Built-in HTML5 video controls
- Preload: Metadata only (faster page load)
- Mobile-friendly: Responsive and touch-enabled
