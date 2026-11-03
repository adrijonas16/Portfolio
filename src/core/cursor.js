import { gsap } from './scroll.js';
import { isTouch } from '../config.js';
import { $, $$ } from './dom.js';

/** Custom cursor (ring + dot) that grows over links, plus magnetic buttons (.mag). */
export function initCursor() {
  if (isTouch) return;
  const ring = $('.cursor');
  const dot = $('.cursor-dot');
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  gsap.set([ring, dot], { x: innerWidth / 2, y: innerHeight / 2 });

  addEventListener('pointermove', (e) => {
    rx(e.clientX);
    ry(e.clientY);
    dx(e.clientX);
    dy(e.clientY);
  });
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('a,button')) ring.classList.add('big');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('a,button')) ring.classList.remove('big');
  });

  $$('.mag').forEach((el) => {
    const qx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,.4)' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.35);
      qy((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => {
      qx(0);
      qy(0);
    });
  });
}
