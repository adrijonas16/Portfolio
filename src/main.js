/**
 * Boot order:
 *   1. page chrome that must exist before the loader finishes (grain, scroll, cursor)
 *   2. sections render their DOM and create their ScrollTriggers
 *   3. the loader waits for images and fonts, wipes away, and the hero plays its entrance
 */
import './styles/index.css';

import { startAtTop, initAnchors, releaseScroll, ScrollTrigger } from './core/scroll.js';
import { initGrain } from './core/grain.js';
import { initCursor } from './core/cursor.js';
import { initNav, initMarquee, initHeadings } from './core/chrome.js';
import { waitForAssets, hideLoader } from './core/loader.js';
import { reducedMotion } from './config.js';

import { initHero } from './sections/hero.js';
import { initProjects } from './sections/projects.js';
import { initBonk } from './sections/bonk.js';
import { initRaya } from './sections/raya.js';
import { initViewer3d } from './sections/viewer3d.js';
import { initExperience } from './sections/experience.js';
import { initAbout } from './sections/about.js';
import { initContact } from './sections/contact.js';

startAtTop();
initGrain();

initProjects(); // renders the project panels first so the loader counts their images
const revealHero = initHero();
initBonk();
initRaya();
initViewer3d();
initExperience();
initAbout();
initContact();

initNav();
initMarquee();
initHeadings();
initAnchors();
initCursor();

waitForAssets().then(() => {
  const tl = hideLoader(releaseScroll);
  revealHero(tl);
  if (reducedMotion) tl.progress(1);
});

addEventListener('load', () => ScrollTrigger.refresh());
