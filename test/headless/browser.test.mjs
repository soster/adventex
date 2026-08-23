/**
 * Headless BROWSER E2E test: loads the built dist/ into real Chromium and
 * plays the escape game through the actual UI (jquery.terminal).
 *
 * Verifies: page boot, rendered text, clickable terminal links (the
 * javascript: link formatting produced by listFormattedObjects /
 * describeLocationEcho), a full 32-command winning playthrough, and zero
 * JS exceptions / console errors along the way.
 *
 * Run:  node test/headless/browser.test.mjs
 * Needs: dist/ (npm run build) and a Chromium/Chrome binary. Auto-SKIPS
 * (exit 0) when no browser binary is found. Set CHROMIUM_BIN (or CHROME_BIN)
 * to point at a non-standard binary.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { DIST, sleep, check, report } from './harness.mjs';

// ---------- helpers ----------
function findChromium() {
  const candidates = [
    process.env.CHROMIUM_BIN,
    process.env.CHROME_BIN,
    '/usr/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/local/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter(Boolean);
  for (const c of candidates) {
    try { fs.accessSync(c, fs.constants.X_OK); return c; } catch { /* next */ }
  }
  return null;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const p = srv.address().port;
      srv.close(() => resolve(p));
    });
    srv.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};
function startStaticServer(dir, port) {
  return http.createServer((req, res) => {
    let p;
    try { p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); res.end(); return; }
    if (p.endsWith('/')) p += 'index.html';
    const file = path.normalize(path.join(dir, p));
    if (!file.startsWith(dir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(port, '127.0.0.1');
}

// ---------- preconditions ----------
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/ is missing - run `npm run build` first (or `npm run test:headless`).');
  process.exit(2);
}
const chromeBin = findChromium();
if (!chromeBin) {
  console.log('SKIP  no Chromium/Chrome binary found (set CHROMIUM_BIN to override)');
  process.exit(0);
}

const watchdog = setTimeout(() => {
  console.error('FAIL  watchdog: browser test exceeded 120s');
  cleanup();
  process.exit(1);
}, 120000);

const httpPort = await freePort();
const cdpPort = await freePort();
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'adventex-e2e-'));
const pageUrl = `http://127.0.0.1:${httpPort}/`;

const server = startStaticServer(DIST, httpPort);
const chrome = spawn(chromeBin, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profileDir}`,
  'about:blank',
], { stdio: 'ignore' });
console.log(`-- browser: ${chromeBin} (cdp port ${cdpPort}, http port ${httpPort}) --`);

function cleanup() {
  try { chrome.kill(); } catch { /* already gone */ }
  try { server.close(); } catch { /* already gone */ }
}

// ---------- CDP session (Node >= 22 has a global WebSocket) ----------
let wsUrl = null;
for (let i = 0; i < 40 && !wsUrl; i++) {
  await sleep(500);
  try {
    const targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json`)).json();
    const page = targets.find((t) => t.type === 'page');
    if (page) wsUrl = page.webSocketDebuggerUrl;
  } catch { /* not up yet */ }
}
if (!wsUrl) {
  console.error('FAIL  chromium did not come up');
  cleanup();
  process.exit(2);
}

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let nextId = 1;
const pending = new Map();
const exceptions = [];
const consoleErrors = [];
const logErrors = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    exceptions.push((d.exception && d.exception.description) || d.text);
  } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map((a) => a.value || a.description || '').join(' '));
  } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    logErrors.push(msg.params.entry.url ? msg.params.entry.url + '  (' + msg.params.entry.text + ')' : msg.params.entry.text);
  }
};
const send = (method, params = {}) => new Promise((resolve) => {
  const id = nextId++;
  pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression, awaitPromise = false) {
  const res = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
  if (res.result && res.result.exceptionDetails) {
    exceptions.push('EVAL: ' + (res.result.exceptionDetails.exception?.description || res.result.exceptionDetails.text));
  }
  return res.result && res.result.result ? res.result.result.value : undefined;
}

await send('Runtime.enable');
await send('Page.enable');
await send('Log.enable');
await send('Page.navigate', { url: pageUrl });

// The terminal renders word boundaries as U+00A0 (no-break space) and drops
// some spaces entirely, so normalize all whitespace before asserting phrases.
const normalize = (s) => (s || '').replace(/[\s\u00a0\u2000-\u200a\u202f\ufeff]+/g, ' ');
const terminalText = async () => normalize(await evaluate(`document.querySelector('#terminal').textContent`));

// wait for terminal to boot
let ready = false;
for (let i = 0; i < 60 && !ready; i++) {
  await sleep(500);
  ready = (await evaluate('!!(window.advntx && window.advntx.term)')) === true;
}
check('page boots: terminal initialized', ready);
if (!ready) {
  cleanup();
  process.exit(report('browser e2e test') ? 0 : 1);
}
await sleep(4000); // initial location echo has a 1500ms delay + boot margin

let text = await terminalText();
check('boot text: greetings + start story rendered', text.includes('Escape Game') && text.includes('hangover'),
  () => console.log('diag len:', text.length, 'hasEscape:', text.includes('Escape Game'), 'hasHangover:', text.includes('hangover'),
    'snippet:', JSON.stringify(text.slice(0, 300))));
check('boot text: Dungeon cell description rendered', text.includes('Dungeon cell'),
  () => console.log('diag tail:', JSON.stringify(text.slice(-400))));
check('no "Could not load game file" error', !text.includes('Could not load game file'));

// links rendered by jquery.terminal (validates the link format string escaping)
// dungeon_cell has no direct connections, so check object links here;
// direction links are checked after moving into the corridor.
let links = (await evaluate(`Array.from(document.querySelectorAll('#terminal a')).map(a => a.textContent).filter(t => t.trim())`)) || [];
links = links.map(normalize);
check('object links rendered as <a> in terminal (straw, bucket, bed, doors)',
  ['straw', 'wooden bucket', 'bunk bed'].every((n) => links.some((l) => l.startsWith(n))));

// click a rendered object link -> should insert the command text into the terminal
await evaluate(`Array.from(document.querySelectorAll('#terminal a')).find(a => a.textContent.trim().startsWith('straw')).click()`);
await sleep(300);
const cmdAfterClick = await evaluate(`window.advntx.term.get_command()`);
check('clicking a link inserts the command (terminalLink works)', (cmdAfterClick || '').includes('straw'));
await evaluate(`window.advntx.term.set_command('')`);

// drain "press any key" pagination (mirrors advntx.executeCurrent)
async function drain() {
  for (let i = 0; i < 200; i++) {
    const waiting = await evaluate('!!window.advntx.waitForKey');
    if (!waiting) break;
    await evaluate(`advntx.term.trigger($.Event('keydown', { keyCode: 8 }))`);
    await sleep(15);
  }
}
async function exec(cmd) {
  await drain();
  await evaluate(`advntx.term.exec(${JSON.stringify(cmd)})`);
  await drain();
  await sleep(200);
}

// the full winning line for the escape game (see test/headless/README.md)
const moves = [
  'examine straw', 'open trap door', 'go down', 'open cell door', 'go north',
  'take torch', 'go east', 'look', 'take stone', 'go west', 'drop torch',
  'go west', 'hide behind barrel', 'throw stone at guard', 'open barrel',
  'take key', 'go west',
  'go east', 'go east', 'go east', 'go east', 'go east',
  'search latrine',
  'go west', 'go west', 'go west', 'go west',
  'clean ring with water', 'go west', 'open portal with key', 'give ring', 'go south',
];
for (const m of moves) {
  await exec(m);
  if (m === 'go north') {
    const dirLinks = await evaluate(`Array.from(document.querySelectorAll('#terminal a')).map(a => a.textContent.trim())`);
    check('direction links rendered in corridor (east, west)',
      Array.isArray(dirLinks) && dirLinks.includes('east') && dirLinks.includes('west'));
  }
}

text = await terminalText();
const stateInfo = await evaluate(`({ loc: advntx.state.location, points: advntx.state.points, steps: advntx.state.steps, w: advntx.waitForKey })`);
check('WIN: "You have won!" visible in the real terminal', text.includes('You have won'),
  () => console.log('diag state:', JSON.stringify(stateInfo), 'tail:', JSON.stringify(text.slice(-600))));
check('WIN: outside world description rendered', text.includes('Outside world'));
check('WIN: state is at outside with 35 points',
  stateInfo && stateInfo.loc === 'outside' && stateInfo.points === 35);
check('no JS exceptions during playthrough', exceptions.length === 0);
check('no console.error during playthrough', consoleErrors.length === 0);

// screenshot for humans
const screenshot = await send('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(path.join(DIST, 'test'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'test', 'e2e-win.png'), Buffer.from(screenshot.result.data, 'base64'));

console.log('\nresource/log errors (informational; known: fallback.png is missing from the repo):');
for (const e of logErrors) console.log('  ' + e);
if (exceptions.length) console.log('exceptions:', exceptions);
if (consoleErrors.length) console.log('console errors:', consoleErrors);

clearTimeout(watchdog);
const ok = report('browser e2e test');
ws.close();
cleanup();
process.exit(ok ? 0 : 1);
