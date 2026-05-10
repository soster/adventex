# Midnight Express: Full Polish — Richer Descriptions & Atmosphere

**Date:** 2026-05-10
**Scope:** JSON-only changes to `src/games/heist/gamestate.json`
**Goal:** Transform functional descriptions into immersive, sensory-rich prose with deeper clues

## Changes

### 1. Rewritten Location Descriptions (5 locations)
Add sensory layers: sounds, smells, lighting, temperature, evidence of struggle.

### 2. New Examine Events (7 objects)
Add examine events for objects that currently only show static descriptions:
- `bed` — twisted sheets, clue underneath
- `window` — reflection, station platforms passing
- `desk` — marked-up train schedule, diamond delivery note
- `safe` — drilled lock, scratches on inside
- `radio` — unusual frequency, warm call button
- `tables` — overturned chair, shattered glass
- `service_cart` — crumpled napkin with clue

### 3. Deeper Opening Scene
Rewrite `start_event` to establish player identity, add disorientation, hint at struggle.

### 4. Richer Win Sequence
Rewrite `call_conductor_win` to reference gathered clues, reveal investigation details, atmospheric ending.

### 5. Additional Atmosphere Events
- `examine_speaker` second announcement about investigation
- `examine_safe_room_door` forced lock detail
- Enhanced `announcement` event with more tension

## Constraints
- No engine code changes
- No new objects added (reuse existing objects, add events only)
- Preserve existing puzzle chain and win condition
- All changes in `gamestate.json` only
