import { gsap, ScrollTrigger } from '../core/scroll.js';
import { reducedMotion } from '../config.js';
import { $, $$ } from '../core/dom.js';

/**
 * Formación: a level map. The rail fills as you scroll and each stop lights up when the fill
 * reaches it, ending on the goal (my own videogame).
 */
export function initPath() {
  const track = $('.path-track');
  if (!track) return;
  const stops = $$('.stop', track);
  const light = (progress) => {
    track.style.setProperty('--progress', progress);
    stops.forEach((stop, i) => stop.classList.toggle('lit', progress >= i / (stops.length - 1) - 0.02));
  };

  if (reducedMotion) return light(1);

  light(0);
  ScrollTrigger.create({
    trigger: track,
    start: 'top 75%',
    end: 'bottom 45%',
    scrub: 0.6,
    onUpdate: (self) => light(self.progress),
  });
  gsap.from(stops, {
    y: 30,
    opacity: 0,
    duration: 0.9,
    ease: 'expo.out',
    stagger: 0.12,
    scrollTrigger: { trigger: track, start: 'top 85%' },
  });
}
