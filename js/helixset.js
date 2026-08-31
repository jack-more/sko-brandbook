/* ---------------------------------------------------------------
   HELIX — THE TREATMENTS

   The same helix in six cuts, side by side, so the difference is the
   material and nothing else. Geometry is identical in all six: strands
   offset 0.42 of a turn, which is what gives B-DNA its wide major
   groove and narrow minor one.

   Three are rendered in three dimensions — liquid metal, white, matte
   blue. Three are flat: unlit colour, no shading, no highlight. The
   flat cuts are the ones that survive small sizes, flat print and
   embroidery, so they are the default wherever the render cannot be
   trusted to hold.

   Each sits on the ground it is actually for: white cuts on blue, blue
   cuts on paper, metal and light blue on carbon.
----------------------------------------------------------------*/
import * as THREE from '../vendor/three.module.min.js';

const HOST = document.getElementById('helixSet');
if (HOST) start(HOST);

function start(host) {
  const CUTS = [
    { id: 'metal', label: 'Liquid metal', note: '3D · chrome + thin film', ground: 0x07090F },
    { id: 'white3', label: 'White', note: '3D · soft', ground: 0x244399 },
    { id: 'blue3', label: 'Matte blue', note: '3D · unpolished', ground: 0xF4F5F7 },
    { id: 'flatw', label: 'Flat white', note: 'Flat · #FFFFFF', ground: 0x244399 },
    { id: 'flatb', label: 'Flat blue', note: 'Flat · #173384', ground: 0xF4F5F7 },
    { id: 'flatl', label: 'Flat light blue', note: 'Flat · #9DBFD9', ground: 0x07090F },
  ];

  const H = 2.95, RAD = 0.46, TURNS = 2.7, PHASE = 0.42;
  const CELL_W = 1.80, CELL_H = 3.85;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%' });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 3, 0.1, 100);

  /* the room the metal reflects — strip lights over dark, the way a
     studio ceiling actually reads in a mirror */
  (function env() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0.00, '#f6faff'); g.addColorStop(0.16, '#c9dcf4');
    g.addColorStop(0.24, '#20306e'); g.addColorStop(0.40, '#0b1236');
    g.addColorStop(0.50, '#eaf2ff'); g.addColorStop(0.57, '#7f9cc8');
    g.addColorStop(0.66, '#0a1030'); g.addColorStop(0.86, '#16224f');
    g.addColorStop(1.00, '#5c78ab');
    x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
    x.fillStyle = 'rgba(255,255,255,.92)';
    x.fillRect(0, 96, 1024, 10); x.fillRect(0, 300, 1024, 6);
    const t = new THREE.Texture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
    const p = new THREE.PMREMGenerator(renderer);
    scene.environment = p.fromEquirectangular(t).texture;
    p.dispose(); t.dispose();
  })();

  scene.add(new THREE.AmbientLight(0x4a5a86, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-4, 6, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9DBFD9, 0.5); fill.position.set(5, -2, 4);
  scene.add(fill);

  /* ---- materials ---- */
  const waveShaders = [];
  function wavify(m) {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uT = { value: 0 };
      sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float wy = transformed.y;
         transformed.x += sin(wy * 1.7 + uT * 1.2) * 0.040;
         transformed.z += cos(wy * 1.5 + uT * 0.9) * 0.040;`);
      waveShaders.push(sh);
    };
    return m;
  }
  const MATS = {
    metal:  () => wavify(new THREE.MeshPhysicalMaterial({
              color: 0xffffff, metalness: 1, roughness: 0.045,
              iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [340, 760] })),
    white3: () => new THREE.MeshPhysicalMaterial({
              color: 0xffffff, metalness: 0, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    blue3:  () => new THREE.MeshStandardMaterial({ color: 0x173384, metalness: 0, roughness: 0.82 }),
    flatw:  () => new THREE.MeshBasicMaterial({ color: 0xffffff }),
    flatb:  () => new THREE.MeshBasicMaterial({ color: 0x173384 }),
    flatl:  () => new THREE.MeshBasicMaterial({ color: 0x9DBFD9 }),
  };

  /* ---- one helix, built once per cut so materials stay separate ---- */
  function helix(mat, tubeR, rungR) {
    const g = new THREE.Group();
    const curve = (phase) => {
      const pts = [];
      for (let i = 0; i <= 200; i++) {
        const t = i / 200, a = t * TURNS * Math.PI * 2 + phase;
        pts.push(new THREE.Vector3(Math.cos(a) * RAD, (t - 0.5) * H, Math.sin(a) * RAD));
      }
      return new THREE.CatmullRomCurve3(pts);
    };
    [0, PHASE * Math.PI * 2].forEach(p =>
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve(p), 200, tubeR, 14, false), mat)));
    for (let i = 1; i < 22; i++) {
      const t = i / 22, a = t * TURNS * Math.PI * 2, b = a + PHASE * Math.PI * 2;
      const p1 = new THREE.Vector3(Math.cos(a) * RAD, (t - 0.5) * H, Math.sin(a) * RAD);
      const p2 = new THREE.Vector3(Math.cos(b) * RAD, (t - 0.5) * H, Math.sin(b) * RAD);
      const len = p1.distanceTo(p2);
      if (len < 0.12) continue;                       /* foreshorten to nothing at the crossings */
      const r = new THREE.Mesh(new THREE.CylinderGeometry(rungR, rungR, len, 10), mat);
      r.position.copy(p1).add(p2).multiplyScalar(0.5);
      r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      g.add(r);
    }
    return g;
  }

  const spins = [], plates = [];
  const PLATE_Z = -1.6;
  CUTS.forEach((cut, i) => {
    const x = (i - (CUTS.length - 1) / 2) * CELL_W;
    const cell = new THREE.Group(); cell.position.x = x; scene.add(cell);
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(CELL_W - 0.055, CELL_H),
      new THREE.MeshBasicMaterial({ color: cut.ground }));
    plate.position.z = PLATE_Z; plate.userData.cx = x; cell.add(plate); plates.push(plate);
    const h = helix(MATS[cut.id](), 0.055, 0.026);
    cell.add(h); spins.push(h);
  });

  let W = 0, Ht = 0;
  function resize() {
    W = host.clientWidth; if (!W) return false;
    Ht = Math.round(Math.min(W * 0.42, 500));
    renderer.setSize(W, Ht, false);
    renderer.domElement.style.height = Ht + 'px';
    camera.aspect = W / Ht;
    /* pull the camera to whatever distance makes the six plates fill the
       frame, so the row is edge to edge at any width */
    const half = Math.tan((camera.fov * Math.PI / 180) / 2);
    const need = Math.max(
      (CUTS.length * CELL_W) / (0.99 * 2 * half * camera.aspect),
      CELL_H / (0.99 * 2 * half));
    camera.position.set(0, 0, need);
    camera.updateProjectionMatrix();
    /* The plates sit behind the helixes, so perspective shrinks them AND
       pulls the row in toward centre. Compensate both, or the outer
       helixes hang off the edge of their own cells. */
    const k = (need - PLATE_Z) / need;
    plates.forEach(pl => {
      pl.scale.set(k, k, 1);
      pl.position.x = pl.userData.cx * (k - 1);
    });
    return true;
  }

  (function frame() {
    requestAnimationFrame(frame);
    if (!W && !resize()) return;
    const t = performance.now() * 0.001;
    spins.forEach((h, i) => {
      h.rotation.y = t * 0.38 + i * 0.5;
      h.rotation.z = Math.sin(t * 0.6 + i) * 0.045;
    });
    for (const sh of waveShaders) sh.uniforms.uT.value = t;
    renderer.render(scene, camera);
  })();
  addEventListener('resize', () => { W = 0; });
}
