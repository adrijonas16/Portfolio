/**
 * Boot order:
 *   1. page chrome that must exist before the loader finishes (grain, scroll, cursor)
 *   2. sections render their DOM and create their ScrollTriggers
 *   3. the loader waits for images and fonts, wipes away, and the hero plays its entrance
 */
import './styles/index.css';

import { startAtTop, initAnchors, releaseScroll, watchLayout, ScrollTrigger } from './core/scroll.js';
import { initGrain } from './core/grain.js';
import { initCursor } from './core/cursor.js';
import { initNav, initMarquee, initHeadings } from './core/chrome.js';
import { waitForAssets, hideLoader } from './core/loader.js';
import { reducedMotion } from './config.js';

import { initHero } from './sections/hero.js';
import { initProjects } from './sections/projects.js';
import { initLibrary } from './sections/library/library.js';
import { initEditor3d } from './sections/editor3d/index.js';
import { initExperience } from './sections/experience/index.js';
import { initPath } from './sections/path.js';
import { initAbout } from './sections/about.js';
import { initContact } from './sections/contact.js';

startAtTop();
initGrain();

initProjects(); // renders the project panels first so the loader counts their images
const revealHero = initHero();
initLibrary();
initEditor3d();
initExperience();
initPath();
initAbout();
initContact();

initNav();
initMarquee();
initHeadings();
initAnchors();
watchLayout();
initCursor();

waitForAssets().then(() => {
  const tl = hideLoader(releaseScroll);
  revealHero(tl);
  if (reducedMotion) tl.progress(1);
});

addEventListener('load', () => ScrollTrigger.refresh());
