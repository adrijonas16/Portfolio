import { gsap } from '../core/scroll.js';
import { reducedMotion } from '../config.js';
import { $ } from '../core/dom.js';
import {
  ROWS,
  COLS,
  CHAOS_EVERY,
  createBoard,
  freeRow,
  isFull,
  winningLine,
  explode,
  chooseMove,
} from '../games/connect4.js';

const PLAYER = 1;
const MACHINE = 2;
const MACHINE_DELAY = 520;

/** Playable mini 4 en Raya Brutal against the machine. Rules live in games/connect4.js. */
export function initRaya() {
  const boardEl = $('#board');
  const turnEl = $('#turn');
  const chaosEl = $('#chaos');
  let board, turn, moves, frozen, over;

  const colEl = (c) => boardEl.children[c];
  const cellEl = (r, c) => colEl(c).children[r];
  const canPlay = (c) => freeRow(board, c) >= 0 && frozen.col !== c;
  const setTurn = (text) => (turnEl.textContent = text);
  const lockAll = () => [...boardEl.children].forEach((b) => (b.disabled = true));
  const refreshColumns = () =>
    [...boardEl.children].forEach((b, c) => {
      b.disabled = over || !canPlay(c);
      b.classList.toggle('frozen', frozen.col === c);
    });
  const markWin = (line) => line.forEach(([r, c]) => $('.chip', cellEl(r, c))?.classList.add('win'));
  const thaw = () => {
    if (frozen.col >= 0) colEl(frozen.col).classList.remove('frozen');
    frozen = { col: -1, left: 0 };
  };

  function reset() {
    board = createBoard();
    turn = PLAYER;
    moves = 0;
    frozen = { col: -1, left: 0 };
    over = false;
    boardEl.innerHTML = '';
    for (let c = 0; c < COLS; c++) {
      const col = document.createElement('button');
      col.className = 'col';
      col.setAttribute('aria-label', `Soltar ficha en la columna ${c + 1}`);
      for (let r = 0; r < ROWS; r++) col.insertAdjacentHTML('beforeend', '<div class="cell"></div>');
      col.addEventListener('click', () => turn === PLAYER && !over && play(c, PLAYER));
      boardEl.appendChild(col);
    }
    setTurn('Tu turno: fichas lilas');
    chaosEl.textContent = `Próximo caos en ${CHAOS_EVERY} jugadas`;
  }

  function drawChip(r, c, player) {
    const chip = document.createElement('div');
    chip.className = `chip p${player}`;
    cellEl(r, c).appendChild(chip);
    if (!reducedMotion) {
      const cellH = cellEl(0, c).getBoundingClientRect().height + 8;
      gsap.from(chip, { y: -(r + 1) * cellH, duration: 0.25 + r * 0.06, ease: 'bounce.out' });
    }
  }

  function play(c, player) {
    if (!canPlay(c)) return;
    const r = freeRow(board, c);
    board[r][c] = player;
    drawChip(r, c, player);
    moves++;

    const win = winningLine(board, player);
    if (win) {
      over = true;
      markWin(win);
      setTurn(player === PLAYER ? '¡Ganaste! Buen bonk.' : 'Ganó la máquina. ¿Revancha?');
      return lockAll();
    }
    if (isFull(board)) {
      over = true;
      return setTurn('Empate');
    }
    if (frozen.left > 0 && --frozen.left === 0) thaw();

    if (moves % CHAOS_EVERY === 0) chaos();
    else {
      const left = CHAOS_EVERY - (moves % CHAOS_EVERY);
      chaosEl.textContent = `Próximo caos en ${left} jugada${left === 1 ? '' : 's'}`;
    }
    if (over) return;

    turn = player === PLAYER ? MACHINE : PLAYER;
    // never leave someone without a legal move: the ice melts if it blocks the only free column
    if (![...Array(COLS).keys()].some(canPlay) && frozen.col >= 0) {
      thaw();
      chaosEl.textContent = 'El hielo se derritió';
    }
    refreshColumns();

    if (turn === MACHINE) {
      setTurn('Piensa la máquina…');
      setTimeout(
        () => {
          const move = chooseMove(board, canPlay);
          if (move === undefined) {
            over = true;
            return setTurn('Empate');
          }
          play(move, MACHINE);
        },
        reducedMotion ? 50 : MACHINE_DELAY,
      );
    } else setTurn('Tu turno: fichas lilas');
  }

  /** Every few moves: a bomb removes a chip (and gravity applies) or ice freezes a column for two turns. */
  function chaos() {
    const filled = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (board[r][c]) filled.push([r, c]);

    if (Math.random() < 0.5 && filled.length > 2) {
      const [r, c] = filled[Math.floor(Math.random() * filled.length)];
      boom(cellEl(r, c));
      $('.chip', cellEl(r, c))?.remove();
      explode(board, r, c);
      for (let rr = r; rr > 0; rr--) {
        const chip = $('.chip', cellEl(rr - 1, c));
        if (!chip) continue;
        cellEl(rr, c).appendChild(chip);
        if (!reducedMotion)
          gsap.from(chip, { y: -cellEl(0, c).getBoundingClientRect().height - 8, duration: 0.3, ease: 'bounce.out' });
      }
      chaosEl.textContent = `¡Bomba! Explotó una ficha en la columna ${c + 1}`;
      for (const p of [PLAYER, MACHINE]) {
        const win = winningLine(board, p);
        if (!win) continue;
        over = true;
        markWin(win);
        setTurn(p === PLAYER ? 'La bomba te dio la victoria' : 'La bomba ayudó a la máquina');
        lockAll();
      }
    } else {
      const open = [...Array(COLS).keys()].filter((c) => freeRow(board, c) >= 0);
      const c = open[Math.floor(Math.random() * open.length)];
      frozen = { col: c, left: 2 };
      chaosEl.textContent = `¡Hielo! La columna ${c + 1} queda congelada dos turnos`;
    }
  }

  function boom(cell) {
    const wrap = boardEl.parentElement;
    const rect = cell.getBoundingClientRect();
    const base = wrap.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'boom';
    el.style.left = `${rect.left - base.left + rect.width / 2 - 30}px`;
    el.style.top = `${rect.top - base.top + rect.height / 2 - 30}px`;
    wrap.appendChild(el);
    gsap.fromTo(
      el,
      { scale: 0.2, opacity: 1 },
      { scale: 2.2, opacity: 0, duration: 0.6, ease: 'expo.out', onComplete: () => el.remove() },
    );
  }

  $('#reset').addEventListener('click', reset);
  reset();
}
