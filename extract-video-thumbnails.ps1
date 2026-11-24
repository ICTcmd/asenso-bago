# Video Thumbnail Extractor Script
# This script will help you extract thumbnails from the festival videos

Write-Host "=== Festival Video Thumbnail Extractor ===" -ForegroundColor Cyan
Write-Host ""

# Check if ffmpeg is available
$ffmpegAvailable = $false
try {
    $null = ffmpeg -version 2>&1
    $ffmpegAvailable = $true
    Write-Host "✓ ffmpeg found!" -ForegroundColor Green
} catch {
    Write-Host "✗ ffmpeg not found" -ForegroundColor Yellow
}

Write-Host ""

if ($ffmpegAvailable) {
    Write-Host "Extracting thumbnails from videos..." -ForegroundColor Cyan
    
    # Extract thumbnail from Bugana video (at 5 seconds)
    Write-Host "1. Extracting Bugana Festival thumbnail..."
    ffmpeg -i "assets\videos\bugana-2026-dionela.mp4" -ss 00:00:05 -vframes 1 -q:v 2 "assets\videos\bugana-2026-thumbnail.jpg" -y
    
    # Extract thumbnail from Al Cinco video (at 5 seconds)
    Write-Host "2. Extracting Al Cinco Festival thumbnail..."
    ffmpeg -i "assets\videos\al-cinco-2026.mp4" -ss 00:00:05 -vframes 1 -q:v 2 "assets\videos\al-cinco-2026-thumbnail.jpg" -y
    
    Write-Host ""
    Write-Host "✓ Thumbnails extracted successfully!" -ForegroundColor Green
    Write-Host "  - assets\videos\bugana-2026-thumbnail.jpg" -ForegroundColor Gray
    Write-Host "  - assets\videos\al-cinco-2026-thumbnail.jpg" -ForegroundColor Gray
    
} else {
    Write-Host "MANUAL EXTRACTION REQUIRED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Since ffmpeg is not installed, please extract thumbnails manually:" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 1: Use VLC Media Player" -ForegroundColor Cyan
    Write-Host "  1. Open the video in VLC" -ForegroundColor Gray
    Write-Host "  2. Pause at a good frame (around 5 seconds)" -ForegroundColor Gray
    Write-Host "  3. Go to Video > Take Snapshot" -ForegroundColor Gray
    Write-Host "  4. Save as:" -ForegroundColor Gray
    Write-Host "     - bugana-2026-thumbnail.jpg" -ForegroundColor Gray
    Write-Host "     - al-cinco-2026-thumbnail.jpg" -ForegroundColor Gray
    Write-Host "  5. Move files to: assets\videos\" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Use Windows Photos/Movies & TV" -ForegroundColor Cyan
    Write-Host "  1. Open video in Photos or Movies & TV app" -ForegroundColor Gray
    Write-Host "  2. Pause at a good frame" -ForegroundColor Gray
    Write-Host "  3. Use Windows + Shift + S to screenshot" -ForegroundColor Gray
    Write-Host "  4. Save the screenshot and name it appropriately" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 3: Install ffmpeg" -ForegroundColor Cyan
    Write-Host "  Download from: https://ffmpeg.org/download.html" -ForegroundColor Gray
    Write-Host "  Or use: winget install ffmpeg" -ForegroundColor Gray
    Write-Host "  Then run this script again" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
