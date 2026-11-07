/**
 * Page templates for the projects book. Each function returns the HTML of one page face.
 * Layout of the book (P projects):
 *   leaf 0      front: cover            back: intro (inside cover)
 *   leaf 1      front: table of contents back: images of project 0
 *   leaf p + 2  front: text of project p back: images of project p + 1 (or the last page)
 * So spread s ≥ 2 shows project s - 2: screenshots and description on the left, the details on the right.
 */

const LOGO = `<svg class="cover-logo" viewBox="0 0 66 44" aria-hidden="true"><path d="M3 42 L18 4 L33 42" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="miter"/><path d="M62 11 A15 15 0 1 0 62 33" fill="none" stroke="currentColor" stroke-width="5"/></svg>`;

/** Page numbers: project p uses pages 2p + 1 (images) and 2p + 2 (text). */
export const folio = (p) => 2 * p + 1;

const pageNo = (n, side) => `<span class="folio folio-${side}">${n}</span>`;

export function cover() {
  return `<div class="cover">
    ${LOGO}
    <div class="cover-title wide">Proyectos<br>independientes</div>
    <div class="cover-author">Adriana Chipana</div>
    <div class="cover-hint">Haz clic para abrir</div>
  </div>`;
}

export function intro() {
  return `<div class="pg-in endpaper">
    <p class="pg-kicker">Antes de empezar</p>
    <p class="pg-lead">Cada proyecto de este libro lo ideé, lo diseñé, lo programé y lo publiqué yo, en mi tiempo libre.</p>
    <p>En cada doble página verás, a la izquierda, capturas reales y de qué se trata; a la derecha, lo que hice, con qué lo construí y dónde está publicado.</p>
    <p class="pg-how only-desktop">Haz clic en la página derecha para avanzar y en la izquierda para volver. También puedes usar las flechas del teclado.</p>
    <p class="pg-how only-touch">Toca la página o desliza hacia la izquierda para avanzar.</p>
  </div>`;
}

export function contents(projects) {
  const rows = projects
    .map(
      (p, i) => `<li><button class="toc-row" data-goto="${i}">
        <span class="toc-name">${p.name}</span><span class="toc-type">${p.type}</span>
        <span class="toc-dots" aria-hidden="true"></span><span class="toc-page">${folio(i)}</span>
      </button></li>`,
    )
    .join('');
  return `<div class="pg-in">
    <h3 class="pg-h wide">Índice</h3>
    <ol class="toc">${rows}</ol>
  </div>`;
}

export function projectImages(p, i) {
  return `<div class="pg-in pg-scroll" data-lenis-prevent>
    <p class="pg-kicker">${p.type}</p>
    <h3 class="pg-title wide">${p.name}</h3>
    <p class="pg-sub">${p.sub}</p>
    ${p.gallery ? gallery(p) : typographicCover(p.tm)}
    <p class="pg-body">${p.body}</p>
    ${pageNo(folio(i), 'l')}
  </div>`;
}

export function projectText(p, i) {
  const links = [];
  if (p.live) links.push(`<a class="pg-btn go" href="${p.live}" target="_blank" rel="noopener">Ver sitio en vivo</a>`);
  if (p.repo)
    links.push(
      `<a class="pg-btn ghost" href="${p.repo}" target="_blank" rel="noopener">${p.repo2 ? 'Código backend' : 'Ver el código'}</a>`,
    );
  if (p.repo2)
    links.push(`<a class="pg-btn ghost" href="${p.repo2}" target="_blank" rel="noopener">Código frontend</a>`);
  if (!p.live) links.push('<span class="pg-note">Demo en vivo próximamente</span>');

  const did = p.did?.length
    ? `<h4 class="pg-first">Lo que hice</h4><ul class="pg-did">${p.did.map((d) => `<li>${d}</li>`).join('')}</ul>`
    : '';
  const deploy = p.deploy ? `<p class="pg-deploy"><span>Publicado en</span> ${p.deploy}</p>` : '';

  return `<div class="pg-in pg-scroll pg-text" data-lenis-prevent>
    ${did}
    <h4>Tecnologías</h4>
    <div class="pg-tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div>
    <div class="pg-foot">${deploy}<div class="pg-links">${links.join('')}</div></div>
    ${pageNo(folio(i) + 1, 'r')}
  </div>`;
}

export function lastPage() {
  return `<div class="pg-in endpaper pg-end">
    <p class="pg-kicker">Fin del libro</p>
    <p class="pg-lead">Hay más en camino: juegos en Godot, Unity y Unreal, y nuevos modelos 3D.</p>
    <p>Todo el código está en <a href="https://github.com/adrijonas16" target="_blank" rel="noopener">github.com/adrijonas16</a>.</p>
    <button class="pg-btn ghost" data-goto="toc">Volver al índice</button>
  </div>`;
}

function gallery(p) {
  const shots = p.gallery
    .map(([src, alt], i) => `<img class="shot${i ? '' : ' on'}" src="${src}" alt="${alt}" loading="lazy">`)
    .join('');
  const thumbs =
    p.gallery.length < 2
      ? ''
      : `<div class="pg-thumbs">${p.gallery
          .map(
            ([src], i) =>
              `<button class="pg-th${i ? '' : ' on'}" aria-pressed="${!i}" aria-label="Imagen ${i + 1} de ${p.gallery.length}"><img src="${src}" alt="" loading="lazy"></button>`,
          )
          .join('')}</div>`;
  return `<div class="pg-photo">${shots}</div>${thumbs}`;
}

/** Projects without screenshots get a typographic plate that says what the product does. */
function typographicCover(kind) {
  if (kind !== 'postula') return '';
  const row = (cls, label, width) =>
    `<div class="tm-row ${cls}"><i></i><span>${label}</span><span class="bar"><b style="--w:${width}%"></b></span></div>`;
  return `<div class="pg-photo"><div class="tm postula"><div class="big wide">Sin inventar nada.</div>
    <div class="tm-rows">${row('ok', 'Coincide', 72)}${row('gap', 'Te falta', 38)}${row('fit', 'Adaptar', 55)}</div></div></div>`;
}
