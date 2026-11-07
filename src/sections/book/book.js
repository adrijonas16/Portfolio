import { gsap } from '../../core/scroll.js';
import { reducedMotion } from '../../config.js';
import { $$ } from '../../core/dom.js';

export const MOBILE = matchMedia('(max-width: 900px)');

const TURN = 1.15; // seconds per page turn
const LIFT = 70; // px a page rises off the desk while it turns
const STAGGER = 0.14; // delay between pages when jumping several at once

/**
 * A page-turning book built from leaves (a sheet with a front and a back face).
 * `spread` = how many leaves are turned: 0 is the closed cover, `leaves.length` the last page.
 * On desktop both pages of a spread are visible; on phones one page at a time (`side` 'l' or 'r').
 * This module only knows about pages and motion: input lives in input.js, content in pages/.
 */
export function createBook(el, leaves, { onChange = () => {} } = {}) {
  const total = leaves.length;
  el.innerHTML = leaves
    .map(
      (l, i) => `<div class="leaf" data-i="${i}">
        <div class="face front">${l.front}</div>
        <div class="face back">${l.back}</div>
      </div>`,
    )
    .join('');
  const leafEls = $$('.leaf', el);
  const fronts = leafEls.map((l) => l.querySelector('.front'));
  const backs = leafEls.map((l) => l.querySelector('.back'));

  let spread = 0;
  let side = 'r';
  let running = null;

  const zIndexFor = (i, turned) => (turned ? i + 1 : total - i);

  /** Horizontal shift so the visible page sits in the middle of the desk. */
  const shift = () => {
    if (MOBILE.matches) return side === 'l' ? 25 : -25;
    if (spread === 0) return -25;
    if (spread === total) return 25;
    return 0;
  };

  /** Only the faces you can see are reachable by keyboard and screen readers. */
  const syncFaces = () => {
    const left = spread > 0 ? backs[spread - 1] : null;
    const right = spread < total ? fronts[spread] : null;
    const visible = MOBILE.matches ? [side === 'l' ? left : right] : [left, right];
    [...fronts, ...backs].forEach((f) => {
      const on = visible.includes(f);
      f.inert = !on;
      f.classList.toggle('is-left', on && f === left);
      f.classList.toggle('is-right', on && f === right);
    });
  };

  /** One leaf turning: it rotates on the spine, rises off the desk and catches the lamp light. */
  const turnLeaf = (tl, leaf, turned, at, order) => {
    const half = TURN / 2;
    tl.set(leaf, { zIndex: total + 10 + order }, at)
      .to(leaf, { rotationY: turned ? -180 : 0, duration: TURN, ease: 'power2.inOut' }, at)
      .to(leaf, { z: LIFT, '--sheen': 1, duration: half, ease: 'sine.out' }, at)
      .to(leaf, { z: 0, '--sheen': 0, duration: half, ease: 'sine.in' }, at + half)
      .set(leaf, { zIndex: zIndexFor(Number(leaf.dataset.i), turned) });
  };

  const render = (from, instant = false) => {
    const moving = [];
    if (spread > from) for (let i = from; i < spread; i++) moving.push([i, true]);
    else for (let i = from - 1; i >= spread; i--) moving.push([i, false]);

    running?.progress(1);
    const tl = gsap.timeline({ onComplete: () => (running = null) });
    moving.forEach(([i, turned], k) => turnLeaf(tl, leafEls[i], turned, k * STAGGER, k));
    tl.to(el, { xPercent: shift(), duration: TURN, ease: 'power3.inOut' }, 0);
    if (instant || reducedMotion) tl.progress(1);
    running = tl;

    syncFaces();
    onChange({ spread, side, total });
  };

  const go = (nextSpread, nextSide = 'l') => {
    const from = spread;
    spread = Math.max(0, Math.min(total, nextSpread));
    side = spread === 0 ? 'r' : spread === total ? 'l' : nextSide;
    render(from);
  };

  const next = () => {
    if (!MOBILE.matches) return spread < total && go(spread + 1);
    if (spread === 0) return go(1, 'l');
    if (side === 'l' && spread < total) return go(spread, 'r');
    if (spread < total) go(spread + 1, 'l');
  };

  const prev = () => {
    if (!MOBILE.matches) return spread > 0 && go(spread - 1);
    if (side === 'r' && spread > 0) return go(spread, 'l');
    if (spread > 0) go(spread - 1, 'r');
  };

  leafEls.forEach((l, i) => gsap.set(l, { rotationY: 0, z: 0, zIndex: zIndexFor(i, false) }));
  MOBILE.addEventListener('change', () => render(spread, true));
  render(0, true);

  return { el, next, prev, go, total };
}
