import { gsap } from '../core/scroll.js';
import { reducedMotion, DESKTOP_QUERY } from '../config.js';
import { $, $$ } from '../core/dom.js';
import { PROJECTS } from '../data/projects.js';

const AUTOPLAY_MS = 3800;

/**
 * Independent projects: each panel is rendered from data/projects.js, has its own image gallery,
 * and on desktop the row is pinned and scrolls sideways.
 */
export function initProjects() {
  const track = $('#track');
  track.innerHTML = PROJECTS.map(panel).join('');
  $$('.pn', track).forEach(initGallery);
  initHorizontalScroll(track);
}

function panel(p) {
  const links = [];
  if (p.live) links.push(`<a class="go" href="${p.live}">Ver sitio en vivo</a>`);
  if (p.repo) links.push(`<a href="${p.repo}">${p.repo2 ? 'Código del backend' : 'Ver el código'}</a>`);
  if (p.repo2) links.push(`<a href="${p.repo2}">Código del frontend</a>`);
  const deploy = p.deploy ? `<div class="deploy"><span>Desplegado en</span> ${p.deploy}</div>` : '';
  const tags = p.tags.map((t) => `<span>${t}</span>`).join('');

  return `<article class="pn">
    <div class="pn-media">${p.gallery ? gallery(p) : typographicCover(p.tm)}</div>
    <div class="pn-body">
      <h3 class="wide">${p.name}<small>${p.sub}</small></h3>
      <div><p>${p.body}</p><div class="links">${links.join('')}</div>${deploy}<div class="chips">${tags}</div></div>
    </div>
  </article>`;
}

function gallery(p) {
  const slides = p.gallery
    .map(([src, alt], i) => `<div class="slide${i ? '' : ' on'}"><img src="${src}" alt="${alt}" loading="lazy"></div>`)
    .join('');
  if (p.gallery.length < 2) return slides;
  const thumbs = p.gallery
    .map(
      ([src], i) =>
        `<button class="th${i ? '' : ' on'}" role="tab" aria-selected="${!i}" aria-label="Imagen ${i + 1} de ${
          p.gallery.length
        }" style="background-image:url(${src})"></button>`,
    )
    .join('');
  return `${slides}<div class="thumbs" role="tablist" aria-label="Imágenes de ${p.name}">${thumbs}</div><div class="count">1 / ${p.gallery.length}</div>`;
}

/** Projects without screenshots get a typographic cover that says what the product does. */
function typographicCover(kind) {
  const covers = {
    postula: `<div class="tm postula"><div class="big wide">Sin inventar nada.</div>
      <div class="tm-rows">
        <div class="tm-row"><i style="background:#7fae5e"></i><span style="width:9ch">Coincide</span><span class="bar"><b style="width:72%"></b></span></div>
        <div class="tm-row"><i style="background:#b79cff"></i><span style="width:9ch">Te falta</span><span class="bar"><b style="width:38%"></b></span></div>
        <div class="tm-row"><i style="background:#e0405a"></i><span style="width:9ch">Adaptar</span><span class="bar"><b style="width:55%"></b></span></div>
      </div></div>`,
    ready: `<div class="tm ready"><div class="px" style="font-size:18px">Lista de útiles → carrito</div>
      <div class="big wide">Económico<br>Estándar<br>Premium</div></div>`,
    huella: `<div class="tm huella"><div class="px" style="font-size:18px">Mapa · Eventos · Rutas · Comunidad</div>
      <div class="big wide">Cada paseo deja huella.</div></div>`,
  };
  return covers[kind] ?? '';
}

/** Thumbnails + autoplay that only runs while the panel is on screen. */
function initGallery(pn) {
  const slides = $$('.slide', pn);
  const thumbs = $$('.th', pn);
  const count = $('.count', pn);
  if (slides.length < 2) return;
  let current = 0;
  let timer = null;

  const show = (i) => {
    if (i === current) return;
    current = i;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    thumbs.forEach((t, k) => {
      t.classList.toggle('on', k === i);
      t.setAttribute('aria-selected', k === i);
    });
    count.textContent = `${i + 1} / ${slides.length}`;
    if (!reducedMotion) {
      gsap.fromTo(
        slides[i],
        { clipPath: 'inset(0 0 0 100%)' },
        {
          clipPath: 'inset(0 0 0 0%)',
          duration: 0.9,
          ease: 'expo.inOut',
          onComplete: () => gsap.set(slides[i], { clearProps: 'clipPath' }),
        },
      );
    }
  };
  const restart = () => {
    clearInterval(timer);
    if (!reducedMotion) timer = setInterval(() => show((current + 1) % slides.length), AUTOPLAY_MS);
  };
  thumbs.forEach((t, k) =>
    t.addEventListener('click', () => {
      show(k);
      restart();
    }),
  );
  new IntersectionObserver(([e]) => (e.isIntersecting ? restart() : clearInterval(timer)), {
    threshold: 0.5,
  }).observe(pn);
}

/** Desktop: pin the row and translate it while scrolling; screenshots drift for parallax. */
function initHorizontalScroll(track) {
  gsap.matchMedia().add(DESKTOP_QUERY, () => {
    const distance = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: '#hz',
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: '#hz',
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
    if (reducedMotion) return;
    $$('.pn-media .slide img', track).forEach((img) =>
      gsap.fromTo(
        img,
        { xPercent: -6 },
        {
          xPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.pn'),
            containerAnimation: tween,
            start: 'left right',
            end: 'right left',
            scrub: true,
          },
        },
      ),
    );
  });
}
