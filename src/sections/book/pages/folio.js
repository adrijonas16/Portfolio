/** Page numbers: project p is printed on pages 2p + 1 (opening) and 2p + 2 (details). */
export const folio = (p) => 2 * p + 1;

export const folioMark = (n, side) => `<span class="folio folio-${side}">${String(n).padStart(2, '0')}</span>`;
