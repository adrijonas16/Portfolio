import { $$ } from '../../core/dom.js';

/**
 * The mosaic on a project's right page picks the screenshot shown full-bleed on its left page.
 * Both pages live on different leaves, so they are linked by the project index (data-p / data-hero).
 */
export function initMosaics(book) {
  book.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    const { p, k } = tile.dataset;
    const index = Number(k);
    $$(`[data-hero="${p}"] .hero-shot`, book).forEach((img, j) => img.classList.toggle('on', j === index));
    $$(`.tile[data-p="${p}"]`, book).forEach((t, j) => {
      t.classList.toggle('on', j === index);
      t.setAttribute('aria-pressed', j === index);
    });
  });
}
