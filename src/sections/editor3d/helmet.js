import { HELMET } from '../../config.js';

/** Finish of each livery on top of the shared geometry and UVs (textures are pre-baked webps). */
const FINISHES = {
  monza: {},
  champion: { metalness: 0.95, roughness: 0.2, envMapIntensity: 2.2, flat: true },
  night: { metalness: 0.3, roughness: 0.55, glow: true, flat: true },
  chrome: { metalness: 1, roughness: 0.05, envMapIntensity: 2.6, flat: true },
};

/**
 * Loads the helmet and owns its materials: five finishes for the "Material" view,
 * plus a clay material for "Sólido" and a wireframe for "Alambre".
 */
export async function loadHelmet({ THREE }, onProgress) {
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/libs/meshopt_decoder.module.js'),
  ]);

  const gltf = await new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .loadAsync(HELMET.model, (e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100)));

  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  model.position.sub(box.getCenter(new THREE.Vector3()));
  model.scale.setScalar(2.4 / Math.max(size.x, size.y, size.z));

  // the generated model's normal map and mips show as white cracks: drop them for a clean, glossy shell
  const meshes = [];
  const stats = { vertices: 0, faces: 0, objects: 0 };
  model.traverse((o) => {
    if (!o.isMesh) return;
    meshes.push(o);
    const g = o.geometry;
    stats.objects++;
    stats.vertices += g.attributes.position.count;
    stats.faces += (g.index ? g.index.count : g.attributes.position.count) / 3;
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
  const finish = (name) =>
    (cache[name] ||= (async () => {
      const f = FINISHES[name];
      const m = base.clone();
      m.map = await texture(name);
      if (f.glow) {
        m.emissiveMap = await texture('night-glow');
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveIntensity = 1.6;
      }
      if (f.flat) m.metalnessMap = m.roughnessMap = null;
      for (const p of ['metalness', 'roughness', 'envMapIntensity']) if (f[p] !== undefined) m[p] = f[p];
      m.needsUpdate = true;
      return m;
    })());

  const views = {
    solid: new THREE.MeshStandardMaterial({ color: 0xb9b6b0, roughness: 0.65, metalness: 0 }),
    wire: new THREE.MeshBasicMaterial({ color: 0xb79cff, wireframe: true, transparent: true, opacity: 0.22 }),
  };

  let livery = 'season';
  let shading = 'material';
  const apply = async () => {
    const material = shading === 'material' ? await finish(livery) : views[shading];
    meshes.forEach((o) => (o.material = material));
  };

  return {
    holder,
    stats,
    /** 'material' | 'solid' | 'wire' */
    setShading(mode) {
      shading = mode;
      return apply();
    },
    setLivery(name) {
      livery = name;
      shading = 'material';
      return apply();
    },
  };
}
