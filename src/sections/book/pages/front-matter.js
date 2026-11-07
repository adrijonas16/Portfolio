import { folio } from './folio.js';

/** Inside cover: what this book is and how to read it. */
export function intro() {
  return `<div class="pg pg-intro">
    <p class="pg-kicker">Proyectos independientes</p>
    <p class="pg-lead">Cada proyecto de este libro lo ideé, lo diseñé, lo programé y lo publiqué yo, en mi tiempo libre.</p>
    <p>A la izquierda verás capturas reales y de qué se trata; a la derecha, más imágenes, lo que hice, con qué lo construí y dónde está publicado.</p>
    <p class="pg-how only-desktop">Haz clic en la página derecha para avanzar y en la izquierda para volver, o usa las flechas del teclado.</p>
    <p class="pg-how only-touch">Toca la página o desliza para avanzar.</p>
  </div>`;
}

export function contents(projects) {
  const rows = projects
    .map(
      (p, i) => `<li><button class="toc-row" data-goto="${i}">
        <span class="toc-page">${String(folio(i)).padStart(2, '0')}</span>
        <span class="toc-name">${p.name}</span>
        <span class="toc-type">${p.type}</span>
      </button></li>`,
    )
    .join('');
  return `<div class="pg pg-toc">
    <h3 class="pg-h wide">Índice</h3>
    <ol class="toc">${rows}</ol>
  </div>`;
}

export function lastPage() {
  return `<div class="pg pg-intro pg-end">
    <p class="pg-kicker">Fin del libro</p>
    <p class="pg-lead">Hay más en camino: juegos en Godot, Unity y Unreal, y nuevos modelos 3D.</p>
    <button class="pg-btn ghost" data-goto="toc">Volver al índice</button>
  </div>`;
}
