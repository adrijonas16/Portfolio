import { gsap } from '../core/scroll.js';
import { reducedMotion } from '../config.js';
import { $, $$ } from '../core/dom.js';
import { PROJECTS } from '../data/projects.js';
import { createBook } from './book/book.js';
import { cover, intro, contents, projectImages, projectText, lastPage } from './book/pages.js';

/** First spread that holds a project (0 = cover, 1 = intro + table of contents). */
const FIRST = 2;

/**
 * Independent projects as a book on a desk: one double page per project,
 * screenshots on the left and the story on the right.
 */
export function initProjects() {
  const leaves = [
    { front: cover(), back: intro() },
    { front: contents(PROJECTS), back: projectImages(PROJECTS[0], 0) },
    ...PROJECTS.map((p, i) => ({
      front: projectText(p, i),
      back: i + 1 < PROJECTS.length ? projectImages(PROJECTS[i + 1], i + 1) : lastPage(),
    })),
  ];

  const el = $('#book');
  const prevBtn = $('#bookPrev');
  const nextBtn = $('#bookNext');
  const pos = $('#bookPos');

  const book = createBook(el, leaves, {
    onChange: ({ spread, total }) => {
      const project = PROJECTS[spread - FIRST];
      pos.textContent =
        spread === 0
          ? 'Libro cerrado'
          : spread === 1
            ? 'Índice'
            : project
              ? `Proyecto ${spread - FIRST + 1} de ${PROJECTS.length}: ${project.name}`
              : 'Fin del libro';
      prevBtn.disabled = spread === 0;
      nextBtn.disabled = spread === total;
      nextBtn.textContent = spread === 0 ? 'Abrir el libro' : 'Siguiente';
      el.classList.toggle('is-closed', spread === 0);
    },
  });

  prevBtn.addEventListener('click', book.prev);
  nextBtn.addEventListener('click', book.next);

  // Table of contents and "back to contents" links.
  el.addEventListener('click', (e) => {
    const target = e.target.closest('[data-goto]');
    if (!target) return;
    const to = target.dataset.goto;
    if (to === 'toc') book.go(1, 'r');
    else book.go(FIRST + Number(to), 'l');
  });

  // Arrow keys turn pages while the book is on screen.
  let inView = false;
  new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.5 }).observe(el);
  addEventListener('keydown', (e) => {
    if (!inView || e.target.closest?.('input, textarea')) return;
    if (e.key === 'ArrowRight') book.next();
    if (e.key === 'ArrowLeft') book.prev();
  });

  $$('.pg-photo', el).forEach(initGallery);
  introAnimation();
}

/** Thumbnails swap the photo printed on the page. */
function initGallery(photo) {
  const shots = $$('.shot', photo);
  const thumbs = $$('.pg-th', photo.parentElement);
  thumbs.forEach((t, k) =>
    t.addEventListener('click', () => {
      shots.forEach((s, j) => s.classList.toggle('on', j === k));
      thumbs.forEach((b, j) => {
        b.classList.toggle('on', j === k);
        b.setAttribute('aria-pressed', j === k);
      });
    }),
  );
}

/** The closed book settles onto the desk the first time you reach it. */
function introAnimation() {
  if (reducedMotion) return;
  gsap.from('.book-view', {
    rotationX: 28,
    y: 90,
    opacity: 0,
    duration: 1.4,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.desk', start: 'top 75%' },
  });
}
