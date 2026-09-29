/*
  Proves the guard fails a seeded regression (PIQ-5877, AC 1).

  Usage: node scripts/check-brand-package.test.mjs

  Each fixture is a real package directory the guard runs in, because the guard reads `npm pack`
  rather than the tree: a fixture that only wrote files would not exercise the thing that decides
  what ships, which is `files` in package.json.

  Runs the real script and asserts its exit code, since that is what the CI step acts on.

  No test runner, deliberately. `npm test` here is a placeholder, and adding a framework to assert
  exit codes would be more moving parts than the thing it checks.
*/
import { execFileSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const guard = resolve(dirname(fileURLToPath(import.meta.url)), 'check-brand-package.mjs');

/** The guard's exit code in a fixture package: 0 clean, 1 a name found, 2 misconfigured. */
const run = (dir) => {
  try {
    execFileSync('node', [guard], { cwd: dir, encoding: 'utf-8', stdio: 'pipe' });
    return 0;
  } catch (error) {
    return error.status;
  }
};

const fixture = (files, pkg = {}) => {
  const dir = mkdtempSync(join(tmpdir(), 'brand-guard-'));
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'fixture', version: '1.0.0', ...pkg }, null, 2),
  );
  for (const [name, body] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), body);
  }
  return dir;
};

const SHIPS_DIST = { files: ['dist'] };

const cases = [
  ['a clean package passes', { 'dist/index.js': 'var a=1' }, SHIPS_DIST, 0],
  ['a company name in a shipped file fails', { 'dist/index.js': 'var a="paymentiq"' }, SHIPS_DIST, 1],
  ['a former company name fails', { 'dist/index.js': '/* bambora */' }, SHIPS_DIST, 1],
  ['a tenant name fails', { 'dist/index.js': 'mrgreen' }, SHIPS_DIST, 1],
  // Copilot raised this: the packed path becomes the consumer's import path.
  ['a company name in the packed path fails', { 'dist/paymentiq.js': 'var a=1' }, SHIPS_DIST, 1],
  ['case is ignored', { 'dist/index.js': 'PaymentIQ' }, SHIPS_DIST, 1],
  // The point of scanning `npm pack` rather than the tree: `files` decides what ships.
  [
    'a name in a file that does not ship passes',
    { 'dist/index.js': 'var a=1', 'CHANGES.md': 'github.com/devcode-git/x' },
    SHIPS_DIST,
    0,
  ],
  [
    'the same name fails once that file ships',
    { 'dist/index.js': 'var a=1', 'CHANGES.md': 'github.com/devcode-git/x' },
    { files: ['dist', 'CHANGES.md'] },
    1,
  ],
];

let failed = 0;
for (const [name, files, pkg, expected] of cases) {
  const dir = fixture(files, pkg);
  const actual = run(dir);
  rmSync(dir, { recursive: true, force: true });
  if (actual === expected) {
    console.log(`  ok    ${name}`);
  } else {
    console.error(`  FAIL  ${name}: expected exit ${expected}, got ${actual}`);
    failed += 1;
  }
}

if (failed) {
  console.error(`\n${failed} case(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} cases passed.`);
