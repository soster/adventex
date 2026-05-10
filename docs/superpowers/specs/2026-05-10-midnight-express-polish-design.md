# Midnight Express - Full Polish Design

**Date:** 2026-05-10
**Scope:** Polish existing game flow — better descriptions, more clues, red herrings, atmosphere
**Constraint:** JSON-only changes, no engine modifications

## Overview

The Midnight Express game has a solid but thin puzzle chain: find key → open drawer → get passenger list → find diamond → call conductor. This polish adds depth through richer descriptions, new objects with examine interactions, red herrings, and atmospheric details — without changing the core puzzle or win condition.

## Changes

### New Objects (5)

| Object | Location | Description | Role |
|--------|----------|-------------|------|
| `crumpled_note` | Under bed (compartment) | Reads: *"Package must reach Zurich. Meet at platform 7. —L"* | Red herring — "L" suggests Laurent but is ambiguous |
| `torn_ticket` | Dining car tables | Ticket stub for "G. Weber" dated yesterday | Red herring — seems suspicious (why would conductor need ticket?) but is a transfer ticket |
| `muddy_footprints` | Corridor floor | Small, women's shoes, heading south | Genuine clue pointing to safe room |
| `cigarette_butt` | Near waiter station | Brand: "Cheval Blanc" | Genuine clue connecting to passenger list |
| `scratch_marks` | Inside safe door | Deep scratches on the inside | Genuine clue — suggests someone was locked in, not breaking out |

### Rewritten Location Descriptions (5)

- **Compartment:** Add temperature, smell of stale coffee, rhythmic clacking of tracks
- **Corridor:** Flickering lights, distant sounds, train vibration through floor
- **Dining Car:** Cold food, overturned chair, shattered glass on floor
- **Conductor's Office:** Papers scattered, chair knocked over, evidence of struggle
- **Safe Room:** Cold, smells of ozone from forced lock, muddy footprints leading to safe

### New Examine Events (~10)

| Event | Trigger | Response |
|-------|---------|----------|
| `examine_bed` | `examine bed` in compartment | Reveals crumpled note: *"The mattress is lumpy. Something crinkles beneath it."* |
| `examine_window` | `examine window` in compartment | Atmospheric: *"For a moment you see a station light flash by — then nothing. The train must be passing through a tunnel."* |
| `examine_desk` | `examine desk` in conductor's office | *"Someone's coffee cup is still on the desk. Cold. A nameplate reads 'Conductor Weber — Night Shift.'"* |
| `examine_safe` | `examine safe` in safe room | *"The inside of the door has deep scratches, as if someone was trying to get out. Or keep someone in."* |
| `examine_radio` | `examine radio` in conductor's office | *"The dial is set to a frequency you don't recognize. The call button is sticky, as if pressed many times recently."* |
| `examine_tables` | `examine tables` in dining car | Reveals torn ticket among debris |
| `examine_service_cart` | `examine service cart` in dining car | Reveals cigarette butt: *"A crushed cigarette butt clings to the underside. Cheval Blanc — an expensive brand."* |
| `examine_corridor_floor` | `examine floor` in corridor | Muddy footprints detail: *"Small prints, women's shoes. They head south, toward the locked door."* |
| `enhanced_start_event` | Game start | More atmospheric opening with sensory details |
| `enhanced_win_event` | Win condition met | Richer ending that references clues gathered |

### Enhanced Events

**`start_event`** — Rewritten to include:
- Sensory details: cold air, smell of coffee, train sounds
- The footsteps and argument are more vivid
- The key discovery feels more mysterious

**`call_conductor_win`** — Rewritten to include:
- Player references clues they gathered (footprints, note, passenger list)
- Conductor confirms Madame Laurent as suspect
- Atmospheric ending: dawn breaking, train whistle

### Unchanged

- Core puzzle chain: find key → open drawer → get passenger list → find diamond → call conductor
- Win condition requirements (diamond in inventory, in conductor's office, use radio)
- Game mechanics, vocabulary structure, config
- Engine code (all changes are JSON-only)

## File Changes

All changes are in `src/games/heist/gamestate.json`:
- Add 5 new objects to `objects`
- Rewrite 5 location descriptions in `locations`
- Add ~10 new events to `events`
- Rewrite `start_event` and `call_conductor_win`

One change to `src/games/heist/vocabulary.json`:
- Add `floor` to adjectives or objects so "examine floor" parses correctly

## Testing

- Existing test suite (`test/test.mjs` heist flow test) should still pass — core puzzle chain unchanged
- Manual testing needed for new examine events and atmospheric text
