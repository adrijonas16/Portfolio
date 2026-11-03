import { gsap } from './scroll.js';
import { reducedMotion } from '../config.js';
import { $, $$ } from './dom.js';

const STEPS = 9;
const MIN_TIME = 1400;
const MAX_TIME = 6000;

/**
 * "Compilando" loader: nine bars fill as images and fonts arrive.
 * Resolves when everything is ready (or after MAX_TIME, so a slow image never blocks the page).
 */
export function waitForAssets() {
  const steps = $('#steps');
  for (let i = 0; i < STEPS; i++) steps.insertAdjacentHTML('beforeend', `<i style="height:${14 + i * 6}px"></i>`);
  const bars = [...steps.children];
  const pct = $('#pct');

  const images = $$('img').filter((img) => img.loading !== 'lazy'); // lazy gallery images load later
  const total = images.length + 1;
  const shown = { v: 0 };
  let loaded = 0;
  const bump = () => {
    loaded++;
    gsap.to(shown, {
      v: loaded / total,
      duration: 0.4,
      overwrite: true,
      onUpdate: () => {
        pct.textContent = String(Math.round(shown.v * 100)).padStart(2, '0');
        const n = Math.round(shown.v * bars.length);
        bars.forEach((b, i) => b.classList.toggle('on', i < n));
      },
    });
  };

  const imagesReady = Promise.all(
    images.map((img) =>
      img.complete
        ? (bump(), null)
        : new Promise((resolve) => {
            img.onload = img.onerror = () => {
              bump();
              resolve();
            };
          }),
    ),
  );
  const fontsReady = document.fonts.ready.then(bump);
  const minTime = new Promise((r) => setTimeout(r, reducedMotion ? 0 : MIN_TIME));
  const maxTime = new Promise((r) => setTimeout(r, MAX_TIME));

  return Promise.race([Promise.all([imagesReady, fontsReady, minTime]), maxTime]).then(() => {
    $('#ldTxt').textContent = 'Listo';
    pct.textContent = '100';
    bars.forEach((b) => b.classList.add('on'));
  });
}

/** Wipes the loader away; returns the timeline so the hero can add its entrance at label "in". */
export function hideLoader(onGone) {
  const tl = gsap.timeline({ delay: reducedMotion ? 0 : 0.25 });
  tl.to('#loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' })
    .call(onGone, null, 0.7)
    .add('in', 0.55);
  return tl;
}
