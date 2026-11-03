// Unit tests for the pure 4 en Raya rules. Run: node --test tests/connect4.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROWS, COLS, createBoard, freeRow, winningLine, explode, chooseMove } from '../src/games/connect4.js';

const drop = (board, col, player) => (board[freeRow(board, col)][col] = player);
const all = () => true;

test('a new board is empty and every column has room', () => {
  const board = createBoard();
  assert.equal(board.length, ROWS);
  for (let c = 0; c < COLS; c++) assert.equal(freeRow(board, c), ROWS - 1);
});

test('chips stack from the bottom and a full column reports -1', () => {
  const board = createBoard();
  for (let i = 0; i < ROWS; i++) drop(board, 0, 1);
  assert.equal(freeRow(board, 0), -1);
});

test('detects horizontal, vertical and diagonal wins', () => {
  const h = createBoard();
  [0, 1, 2, 3].forEach((c) => drop(h, c, 1));
  assert.ok(winningLine(h, 1));

  const v = createBoard();
  for (let i = 0; i < 4; i++) drop(v, 4, 2);
  assert.ok(winningLine(v, 2));
  assert.equal(winningLine(v, 1), null);

  const d = createBoard();
  [
    [0, 1],
    [1, 2],
    [1, 1],
    [2, 2],
    [2, 2],
    [2, 1],
    [3, 2],
    [3, 2],
    [3, 2],
    [3, 1],
  ].forEach(([c, p]) => drop(d, c, p));
  assert.ok(winningLine(d, 1));
});

test('a bomb removes a chip and the ones above fall', () => {
  const board = createBoard();
  drop(board, 3, 1);
  drop(board, 3, 2);
  drop(board, 3, 1);
  explode(board, ROWS - 1, 3);
  assert.equal(board[ROWS - 1][3], 2);
  assert.equal(board[ROWS - 2][3], 1);
  assert.equal(board[ROWS - 3][3], 0);
});

test('the machine wins when it can and blocks when it must', () => {
  const win = createBoard();
  [0, 1, 2].forEach((c) => drop(win, c, 2));
  assert.equal(chooseMove(win, all), 3);

  const block = createBoard();
  [0, 1, 2].forEach((c) => drop(block, c, 1));
  assert.equal(chooseMove(block, all), 3);
});

test('the machine respects frozen columns and returns undefined with no move', () => {
  const board = createBoard();
  const move = chooseMove(
    board,
    (c) => c !== 3,
    () => 0.5,
  );
  assert.notEqual(move, 3);
  assert.equal(
    chooseMove(board, () => false),
    undefined,
  );
});
