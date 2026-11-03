import { gsap, SplitText } from '../core/scroll.js';
import { reducedMotion } from '../config.js';

/** About: the lead lights up word by word while scrolling; the photo drifts. */
export function initAbout() {
  if (reducedMotion) return;
  const words = SplitText.create('#lead', { type: 'words', wordsClass: 'w' }).words;
  gsap.to(words, {
    opacity: 1,
    stagger: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: '#lead', start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
  gsap.from('.photo img', {
    scale: 1.25,
    ease: 'none',
    scrollTrigger: { trigger: '.photo', start: 'top bottom', end: 'bottom top', scrub: true },
  });
}
