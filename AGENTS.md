# AGENTS.md

## Project Overview

Adventex is a JavaScript interactive fiction (text adventure) game framework. Adventures are defined entirely through JSON files (gamestate, vocabulary, messages, config). The game renders in a browser terminal UI powered by jquery.terminal.

**Repository:** https://github.com/soster/adventex
**License:** MIT

## Tech Stack

- **Language:** JavaScript (ES6 modules, ES2015+)
- **Bundler:** Rollup 4 (UMD output, with terser minification)
- **CSS:** SCSS compiled via Dart Sass to `dist/css`
- **UI Dependencies:** jQuery 4, jquery.terminal 2.45, Bootstrap 5.3
- **Testing:** Mocha 11 + Chai 6, browser-only tests via BrowserSync 3
- **Dev Server:** BrowserSync with file watching

## Project Structure

```
src/
  js/              # Core game engine (ES modules)
    main.js        # Entry point, initializes global window.advntx
    interpreter.js # Command interpreter (parses player input)
    parser.js      # Natural language parser (verb+object extraction)
    eventhandler.js # Event trigger/matching logic
    locationhandler.js # Location navigation & descriptions
    inventoryhandler.js # Player inventory management
    helper.js      # Utility functions (findItemIds, getName, etc.)
    json.js        # JSON file loader for game data
    const.js       # Constants
    functions.js   # Legacy CommonJS utilities (copied to dist as-is)
  scss/main.scss   # Styles (compiled to dist/css)
  copy/index.html  # HTML template (copied to dist)
  svg/             # SVG assets (optimized with SVGO)
  img/             # Image assets (minified with imagemin)
  games/           # Adventure data (JSON files per game)
    games.json     # Game registry
    escape/        # Default escape room game
    tutorial/      # Tutorial adventure
    de/            # German language adventure
    ai/            # AI-generated adventure
test/
  test.mjs         # Mocha test suite (browser-only)
  index.html       # Test runner page
  browser-sync.js  # Test server config
```

## Build System

All build output goes to `dist/`. Key npm scripts:

| Command | Description |
|---------|-------------|
| `npm run build` | Full clean build (JS bundle, CSS, images, static assets) |
| `npm run serve` | Dev server with live reload (build + watch + BrowserSync) |
| `npm run js` | Rollup JS bundle only |
| `npm run css` | Compile SCSS to CSS |
| `npm run test` | Run Mocha tests (requires browser via `serve-tests`) |
| `npm run serve-tests` | Start BrowserSync for browser-based tests |

Rollup config: `rollup.config.mjs` — bundles `src/js/main.js` → `dist/js/main.js` (UMD format).
CSS pipeline: `sass.mjs` — compiles `src/scss/main.scss` → `dist/css/main.css` (minified, with banner).

## Game Engine Architecture

The game engine is data-driven. Each game is a directory under `src/games/<game_id>/` with these JSON files:

- **gamestate.json** — Locations, objects (with states), events, player state
- **vocabulary.json** — Verbs, directions, prepositions, adjectives, object names
- **messages.json** — Localized UI strings and responses
- **config.json** — Game configuration (terminal height, colors, prompt)

### Core Flow

1. `main.js` initializes `window.advntx` (global game state + API)
2. `parseJson()` loads game JSON files asynchronously
3. jquery.terminal captures player input → `interpreter.interpret()`
4. `Parser` extracts verb, objects, prepositions from input string
5. `EventHandler` matches input against events with prerequisite conditions
6. Matching events execute actions (move, take, open, setState, etc.)
7. `LocationHandler` / `InventoryHandler` update state and echo descriptions

### Key Classes

- **Interpreter** (`interpreter.js`) — Main command loop, handles all verbs (go, take, examine, open, close, drop, read, save, load, help, etc.)
- **Parser** (`parser.js`) — Tokenizes input, matches against vocabulary
- **EventHandler** (`eventhandler.js`) — Finds/executes events based on prerequisites (verb, location, inventory, object states)
- **LocationHandler** (`locationhandler.js`) — Navigation, connections, visited tracking
- **InventoryHandler** (`inventoryhandler.js`) — Take/drop items, state tracking

## Code Conventions

- **ES6 classes** for handlers (Interpreter, Parser, EventHandler, etc.)
- **ES module imports/exports** in `src/js/*.js`
- **`var` declarations** are common (legacy style, not being refactored)
- **Callback-based async** throughout (no Promises/async-await in engine code)
- **Global state** via `window.advntx` object
- **No linting or type checking** configured — code is untyped
- Comments are sparse; README.md and test file are primary documentation

## Testing

Tests are **browser-only** (they depend on `window`, `chai` global, and DOM). Run via:
```bash
npm run serve-tests
```
Then open the BrowserSync URL in a browser. The test suite covers Parser, EventHandler, Interpreter, LocationHandler, and InventoryHandler.

## Adding a New Game

1. Create `src/games/<name>/` directory
2. Add `gamestate.json`, `vocabulary.json`, `messages.json`, `config.json`
3. Register in `src/games/games.json`
4. Run `npm run build` (games are copied to `dist/games/`)

## Important Notes for AI Agents

- Do NOT introduce new dependencies without asking
- The codebase uses `var` extensively — do not refactor to `let`/`const` unless explicitly requested
- jQuery and jquery.terminal are required — do not replace them
- Games are purely JSON-driven; engine code changes are rare
- The `dist/` directory is git-ignored and regenerated by build
- `src/js/functions.js` is copied as-is (not bundled) due to CommonJS compatibility
