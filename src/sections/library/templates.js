/** HTML for the game library: sidebar entries and one page per game. */

const PLAY_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>';
const TROPHY_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v5a5 5 0 0 1-10 0V3zM4 4h3v3.5A2.5 2.5 0 0 1 4 5V4zm13 0h3v1a2.5 2.5 0 0 1-3 2.5V4zM10.5 13h3v4h-3zM7 18h10v3H7z" fill="currentColor"/></svg>';

export function sidebarGroup(title, games, all) {
  return `<p class="lib-group">${title} <span>${games.length}</span></p>
    <ul class="lib-list" role="presentation">${games.map((g) => sidebarItem(g, all.indexOf(g))).join('')}</ul>`;
}

function sidebarItem(g, i) {
  const thumb = g.shots
    ? `<img src="${g.shots[0][0]}" alt="" loading="lazy">`
    : `<span class="lib-engine-mark">${g.engine.slice(0, 2)}</span>`;
  return `<li role="presentation"><button class="lib-item${g.status === 'dev' ? ' is-dev' : ''}" role="tab" id="lib-tab-${g.id}"
      aria-controls="lib-page-${g.id}" aria-selected="${!i}" tabindex="${i ? -1 : 0}" data-i="${i}">
      <span class="lib-thumb">${thumb}</span>
      <span class="lib-name">${g.name}<small>${g.status === 'dev' ? `En desarrollo · ${g.engine}` : g.genre}</small></span>
    </button></li>`;
}

export function gamePage(g, i) {
  return `<article class="lib-page" role="tabpanel" id="lib-page-${g.id}" aria-labelledby="lib-tab-${g.id}"${i ? ' hidden' : ''}>
    ${g.status === 'dev' ? devPage(g) : playablePage(g)}
  </article>`;
}

function playablePage(g) {
  const shots = g.shots
    .map(([src, alt], k) => `<img class="lib-shot${k ? '' : ' on'}" src="${src}" alt="${alt}" loading="lazy">`)
    .join('');
  const thumbs = g.shots
    .map(
      ([src, alt], k) =>
        `<button class="lib-th${k ? '' : ' on'}" data-k="${k}" aria-pressed="${!k}" aria-label="Ver: ${alt}"><img src="${src}" alt="" loading="lazy"></button>`,
    )
    .join('');

  return `<div class="lib-hero">${shots}<div class="lib-hero-title"><h3 class="wide">${g.name}</h3><p>${g.tagline}</p></div></div>
    <div class="lib-bar">
      <a class="lib-play" href="${g.play}" target="_blank" rel="noopener">${PLAY_ICON}Jugar</a>
      <dl class="lib-meta">
        <div><dt>Plataforma</dt><dd>${g.platform}</dd></div>
        <div><dt>Hecho con</dt><dd>${g.engine}</dd></div>
        <div><dt>Logros</dt><dd>${g.achievements.length} de ${g.achievements.length}</dd></div>
      </dl>
    </div>
    <div class="lib-body">
      <div class="lib-main">
        <p class="lib-desc">${g.body}</p>
        <div class="lib-thumbs">${thumbs}</div>
        ${g.embed ? quickMatch() : ''}
      </div>
      <aside class="lib-side">
        <h4>Logros desbloqueados</h4>
        <ul class="lib-ach">${g.achievements
          .map(
            ([name, desc]) =>
              `<li><span class="lib-ach-icon">${TROPHY_ICON}</span><b>${name}</b><small>${desc}</small></li>`,
          )
          .join('')}</ul>
        <h4>Tecnologías</h4>
        <p class="lib-stack">${g.stack.map((s) => `<span>${s}</span>`).join('')}</p>
      </aside>
    </div>`;
}

function devPage(g) {
  return `<div class="lib-hero lib-hero-dev">
      <div class="lib-dev-mark wide">${g.engine}</div>
      <div class="lib-hero-title"><h3 class="wide">${g.name}</h3><p>${g.tagline}</p></div>
    </div>
    <div class="lib-bar">
      <span class="lib-play is-disabled">En desarrollo</span>
      <dl class="lib-meta"><div><dt>Motor</dt><dd>${g.engine}</dd></div><div><dt>Estado</dt><dd>En progreso</dd></div></dl>
    </div>
    <div class="lib-body"><div class="lib-main"><p class="lib-desc">${g.body}</p></div></div>`;
}

/** The playable mini version; ids are used by quick-match.js. */
function quickMatch() {
  return `<div class="lib-qm">
    <div class="lib-qm-head">
      <h4>Partida rápida aquí mismo</h4>
      <div class="status" aria-live="polite"><span id="turn">Tu turno: fichas lilas</span><span id="chaos">Próximo caos en 4 jugadas</span></div>
    </div>
    <div class="board-wrap"><div class="board" id="board" role="group" aria-label="Tablero de 7 columnas"></div></div>
    <div class="raya-foot">
      <div class="legend"><span><i class="dot-player"></i>Tú</span><span><i class="dot-machine"></i>Máquina</span></div>
      <button class="btn sm" id="reset">Nueva partida</button>
    </div>
  </div>`;
}
