/**
 * 4 en Raya Brutal — pure game rules, no DOM. The UI in sections/raya.js drives these,
 * and tests/connect4.test.mjs checks them directly.
 *
 * Board: board[row][col], row 0 is the top. Cells hold 0 (empty), 1 (player) or 2 (machine).
 */
export const ROWS = 6;
export const COLS = 7;
export const CHAOS_EVERY = 4;

export const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

/** Lowest empty row in a column, or -1 if it's full. */
export function freeRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) if (!board[r][col]) return r;
  return -1;
}

export const isFull = (board) => board[0].every(Boolean);

/** The four winning cells for `player`, or null. */
export function winningLine(board, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of directions) {
        const line = [];
        for (let k = 0; k < 4; k++) {
          const rr = r + dr * k;
          const cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || board[rr][cc] !== player) break;
          line.push([rr, cc]);
        }
        if (line.length === 4) return line;
      }
    }
  }
  return null;
}

/** Removes the chip at (row, col) and lets everything above it fall one row. Mutates the board. */
export function explode(board, row, col) {
  for (let r = row; r > 0; r--) board[r][col] = board[r - 1][col];
  board[0][col] = 0;
}

/**
 * Machine move: win if it can, block if it must, avoid gifting a win, prefer the centre.
 * `canPlay(col)` lets the caller exclude frozen columns. Returns undefined when no move exists.
 */
export function chooseMove(board, canPlay, random = Math.random) {
  const options = [...Array(COLS).keys()].filter(canPlay);
  const winsWith = (player) =>
    options.find((c) => {
      const r = freeRow(board, c);
      board[r][c] = player;
      const won = winningLine(board, player);
      board[r][c] = 0;
      return won;
    });

  const win = winsWith(2);
  if (win !== undefined) return win;
  const block = winsWith(1);
  if (block !== undefined) return block;

  const safe = options.filter((c) => {
    const r = freeRow(board, c);
    if (r <= 0) return true;
    board[r][c] = 2;
    board[r - 1][c] = 1;
    const gift = winningLine(board, 1);
    board[r][c] = 0;
    board[r - 1][c] = 0;
    return !gift;
  });
  const pool = safe.length ? safe : options;
  return pool.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3) + (random() - 0.5) * 1.6)[0];
}
