/**
 * Orchestrates the headless test suite (one command, complete automation):
 *
 *   1. ensure dist/ exists (full `npm run build` on first run)
 *   2. refresh the JS bundle so the code under test matches the working tree
 *   3. engine test   (Node, no browser needed)
 *   4. browser E2E   (real Chromium; auto-SKIPs when no browser binary)
 *
 * Run:  npm run test:headless
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, DIST } from './harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const npm = (args) => spawnSync('npm', args, { stdio: 'inherit', cwd: ROOT, shell: process.platform === 'win32' });
const node = (file) => spawnSync(process.execPath, [file], { stdio: 'inherit', cwd: ROOT });
const codeOf = (r) => (r.status === 0 ? 0 : (r.status ?? 1));

console.log('=== adventex headless test suite ===\n');

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.log('-- dist/ missing, running full build (one-time) --');
  if (npm(['run', 'build']).status !== 0) {
    console.error('build failed');
    process.exit(1);
  }
}

console.log('-- refreshing JS bundle (rollup, ~1s) --');
if (npm(['run', 'js']).status !== 0) {
  console.error('rollup failed');
  process.exit(1);
}

console.log('\n-- engine test --');
const engine = codeOf(node(path.join(here, 'engine.test.mjs')));

console.log('\n-- browser e2e test --');
const browser = codeOf(node(path.join(here, 'browser.test.mjs')));

const failed = engine !== 0 || browser !== 0;
console.log('\n=== summary ===');
console.log('engine test:   ' + (engine === 0 ? 'PASS' : 'FAIL (' + engine + ')'));
console.log('browser e2e:   ' + (browser === 0 ? 'PASS (or SKIP without a browser)' : 'FAIL (' + browser + ')'));
process.exit(failed ? 1 : 0);
