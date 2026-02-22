# Personal website

Film-first runway single-page website built with plain HTML, CSS, and vanilla JS.

## Structure

- `index.html`: full-viewport film stage + minimal overlay
- `styles.css`: cinematic styling, vignette, fixed overlay controls
- `script.js`: media controller (autoplay, sound preference, sync, fallback states)
- `assets/`: runway media files (video/audio/poster)
- `resume.pdf`: downloadable CV

## Required media files

Add these files exactly:

- `assets/runway-desktop.mp4`
- `assets/runway-mobile.mp4`
- `assets/runway-audio.m4a`
- `assets/runway-poster.jpg`

Optional fallbacks:

- `assets/runway-desktop.webm`
- `assets/runway-mobile.webm`
- `assets/runway-audio.mp3`

## Behavior and constraints

- Video attempts muted autoplay and loops.
- Music does **not** autoplay with sound by default due browser policy.
- User enables sound via one explicit click/tap (`Sound On`).
- Sound preference is stored in `localStorage` as `runway_sound` and unlock state as `runway_sound_unlocked`.
- Overlay links remain available at all times.

## Suggested encoding targets

- Desktop video: H.264 MP4, 1080p, ~4-8 Mbps, 15-30s
- Mobile video: H.264 MP4, 720p, ~1.5-3 Mbps, 15-30s
- Audio: AAC M4A, 128-192 kbps
