# Personal website

Minimal single-page website built with plain HTML, CSS, and vanilla JS.

## Structure

- `index.html`: full-viewport background video and minimal overlay
- `styles.css`: cinematic styling, vignette/grain, fixed overlay controls
- `script.js`: media controller (autoplay, sound preference, sync, fallback states)
- `assets/`: media + icon files (video/audio/poster/favicon)
- `resume.pdf`: downloadable CV

## Required media files

Add these files exactly:

- `assets/scene-desktop.mp4`
- `assets/scene-mobile.mp4`
- `assets/scene-audio.m4a`
- `assets/scene-poster.jpg`

Optional fallbacks:

- `assets/scene-desktop.webm`
- `assets/scene-mobile.webm`
- `assets/scene-audio.mp3`

## Behavior and constraints

- Video attempts muted autoplay and loops.
- Sound does **not** autoplay by default due browser policy.
- User enables sound with one explicit click/tap.
- Sound preference is stored in `localStorage` as `site_sound` and unlock state as `site_sound_unlocked`.
- Overlay links remain available at all times.

## Suggested encoding targets

- Desktop video: H.264 MP4, 1080p, ~4-8 Mbps, 15-30s
- Mobile video: H.264 MP4, 720p, ~1.5-3 Mbps, 15-30s
- Audio: AAC M4A, 128-192 kbps

## Favicon

Current files:

- `assets/favicon.svg`
- `assets/favicon.ico`
- `assets/favicon-32.png`
- `assets/apple-touch-icon.png`

Tasteful favicon guideline:

- Keep it monochrome and high-contrast.
- Use one strong mark (initial/monogram/symbol), not tiny details.
- Test at 16px and 32px first.

Quick generation flow (macOS):

```bash
sips -s format png assets/favicon.svg --out assets/favicon-512.png
sips -Z 32 assets/favicon-512.png --out assets/favicon-32.png
sips -Z 180 assets/favicon-512.png --out assets/apple-touch-icon.png
ffmpeg -y -i assets/favicon-32.png assets/favicon.ico
rm -f assets/favicon-512.png
```
