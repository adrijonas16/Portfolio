import { gsap } from '../core/scroll.js';
import { reducedMotion } from '../config.js';
import { $ } from '../core/dom.js';
import { PROJECTS } from '../data/projects.js';
import { createBook, MOBILE } from './book/book.js';
import { bindBookInput } from './book/input.js';
import { initMosaics } from './book/gallery.js';
import { buildLeaves, FIRST_PROJECT_SPREAD } from './book/pages/index.js';

/**
 * Independent projects: a black brochure lying on the desk. One double page per project.
 * This file only wires the pieces together: content (pages/), motion (book.js),
 * input (input.js), the screenshot mosaic (gallery.js) and the controls under the book.
 */
export function initProjects() {
  const el = $('#book');
  const controls = { prev: $('#bookPrev'), next: $('#bookNext'), pos: $('#bookPos') };

  const book = createBook(el, buildLeaves(PROJECTS), {
    onChange: (state) => {
      updateControls(controls, state);
      layBook(state.spread === 0);
    },
  });

  bindBookInput(book);
  initMosaics(el);
  controls.prev.addEventListener('click', book.prev);
  controls.next.addEventListener('click', book.next);

  // Table of contents and "back to contents".
  el.addEventListener('click', (e) => {
    const target = e.target.closest('[data-goto]');
    if (!target) return;
    if (target.dataset.goto === 'toc') book.go(1, 'r');
    else book.go(FIRST_PROJECT_SPREAD + Number(target.dataset.goto), 'l');
  });

  settleOnDesk();
}

function updateControls({ prev, next, pos }, { spread, total }) {
  const project = PROJECTS[spread - FIRST_PROJECT_SPREAD];
  pos.textContent =
    spread === 0
      ? 'Libro cerrado'
      : spread === 1
        ? 'Índice'
        : project
          ? `Proyecto ${spread - FIRST_PROJECT_SPREAD + 1} de ${PROJECTS.length}: ${project.name}`
          : 'Fin del libro';
  prev.disabled = spread === 0;
  next.disabled = spread === total;
  next.textContent = spread === 0 ? 'Abrir el libro' : 'Siguiente';
}

/**
 * The desk is seen from above at an angle. Closed, the book lies crooked and flat on it;
 * open, it straightens up and tilts towards you so the pages read well.
 */
function layBook(closed) {
  $('#book').classList.toggle('is-closed', closed);
  const tilt = MOBILE.matches ? 4 : closed ? 26 : 14;
  gsap.to('.book-tilt', {
    rotation: closed ? -5 : 0,
    rotationX: tilt,
    duration: reducedMotion ? 0 : 1.1,
    ease: 'power3.inOut',
  });
}

/** The first time you reach the desk the book drops onto it. */
function settleOnDesk() {
  if (reducedMotion) return;
  gsap.from('.book-tilt', {
    y: -60,
    scale: 1.08,
    autoAlpha: 0,
    duration: 1.3,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.desk', start: 'top 70%' },
  });
}
