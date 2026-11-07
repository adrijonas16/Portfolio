import { gsap } from '../../core/scroll.js';
import { reducedMotion } from '../../config.js';
import { $$ } from '../../core/dom.js';

const MOBILE = matchMedia('(max-width: 900px)');
const TURN = 0.9;

/**
 * A page-turning book built from leaves (a sheet with a front and a back face).
 * `spread` = how many leaves are turned. Spread 0 is the closed cover, spread = leaves.length the last page.
 * On desktop both pages of a spread are visible; on phones one page at a time (`side` 'l' or 'r').
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
  let busy = null;

  const zFor = (i, turned) => (turned ? i + 1 : total - i);
  leafEls.forEach((l, i) => gsap.set(l, { rotationY: 0, zIndex: zFor(i, false) }));

  /** Horizontal shift so the visible page sits in the middle of the desk. */
  const shift = () => {
    if (MOBILE.matches) return side === 'l' ? 25 : -25;
    if (spread === 0) return -25;
    if (spread === total) return 25;
    return 0;
  };

  /** Only the faces you can see are reachable by keyboard and screen readers. */
  const updateFocusable = () => {
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

  const render = (from, instant = false) => {
    const to = spread;
    const animate = !reducedMotion && from !== to;
    const moving = [];
    if (to > from) for (let i = from; i < to; i++) moving.push([i, true]);
    else for (let i = from - 1; i >= to; i--) moving.push([i, false]);

    busy?.progress(1);
    const tl = gsap.timeline({ onComplete: () => (busy = null) });
    moving.forEach(([i, turned], k) => {
      const leaf = leafEls[i];
      const at = animate ? k * 0.12 : 0;
      tl.set(leaf, { zIndex: total + 10 + k }, at)
        .to(leaf, { rotationY: turned ? -180 : 0, duration: animate ? TURN : 0, ease: 'power2.inOut' }, at)
        .to(leaf, { '--shade': 0.28, duration: animate ? TURN / 2 : 0, ease: 'sine.in' }, at)
        .to(leaf, { '--shade': 0, duration: animate ? TURN / 2 : 0, ease: 'sine.out' }, at + (animate ? TURN / 2 : 0))
        .set(leaf, { zIndex: zFor(i, turned) });
    });
    tl.to(el, { xPercent: shift(), duration: instant || reducedMotion ? 0 : TURN, ease: 'power3.inOut' }, 0);
    if (instant) tl.progress(1);
    busy = tl;
    updateFocusable();
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

  // Desktop: click the right page to move on, the left page to go back. Phones: tap the page to move on.
  el.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input')) return;
    const face = e.target.closest('.face');
    if (!face) return;
    if (face.classList.contains('is-right') || MOBILE.matches) next();
    else if (face.classList.contains('is-left')) prev();
  });

  // Swipe on touch screens.
  let startX = null;
  el.addEventListener('pointerdown', (e) => (startX = e.pointerType === 'touch' ? e.clientX : null));
  el.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  });

  MOBILE.addEventListener('change', () => render(spread, true));
  render(0, true);

  return {
    next,
    prev,
    go,
    get state() {
      return { spread, side, total, mobile: MOBILE.matches };
    },
  };
}
