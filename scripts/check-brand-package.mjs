/*
  Asserts the published package carries no company name (PIQ-5877).

  Scans what `npm pack` would ship rather than the working tree: `files` limits the tarball to dist
  and index.d.ts, so CHANGES.md and .github never ship and scanning the tree would fail on their
  GitHub links for no reason. CI publishes on every push to master, so this runs before `npm publish`
  and on pull requests: a name that reaches npm cannot be withdrawn, only superseded.

  Deliberately not configurable from the environment. A guard that can be switched off where it runs
  is not a guard.
*/
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';

/*
  Former and current company names, plus the two paymentiq.io tenants, each split where a human would
  space it. Matching the closed-up spelling alone lets the prose form through: `Payment IQ` in a
  README, `Mr Green` in a comment, `payment-iq` in a filename. The repo already writes it both ways,
  for example `// The payment iq mid` in src/sdk/api/index.js.
*/
const FORBIDDEN = [
  ['payment', 'iq'],
  ['world', 'line'],
  ['dev', 'code'],
  ['bambora'],
  ['casumo'],
  ['mr', 'green'],
];

// Whitespace, underscore, dot or hyphen between the parts, in any number, including none.
const SEPARATOR = '[\\s_.-]*';

// Word characters only, so joining the parts into an alternation cannot introduce a metacharacter.
const malformed = FORBIDDEN.flat().filter((part) => !/^\w+$/.test(part));
if (malformed.length) {
  console.error(`FORBIDDEN parts must be word characters only: ${malformed.join(', ')}`);
  process.exit(2);
}

const names = FORBIDDEN.map((parts) => parts.join(''));

let files;
try {
  // --dry-run writes nothing; the JSON lists exactly what a real pack would include.
  const out = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf-8' });
  files = JSON.parse(out)[0].files.map((f) => f.path);
} catch (error) {
  console.error(`Could not read the package contents: ${error.message}`);
  process.exit(2);
}

if (!files.length) {
  console.error('npm pack listed no files, which cannot be right');
  process.exit(2);
}

const pattern = new RegExp(FORBIDDEN.map((parts) => parts.join(SEPARATOR)).join('|'), 'gi');
const failures = [];

for (const file of files) {
  let contents;
  try {
    contents = readFileSync(file, 'utf-8');
  } catch (error) {
    // A file that ships but cannot be read is a hole in the guard, not something to skip.
    console.error(`Could not read ${file}: ${error.message}`);
    process.exit(2);
  }
  // The packed path counts as well as the contents: it becomes the consumer's import path, so
  // `dist/paymentiq.js` carries the name whatever the file says. Relative, as npm lists it, since
  // the absolute path runs through a checkout directory nobody chose.
  const hits = [...(file.match(pattern) ?? []), ...(contents.match(pattern) ?? [])];
  if (hits.length) failures.push({ file, hits });
}

if (failures.length) {
  console.error(`The published package carries a company name, in ${failures.length} file(s):\n`);
  for (const { file, hits } of failures) {
    const counts = new Map();
    for (const hit of hits) {
      const name = hit.toLowerCase();
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const summary = [...counts].map(([name, n]) => `${name} x${n}`).join(', ');
    console.error(`  ${file}: ${summary}`);
  }
  console.error(`\nScanned ${files.length} packed file(s) for: ${names.join(', ')}, spaced or hyphenated too`);
  process.exit(1);
}

console.log(`No company name in any of the ${files.length} packed file(s).`);
