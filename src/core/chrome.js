import { gsap, ScrollTrigger, SplitText, lenis } from './scroll.js';
import { reducedMotion } from '../config.js';
import { $, $$ } from './dom.js';

/** Page chrome shared by every section: nav behaviour, tech marquee and heading reveals. */

/** Nav hides when scrolling down and gets a solid background past the hero's top. */
export function initNav() {
  const nav = $('#nav');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('hide', y > lastY && y > 300);
      nav.classList.toggle('solid', y > 80);
      lastY = y;
    },
  });
}

/** Tech marquee: loops forever and speeds up with the scroll velocity. */
export function initMarquee() {
  const track = $('#mq');
  track.innerHTML += track.innerHTML;
  if (reducedMotion) return;
  let x = 0;
  let speed = 1;
  gsap.ticker.add(() => {
    const half = track.scrollWidth / 2;
    const vel = lenis ? lenis.velocity : 0;
    speed += ((1 + Math.abs(vel) * 0.25) * Math.sign(vel || 1) - speed) * 0.08;
    x -= speed * 0.9;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    track.style.transform = `translate3d(${x}px,0,0)`;
  });
}

/** Section headings (.h-l) reveal character by character as they enter. */
export function initHeadings() {
  if (reducedMotion) return;
  $$('.h-l').forEach((heading) => {
    const split = SplitText.create(heading, { type: 'lines,chars', linesClass: 'split-line' });
    gsap.from(split.chars, {
      yPercent: 110,
      duration: 1.05,
      ease: 'expo.out',
      stagger: 0.016,
      scrollTrigger: { trigger: heading, start: 'top 86%' },
    });
  });
}
