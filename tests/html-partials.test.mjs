// Unit tests for the build-time HTML includes. Run: node --test tests/html-partials.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import htmlPartials from '../plugins/html-partials.js';

const fixture = (files) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'partials-'));
  for (const [name, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), body);
  }
  return htmlPartials({ root: dir }).transformIndexHtml.handler;
};

test('replaces includes, including nested ones', () => {
  const run = fixture({ 'a.html': '<a><!-- @include b/c.html --></a>', 'b/c.html': '<c></c>\n' });
  assert.equal(run('<main><!-- @include a.html --></main>'), '<main><a><c></c></a></main>');
});

test('fails loudly on a missing or circular include', () => {
  const run = fixture({ 'x.html': '<!-- @include y.html -->', 'y.html': '<!-- @include x.html -->' });
  assert.throws(() => run('<!-- @include nope.html -->'), /not found/);
  assert.throws(() => run('<!-- @include x.html -->'), /Circular/);
});

test('refuses paths outside the partials root', () => {
  const run = fixture({});
  assert.throws(() => run('<!-- @include ../../etc/passwd -->'), /outside/);
});
