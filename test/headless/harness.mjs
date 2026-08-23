/**
 * Shared harness for the headless test suite.
 *
 * See test/headless/README.md for the big picture (what each layer tests,
 * requirements, how to extend).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '../..');
export const DIST = path.join(ROOT, 'dist');
export const TEST_DIST = path.join(DIST, 'test');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0;
let failed = 0;

/**
 * Record a check. `onFail` (optional function) runs for extra diagnostics
 * when the check fails.
 */
export function check(label, cond, onFail) {
  if (cond) {
    passed++;
    console.log('PASS  ' + label);
  } else {
    failed++;
    console.log('FAIL  ' + label);
    if (typeof onFail === 'function') onFail();
  }
}

/** Print a summary; returns true when nothing failed. */
export function report(name) {
  console.log('\n' + name + ': ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

/**
 * Build two ESM bundles with the project's rollup (same plugins as
 * rollup.config.mjs, without terser) so the engine can run under Node:
 *
 *  - dist/test/engine-classes.mjs: engine classes + helpers (via shim.mjs)
 *  - dist/test/app-bundle.mjs:     bundled src/js/main.js (defines window.advntx)
 *
 * Rebuilt on every run (~1s) so the bundles always match the working tree.
 * Returns { engine, app } as absolute file paths.
 */
export async function ensureBundles() {
  fs.mkdirSync(TEST_DIST, { recursive: true });
  const { rollup } = await import('rollup');
  const resolve = (await import('@rollup/plugin-node-resolve')).default;
  const commonjs = (await import('@rollup/plugin-commonjs')).default;
  const plugins = () => [
    resolve({ browser: true }),
    commonjs({ include: ['node_modules/**', path.join(ROOT, 'src/js/functions.js')] }),
  ];

  const engineOut = path.join(TEST_DIST, 'engine-classes.mjs');
  const engineBundle = await rollup({ input: path.join(here, 'shim.mjs'), plugins: plugins() });
  await engineBundle.write({ file: engineOut, format: 'esm' });
  await engineBundle.close();

  const appOut = path.join(TEST_DIST, 'app-bundle.mjs');
  const appBundle = await rollup({ input: path.join(ROOT, 'src/js/main.js'), plugins: plugins() });
  await appBundle.write({ file: appOut, format: 'esm' });
  await appBundle.close();

  return { engine: engineOut, app: appOut };
}

/**
 * Minimal browser stubs so the bundled app + engine run under Node.
 * Must be called BEFORE importing the app bundle.
 * Returns { store, terminalDiv } for assertions.
 */
export function makeStubs() {
  const terminalDiv = { textContent: '' };
  const store = new Map();
  globalThis.window = globalThis; // like a browser: window properties ARE globals
  globalThis.document = {
    getElementById: (id) => (id === 'terminal' ? terminalDiv : null),
    querySelectorAll: () => [],
  };
  globalThis.$ = () => ({ ready: () => {} });
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  };
  // Serve game data from dist/ like a web server would (strips the ?v= buster).
  // Missing files resolve to a 404 response, matching real server behavior.
  globalThis.fetch = (url) => {
    const p = String(url).split('?')[0];
    try {
      const data = fs.readFileSync(path.join(DIST, p), 'utf8');
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(JSON.parse(data)) });
    } catch {
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error('404 ' + p)) });
    }
  };
  return { store, terminalDiv };
}

/** Import a local file (works cross-platform, CJS or ESM) by path. */
export const importFile = (p) => import(pathToFileURL(p).href);
