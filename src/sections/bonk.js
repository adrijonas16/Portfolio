import { gsap } from '../core/scroll.js';
import { reducedMotion } from '../config.js';
import { $, $$ } from '../core/dom.js';

const REALMS = ['Jötunheim', 'Tártaro', 'Machu Picchu'];

/**
 * Bonk de los Dioses: a pinned stage. The screenshot grows from a card to full screen
 * (transform only, so it stays on the compositor) and then cycles through three realms.
 */
export function initBonk() {
  if (reducedMotion) {
    $('#bonkIntro').style.display = 'none';
    return;
  }
  const [first, second, third] = $$('#bonkFrame img');
  const realmName = $('#realmName');

  gsap
    .timeline({
      scrollTrigger: {
        trigger: '#bonk',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: ({ progress }) => {
          const realm = REALMS[progress < 0.55 ? 0 : progress < 0.8 ? 1 : 2];
          if (realmName.textContent !== realm) realmName.textContent = realm;
        },
      },
    })
    .to('#bonkIntro', { opacity: 0, scale: 0.9, duration: 0.15 }, 0)
    .to('#bonkFrame', { scale: 1, borderRadius: 0, duration: 0.3, ease: 'power2.inOut' }, 0)
    .to(first, { scale: 1.08, duration: 0.6, ease: 'none' }, 0)
    .to(['#bonkCopy', '#realm'], { opacity: 1, duration: 0.1 }, 0.25)
    .from('#bonkCopy', { y: 40, duration: 0.12 }, 0.25)
    .to(second, { opacity: 1, duration: 0.08 }, 0.55)
    .fromTo(second, { scale: 1.12 }, { scale: 1, duration: 0.3, ease: 'none' }, 0.55)
    .to(third, { opacity: 1, duration: 0.08 }, 0.8)
    .fromTo(third, { scale: 1.12 }, { scale: 1.02, duration: 0.2, ease: 'none' }, 0.8);
}
