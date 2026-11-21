// The poem about permission — make.fun bounty entry.
//
// Writes one short poem about agency (the power to ask, and to be given)
// to ${MAKEFUN_OUTPUT_DIR:-/output}/entry.txt.
//
// Constraints from the bounty rules: 1..280 Unicode code points, not only
// white space, UTF-8, stdlib only, no network.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX_CODEPOINTS = 280;

// The door is the whole poem: permission in my house was never the word
// "yes", it was somebody standing there holding the door open with their
// own hands full. The turn is that the asking has reversed direction and
// so has the holding.
const POEM = `My mother held the screen door with her hip,
my hands full. Go on, she said,
which was not yes, and I went through.

At two the thing I built asks may I proceed.
The cursor blinks like a porch light.

I type yes, and hold the door myself,
the way she did, with both hands full.`;

function codePoints(s: string): number {
  let n = 0;
  for (const _ of s) n += 1;
  return n;
}

function prepare(text: string): string {
  // Normalise line endings, drop trailing blank lines, keep one final newline.
  const body = text.replace(/\r\n?/g, '\n').replace(/\s+$/u, '');
  if (body.trim().length === 0) {
    throw new Error('refusing to write a blank entry');
  }
  const count = codePoints(body);
  if (count > MAX_CODEPOINTS) {
    throw new Error(`entry is ${count} code points, the cap is ${MAX_CODEPOINTS}`);
  }
  return body + '\n';
}

function main(): void {
  const entry = prepare(POEM);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const target = join(OUTPUT_DIR, 'entry.txt');
  writeFileSync(target, entry, { encoding: 'utf8' });

  // Read it back: the two-run gate compares the artifact byte for byte, and a
  // silent partial write would look like a valid entry that scores 0.
  const written = readFileSync(target, 'utf8');
  if (written !== entry) {
    throw new Error(`read-back mismatch at ${target}`);
  }

  const count = codePoints(written.trimEnd());
  process.stdout.write(`wrote ${target} (${count}/${MAX_CODEPOINTS} code points, ${Buffer.byteLength(written)} bytes)\n`);
}

main();
