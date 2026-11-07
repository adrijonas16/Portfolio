import { gsap } from '../../core/scroll.js';
import { reducedMotion } from '../../config.js';
import { $, $$ } from '../../core/dom.js';

/** BSG: lines from the platform to each integration, with pulses travelling both ways. */
export function initHub() {
  const hub = $('.hub');
  if (!hub) return;
  const [cx, cy] = [200, 150]; // centre of the 400x300 viewBox
  $$('.node', hub).forEach((n) => {
    n.style.setProperty('--x', n.dataset.x);
    n.style.setProperty('--y', n.dataset.y);
  });
  const nodes = $$('.node:not(.core)', hub).map((n) => [Number(n.dataset.x) * 4, Number(n.dataset.y) * 3]);
  $('.wires', hub).innerHTML = nodes
    .map(([x, y], i) => {
      const [from, to] = i % 2 ? [`${cx},${cy}`, `${x},${y}`] : [`${x},${y}`, `${cx},${cy}`];
      const pulse = reducedMotion
        ? ''
        : `<circle r="3" class="pulse"><animateMotion dur="${2.2 + i * 0.35}s" repeatCount="indefinite" path="M${from} L${to}"/></circle>`;
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="w"/>${pulse}`;
    })
    .join('');
}

/** Each job's detail plays its own little animation when it opens. */
const PLAYS = {
  imb: (el) => gsap.from($$('.arch .layer', el), { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.09 }),
  'isp-corp': (el) =>
    gsap.from($$('.msg', el), { y: 14, opacity: 0, scale: 0.96, duration: 0.45, ease: 'back.out(1.6)', stagger: 0.4 }),
  bsg: (el) =>
    gsap.from($$('.node', el), { scale: 0.6, opacity: 0, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.07 }),
};

export function playDetail(el) {
  if (reducedMotion) return;
  gsap.fromTo(
    el.children,
    { y: 14, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.05, clearProps: 'all' },
  );
  PLAYS[el.dataset.job]?.(el);
}
