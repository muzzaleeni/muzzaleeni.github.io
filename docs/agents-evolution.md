# Agent Evolution Notes (Repo)

Purpose: record durable learnings that changed repo operation (commands, conventions, guardrails).
Not a diary.

## When to write an entry
Only when:
- Local `AGENTS.md` changes, OR
- A recurring friction leads to a new operational rule.

Do NOT log:
- One-off fixes
- Temporary context
- Cosmetic edits
- Routine work

## Entry format
### YYYY-MM-DD — <short title>
**Change:** <1-2 lines>  
**Why:** <1-2 lines>  
**Signal:** <what triggered it>  

## Maintenance
- Keep entries concise.
- If learnings become stable, ensure they are reflected in `AGENTS.md`.
- If the file grows large, summarize older entries instead of letting it expand indefinitely.

## Entries
### 2026-02-23 — Initial repo bootstrap
**Change:** Added local `AGENTS.md` with repo-specific commands, structure, constraints, and definition of done. Added this local evolution log file.  
**Why:** Global bootstrap requires local operational notes per repository so agent behavior follows real repo workflow.  
**Signal:** `Repo Bootstrap (mandatory)` section in `/Users/muzzyaqow/.codex/AGENTS.md` and missing local bootstrap files.  

### 2026-02-23 — Added thread state bootstrap file
**Change:** Updated local `AGENTS.md` to require `docs/thread-state.md` during bootstrap and recorded the hygiene update prompt for thread state refreshes. Added `docs/thread-state.md` with Active/On Hold/Archived Recently/Next sections.  
**Why:** Thread workflow now needs a persistent local state file updated after every applied hygiene pass.  
**Signal:** User request to mix thread workflow with repo bootstrap and add a standard thread-state update prompt.  
