import { gsap } from '../../core/scroll.js';
import { reducedMotion } from '../../config.js';
import { $ } from '../../core/dom.js';

/** Renderer, camera, lights, floor grid and the render loop of the 3D viewport. */
export async function createScene(container, canvas) {
  const [THREE, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/controls/OrbitControls.js'),
    import('three/examples/jsm/environments/RoomEnvironment.js'),
  ]);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const HOME = new THREE.Vector3(2.6, 1.3, 5.2);
  camera.position.copy(HOME);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xb79cff, 3);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim);

  // floor grid with red and green axis lines, like an editor viewport
  const floor = new THREE.Group();
  const grid = new THREE.GridHelper(16, 32, 0x3c3c44, 0x2a2a30);
  const axis = (color, a, b) =>
    new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineBasicMaterial({ color }));
  floor.add(
    grid,
    axis(0xe0405a, new THREE.Vector3(-8, 0.001, 0), new THREE.Vector3(8, 0.001, 0)),
    axis(0x7fae5e, new THREE.Vector3(0, 0.001, -8), new THREE.Vector3(0, 0.001, 8)),
  );
  floor.position.y = -1.3;
  scene.add(floor);

  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, {
    enableDamping: true,
    enablePan: false,
    enableZoom: false,
    autoRotate: !reducedMotion,
    autoRotateSpeed: 1.6,
    minPolarAngle: 0.5,
    maxPolarAngle: 1.75,
  });

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize);

  const onFrame = [];
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(container);
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    controls.update();
    onFrame.forEach((fn) => fn());
    renderer.render(scene, camera);
  });

  return {
    THREE,
    scene,
    camera,
    controls,
    floor,
    onFrame,
    /** Fly the camera back to its starting point. */
    frame() {
      gsap.to(camera.position, { ...HOME, duration: reducedMotion ? 0 : 1, ease: 'power3.inOut' });
    },
    /** Fade out the loading label and grow the model in. */
    reveal(object) {
      scene.add(object);
      gsap.to('#vLoad', { opacity: 0, duration: 0.5, onComplete: () => $('#vLoad')?.remove() });
      if (!reducedMotion) gsap.from(object.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.4, ease: 'expo.out' });
    },
  };
}
