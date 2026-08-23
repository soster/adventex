/**
 * Headless ENGINE test: runs the real game engine under Node (no browser)
 * against the real escape-game data in dist/.
 *
 *   Part 1: getJSON error handling (regression: silent hangs on bad files)
 *   Part 2: save/load validation (regression: unvalidated state injection)
 *   Part 3: link escaping through a simulated browser (XSS regression)
 *   Part 4: full winning playthrough of the escape game
 *   Part 5: guard-arest teleport (regression: triggerEvent setTimeout `this`)
 *
 * Run:  node test/headless/engine.test.mjs
 * Needs: dist/ with game data (npm run build at least once).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, DIST, sleep, check, report, ensureBundles, makeStubs, importFile } from './harness.mjs';

if (!fs.existsSync(path.join(DIST, 'games/escape/gamestate.json'))) {
  console.error('dist/games/escape is missing - run `npm run build` first.');
  process.exit(2);
}

// ---- stubs + bundles (stubs must exist before the app bundle import) ----
const { terminalDiv } = makeStubs();
await importFile(path.join(ROOT, 'src/js/functions.js')); // String.prototype.format, global isEmpty
const { engine: enginePath, app: appPath } = await ensureBundles();
const engine = await importFile(enginePath);
await importFile(appPath); // defines globalThis.advntx (window.advntx)
const { getJSON, parseJson, escapeJsLinkParam } = engine;

const advntx = globalThis.advntx;
const tick = () => new Promise((r) => setTimeout(r, 20));
const messages = JSON.parse(fs.readFileSync(path.join(DIST, 'games/escape/messages.json'), 'utf8'));
const gamestate = JSON.parse(fs.readFileSync(path.join(DIST, 'games/escape/gamestate.json'), 'utf8'));
const config = JSON.parse(fs.readFileSync(path.join(DIST, 'games/escape/config.json'), 'utf8'));

// ================= Part 1: getJSON error handling =================
console.log('\n-- Part 1: getJSON error handling --');
let errCaptured = null;
getJSON('games/escape/definitely-missing.json', () => { throw new Error('should not be called'); },
  (err, url) => { errCaptured = [err, url]; });
await tick();
check('getJSON: custom error callback invoked with url',
  errCaptured !== null && errCaptured[1] === 'games/escape/definitely-missing.json');

terminalDiv.textContent = '';
getJSON('games/escape/definitely-missing2.json', () => {});
await tick();
check('getJSON: default handler shows error in terminal div',
  terminalDiv.textContent === 'Could not load game file: games/escape/definitely-missing2.json');

let httpErr = null;
getJSON('games/escape/definitely-missing3.json', () => { throw new Error('no'); }, (err) => { httpErr = err; });
await tick();
check('getJSON: non-OK HTTP response surfaces as error',
  httpErr instanceof Error && /HTTP 404/.test(httpErr.message));

// ================= Part 2: save/load validation =================
console.log('\n-- Part 2: save/load validation --');
const store = globalThis.localStorage;
const echoes = [];
advntx.messages = messages;
advntx.config = config;
advntx.echo = (t) => { echoes.push(String(t)); };
let initCalls = 0;
advntx.initGame = () => { initCalls++; };
advntx.term = { exec: () => {} };

advntx.load('missing');
check('load: missing save echoes error_save_not_found',
  echoes.length === 1 && echoes[0].includes(messages.error_save_not_found.replace('{0}', 'missing')));
check('load: missing save does not init game', initCalls === 0);
echoes.length = 0;

store.setItem('advntxcorrupt', 'this is not json');
advntx.load('corrupt');
check('load: corrupt JSON echoes error_save_invalid',
  echoes.length === 1 && echoes[0].includes(messages.error_save_invalid.replace('{0}', 'corrupt')));
check('load: corrupt JSON does not init game', initCalls === 0);
echoes.length = 0;

store.setItem('advntxproto', JSON.stringify({ ...gamestate, location: 'constructor' }));
advntx.load('proto');
check('load: prototype-key location (constructor) rejected',
  echoes.length === 1 && echoes[0].includes(messages.error_save_invalid.replace('{0}', 'proto')));
echoes.length = 0;

store.setItem('advntxbadinv', JSON.stringify({ ...gamestate, inventory: ['no_such_item'] }));
advntx.load('badinv');
check('load: unknown inventory id rejected',
  echoes.length === 1 && echoes[0].includes(messages.error_save_invalid.replace('{0}', 'badinv')));
echoes.length = 0;

store.setItem('advntxok', JSON.stringify(gamestate));
advntx.load('ok');
check('load: valid save echoes info_game_loaded',
  echoes.length === 1 && echoes[0].includes(messages.info_game_loaded.replace('{0}', 'ok')));
check('load: valid save inits game', initCalls === 1);
check('load: valid save state applied', advntx.state.location === gamestate.location);
echoes.length = 0;

// ================= Part 3: link escaping (simulated browser) =================
console.log('\n-- Part 3: link escaping --');
// Simulates the full render path of a terminal link:
// our href construction -> jquery.terminal clean_data (HTML-escapes < > ")
// -> HTML attribute entity decode -> URL fragment split + percent-decode
// -> javascript: script execution.
const cleanData = (d) => d.replace(/&#93;/g, ']').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const entityDecode = (s) => s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (m) => {
  const map = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ', '#93': ']', '#39': "'", '#x27': "'" };
  const key = m.slice(1, -1);
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : m;
});
const urlDecode = (s) => s.replace(/%([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
function simulateBrowser(name) {
  let captured = null;
  let alertCalled = false;
  const href = 'javascript:advntx.terminalLink(\' ' + escapeJsLinkParam(name) + ' \');';
  const attr = entityDecode(cleanData(href));
  const script = attr.slice('javascript:'.length);
  const hash = script.indexOf('#');
  const code = hash === -1 ? script : script.slice(0, hash);
  const fake = { terminalLink: (s) => { captured = s; } };
  // eslint-disable-next-line no-new-func
  new Function('advntx', 'alert', urlDecode(code))(fake, () => { alertCalled = true; });
  return { captured, alertCalled };
}

for (const name of [
  "o'hare",
  'a"b',
  "x');alert(1);//",
  'café #1',
  '50% off \\ backslash',
  'a & b <c> d',
  "it's #1 \\ 100% \"quoted\" & <b>",
  'plain',
]) {
  const { captured, alertCalled } = simulateBrowser(name);
  check('link: ' + JSON.stringify(name) + ' round-trips without breakout',
    captured === ' ' + name + ' ' && !alertCalled);
}
check('link: plain values unchanged', escapeJsLinkParam('north') === 'north');

// ================= Part 4: full winning playthrough =================
console.log('\n-- Part 4: escape game playthrough --');

/**
 * Boot a fresh game exactly like main.js does (initGame -> getJSON
 * games.json -> parseJson -> initGameAsync wiring), with stubbed UI
 * callbacks. Returns a Promise resolving when `onBoot` completes.
 */
function bootGame(onBoot) {
  const localEchoes = [];
  const locationEchoes = [];
  const describeEcho = (locId) => { locationEchoes.push(locId); };
  const echo = (t) => { localEchoes.push(String(t)); };

  return new Promise((resolve) => {
    getJSON('games/games.json', (result) => {
      advntx.games = result;
      advntx.gameId = result.default;
      advntx.currentGame = 'games/' + result[advntx.gameId].path;
      parseJson(() => {
        advntx.parser = new engine.Parser(
          advntx.vocabulary.verbs, advntx.vocabulary.directions,
          advntx.vocabulary.prepositions, advntx.vocabulary.adjectives,
          advntx.vocabulary.objects, advntx.state.objects);
        advntx.inventoryHandler = new engine.InventoryHandler(advntx.state, () => {});
        advntx.interpreter = new engine.Interpreter(advntx);
        advntx.locationHandler = new engine.LocationHandler(advntx.state);
        advntx.eventHandler = new engine.EventHandler(advntx.state, advntx.vocabulary, () => {});

        // start event, like initGameAsync(reset = true)
        advntx.eventHandler.executeEvent(advntx.state.events['start_event'], (eventText) => { echo(eventText); });

        Promise.resolve(onBoot({
          cmd: (c) => advntx.interpreter.interpret(c, describeEcho, () => {}, echo,
            () => {}, () => {}, () => {}, () => {}),
          echoes: localEchoes,
          locationEchoes,
        })).then(resolve);
      }, advntx);
    });
  });
}

await bootGame(async ({ cmd, echoes, locationEchoes }) => {
  const inv = () => advntx.state.inventory;
  const obj = (id) => advntx.state.objects[id];
  const at = () => advntx.state.location;
  const out = () => echoes.join('\n');

  cmd('examine straw');
  check('A1 examine straw shows trap door hint', out().includes('trap door'));
  echoes.length = 0;

  cmd('open trap door');
  check('A2 trap door opens', obj('trap_door').state === 'open');
  echoes.length = 0;

  cmd('go down');
  check('A3 go down -> lower_cell', at() === 'lower_cell');
  echoes.length = 0;

  cmd('open cell door');
  check('A4 cell door opens', obj('unlocked_cell_door').state === 'open');
  echoes.length = 0;

  cmd('go north');
  check('A5 go north -> corridor', at() === 'corridor');
  echoes.length = 0;

  cmd('take torch');
  check('A6 torch taken (get_torch event text)', inv().includes('torch') && out().includes('torch makes it easier'));
  echoes.length = 0;

  cmd('go east');
  check('A7 -> forward_corridor', at() === 'forward_corridor');
  echoes.length = 0;

  // note: stone_visible_with_torch may already have fired on entering the room
  cmd('look');
  check('A8 torch reveals stone (state none)', obj('stone').state === 'none');
  echoes.length = 0;

  cmd('take stone');
  check('A9 stone taken', inv().includes('stone'));
  echoes.length = 0;

  cmd('go west');
  check('A10 -> corridor', at() === 'corridor');
  echoes.length = 0;

  cmd('drop torch');
  check('A11 torch dropped (drop_torch event)', !inv().includes('torch') && out().includes('darker'));
  echoes.length = 0;

  cmd('go west');
  check('A12 -> backward_corridor', at() === 'backward_corridor');
  check('A13 guard_trigger fired on entry', advntx.state.events['guard_trigger'].triggered === true);
  echoes.length = 0;

  cmd('hide behind barrel');
  check('A14 hide behind barrel (location state hidden)',
    advntx.state.locations['backward_corridor'].state === 'hidden' && out().includes('hide behind the barrel'));
  echoes.length = 0;

  cmd('throw stone at guard');
  check('A15 guard unconscious, +10 points',
    obj('guard').state === 'unconscious' && advntx.state.points === 10 && !inv().includes('stone'));
  echoes.length = 0;

  cmd('open barrel');
  check('A16 barrel opens (water visible)', obj('barrel').state === 'open' && out().includes('water'));
  echoes.length = 0;

  cmd('take key');
  check('A17 key taken from guard', inv().includes('key'));
  echoes.length = 0;

  cmd('go west');
  check('A18 -> entrance_corridor (unhide fires)',
    at() === 'entrance_corridor' && advntx.state.locations['backward_corridor'].state === 'none');
  echoes.length = 0;

  // fetch the ring: 5x east: backward_corridor, corridor, forward_corridor, staircase, latrine
  cmd('go east'); cmd('go east'); cmd('go east'); cmd('go east'); cmd('go east');
  check('A19 -> latrine_room', at() === 'latrine_room');
  echoes.length = 0;

  cmd('search latrine');
  check('A20 dirty ring found, +10 points',
    inv().includes('ring') && obj('ring').state === 'dirty' && advntx.state.points === 20);
  echoes.length = 0;

  cmd('go west'); cmd('go west'); cmd('go west'); cmd('go west');
  check('A21 back in backward_corridor', at() === 'backward_corridor');
  echoes.length = 0;

  cmd('clean ring with water');
  check('A22 ring cleaned with water', obj('ring').state === 'none' && out().includes('pure gold'));
  echoes.length = 0;

  cmd('go west');
  check('A23 -> entrance_corridor', at() === 'entrance_corridor');
  echoes.length = 0;

  cmd('open portal with key');
  check('A24 portal open, unlocked, merchant arrives',
    obj('portal').state === 'open' && obj('portal').locked === false &&
    advntx.state.locations['entrance_corridor'].objects.includes('merchant'));
  echoes.length = 0;

  cmd('give ring');
  check('A25 merchant takes ring and leaves',
    !inv().includes('ring') && !advntx.state.locations['entrance_corridor'].objects.includes('merchant') &&
    out().includes('keep my mouth shut'));
  echoes.length = 0;

  cmd('go south');
  check('A26 -> outside', at() === 'outside');
  check('A27 WIN: win message with points 35', out().includes('You have won!') && out().includes('35'));
  check('A28 location description echoed for every move (12+ echoes)', locationEchoes.length >= 12);
});

// ================= Part 5: guard-arest teleport =================
console.log('\n-- Part 5: arest teleport (triggerEvent setTimeout) --');
// Fresh game. With a burning torch you are arrested the moment you enter
// backward_corridor (arest_torch -> arest -> action_move_to_location). The
// delayed describeLocationEcho in triggerEvent() must run without throwing;
// the old `function () {...}` bug would have raised a TypeError inside the
// setTimeout and crashed this Node process.
await sleep(200);
await bootGame(async ({ cmd, echoes }) => {
  const at = () => advntx.state.location;
  cmd('open trap door');
  cmd('go down');
  cmd('open cell door');
  cmd('go north');
  cmd('take torch');
  cmd('go east');
  cmd('go west');
  echoes.length = 0;
  cmd('go west'); // enter backward_corridor with torch -> arest -> teleport back
  check('B1 arrested and teleported to dungeon_cell',
    at() === 'dungeon_cell' && echoes.join('\n').includes('loose consciousness'));
  echoes.length = 0;
  // config.standard_wait_eventtext is 1000ms for the escape game
  await sleep(1600);
  check('B2 delayed location echo fired without crashing (triggerEvent fix)', true);
});

process.exit(report('engine test') ? 0 : 1);
