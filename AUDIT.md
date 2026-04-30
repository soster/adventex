# Adventex Project Audit

> Generated: 2026-04-26

## High Severity

### H1 — XSS via inline `onclick` handlers

Game IDs and item names from JSON are interpolated into inline `onclick` strings without escaping. If a game author includes a `'` in a key or item name, it breaks out of the attribute and executes arbitrary JavaScript.

| File | Line |
|------|------|
| `src/js/main.js` | 193, 366 |

**Fix:** Switch to `addEventListener` or escape values with a HTML-escaping function before interpolation.

---

### H2 — String-based `setTimeout` / `setInterval` (eval-equivalent)

String arguments to `setTimeout` and `setInterval` are evaluated via `eval()`.

| File | Line |
|------|------|
| `src/js/main.js` | 349, 443 |

**Fix:** Replace with function callbacks:
```js
// Before
window.setTimeout('advntx.refocusTerminal();', 250)
// After
window.setTimeout(() => advntx.refocusTerminal(), 250)
```

---

### H3 — Save/load with no validation

Save games loaded from `localStorage` and files are parsed and assigned directly to `advntx.state` with no schema validation or sanitization. A malicious save could inject arbitrary state.

| File | Line |
|------|------|
| `src/js/main.js` | 242-248, 410-414 |

**Fix:** Add schema validation on loaded state before assigning.

---

### H4 — Uncaught `throw` in core game logic

`throw` statements for missing objects are never caught. A misconfigured game JSON crashes the entire game with no user-facing error.

| File | Line |
|------|------|
| `src/js/locationhandler.js` | 111, 161 |
| `src/js/inventoryhandler.js` | 121 |
| `src/js/helper.js` | 183 |
| `src/js/eventhandler.js` | 154 |

**Fix:** Wrap in try/catch and show a user-friendly error message.

---

### H5 — Method name mismatch (silent bug)

`eventhandler.js` calls `get_state_of_object()` but the actual method in `InventoryHandler` is `getStateOfObject()`. This throws at runtime.

| File | Line |
|------|------|
| `src/js/eventhandler.js` | 89 |

**Fix:** Rename the call to `getStateOfObject`.

---

## Medium Severity

### M1 — jQuery 3.2.1+ has known XSS CVEs

`jquery@^3.2.1` allows resolution to 3.2.x which has CVE-2020-11022 and CVE-2020-11023.

| File |
|------|
| `package.json` |

**Fix:** Pin to `^3.5.0` or newer.

---

### M2 — Mutating built-in prototypes

`Array.prototype.remove` and `String.prototype.format` extend native prototypes, which can conflict with other libraries and cause `for...in` iteration bugs.

| File |
|------|
| `src/js/functions.js` |

**Fix:** Use standalone utility functions instead.

---

### M3 — Broken test suite

`chai` is referenced but never imported in the test file, causing a `ReferenceError`.

| File | Line |
|------|------|
| `test/test.mjs` | 28 |

**Fix:** Import chai properly or remove the dependency.

---

### M4 — No error handling on `fetch` / `JSON.parse`

`getJSON` in `helper.js` has no `.catch()` handler. File load in `main.js` has no try/catch around `JSON.parse`.

| File | Line |
|------|------|
| `src/js/helper.js` | 105 |
| `src/js/main.js` | 411 |

**Fix:** Add error handling with user-facing feedback.

---

### M5 — `this` context lost in `setTimeout` callback

A `setTimeout` callback references `this.advntx` but `this` is lost in the callback scope.

| File | Line |
|------|------|
| `src/js/interpreter.js` | 444 |

**Fix:** Use an arrow function or bind `this`.

---

### M6 — Outdated dependencies

| Dependency | Current | Issue |
|------------|---------|-------|
| `bootstrap` | 4.6.0 | End-of-life |
| `sass` | 1.26.5 | Significantly outdated |
| `rollup` | 3.2.3 | v4.x available |

| File |
|------|
| `package.json` |

---

### M7 — `isEmpty()` unreliable for non-strings

The `isEmpty()` function checks `!str || 0 === str.length`, treating `0`, `false`, and `null` as empty. Used on IDs and state variables throughout the codebase.

| File | Line |
|------|------|
| `src/js/functions.js` | 26-28 |

**Fix:** Narrow to string-only check or rename and create type-specific variants.

---

### M8 — Debug mode allows arbitrary teleport

When `config.debug` is true, any unrecognized word is treated as a location ID for teleportation.

| File | Line |
|------|------|
| `src/js/interpreter.js` | 329-334 |

**Fix:** Strip debug mode in production builds or gate behind a build flag.

---

## Low Severity

### L1 — Empty `TodoList.js`
Zero-byte file. Dead code. (`src/TodoList.js`)

### L2 — `VERSION_REPLACE` never substituted
The build doesn't replace the version placeholder in `index.html`. (`src/copy/index.html:160`)

### L3 — `var` used throughout
Function-scoped variables instead of `let`/`const`. Potential hoisting bugs.

### L4 — No linting config
No `.eslintrc`, `.prettierrc`, or similar. Inconsistent code style.

### L5 — No Content Security Policy
`index.html` has no CSP meta tag. (`src/copy/index.html`)

### L6 — Inconsistent naming
Project is "adventex" but the global namespace is `advntx` (missing 'e').

### L7 — `console.log` in production
File load handler logs `e` to console, exposing file contents. (`src/js/main.js:410`)

---

## Summary

| Severity | Count |
|----------|-------|
| High | 5 |
| Medium | 8 |
| Low | 7 |

## Recommended Fix Order

1. **H1** — XSS in inline handlers (security)
2. **H2** — Replace eval-equivalent setTimeout/setInterval
3. **H5** — Fix method name mismatch (broken functionality)
4. **H4** — Add error handling for uncaught throws
5. **M1** — Update jQuery to >=3.5.0
6. **M3** — Fix broken test suite
7. **M4** — Add error handling on fetch/JSON.parse
8. **H3** — Add save/load validation
9. **M2** — Remove prototype mutations
10. **M6** — Update outdated dependencies
