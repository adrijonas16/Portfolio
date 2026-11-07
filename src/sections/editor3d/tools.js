import { gsap } from '../../core/scroll.js';
import { reducedMotion } from '../../config.js';
import { $, $$ } from '../../core/dom.js';

const fmt = new Intl.NumberFormat('es-PE');

/** Real numbers from the loaded geometry, shown in the status bar. */
export function showStats({ vertices, faces, objects }) {
  $('#edStats').textContent =
    `Vértices ${fmt.format(vertices)} · Caras ${fmt.format(Math.round(faces))} · Objetos ${objects}`;
}

/** Toolbar, view modes, finishes and the axis gizmo. */
export function bindTools(editor, view, helmet) {
  const { controls, floor } = view;

  // left toolbar
  $$('.ed-tool', editor).forEach((tool) =>
    tool.addEventListener('click', () => {
      const name = tool.dataset.tool;
      if (name === 'frame') return view.frame();
      const on = tool.getAttribute('aria-pressed') !== 'true';
      tool.setAttribute('aria-pressed', on);
      tool.classList.toggle('on', on);
      if (name === 'spin') controls.autoRotate = on && !reducedMotion;
      if (name === 'grid') floor.visible = on;
    }),
  );

  // Material / Sólido / Alambre
  const shadeButtons = $$('.ed-shading button', editor);
  const markShading = (mode) =>
    shadeButtons.forEach((b) => {
      b.classList.toggle('on', b.dataset.shade === mode);
      b.setAttribute('aria-checked', b.dataset.shade === mode);
    });
  shadeButtons.forEach((b) =>
    b.addEventListener('click', () => {
      markShading(b.dataset.shade);
      helmet.setShading(b.dataset.shade);
    }),
  );

  // finishes in the Material panel (they switch the view back to Material)
  const liveries = $$('#livs .liv', editor);
  liveries.forEach((button) =>
    button.addEventListener('click', async () => {
      liveries.forEach((b) => {
        b.classList.toggle('on', b === button);
        b.setAttribute('aria-checked', b === button);
      });
      markShading('material');
      await helmet.setLivery(button.dataset.l);
      if (!reducedMotion) {
        const r = helmet.holder.rotation;
        gsap.fromTo(r, { y: r.y }, { y: r.y + Math.PI * 2, duration: 1.2, ease: 'expo.out' });
      }
    }),
  );

  view.onFrame.push(gizmo(view), float(helmet.holder));
}

/** Axis gizmo in the corner that follows the camera, like in an editor viewport. */
function gizmo({ THREE, camera }) {
  const svg = $('#gizmo');
  const axes = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
  const lines = Object.fromEntries(Object.keys(axes).map((k) => [k, svg.querySelector(`line[data-axis="${k}"]`)]));
  const dots = Object.fromEntries(Object.keys(axes).map((k) => [k, svg.querySelector(`g[data-axis="${k}"]`)]));
  const inverse = new THREE.Quaternion();
  const v = new THREE.Vector3();
  const R = 26;
  return () => {
    inverse.copy(camera.quaternion).invert();
    const depth = [];
    for (const [k, axis] of Object.entries(axes)) {
      v.copy(axis).applyQuaternion(inverse);
      const x = v.x * R;
      const y = -v.y * R;
      lines[k].setAttribute('x2', x.toFixed(1));
      lines[k].setAttribute('y2', y.toFixed(1));
      dots[k].setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      depth.push([v.z, k]);
    }
    depth.sort((a, b) => a[0] - b[0]).forEach(([, k]) => svg.appendChild(dots[k]));
  };
}

/** The model hovers slightly above the grid. */
function float(holder) {
  return () => (holder.position.y = reducedMotion ? 0 : Math.sin(performance.now() / 900) * 0.05);
}
