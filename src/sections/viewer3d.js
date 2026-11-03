import { gsap } from '../core/scroll.js';
import { reducedMotion, HELMET } from '../config.js';
import { $, $$ } from '../core/dom.js';

/** Finish of each livery on top of the shared geometry and UVs (textures are pre-baked webps). */
const FINISHES = {
  monza: {},
  champion: { metalness: 0.95, roughness: 0.2, envMapIntensity: 2.2, flat: true },
  night: { metalness: 0.3, roughness: 0.55, glow: true, flat: true },
  chrome: { metalness: 1, roughness: 0.05, envMapIntensity: 2.6, flat: true },
};

/**
 * Interactive helmet. three.js is a separate chunk that only downloads when the section gets close,
 * and the render loop stops whenever the viewer is off screen.
 */
export function initViewer3d() {
  const viewer = $('#viewer');
  if (!viewer) return;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      boot(viewer).catch((err) => {
        console.warn(err);
        $('#vLoad').innerHTML = '<span>No se pudo cargar el modelo 3D en este navegador.</span>';
      });
    },
    { rootMargin: '400px' },
  );
  io.observe(viewer);
}

async function boot(viewer) {
  const [THREE, { GLTFLoader }, { OrbitControls }, { RoomEnvironment }, { MeshoptDecoder }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/controls/OrbitControls.js'),
    import('three/examples/jsm/environments/RoomEnvironment.js'),
    import('three/examples/jsm/libs/meshopt_decoder.module.js'),
  ]);

  const canvas = $('#v3d');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(2.6, 1.1, 5.2);
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xb79cff, 3);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim);

  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, {
    enableDamping: true,
    enablePan: false,
    enableZoom: false,
    autoRotate: !reducedMotion,
    autoRotateSpeed: 1.6,
    minPolarAngle: 0.6,
    maxPolarAngle: 2.2,
  });

  const resize = () => {
    const { width, height } = viewer.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize);

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(HELMET.model, (e) => {
    if (e.total) $('#vPct').textContent = `${Math.round((e.loaded / e.total) * 100)}%`;
  });

  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  model.position.sub(box.getCenter(new THREE.Vector3()));
  model.scale.setScalar(2.4 / Math.max(size.x, size.y, size.z));

  // the generated model's normal map and mips show as white cracks: drop them for a clean, glossy shell
  const meshes = [];
  model.traverse((o) => {
    if (!o.isMesh) return;
    meshes.push(o);
    const m = o.material;
    m.normalMap = null;
    m.envMapIntensity = 1.6;
    m.roughness = Math.min(m.roughness ?? 1, 0.35);
    for (const k of ['map', 'metalnessMap', 'roughnessMap', 'emissiveMap']) {
      if (!m[k]) continue;
      m[k].generateMipmaps = false;
      m[k].minFilter = THREE.LinearFilter;
      m[k].needsUpdate = true;
    }
    m.needsUpdate = true;
  });
  const holder = new THREE.Group();
  holder.add(model);
  scene.add(holder);

  const base = meshes[0].material;
  const textureLoader = new THREE.TextureLoader();
  const texture = (name) =>
    textureLoader.loadAsync(`${HELMET.textures}${name}.webp`).then((t) => {
      Object.assign(t, {
        flipY: base.map.flipY,
        wrapS: base.map.wrapS,
        wrapT: base.map.wrapT,
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
      });
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    });
  const cache = { season: Promise.resolve(base) };
  const variant = (name) =>
    (cache[name] ||= (async () => {
      const finish = FINISHES[name];
      const m = base.clone();
      m.map = await texture(name);
      if (finish.glow) {
        m.emissiveMap = await texture('night-glow');
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveIntensity = 1.6;
      }
      if (finish.flat) m.metalnessMap = m.roughnessMap = null;
      for (const p of ['metalness', 'roughness', 'envMapIntensity']) if (finish[p] !== undefined) m[p] = finish[p];
      m.needsUpdate = true;
      return m;
    })());

  const buttons = $$('#livs .liv');
  buttons.forEach((button) =>
    button.addEventListener('click', async () => {
      buttons.forEach((b) => {
        b.classList.toggle('on', b === button);
        b.setAttribute('aria-checked', b === button);
      });
      const material = await variant(button.dataset.l);
      meshes.forEach((o) => (o.material = material));
      if (!reducedMotion) {
        gsap.fromTo(
          holder.rotation,
          { y: holder.rotation.y },
          { y: holder.rotation.y + Math.PI * 2, duration: 1.2, ease: 'expo.out' },
        );
      }
    }),
  );

  gsap.to('#vLoad', { opacity: 0, duration: 0.5, onComplete: () => $('#vLoad')?.remove() });
  if (!reducedMotion) gsap.from(holder.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.4, ease: 'expo.out' });

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(viewer);
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    holder.position.y = Math.sin(performance.now() / 900) * 0.05;
    controls.update();
    renderer.render(scene, camera);
  });
}
