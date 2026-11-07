import { folio, folioMark } from './folio.js';

/**
 * Left page of a project: a full-bleed screenshot with the title printed over it,
 * and the description underneath. Every screenshot is in the page; the mosaic on the
 * right page decides which one is showing.
 */
export function projectOpening(p, i) {
  const visual = p.gallery
    ? p.gallery
        .map(([src, alt], k) => `<img class="hero-shot${k ? '' : ' on'}" src="${src}" alt="${alt}" loading="lazy">`)
        .join('')
    : typographicPlate(p.tm);
  return `<div class="pg pg-open" data-lenis-prevent>
    <figure class="pg-hero" data-hero="${i}">${visual}</figure>
    <div class="pg-cap">
      <p class="pg-kicker">${p.type}</p>
      <h3 class="pg-title wide">${p.name}</h3>
      <p class="pg-sub">${p.sub}</p>
    </div>
    <p class="pg-body">${p.body}</p>
    ${folioMark(folio(i), 'l')}
  </div>`;
}

/** Right page: mosaic of screenshots, what I built, the stack, where it runs and the links. */
export function projectDetails(p, i) {
  return `<div class="pg pg-details" data-lenis-prevent>
    ${mosaic(p, i)}
    ${p.did?.length ? `<h4>Lo que hice</h4><ul class="pg-did">${p.did.map((d) => `<li>${d}</li>`).join('')}</ul>` : ''}
    <h4>Tecnologías</h4>
    <p class="pg-stack">${p.tags.map((t) => `<span>${t}</span>`).join(' <i>/</i> ')}</p>
    <div class="pg-foot">
      ${p.deploy ? `<p class="pg-deploy"><span>Publicado en</span> ${p.deploy}</p>` : ''}
      <div class="pg-links">${links(p)}</div>
    </div>
    ${folioMark(folio(i) + 1, 'r')}
  </div>`;
}

function mosaic(p, i) {
  if (!p.gallery || p.gallery.length < 2) return '';
  const tiles = p.gallery
    .map(
      ([src, alt], k) =>
        `<button class="tile${k ? '' : ' on'}" data-p="${i}" data-k="${k}" aria-pressed="${!k}" aria-label="Ver: ${alt}"><img src="${src}" alt="" loading="lazy"></button>`,
    )
    .join('');
  return `<div class="pg-mosaic n${Math.min(p.gallery.length, 7)}">${tiles}</div>`;
}

function links(p) {
  const out = [];
  if (p.live) out.push(`<a class="pg-btn go" href="${p.live}" target="_blank" rel="noopener">Ver sitio en vivo</a>`);
  if (!p.live) out.push('<span class="pg-note">Demo en vivo próximamente</span>');
  return out.join('');
}

/** Projects without screenshots get a typographic plate that says what the product does. */
function typographicPlate(kind) {
  if (kind !== 'postula') return '';
  const row = (cls, label, width) =>
    `<div class="tm-row ${cls}"><i></i><span>${label}</span><span class="bar"><b style="--w:${width}%"></b></span></div>`;
  return `<div class="tm"><div class="big wide">Sin inventar nada.</div>
    <div class="tm-rows">${row('ok', 'Coincide', 72)}${row('gap', 'Te falta', 38)}${row('fit', 'Adaptar', 55)}</div></div>`;
}
