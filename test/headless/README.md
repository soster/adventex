# Headless test suite

Automated tests for the adventex game engine and UI that run **without any
manual browser interaction**. Complements the browser-only Mocha suite
(`test/test.mjs`, see AGENTS.md).

## Quick start

```bash
npm run test:headless
```

One command does everything:

1. full `npm run build` if `dist/` does not exist yet (one-time),
2. `npm run js` (fast Rollup rebuild so the code under test matches the
   working tree),
3. **engine test** — pure Node, no browser needed,
4. **browser E2E test** — real Chromium against the built `dist/`,
   auto-**SKIP**s (exit 0) when no Chromium/Chrome binary is found.

Individual layers (each is also runnable standalone):

```bash
node test/headless/engine.test.mjs
node test/headless/browser.test.mjs
```

Exit codes: `0` pass (or SKIP for the browser layer), `1` failure, `2`
environment problem (missing dist/, chromium did not start).

## Requirements

- **Node >= 22** (the E2E test uses the built-in global `WebSocket` to speak
  the Chrome DevTools Protocol; no puppeteer/playwright dependency).
- `npm install` (devDependencies only).
- Chromium or Chrome for the E2E layer (auto-detected from `CHROMIUM_BIN`,
  `CHROME_BIN`, or common system paths on Linux/macOS). Not required for the
  engine layer.

## What each layer covers

### `engine.test.mjs` (~51 checks, ~5s)
Runs the **real engine code** (bundled from `src/js/` via Rollup) under Node
with minimal browser stubs (`window`, `document`, `localStorage`, `fetch`
serving `dist/games/`), using the **real escape-game JSON** from `dist/`:

| Part | Checks |
|------|--------|
| 1. `getJSON` | missing file / non-OK HTTP response invoke the error callback or the default handler (writes the error into `#terminal`) instead of hanging silently |
| 2. save/load | `advntx.load()` rejects missing, corrupt-JSON, prototype-key (`location: "constructor"`) and unknown-inventory-id saves with the localized error; accepts a valid save |
| 3. link escaping | `escapeJsLinkParam()` through a *simulated browser* (terminal `clean_data` → HTML attr entity decode → URL fragment split + percent-decode → script execution): hostile names like `x');alert(1);//` neither break out nor corrupt the value |
| 4. playthrough | the complete winning line of the escape game (31 commands, 28 checks): states, inventory, points, events, final win |
| 5. arest teleport | the arrest event teleports the player back and the delayed location echo from `triggerEvent()` fires without throwing (regression guard for the `setTimeout`/`this` bug) |

### `browser.test.mjs` (~12 checks, ~25s)
Serves `dist/` with a small built-in static server, drives a headless
Chromium via CDP, and plays through the **real UI** (jquery.terminal):

- page boot, terminal initialization, boot text rendered,
  no "Could not load game file" error (exercises the real `fetch` + `getJSON`),
- object **and** direction links render as clickable `<a>` elements
  (validates the `[[!;…;javascript:advntx.terminalLink(…)]` format string in
  a live terminal),
- clicking a rendered link inserts the command (real `terminalLink` behavior),
- full 32-command playthrough via `advntx.term.exec()` in the real terminal,
- "You have won!" visible in the DOM, final state `outside` with 35 points,
- **zero** JS exceptions and `console.error` calls across the whole run,
- screenshot of the win state saved to `dist/test/e2e-win.png` (git-ignored).

## Files

| File | Role |
|------|------|
| `run.mjs` | orchestrator (`npm run test:headless`) |
| `harness.mjs` | shared: paths, Rollup bundle builder, browser stubs, `check()`/`report()` |
| `shim.mjs` | Rollup entry re-exporting the engine classes + helpers |
| `engine.test.mjs` | Node engine layer |
| `browser.test.mjs` | Chromium E2E layer |

Bundles are written to `dist/test/` (git-ignored) and rebuilt on every run.

## Notes when extending

- **Terminal text quirks:** jquery.terminal renders word boundaries as
  U+00A0 (no-break space) and drops some spaces entirely. Always run text
  assertions through the `normalize()` helper (see `browser.test.mjs`) —
  plain `textContent.includes('two words')` will fail.
- **Adding a new game playthrough:** derive a winning command sequence from
  the game's `src/games/<game>/gamestate.json` (connections, events,
  `win_event`), then add a `bootGame(...)` scenario to `engine.test.mjs`.
  Remember to drop the torch before entering `backward_corridor` in escape
  (carrying it triggers the arrest).
- **Pagination:** long echoes put the terminal into `waitForKey` mode; the
  E2E `drain()` helper mirrors `advntx.executeCurrent()` (simulated
  backspace keydowns) — call it before `term.exec()`.
- **Known pre-existing 404:** `fallback.png` (default location image in
  `main.js`) does not exist in the repo; the E2E test reports it
  informationally and does not fail on it.
- The Mocha suite (`npm run serve-tests`) still covers Parser/
  EventHandler/Interpreter unit tests and the heist + lighthouse win flows;
  run both suites for full coverage.
