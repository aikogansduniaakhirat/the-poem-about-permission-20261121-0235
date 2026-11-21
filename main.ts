// A fixed poem about permission, rendered offline without dependencies.
// A mother's held door becomes the speaker's model for answering a machine:
// permission means taking responsibility, not merely saying yes.
// CommonJS keeps direct Node 22 execution independent of package metadata.
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const poem = `My mother held the screen door with her hip,
my hands full. Go on, she said,
which was not yes, and I went through.

At two the thing I built asks may I proceed.
The cursor blinks like a porch light.

I type yes, and hold the door myself,
the way she did, with both hands full.`;

function codePoints(text: string): number {
  let count = 0;
  for (const point of text) {
    count += 1;
  }
  return count;
}

function validatePoemShape(text: string): void {
  if (/[\r\n]$/.test(text)) {
    throw new Error('The poem must not end with a newline.');
  }
  const lines = text.split(/\r\n|\n|\r/);
  if (lines.length > 24) {
    throw new Error('The poem exceeds 24 lines.');
  }
  for (const [index, line] of lines.entries()) {
    if (codePoints(line) > 64) {
      throw new Error(`Poem line ${index + 1} exceeds 64 characters.`);
    }
  }
}

function prepare(text: string): string {
  validatePoemShape(text);
  const body = text.replace(/\r\n/g, '\n').replace(/[^\S\n]+$/gm, '').trimEnd();
  if (body.trim() === '') {
    throw new Error('The poem must not be empty or whitespace-only.');
  }
  if (codePoints(body) > 280) {
    throw new Error('The poem exceeds 280 Unicode code points.');
  }
  return body;
}

function main(): void {
  const body = prepare(poem);
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outputDir, { recursive: true });
  const destination = join(outputDir, 'entry.txt');
  const expected = Buffer.from(body, 'utf8');
  writeFileSync(destination, body, 'utf8');
  const written = readFileSync(destination);
  if (!written.equals(expected)) {
    throw new Error('The written poem does not match the expected UTF-8 bytes.');
  }
  const writtenText = written.toString('utf8');
  const lines = writtenText.split('\n');
  console.log(`Lines: ${lines.length}`);
  console.log(`Longest line: ${Math.max(...lines.map(codePoints))} characters`);
  console.log(`Code points: ${codePoints(writtenText)}`);
  console.log(`UTF-8 bytes: ${written.byteLength}`);
  for (const [index, line] of lines.entries()) {
    if (line.startsWith(' ') || line.endsWith(' ')) {
      throw new Error(`Written poem line ${index + 1} has leading or trailing spaces.`);
    }
  }
}

main();
