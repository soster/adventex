# The Midnight Express — Train Heist Adventure

**Date:** 2026-04-30  
**Type:** New Adventex adventure (JSON-based)  
**Approach:** Linear investigation, 5 locations, clear puzzle chain

## Overview

A luxury overnight train adventure where the player is a passenger who overhears suspicious activity during the night. The next morning, a valuable diamond is reported stolen from the safe room. The player must investigate the crime scene, gather clues, and recover the diamond before the train reaches its destination.

## Story

The player wakes in their compartment to find a strange key that wasn't there the night before. The train's announcement system reports that a diamond has been stolen from the safe room. The conductor is investigating, but the player suspects the thief is still on board. By exploring the train, examining clues, and piecing together evidence, the player discovers that Madame Laurent — a passenger with no luggage — stole the diamond and hid it in the service cart in the dining car.

## Locations

| ID | Name | Description |
|----|------|-------------|
| `compartment` | Your Compartment | Starting location. Bed, small table, window, door. The strange key is found here. |
| `corridor` | Train Corridor | Connects all rooms. Service cart, announcement speaker. |
| `dining_car` | Dining Car | Breakfast tables, waiter's station. The waiter provides a clue about Madame Laurent. |
| `conductors_office` | Conductor's Office | Ledgers, radio, locked drawer. Contains the passenger list. |
| `safe_room` | Safe Room | Where the diamond was kept. Open safe, evidence of forced entry. |

### Connections

- `compartment` ↔ `corridor` (via door)
- `corridor` → `dining_car`, `conductors_office`, `safe_room` (all accessible from corridor)

## Objects

### Collectible/Key Items

| Object | Location | Purpose |
|--------|----------|---------|
| `strange_key` | `compartment` (floor) | Opens the conductor's drawer |
| `passenger_list` | `conductors_office` (drawer, locked) | Reveals Madame Laurent has no luggage |
| `manifest` | `conductors_office` (desk) | Shows diamond was insured, due for delivery |
| `diamond` | `dining_car` (hidden under service cart) | Win item — must be recovered |

### Static/Atmospheric Objects

| Object | Location | Notes |
|--------|----------|-------|
| `bed` | `compartment` | Non-portable, examinable |
| `window` | `compartment` | Shows countryside passing by |
| `compartment_door` | `compartment` | Connects to corridor |
| `service_cart` | `dining_car` | Stationary; diamond hidden underneath |
| `speaker` | `corridor` | Triggers announcement event |
| `tables` | `dining_car` | Half-eaten breakfast |
| `waiter_station` | `dining_car` | Examine triggers waiter clue |
| `desk` | `conductors_office` | Holds manifest |
| `drawer` | `conductors_office` | Locked, needs strange_key |
| `radio` | `conductors_office` | Used to page conductor (win trigger) |
| `safe` | `safe_room` | Open, empty |
| `safe_room_door` | `safe_room` | Locked from inside, unlocked from corridor |

## Events (Puzzle Chain)

1. **start_event** — Wake up, hear announcement about theft, move to compartment
2. **find_key** — Examine floor → discover strange key
3. **hear_announcement** — Examine speaker → conductor announces theft
4. **read_manifest** — Examine manifest → learn about the diamond
5. **open_drawer** — Use strange_key on drawer → get passenger list
6. **read_passenger_list** — Examine passenger list → learn about Madame Laurent
7. **waiter_clue** — Examine waiter station → waiter says Laurent was near safe room early
8. **examine_safe** — Examine safe in safe room → confirms forced entry
9. **find_diamond** — Look under service cart in dining car → recover diamond
10. **call_conductor** — Use radio with diamond in inventory → win event
11. **call_conductor_no_diamond** — Use radio without diamond → "Conductor says keep your voice down, he's handling it"

## Vocabulary

### Verbs
Standard set plus: `listen`, `page`

### Directions
`north`, `south`, `east`, `west` (mapped to corridor connections)

### Special Synonyms
- `listen` → `eavesdrop`
- `page` → `call`, `radio`

## Win Condition

The player must:
1. Find the diamond (hidden under service cart in dining car)
2. Use the radio in the conductor's office while holding the diamond

The win event triggers a message from the conductor thanking the player, and the standard win screen appears.

## Technical Details

- **Game ID:** `heist`
- **Directory:** `src/games/heist/`
- **Files:** `gamestate.json`, `vocabulary.json`, `messages.json`, `config.json`
- **Registration:** Add entry to `src/games/games.json`
- **No images required** — text-only, no image assets needed
- **Estimated size:** ~40 events, ~15 objects, 5 locations

## Design Decisions

- **No images** keeps the scope small and focused on writing quality puzzles
- **Linear chain** prevents soft-locks; each clue naturally leads to the next
- **No NPC movement** — the waiter is stationary, keeping the engine simple
- **No time limit** — the urgency is narrative, not mechanical
- **Single solution** — the diamond is in one place, one path to find it
