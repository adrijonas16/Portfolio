import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { reducedMotion } from '../config.js';
import { $, $$ } from './dom.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger and Lenis stay in sync. */
export const lenis = reducedMotion ? null : new Lenis({ duration: 1.15 });

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // released by the intro
}

/** The page always opens at the top, never where the visitor left it. */
export function startAtTop() {
  try {
    history.scrollRestoration = 'manual';
  } catch {
    /* not supported */
  }
  scrollTo(0, 0);
  addEventListener('pageshow', () => scrollTo(0, 0));
}

/** Called by the intro once the loader is gone. */
export function releaseScroll() {
  document.body.classList.remove('loading');
  scrollTo(0, 0);
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.start();
  }
  ScrollTrigger.refresh();
}

/**
 * Opening another game, job or page of the book changes the page height. Recalculate every
 * ScrollTrigger when that happens, or the ones further down (like "Hablemos") never fire.
 */
export function watchLayout(root = document.body) {
  let timer;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(root);
}

/** In-page anchors glide instead of jumping. */
export function initAnchors() {
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = a.getAttribute('href');
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else $(target)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }),
  );
}

export { gsap, ScrollTrigger, SplitText };
