# Tourism Videos Fix - File Size Issue

## Problem Identified
The `tourism-video.mp4` file (38.6 MB) is not being tracked in Git, while the other two videos are:
- ✅ `al-cinco-2026.mp4` (31.7 MB) - tracked
- ✅ `bugana-2026-dionela.mp4` (9.9 MB) - tracked  
- ❌ `tourism-video.mp4` (38.6 MB) - NOT tracked

**Total size**: ~80 MB for all 3 videos

## Why Git Won't Add tourism-video.mp4
Git is silently refusing to add this file, likely because:
1. **Too large**: At 38MB, it exceeds recommended Git file sizes
2. **Vercel deployment limit**: 100MB total, and we're already close with other files
3. **Git history**: The file WAS previously in Git (commit e0a7f966) but may have been removed

## Best Solution: Use Video Hosting (Recommended)

Instead of storing large video files in Git, use a proper video hosting platform:

### Option 1: YouTube (Free, Recommended)
1. Upload videos to a YouTube channel
2. Get embed codes
3. Replace `<video>` tags with YouTube iframes
4. **Benefits**: Free CDN, mobile-optimized, no deployment size issues

### Option 2: Cloudinary (Free Tier Available)
1. Sign up at https://cloudinary.com (free tier: 25GB storage, 25GB bandwidth/month)
2. Upload videos to Cloudinary
3. Use their video player URLs
4. **Benefits**: Better compression, adaptive streaming, CDN delivery

### Option 3: Vercel Blob Storage
1. Use Vercel's blob storage for large files
2. Store videos separately from deployment
3. Reference via URLs
4. **Benefits**: Integrates with Vercel, pay-as-you-go

## Quick Fix: Direct Git LFS Approach

If you absolutely need files in Git:

```bash
# Install Git LFS if not already installed
git lfs install

# Track all MP4 files with LFS
git lfs track "*.mp4"

# Add the gitattributes file
git add .gitattributes

# Now add the video files
git add assets/videos/tourism-video.mp4
git add assets/videos/*.mp4

# Commit
git commit -m "Add tourism videos via Git LFS"

# Push (note: LFS files count toward Git LFS quota)
git push origin main
```

## Immediate Workaround: Compress Videos

Reduce file sizes to make them git-friendly:

```bash
# Using FFmpeg (install first: https://ffmpeg.org/)
ffmpeg -i tourism-video.mp4 -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k tourism-video-compressed.mp4
```

This can reduce file size by 50-70% with minimal quality loss.

## Status
- Local files exist and are functional
- Deployment is missing `tourism-video.mp4`
- Other videos should work on the deployed site

## Recommendation
I recommend **YouTube embedding** as the best long-term solution. It's free, handles all device optimization automatically, and removes the deployment size problem entirely.
