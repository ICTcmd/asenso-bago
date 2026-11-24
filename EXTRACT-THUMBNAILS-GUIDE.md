# How to Extract Video Thumbnails - Quick Guide

Since ffmpeg needs a shell restart, here's the easiest way to extract thumbnails from your videos:

## Method 1: Using VLC Media Player (EASIEST)

If you have VLC installed:

1. **Open Bugana Video**
   - Right-click `assets\videos\bugana-2026-dionela.mp4`
   - Open with VLC Media Player

2. **Find a Good Frame**
   - Play the video
   - Pause at a colorful, interesting moment (around 5-10 seconds in)

3. **Take Snapshot**
   - Click `Video` menu → `Take Snapshot`
   - Or press `Shift + S`

4. **Rename and Move**
   - Find the screenshot (usually in `Pictures` folder)
   - Rename it to: `bugana-2026-thumbnail.jpg`
   - Move it to: `assets\videos\` folder

5. **Repeat for Al Cinco Video**
   - Open `assets\videos\al-cinco-2026.mp4` in VLC
   - Pause at a good frame
   - Take snapshot (`Shift + S`)
   - Rename to: `al-cinco-2026-thumbnail.jpg`
   - Move to: `assets\videos\` folder

---

## Method 2: Using Windows Photos App

1. **Open Video**
   - Right-click the video
   - Open with `Photos` or `Movies & TV`

2. **Pause at Good Frame**
   - Play and pause at an interesting moment

3. **Take Screenshot**
   - Press `Windows + Shift + S` (Snipping Tool)
   - Select the video area
   - Screenshot is copied to clipboard

4. **Save Screenshot**
   - Open Paint or Photos
   - Paste (`Ctrl + V`)
   - Save as JPG with proper name
   - Move to `assets\videos\` folder

---

## Method 3: Using ffmpeg (After Restart)

After restarting PowerShell/Terminal, run:

```powershell
# Navigate to project folder
cd "c:\Users\OJTBEEG\Desktop\LGU-Bago-App\bago-city-pwa"

# Extract Bugana thumbnail (at 5 seconds)
ffmpeg -i "assets\videos\bugana-2026-dionela.mp4" -ss 00:00:05 -vframes 1 -q:v 2 "assets\videos\bugana-2026-thumbnail.jpg" -y

# Extract Al Cinco thumbnail (at 5 seconds)
ffmpeg -i "assets\videos\al-cinco-2026.mp4" -ss 00:00:05 -vframes 1 -q:v 2 "assets\videos\al-cinco-2026-thumbnail.jpg" -y
```

---

## Required Thumbnail Names

Make sure the files are named EXACTLY as:
- `bugana-2026-thumbnail.jpg`
- `al-cinco-2026-thumbnail.jpg`

And placed in:
- `c:\Users\OJTBEEG\Desktop\LGU-Bago-App\bago-city-pwa\assets\videos\`

---

## After Creating Thumbnails

Once you have both thumbnail images in the `assets\videos\` folder, let me know and I'll:
1. Update the HTML to use them as video posters
2. Commit and push to GitHub
3. The videos will show beautiful thumbnails instead of black screens!

---

## Quick Checklist

- [ ] Extract Bugana thumbnail
- [ ] Rename to: `bugana-2026-thumbnail.jpg`
- [ ] Extract Al Cinco thumbnail  
- [ ] Rename to: `al-cinco-2026-thumbnail.jpg`
- [ ] Move both to: `assets\videos\`
- [ ] Tell Kiro you're ready!
