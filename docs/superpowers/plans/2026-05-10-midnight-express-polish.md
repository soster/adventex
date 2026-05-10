# Midnight Express Full Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add richer descriptions, atmosphere, and examine events to the Midnight Express game

**Architecture:** All changes are in `src/games/heist/gamestate.json` — rewrite location descriptions, add examine events, deepen opening and win scenes. No engine or vocabulary changes needed.

**Tech Stack:** JSON game data only

---

### Task 1: Rewrite Location Descriptions

**Files:**
- Modify: `src/games/heist/gamestate.json` — all 5 location descriptions

- [ ] **Step 1: Rewrite compartment description**

Replace compartment description with:
```json
"A cozy compartment on the Midnight Express. Cold air seeps through the window frame. A narrow bed runs along the left wall, its sheets twisted from sleep. A small table sits opposite, a half-empty coffee cup still warm. The rhythmic clacking of wheels on tracks is the only sound.\nYour door leads south to the corridor."
```

- [ ] **Step 2: Rewrite corridor description**

Replace corridor description with:
```json
"A narrow carpeted corridor running the length of the train car. An overhead light flickers, casting long shadows. The announcement speaker is mounted on the wall, silent for now. A cold draft comes from somewhere — the heating must have failed.\nYour compartment door is to the north. The dining car is to the east. The conductor's office is to the west. A locked door leads south."
```

- [ ] **Step 3: Rewrite dining_car description**

Replace dining_car description with:
```json
"The dining car is quiet this early morning. The smell of cold food hangs in the air. Half-eaten breakfast plates sit on the tables. One chair is overturned, a wine glass shattered on the floor — someone left in a hurry. A service cart stands near the waiter's station.\nThe corridor is to the west."
```

- [ ] **Step 4: Rewrite conductors_office description**

Replace conductors_office description with:
```json
"A small office in disarray. Papers are scattered across the floor, a coffee cup overturned. The desk holds train documents, a drawer sits beneath it, and an old radio sits on a shelf — its dial still glowing faintly. Someone was here recently, and they didn't leave calmly.\nThe corridor is to the east."
```

- [ ] **Step 5: Rewrite safe_room description**

Replace safe_room description with:
```json
"A small secure room at the end of the corridor. The air is cold and smells of ozone — the lock was drilled open. A large safe stands against the wall, its door hanging open.\nThe corridor is to the north."
```

- [ ] **Step 6: Verify and commit**

```bash
git add src/games/heist/gamestate.json
git commit -m "improve: rewrite Midnight Express location descriptions with sensory details"
```

### Task 2: Add Examine Events

**Files:**
- Modify: `src/games/heist/gamestate.json` — add 7 new examine events

- [ ] **Step 1: Add examine events for bed, window, desk**

Add to events object:
```json
"examine_bed": {
  "description": "The sheets are twisted and cold. You reach underneath the mattress and feel something hard — a folded piece of paper. It reads: 'Package must reach Zurich. Meet at platform 7. - L'",
  "prereq_verb": "examine",
  "prereq_used_items": ["bed"],
  "prereq_location": "compartment"
},
"examine_window": {
  "description": "For a moment you catch your own reflection in the glass — disheveled, wide-eyed. Then a station platform flashes by, its lights streaking past. A sign reads 'Lyons-Perrache'. The train is moving fast.\nDarkness returns.",
  "prereq_verb": "examine",
  "prereq_used_items": ["window"],
  "prereq_location": "compartment"
},
"examine_desk": {
  "description": "Among the scattered papers: a train schedule marked up in pencil. The 23:47 departure from Paris is circled three times. Below it, someone has written 'Zurich — diamond delivery — Weber'.\nA coffee stain mars the corner of the page.",
  "prereq_verb": "examine",
  "prereq_used_items": ["desk"],
  "prereq_location": "conductors_office"
}
```

- [ ] **Step 2: Add examine events for safe, radio, tables**

Add to events object:
```json
"examine_safe": {
  "description": "The lock has been drilled — professional tools, clean entry. But something catches your eye: the scratch marks are on the *inside* of the door. Deep gouges in the metal, as if someone was trying to get out. Or keep someone out.\nThe interior shelves are empty.",
  "prereq_verb": "examine",
  "prereq_used_items": ["safe"],
  "prereq_location": "safe_room"
},
"examine_radio": {
  "description": "The dial is set to frequency 147.3 — not the usual train channel. The call button is still warm to the touch, as if pressed recently. A handwritten note taped to the side reads: 'Emergency only — notify Zurich control'.",
  "prereq_verb": "examine",
  "prereq_used_items": ["radio"],
  "prereq_location": "conductors_office"
},
"examine_tables": {
  "description": "One chair is overturned, its legs scraped. A wine glass lies shattered on the floor, dark liquid spreading across the tiles. On the nearest table, a napkin has been crumpled and discarded — someone was writing something, then stopped abruptly.",
  "prereq_verb": "examine",
  "prereq_used_items": ["tables"],
  "prereq_location": "dining_car"
}
```

- [ ] **Step 3: Add examine event for service_cart**

Add to events object:
```json
"examine_service_cart": {
  "description": "Among the dishes and silverware: a crumpled napkin caught under the bottom shelf. You pull it free. Handwritten in hurried script: 'L. was here. She took it. God help me.'\nThe handwriting is shaking.",
  "prereq_verb": "examine",
  "prereq_used_items": ["service_cart"],
  "prereq_location": "dining_car"
}
```

- [ ] **Step 4: Verify and commit**

```bash
git add src/games/heist/gamestate.json
git commit -m "improve: add examine events for Midnight Express objects"
```

### Task 3: Deepen Opening Scene

**Files:**
- Modify: `src/games/heist/gamestate.json` — rewrite start_event

- [ ] **Step 1: Rewrite start_event**

Replace start_event with:
```json
"start_event": {
  "name": "Awakening",
  "description": "You wake with a jolt, heart pounding. The train rocks beneath you, but something is wrong. The compartment is too cold. Your door is ajar — you swear you closed it before sleeping.\n\nMemories surface in fragments: boarding the Midnight Express at Paris Gare de Lyon, the conductor's efficient smile, settling into your compartment. Then a sound — footsteps in the corridor, voices raised in argument near the conductor's office. Glass breaking. Then silence.\n\nYou sit up. The reading light flickers. On the floor beside the bed, something glints in the dim light — a strange key. It wasn't there when you went to sleep.\n\nYour head throbs. How long were you unconscious?",
  "action_move_to_location": "compartment"
}
```

- [ ] **Step 2: Verify and commit**

```bash
git add src/games/heist/gamestate.json
git commit -m "improve: deepen Midnight Express opening scene with tension"
```

### Task 4: Enrich Win Sequence

**Files:**
- Modify: `src/games/heist/gamestate.json` — rewrite call_conductor_win

- [ ] **Step 1: Rewrite call_conductor_win**

Replace call_conductor_win with:
```json
"call_conductor_win": {
  "description": "You pick up the radio and press the call button. Static, then a voice — tired, urgent.\n\n\"Weber here.\"\n\n\"I found the diamond,\" you say. \"Hidden under the service cart in the dining car. And I think I know what happened. The safe was locked from the inside. Someone was trapped in there.\"\n\nA long pause. You can hear the conductor breathing over the static.\n\n\"The waiter,\" he says finally. \"He was in the safe room when Laurent came for the diamond. She locked him in. By the time we got the door open—\" His voice breaks. \"He didn't make it.\"\n\nAnother pause. \"You've done what I couldn't, sir. The diamond is recovered. Laurent will be waiting for us at Zurich. Thank you.\"\n\nThe line clicks off. Outside the window, the first grey light of dawn touches the horizon. The train slows as it approaches the station.\n\nThe case is closed.",
  "prereq_verb": "use",
  "prereq_used_items": ["radio"],
  "prereq_inventory_items": ["diamond"],
  "prereq_location": "conductors_office"
}
```

- [ ] **Step 2: Verify and commit**

```bash
git add src/games/heist/gamestate.json
git commit -m "improve: enrich Midnight Express win sequence with story resolution"
```

### Task 5: Verify Game Still Works

**Files:**
- Test: browser via `npm run serve`

- [ ] **Step 1: Build the game**

```bash
npm run build
```
Expected: Build succeeds without errors

- [ ] **Step 2: Run the game in browser**

```bash
npm run serve
```
Then open BrowserSync URL, select "The Midnight Express", verify:
- Opening scene displays correctly
- All new examine events trigger on `examine <object>`
- Core puzzle chain still works: look under bed → open drawer with key → take passenger list → look under service cart → use radio
- Win condition triggers

- [ ] **Step 3: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/games/heist/gamestate.json', 'utf8')); console.log('Valid JSON')"
```
Expected: "Valid JSON"

- [ ] **Step 4: Final commit**

```bash
git add src/games/heist/gamestate.json
git commit -m "improve: Midnight Express full polish — descriptions, atmosphere, examine events"
```
