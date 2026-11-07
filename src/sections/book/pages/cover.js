const LOGO = `<svg class="cover-logo" viewBox="0 0 66 44" aria-hidden="true"><path d="M3 42 L18 4 L33 42" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="miter"/><path d="M62 11 A15 15 0 1 0 62 33" fill="none" stroke="currentColor" stroke-width="4"/></svg>`;

/** Matte black cover with a debossed logo, like a printed brochure. */
export function cover() {
  return `<div class="cover">
    <div class="cover-mark">${LOGO}<span>Adriana Chipana</span></div>
    <div class="cover-foot">
      <span class="cover-title">Proyectos independientes</span>
      <span class="cover-hint">Haz clic para abrir</span>
    </div>
  </div>`;
}
