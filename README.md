# Personal website

Minimal ambient-film single-page website built with plain HTML, CSS, and vanilla JS.

## Structure

- `index.html`: full-viewport background video and minimal overlay
- `styles.css`: cinematic styling, vignette/grain, fixed overlay controls
- `script.js`: media controller (autoplay, sound preference, sync, fallback states)
- `assets/`: media files (video/audio/poster)
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
