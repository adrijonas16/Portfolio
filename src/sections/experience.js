import { gsap, ScrollTrigger } from '../core/scroll.js';
import { reducedMotion } from '../config.js';
import { $, $$ } from '../core/dom.js';

/** Experience: the year lights up while its job is in focus, plus the three small diagrams. */
export function initExperience() {
  $$('.job').forEach((job) =>
    ScrollTrigger.create({ trigger: job, start: 'top 65%', end: 'bottom 35%', toggleClass: 'on' }),
  );
  initIntegrationHub();
  if (reducedMotion) return;

  // IMB: the N-layer architecture stacks in
  gsap.from('.arch .layer', {
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: 'expo.out',
    stagger: 0.12,
    scrollTrigger: { trigger: '.arch', start: 'top 80%' },
  });
  // ISP Corp: the chatbot conversation plays message by message
  gsap.from('#chat .msg', {
    y: 16,
    opacity: 0,
    scale: 0.96,
    duration: 0.5,
    ease: 'back.out(1.6)',
    stagger: 0.55,
    scrollTrigger: { trigger: '#chat', start: 'top 75%' },
  });
}

/** BSG: lines from the platform to each integration, with pulses travelling both ways. */
function initIntegrationHub() {
  const hub = $('.hub');
  if (!hub) return;
  const wires = $('.wires', hub);
  const [cx, cy] = [200, 150]; // centre of the 400x300 viewBox
  $$('.node', hub).forEach((n) => {
    n.style.setProperty('--x', n.dataset.x);
    n.style.setProperty('--y', n.dataset.y);
  });
  const nodes = $$('.node:not(.core)', hub).map((n) => [Number(n.dataset.x) * 4, Number(n.dataset.y) * 3]);
  wires.innerHTML = nodes
    .map(([x, y], i) => {
      const [from, to] =
        i % 2
          ? [
              [cx, cy],
              [x, y],
            ]
          : [
              [x, y],
              [cx, cy],
            ];
      const pulse = reducedMotion
        ? ''
        : `<circle r="3" class="pulse"><animateMotion dur="${2.2 + i * 0.35}s" repeatCount="indefinite" path="M${from} L${to}"/></circle>`;
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="w"/>${pulse}`;
    })
    .join('');
  if (!reducedMotion) {
    gsap.from($$('.node', hub), {
      scale: 0.6,
      opacity: 0,
      duration: 0.7,
      ease: 'back.out(1.7)',
      stagger: 0.08,
      scrollTrigger: { trigger: hub, start: 'top 80%' },
    });
  }
}
