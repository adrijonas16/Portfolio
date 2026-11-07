import { gsap } from '../../core/scroll.js';
import { reducedMotion } from '../../config.js';
import { $, $$ } from '../../core/dom.js';
import { GAMES } from '../../data/games.js';
import { sidebarGroup, gamePage } from './templates.js';
import { initQuickMatch } from './quick-match.js';

/**
 * Games as a game-launcher library: the list on the left, the selected game on the right
 * with its cover, Play button, screenshots and achievements. 4 en Raya can be played right there.
 */
export function initLibrary() {
  const nav = $('#libNav');
  const pages = $('#libPages');
  const playable = GAMES.filter((g) => g.status === 'playable');
  const inDev = GAMES.filter((g) => g.status === 'dev');

  nav.innerHTML =
    sidebarGroup('Jugables en el navegador', playable, GAMES) + sidebarGroup('En desarrollo', inDev, GAMES);
  pages.innerHTML = GAMES.map(gamePage).join('');

  const tabs = $$('.lib-item', nav);
  const pageEls = $$('.lib-page', pages);
  let current = 0;

  const select = (i, focus = false) => {
    if (i === current) return;
    tabs[current].setAttribute('aria-selected', 'false');
    tabs[current].tabIndex = -1;
    pageEls[current].hidden = true;
    current = i;
    tabs[i].setAttribute('aria-selected', 'true');
    tabs[i].tabIndex = 0;
    if (focus) tabs[i].focus();
    pageEls[i].hidden = false;
    enter(pageEls[i]);
  };

  tabs.forEach((t) => t.addEventListener('click', () => select(Number(t.dataset.i))));
  nav.addEventListener('keydown', (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    select((current + step + GAMES.length) % GAMES.length, true);
  });

  pageEls.forEach(initScreenshots);
  initQuickMatch();
}

/** Thumbnails under the description change the cover image. */
function initScreenshots(page) {
  const shots = $$('.lib-shot', page);
  const thumbs = $$('.lib-th', page);
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

/** Switching games: the cover settles in and the rest follows. */
function enter(page) {
  if (reducedMotion) return;
  gsap.fromTo(
    $('.lib-hero', page),
    { scale: 1.04, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.8, ease: 'expo.out' },
  );
  gsap.fromTo(
    [$('.lib-bar', page), ...$$('.lib-body > *', page)],
    { y: 16, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.06, delay: 0.1, clearProps: 'all' },
  );
}
