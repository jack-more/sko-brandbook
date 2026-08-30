/* ---------------------------------------------------------------
   THE ARRAY — SKO Compounds, in WebGL.

   Every part here is a surface of revolution, which is what a crimp
   cap actually is: a lathe profile, not a sculpt. The foil is three's
   thin-film iridescence — the same physics as the real holographic
   band, not a gradient standing in for it.

   Colours are sampled off the label artwork:
     flip-top  #172E7A   crimp  aluminium   seal  thin film 100-780nm
----------------------------------------------------------------*/
import * as THREE from '../vendor/three.module.min.js';

const HOST = document.getElementById('array3d');
if (HOST) init(HOST);

function init(host) {
  const COLS = 12, ROWS = 3, GAP = 2.85;
  const FEAT = [
    { img: 'img/arr-1.png', name: 'BPC-157' },
    { img: 'img/arr-2.png', name: 'TB-500' },
    { img: 'img/arr-3.png', name: 'GHK-Cu' },
    { img: 'img/arr-4.png', name: 'CJC-1295' },
    { img: 'img/arr-5.png', name: 'Ipamorelin' },
  ];
  const FILL = 9000, HOLD = 3000, CLEAR = 3200;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.borderRadius = '4px';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, 2, 1, 400);

  /* ---- the room the metal reflects ---------------------------- */
  function environment() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0.00, '#dae7f8');
    g.addColorStop(0.42, '#8fabd4');
    g.addColorStop(0.52, '#24337e');
    g.addColorStop(1.00, '#070c26');
    x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
    /* one softbox, high and to the left — the same light the flat
       version used at 135deg, now an actual source to reflect */
    const s = x.createRadialGradient(300, 96, 10, 300, 96, 210);
    s.addColorStop(0, 'rgba(255,255,255,1)');
    s.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = s; x.beginPath(); x.ellipse(300, 96, 210, 120, 0, 0, 7); x.fill();
    /* a cooler fill opposite, so the shadow side is not dead */
    const f = x.createRadialGradient(820, 150, 10, 820, 150, 170);
    f.addColorStop(0, 'rgba(150,185,240,.55)');
    f.addColorStop(1, 'rgba(150,185,240,0)');
    x.fillStyle = f; x.beginPath(); x.ellipse(820, 150, 170, 100, 0, 0, 7); x.fill();
    const tex = new THREE.Texture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromEquirectangular(tex).texture;
    pmrem.dispose(); tex.dispose();
    return env;
  }
  scene.environment = environment();

  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-6, 12, 5);
  scene.add(key);
  scene.add(new THREE.AmbientLight(0x2a3a7a, 0.5));

  /* ---- knurl, as a normal map rather than 96 extra faces ------ */
  function knurlNormal() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 8;
    const x = c.getContext('2d');
    for (let i = 0; i < 512; i++) {
      const t = (i % 8) / 8;                 /* sawtooth across the tooth */
      const nx = Math.cos(t * Math.PI * 2) * 0.6;
      x.fillStyle = `rgb(${Math.round((nx * 0.5 + 0.5) * 255)},128,255)`;
      x.fillRect(i, 0, 1, 8);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 1);
    return t;
  }

  /* ---- the parts, each a revolved profile --------------------- */
  const P = (pts) => pts.map(p => new THREE.Vector2(p[0], p[1]));

  const collarGeo = new THREE.LatheGeometry(P([
    [0.78, 0.16], [0.79, 0.30], [0.83, 0.345], [0.90, 0.355],
    [0.965, 0.345], [1.00, 0.30], [1.00, 0.05], [0.95, 0.00],
  ]), 128);
  const collarMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8d8de, metalness: 1.0, roughness: 0.24,
    normalMap: knurlNormal(), normalScale: new THREE.Vector2(0.35, 0.35),
  });

  const topGeo = new THREE.LatheGeometry(P([
    [0.00, 0.400], [0.30, 0.396], [0.55, 0.386], [0.70, 0.372],
    [0.765, 0.352], [0.78, 0.318], [0.78, 0.20],
  ]), 96);
  const topMat = new THREE.MeshPhysicalMaterial({
    color: 0x172e7a, metalness: 0.30, roughness: 0.28,
    clearcoat: 0.85, clearcoatRoughness: 0.18,
  });

  const glassGeo = new THREE.CylinderGeometry(1.26, 1.30, 0.62, 96, 1, true);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xcfe0ff, metalness: 0, roughness: 0.06,
    transparent: true, opacity: 0.30, side: THREE.DoubleSide,
  });

  /* the label's top foil band. Real thin-film, not a ramp. */
  const sealGeo = new THREE.CylinderGeometry(1.305, 1.305, 0.30, 128, 1, true);
  function sealMaterial() {
    return new THREE.MeshPhysicalMaterial({
      color: 0x203a86, metalness: 0.85, roughness: 0.16,
      iridescence: 1.0, iridescenceIOR: 1.9,
      iridescenceThicknessRange: [100, 780],
      side: THREE.DoubleSide,
    });
  }

  /* ---- the case ---------------------------------------------- */
  const caps = [];
  const grid = new THREE.Group();
  scene.add(grid);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const g = new THREE.Group();
    g.position.set((c - (COLS - 1) / 2) * GAP, 0, (r - (ROWS - 1) / 2) * GAP);
    const collar = new THREE.Mesh(collarGeo, collarMat);
    const top = new THREE.Mesh(topGeo, topMat);
    const glass = new THREE.Mesh(glassGeo, glassMat); glass.position.y = -0.32;
    const seal = new THREE.Mesh(sealGeo, sealMaterial()); seal.position.y = -0.22;
    seal.material.iridescence = 0;
    seal.material.opacity = 1;
    g.add(glass, seal, collar, top);
    grid.add(g);
    caps.push({ g, seal, rank: 0, c, r, hover: 0, lift: 0, gone: false });
  }

  /* seal spreads from one position, adjacent only */
  (function propagationOrder() {
    const at = (c, r) => caps.find(k => k.c === c && k.r === r);
    const seen = new Set(); let rank = 0;
    const edge = [at(Math.floor(COLS / 2), Math.floor(ROWS / 2))];
    while (edge.length) {
      const i = Math.floor(Math.random() * edge.length);
      const k = edge.splice(i, 1)[0];
      if (!k || seen.has(k)) continue;
      seen.add(k); k.rank = rank++;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dc, dr]) => {
        const n = at(k.c + dc, k.r + dr);
        if (n && !seen.has(n)) edge.push(n);
      });
    }
  })();

  /* ---- the five that leave the case --------------------------- */
  const loader = new THREE.TextureLoader();
  const leaks = [];
  FEAT.forEach((f, i) => {
    const want = (i + 0.5) / FEAT.length * COLS - 0.5;
    let best = null, bd = 1e9;
    caps.forEach(k => {
      if (k.taken) return;
      const d = Math.abs(k.c - want) + (ROWS - 1 - k.r) * 2.2;
      if (d < bd) { bd = d; best = k; }
    });
    if (!best) return;
    best.taken = true;
    const tex = loader.load(f.img);
    tex.colorSpace = THREE.SRGBColorSpace;
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }),
    );
    plane.visible = false;
    scene.add(plane);
    leaks.push({ cap: best, plane, slot: i, name: f.name, fired: false });
  });

  /* ---- hover -------------------------------------------------- */
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-9, -9);
  let hovered = null;
  renderer.domElement.addEventListener('pointermove', (e) => {
    const b = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
  });
  renderer.domElement.addEventListener('pointerleave', () => pointer.set(-9, -9));

  /* ---- layout ------------------------------------------------- */
  let W = 0, H = 0, rowY = 0;
  function resize() {
    W = host.clientWidth; if (!W) return false;
    H = Math.round(W * 0.46);
    renderer.setSize(W, H, false);
    renderer.domElement.style.height = H + 'px';
    camera.aspect = W / H;
    const span = COLS * GAP;
    const dist = (span / 2) / Math.tan((camera.fov * Math.PI / 180) / 2) / camera.aspect;
    camera.position.set(0, dist * 0.965, dist * 0.26);
    camera.lookAt(0, -1.2, 1.4);
    camera.updateProjectionMatrix();
    rowY = ROWS * GAP * 0.5 + 5.6;
    return true;
  }

  const ease = (x) => (x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2);
  const fireAt = (s) => FILL * (0.56 + 0.075 * s);

  let t0 = null;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!W && !resize()) return;
    if (t0 === null) t0 = ts;
    const el = ts - t0, total = FILL + HOLD + CLEAR, e = el % total;

    let prog;
    if (e < FILL) prog = e / FILL;
    else if (e < FILL + HOLD) prog = 1;
    else prog = 1 - (e - FILL - HOLD) / CLEAR;
    const front = prog * (caps.length + 6);

    /* hover pick */
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(grid.children, true)[0];
    hovered = hit ? caps.find(k => k.g === hit.object.parent) : null;

    caps.forEach(k => {
      const lit = Math.max(0, Math.min(1, (front - k.rank) / 3));
      const want = (hovered === k && !k.gone) ? 1 : 0;
      k.hover += (want - k.hover) * 0.16;
      k.seal.material.iridescence = ease(lit) * (1 + k.hover * 0.9);
      k.seal.material.emissive.setRGB(0.05 * k.hover, 0.09 * k.hover, 0.22 * k.hover);
      if (!k.gone) {
        k.g.position.y = k.hover * 1.5;
        k.g.rotation.z = k.hover * 0.10;
        k.g.rotation.x = -k.hover * 0.07;
        const s = 1 + k.hover * 0.06;
        k.g.scale.setScalar(s);
      }
    });

    leaks.forEach(lk => {
      const fa = fireAt(lk.slot);
      if (el < fa) {
        lk.cap.gone = false; lk.cap.g.visible = true;
        lk.plane.visible = false; lk.plane.material.opacity = 0;
        return;
      }
      const p = Math.min(1, (el - fa) / 1400), k = ease(p);
      lk.cap.gone = true;
      const from = new THREE.Vector3((lk.cap.c - (COLS-1)/2) * GAP, 0, (lk.cap.r - (ROWS-1)/2) * GAP);
      const to = new THREE.Vector3((lk.slot - (FEAT.length-1)/2) * (COLS*GAP/FEAT.length), 0.4, rowY);
      const pos = from.clone().lerp(to, k);
      pos.y += Math.sin(k * Math.PI) * 3.2;                 /* it lifts out, then settles */
      lk.cap.g.position.copy(pos);
      lk.cap.g.rotation.x = -k * Math.PI * 0.5;             /* and turns to face you */
      lk.cap.g.visible = k < 0.62;
      lk.plane.visible = k > 0.42;
      lk.plane.material.opacity = Math.max(0, Math.min(1, (k - 0.42) / 0.30));
      lk.plane.scale.set(3.1, 7.0, 1);
      lk.plane.position.set(to.x, to.y + 1.2, to.z);
      lk.plane.quaternion.copy(camera.quaternion);
    });

    renderer.render(scene, camera);
  }

  addEventListener('resize', () => { W = 0; });
  requestAnimationFrame(frame);
}
