import { $ } from '../../core/dom.js';
import { createScene } from './scene.js';
import { loadHelmet } from './helmet.js';
import { bindTools, showStats } from './tools.js';

/**
 * The helmet inside a 3D-editor style window. three.js is a separate chunk that only
 * downloads when the section gets close, and rendering stops while it's off screen.
 *   scene.js   renderer, camera, lights, grid and the render loop
 *   helmet.js  the model and its materials (five finishes + solid and wireframe views)
 *   tools.js   toolbar, view modes, finishes, stats and the axis gizmo
 */
export function initEditor3d() {
  const editor = $('#viewer');
  if (!editor) return;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      boot(editor).catch((err) => {
        console.warn(err);
        $('#vLoad').innerHTML = '<span>No se pudo cargar el modelo 3D en este navegador.</span>';
      });
    },
    { rootMargin: '400px' },
  );
  io.observe(editor);
}

async function boot(editor) {
  const view = await createScene($('.ed-view', editor), $('#v3d'));
  const helmet = await loadHelmet(view, (pct) => ($('#vPct').textContent = `${pct}%`));
  showStats(helmet.stats);
  bindTools(editor, view, helmet);
  view.reveal(helmet.holder);
}
