import { MOBILE } from './book.js';

/**
 * Ways to turn the pages:
 * - desktop: click the right page to move on, the left page to go back
 * - phones: tap the page to move on, swipe either way
 * - arrow keys while the book is on screen
 * Links and buttons printed on the pages keep working normally.
 */
export function bindBookInput(book) {
  const { el } = book;

  el.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    const face = e.target.closest('.face');
    if (!face) return;
    if (face.classList.contains('is-right') || MOBILE.matches) book.next();
    else if (face.classList.contains('is-left')) book.prev();
  });

  let startX = null;
  el.addEventListener('pointerdown', (e) => (startX = e.pointerType === 'touch' ? e.clientX : null));
  el.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) (dx < 0 ? book.next : book.prev)();
  });

  let inView = false;
  new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0.5 }).observe(el);
  addEventListener('keydown', (e) => {
    if (!inView || e.target.closest?.('input, textarea')) return;
    if (e.key === 'ArrowRight') book.next();
    if (e.key === 'ArrowLeft') book.prev();
  });
}
