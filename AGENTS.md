# Repo Agent Notes

## Purpose
Static personal website with a cinematic background video, minimal overlay UI, and no framework/build step.

## Quickstart
- Install: none (no package manager in this repo).
- Run locally:
  - `cd /Users/muzzyaqow/Documents/projects/personal_website`
  - `python3 -m http.server 8000`
  - open `http://localhost:8000`
- Test: no automated test suite exists.
- Lint/typecheck: no formal lint/typecheck setup.
- JS syntax sanity check: `node --check script.js`
- Format: no formatter configured; keep edits consistent with existing style.
- Build/deploy: push to `main` (GitHub Pages deploy pipeline runs from repo settings/workflow).

## Entrypoints
- Main page: `index.html`
- Styling: `styles.css`
- Runtime behavior: `script.js`
- Resume artifact: `resume.pdf`
- Media and icon assets: `assets/`

## Environment
- Required env vars: none.
- Secrets: none required for local development.
- Browser policies apply:
  - video can autoplay muted.
  - audio playback requires user gesture to reliably start.

## Project Structure
- Root:
  - `index.html`: page structure, links, overlay elements.
  - `styles.css`: layout, typography, effects, responsive rules.
  - `script.js`: media source selection, autoplay flow, sound toggle, timecode, edition stamp.
  - `README.md`: architecture + asset contract + credits.
  - `resume.pdf`: linked downloadable resume.
- `assets/`:
  - scene media (`scene-desktop.mp4`, `scene-mobile.mp4`, `scene-audio.m4a`, `scene-poster.jpg`)
  - optional fallbacks (`*.webm`, `scene-audio.mp3`)
  - icons/favicon files
  - fonts in `assets/fonts/`

## Conventions
- Keep the stack minimal: plain HTML/CSS/JS only.
- Maintain one-page architecture unless explicitly changing site scope.
- Keep UI copy concise and intentional; avoid verbose blocks.
- Preserve responsive static-viewport behavior (`overflow: hidden`, no page scroll).
- When changing media file names, update both HTML attributes and JS assumptions.
- Keep accessibility attributes that already exist unless there is a clear reason to remove them.
- Avoid committing local junk files (especially `.DS_Store`).

## Definition of Done (repo-specific)
- Site loads from local HTTP server without console errors.
- Core first-view behavior works:
  - background video starts (or clear fallback status appears if missing).
  - sound toggle updates state correctly.
  - primary links (resume/linkedin/email/book) are reachable.
- Layout checks:
  - no unintended horizontal/vertical scrolling on desktop or mobile widths.
  - overlays do not overlap critically at small viewport sizes.
- Sanity checks:
  - `node --check script.js` passes.
  - `git diff` contains only intentional changes.

## Gotchas
- Opening `index.html` directly via `file://` can break or alter media behavior; use a local HTTP server.
- Browser autoplay policy blocks unmuted audio by default.
- Missing media files trigger status messaging from `script.js`; this is expected fallback behavior.
- Absolute-positioned overlay elements are sensitive to spacing changes; test small screens after UI edits.
- Large media files can dominate load/perf; keep source media optimized before committing.

## Dependencies Notes
- No runtime dependencies or build tooling in-repo.
- External files used directly by browser:
  - local font files in `assets/fonts/`
  - local media files in `assets/`
- Licensing notes live in:
  - `assets/fonts/README.md`
  - `README.md` (media credits)

## Docs
- Canonical project doc: `README.md`
- Asset details: `assets/README.md`
- Font licensing note: `assets/fonts/README.md`
- Evolution notes: `docs/agents-evolution.md`
- Thread state: `docs/thread-state.md`

## Bootstrap + Thread State
- Before substantive work, ensure these files exist:
  - `AGENTS.md`
  - `docs/agents-evolution.md`
  - `docs/thread-state.md`
- If `docs/thread-state.md` is missing, create it with:
  - `Last updated: YYYY-MM-DD`
  - `Active`
  - `On Hold`
  - `Archived Recently`
  - `Next`
- Thread hygiene update prompt:
  - `Update <repo>/docs/thread-state.md from this hygiene result.`
  - `Keep sections: Active, On Hold, Archived Recently, Next.`
  - `Use thread names only.`
  - `Keep only the 5 most recent thread names in Archived Recently (newest first).`
  - `Set Last updated to today.`
  - `Run this after every applied hygiene pass (not only end of day).`
  - `No commentary.`
