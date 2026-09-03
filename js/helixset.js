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
    { id: 'ombre', label: 'Logo ombré', note: 'The mark\'s own blues', ground: 0xF4F5F7 },
  ];

  const H = 2.95, RAD = 0.46, TURNS = 2.7, PHASE = 0.42;
  const CELL_W = 1.80, CELL_H = 3.85;

  /* The mark's own ombré. Taking it off the shield fill alone gives a
     ramp that is all deep navy — on a thin strand that reads black, not
     as blue. The mark actually runs the full range: a light chrome-blue
     helix (#B1D8EB, sampled) sitting inside a shield that ends deep at
     the point (#061842, sampled). Between them it passes through the
     named palette, so the cut is the brand's blues top to bottom. */
  const MARK_RAMP = [
    [0.00, 0xC6E4F2], [0.16, 0xB1D8EB], [0.32, 0x9DBFD9],
    [0.52, 0x244399], [0.72, 0x173384], [0.88, 0x092266], [1.00, 0x061842],
  ].map(([t, hex]) => [t, new THREE.Color(hex).convertSRGBToLinear()]);

  function rampAt(t) {
    t = Math.max(0, Math.min(1, t));
    for (let i = 1; i < MARK_RAMP.length; i++) {
      const [t0, c0] = MARK_RAMP[i - 1], [t1, c1] = MARK_RAMP[i];
      if (t <= t1) return c0.clone().lerp(c1, (t - t0) / (t1 - t0));
    }
    return MARK_RAMP[MARK_RAMP.length - 1][1].clone();
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
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
    g.addColorStop(0.24, '#2f52b3'); g.addColorStop(0.40, '#173384');
    g.addColorStop(0.50, '#eaf2ff'); g.addColorStop(0.57, '#7f9cc8');
    g.addColorStop(0.66, '#12297a'); g.addColorStop(0.86, '#244399');
    g.addColorStop(1.00, '#3b5fbd');
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
  /* no lateral wave: the reference render is a rigid machined object, and
     the wobble is what read as disjointed */
  function wavify(m) { return m; }
  const MATS = {
    metal:  () => wavify(new THREE.MeshPhysicalMaterial({
              color: 0xffffff, metalness: 1, roughness: 0.06,
              iridescence: 0.35, iridescenceIOR: 1.5, iridescenceThicknessRange: [300, 600] })),
    white3: () => new THREE.MeshPhysicalMaterial({
              color: 0xffffff, metalness: 0, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    blue3:  () => new THREE.MeshStandardMaterial({ color: 0x173384, metalness: 0, roughness: 0.82 }),
    flatw:  () => new THREE.MeshBasicMaterial({ color: 0xffffff }),
    flatb:  () => new THREE.MeshBasicMaterial({ color: 0x173384 }),
    flatl:  () => new THREE.MeshBasicMaterial({ color: 0x9DBFD9 }),
    ombre:  () => new THREE.MeshPhysicalMaterial({
              vertexColors: true, metalness: 0.2, roughness: 0.3,
              clearcoat: 0.75, clearcoatRoughness: 0.14 }),
  };

  /* ---- one helix, built once per cut so materials stay separate ---- */
  function helix(mat, tubeR, rungR, ombre) {
    const g = new THREE.Group();
    const paint = (geo) => {
      if (!ombre) return geo;
      const pos = geo.attributes.position;
      const col = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        /* the ramp is written top of mark first, so invert */
        const c = rampAt(1 - (pos.getY(i) + H / 2) / H);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      return geo;
    };
    const curve = (phase) => {
      const pts = [];
      for (let i = 0; i <= 200; i++) {
        const t = i / 200, a = t * TURNS * Math.PI * 2 + phase;
        pts.push(new THREE.Vector3(Math.cos(a) * RAD, (t - 0.5) * H, Math.sin(a) * RAD));
      }
      return new THREE.CatmullRomCurve3(pts);
    };
    [0, PHASE * Math.PI * 2].forEach(p =>
      g.add(new THREE.Mesh(paint(new THREE.TubeGeometry(curve(p), 200, tubeR, 14, false)), mat)));
    for (let i = 1; i < 27; i++) {
      const t = i / 27, a = t * TURNS * Math.PI * 2, b = a + PHASE * Math.PI * 2;
      const p1 = new THREE.Vector3(Math.cos(a) * RAD, (t - 0.5) * H, Math.sin(a) * RAD);
      const p2 = new THREE.Vector3(Math.cos(b) * RAD, (t - 0.5) * H, Math.sin(b) * RAD);
      const len = p1.distanceTo(p2), dir = p2.clone().sub(p1).normalize();
      /* a base pair: two bars, one off each strand, meeting at a gap in the
         middle — the way the reference render draws them */
      const bar = Math.max(0.05, (len - 0.06) / 2);
      for (const [from, sgn] of [[p1, 1], [p2, -1]]) {
        const rg = new THREE.CylinderGeometry(rungR, rungR, bar, 10);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().multiplyScalar(sgn));
        const mid = from.clone().add(dir.clone().multiplyScalar(sgn * bar / 2));
        rg.applyMatrix4(new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1)));
        g.add(new THREE.Mesh(paint(rg), mat));
      }
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
    const h = helix(MATS[cut.id](), 0.062, 0.040, cut.id === 'ombre');
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

  /* Default to drawing. The observer only ever pauses — if it never
     fires, or is not supported, the module still runs rather than
     silently rendering nothing. Keep a reference so it is not collected. */
  let onScreen = true;
  const seen = new IntersectionObserver(
    es => { onScreen = es[0].isIntersecting; },
    { rootMargin: '150px' });
  seen.observe(host);

  (function frame() {
    requestAnimationFrame(frame);
    if (!onScreen) return;
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
