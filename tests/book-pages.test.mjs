import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLeaves, FIRST_PROJECT_SPREAD } from '../src/sections/book/pages/index.js';
import { folio } from '../src/sections/book/pages/folio.js';
import { PROJECTS } from '../src/data/projects.js';

const leaves = buildLeaves(PROJECTS);

test('one leaf for the cover, one for the contents and one per project', () => {
  assert.equal(leaves.length, PROJECTS.length + FIRST_PROJECT_SPREAD);
});

test('spread s shows project s - 2: opening on the left, details on the right', () => {
  PROJECTS.forEach((p, i) => {
    const s = FIRST_PROJECT_SPREAD + i;
    assert.match(leaves[s - 1].back, new RegExp(`data-hero="${i}"`), `${p.name} opening page`);
    assert.match(leaves[s].front, /pg-details/, `${p.name} details page`);
    assert.ok(leaves[s - 1].back.includes(p.name));
  });
});

test('every live project gets a button and the last page closes the book', () => {
  const html = leaves.map((l) => l.front + l.back).join('');
  assert.equal((html.match(/class="pg-btn go"/g) ?? []).length, PROJECTS.filter((p) => p.live).length);
  assert.match(leaves.at(-1).back, /Fin del libro/);
});

test('contents list every project with its page number', () => {
  PROJECTS.forEach((p, i) => {
    assert.ok(leaves[1].front.includes(p.name));
    assert.ok(leaves[1].front.includes(String(folio(i)).padStart(2, '0')));
  });
});
