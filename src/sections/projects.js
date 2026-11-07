import { gsap, lenis } from '../core/scroll.js';
import { reducedMotion } from '../config.js';
import { $, $$ } from '../core/dom.js';
import { PROJECTS } from '../data/projects.js';

const AUTOPLAY_MS = 5000;

/**
 * Independent projects as tabs: every project is visible in the tab row, and the selected one
 * opens as a full case (gallery + description + what I built + stack + links) without extra scrolling.
 */
export function initProjects() {
  const tabs = $('#pjTabs');
  const stage = $('#pjStage');
  tabs.innerHTML = PROJECTS.map(tab).join('') + '<span class="pj-ink" aria-hidden="true"></span>';
  stage.innerHTML = PROJECTS.map(caseStudy).join('');

  const buttons = $$('.pj-tab', tabs);
  const cases = $$('.pj-case', stage);
  const ink = $('.pj-ink', tabs);
  const galleries = cases.map(initGallery);
  let current = 0;

  const moveInk = (animate) => {
    const b = buttons[current];
    const props = { x: b.offsetLeft, width: b.offsetWidth };
    if (animate && !reducedMotion) gsap.to(ink, { ...props, duration: 0.6, ease: 'expo.out' });
    else gsap.set(ink, props);
  };

  const select = (i, { focus = false } = {}) => {
    if (i === current) return;
    const prev = cases[current];
    galleries[current].stop();
    buttons[current].setAttribute('aria-selected', 'false');
    buttons[current].tabIndex = -1;
    prev.classList.remove('on');

    current = i;
    const next = cases[i];
    buttons[i].setAttribute('aria-selected', 'true');
    buttons[i].tabIndex = 0;
    if (focus) buttons[i].focus();
    buttons[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    next.classList.add('on');
    moveInk(true);
    galleries[i].start();
    reveal(next);
  };

  buttons.forEach((b, i) => b.addEventListener('click', () => select(i)));
  tabs.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      select(e.key === 'Home' ? 0 : PROJECTS.length - 1, { focus: true });
    } else if (step) {
      e.preventDefault();
      select((current + step + PROJECTS.length) % PROJECTS.length, { focus: true });
    }
  });

  // "Siguiente" sits at the end of a long case on phones: bring the tabs back into view first.
  $$('[data-go]', stage).forEach((b) =>
    b.addEventListener('click', () => {
      if (tabs.getBoundingClientRect().top < 0) {
        if (lenis) lenis.scrollTo(tabs, { offset: -90 });
        else tabs.scrollIntoView();
      }
      select(Number(b.dataset.go));
    }),
  );

  moveInk(false);
  addEventListener('resize', () => moveInk(false));
  document.fonts?.ready.then(() => moveInk(false));

  // Start the first gallery only once the section is on screen.
  new IntersectionObserver(([e]) =>
    e.isIntersecting ? galleries[current].start() : galleries[current].stop(),
  ).observe(stage);
}

function tab(p, i) {
  return `<button class="pj-tab" role="tab" id="pj-tab-${i}" aria-controls="pj-case-${i}"
    aria-selected="${!i}" tabindex="${i ? -1 : 0}">
    <span class="pj-tab-name">${p.name}</span><span class="pj-tab-type">${p.type}</span>
  </button>`;
}

function caseStudy(p, i) {
  const links = [];
  if (p.live)
    links.push(`<a class="btn fill go" href="${p.live}" target="_blank" rel="noopener">Ver sitio en vivo</a>`);
  if (p.repo)
    links.push(
      `<a class="btn" href="${p.repo}" target="_blank" rel="noopener">${p.repo2 ? 'Código del backend' : 'Ver el código'}</a>`,
    );
  if (p.repo2) links.push(`<a class="btn" href="${p.repo2}" target="_blank" rel="noopener">Código del frontend</a>`);
  if (!p.live) links.push('<span class="pj-note">Demo en vivo próximamente</span>');

  const did = p.did?.length
    ? `<div class="pj-block"><h4>Lo que hice</h4><ul class="pj-did">${p.did.map((d) => `<li>${d}</li>`).join('')}</ul></div>`
    : '';
  const deploy = p.deploy ? `<p class="pj-deploy"><span>Publicado en</span> ${p.deploy}</p>` : '';
  const next = (i + 1) % PROJECTS.length;

  return `<article class="pj-case${i ? '' : ' on'}" role="tabpanel" id="pj-case-${i}" aria-labelledby="pj-tab-${i}">
    <div class="pj-media">${p.gallery ? gallery(p) : typographicCover(p.tm)}</div>
    <div class="pj-info">
      <header class="pj-head r">
        <h3 class="wide">${p.name}</h3>
        <p class="pj-sub">${p.sub}</p>
      </header>
      <div class="pj-cta r"><div class="pj-links">${links.join('')}</div>${deploy}</div>
      <p class="pj-body r">${p.body}</p>
      <div class="r">${did}</div>
      <div class="pj-block r"><h4>Tecnologías</h4><div class="chips">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div></div>
      <button class="pj-next r" data-go="${next}">Siguiente: ${PROJECTS[next].name}</button>
    </div>
  </article>`;
}

function gallery(p) {
  const slides = p.gallery
    .map(([src, alt], i) => `<div class="slide${i ? '' : ' on'}"><img src="${src}" alt="${alt}" loading="lazy"></div>`)
    .join('');
  if (p.gallery.length < 2) return `<div class="pj-frame">${slides}</div>`;
  const thumbs = p.gallery
    .map(
      ([src], i) =>
        `<button class="th${i ? '' : ' on'}" aria-pressed="${!i}" aria-label="Imagen ${i + 1} de ${p.gallery.length}"><img src="${src}" alt="" loading="lazy"></button>`,
    )
    .join('');
  return `<div class="pj-frame">${slides}<div class="count">1 / ${p.gallery.length}</div></div>
    <div class="thumbs" aria-label="Imágenes de ${p.name}">${thumbs}</div>`;
}

/** Projects without screenshots get a typographic cover that says what the product does. */
function typographicCover(kind) {
  if (kind !== 'postula') return '';
  const row = (cls, label, width) =>
    `<div class="tm-row ${cls}"><i></i><span>${label}</span><span class="bar"><b style="--w:${width}%"></b></span></div>`;
  return `<div class="pj-frame"><div class="tm postula"><div class="big wide">Sin inventar nada.</div>
    <div class="tm-rows">${row('ok', 'Coincide', 72)}${row('gap', 'Te falta', 38)}${row('fit', 'Adaptar', 55)}</div></div></div>`;
}

/** Fade the incoming case in: the image wipes in, the text follows line by line. */
function reveal(el) {
  if (reducedMotion) return;
  const frame = $('.pj-frame', el);
  gsap.fromTo(
    frame,
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' },
  );
  gsap.fromTo(
    $$('.r', el),
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, delay: 0.15, clearProps: 'all' },
  );
}

/** Thumbnails + slow autoplay that pauses on hover and only runs for the selected case. */
function initGallery(el) {
  const slides = $$('.slide', el);
  const thumbs = $$('.th', el);
  const count = $('.count', el);
  let index = 0;
  let timer = null;
  let running = false;
  if (slides.length < 2) return { start() {}, stop() {} };

  const show = (i) => {
    if (i === index) return;
    index = i;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    thumbs.forEach((t, k) => {
      t.classList.toggle('on', k === i);
      t.setAttribute('aria-pressed', k === i);
    });
    count.textContent = `${i + 1} / ${slides.length}`;
    if (!reducedMotion)
      gsap.fromTo(slides[i], { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'opacity' });
  };
  const tick = () => {
    clearInterval(timer);
    if (running && !reducedMotion) timer = setInterval(() => show((index + 1) % slides.length), AUTOPLAY_MS);
  };
  thumbs.forEach((t, k) =>
    t.addEventListener('click', () => {
      show(k);
      tick();
    }),
  );
  const media = $('.pj-media', el);
  media.addEventListener('mouseenter', () => clearInterval(timer));
  media.addEventListener('mouseleave', tick);

  return {
    start() {
      running = true;
      tick();
    },
    stop() {
      running = false;
      clearInterval(timer);
    },
  };
}
