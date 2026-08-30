/* ---------------------------------------------------------------
   THE ARRAY — SKO Compounds

   The catalogue in orbit. Every unit is the real product render,
   billboarded so the label always faces the reader. At the centre, a
   machined sphere carrying real thin-film iridescence, with a light
   blue fresnel bleeding off its edge.

   Drag to spin. It carries momentum and settles. Hover holds it and
   raises that unit; click opens that product.
----------------------------------------------------------------*/
import * as THREE from '../vendor/three.module.min.js';

const HOST = document.getElementById('arraySphere');
if (HOST) start(HOST);

function start(host) {
  /* one edit here when the storefront's URL pattern is confirmed */
  const HREF = slug => `/products/${slug}`;
  const UNITS = [
    ['arr-1.png','BPC-157','bpc-157'], ['arr-2.png','TB-500','tb-500'],
    ['arr-3.png','GHK-Cu','ghk-cu'],   ['arr-4.png','CJC-1295','cjc-1295'],
    ['arr-5.png','Ipamorelin','ipamorelin'],
  ];
  /* the full catalogue repeats the five renders we ship with the book;
     swap in one image per SKU and the ring fills out on its own */
  const NAMES = ['BPC-157','TB-500','GHK-Cu','CJC-1295','Ipamorelin','Sermorelin',
    'Tesamorelin','IGF-1 LR3','MOTS-c','NAD+','SS-31','Glutathione','Semax','Selank',
    'DSIP','PT-141','Kisspeptin','KPV','TA-1','ARA-290','AOD-9604','Cagrilintide',
    'Adamax','5-Amino-1MQ','MT-1','MT-2','Glow','Wolverine'];

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', cursor: 'grab' });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 0, 23.5);

  /* ---- the room the metal reflects ---- */
  (function env() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const x = c.getContext('2d');
    /* chrome needs contrast to reflect, not an even wash: strip lights
       over dark, the way a studio ceiling actually reads in a mirror */
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0.00, '#f6faff'); g.addColorStop(0.16, '#c9dcf4');
    g.addColorStop(0.24, '#20306e'); g.addColorStop(0.40, '#0b1236');
    g.addColorStop(0.50, '#eaf2ff'); g.addColorStop(0.57, '#7f9cc8');
    g.addColorStop(0.66, '#0a1030'); g.addColorStop(0.86, '#16224f');
    g.addColorStop(1.00, '#5c78ab');
    x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
    x.fillStyle = 'rgba(255,255,255,.92)';
    x.fillRect(0, 96, 1024, 10); x.fillRect(0, 300, 1024, 6);
    const s = x.createRadialGradient(300, 92, 8, 300, 92, 200);
    s.addColorStop(0, '#fff'); s.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = s; x.beginPath(); x.ellipse(300, 92, 200, 115, 0, 0, 7); x.fill();
    const f = x.createRadialGradient(800, 160, 8, 800, 160, 165);
    f.addColorStop(0, 'rgba(157,191,217,.6)'); f.addColorStop(1, 'rgba(157,191,217,0)');
    x.fillStyle = f; x.beginPath(); x.ellipse(800, 160, 165, 100, 0, 0, 7); x.fill();
    const t = new THREE.Texture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
    const p = new THREE.PMREMGenerator(renderer);
    scene.environment = p.fromEquirectangular(t).texture;
    p.dispose(); t.dispose();
  })();

  scene.add(new THREE.AmbientLight(0x33447f, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-5, 7, 6);
  scene.add(key);
  scene.add(new THREE.PointLight(0x9DBFD9, 44, 30, 2));

  /* ---- the core ---- */
  const CORE_R = 2.55;
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(CORE_R, 96, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 1.0, roughness: 0.035,
      iridescence: 1.0, iridescenceIOR: 1.6,
      iridescenceThicknessRange: [340, 760],
    }));
  scene.add(core);

  /* the glow: a fresnel rim on a slightly larger back-facing shell */
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(CORE_R * 1.16, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true, blending: THREE.AdditiveBlending,
      side: THREE.BackSide, depthWrite: false,
      uniforms: { c: { value: new THREE.Color(0x9fd0f2) } },
      vertexShader: `varying vec3 vN; varying vec3 vP;
        void main(){ vN = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position,1.0); vP = mv.xyz;
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 c; varying vec3 vN; varying vec3 vP;
        void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 3.6);
          gl_FragColor = vec4(c, f * 0.48); }`,
    }));
  scene.add(glow);

  /* ---- the units, on a Fibonacci sphere so spacing stays even ---- */
  const R = 7.9;
  const loader = new THREE.TextureLoader();
  const orbit = new THREE.Group(); scene.add(orbit);
  const units = [];
  const N = NAMES.length;
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = GA * i;
    const src = UNITS[i % UNITS.length];
    const tex = loader.load('img/' + src[0]);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.92, 2.09),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.position.set(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R);
    orbit.add(m);
    units.push({ m, name: NAMES[i], href: HREF(NAMES[i].toLowerCase().replace(/[^a-z0-9]+/g, '-')), hov: 0 });
  }

  /* ---- label ---- */
  const tag = document.createElement('div');
  Object.assign(tag.style, {
    position: 'absolute', pointerEvents: 'none', padding: '5px 10px',
    font: '500 12px/1 "DM Sans",system-ui,sans-serif', letterSpacing: '.02em',
    color: '#0B1E58', background: 'rgba(255,255,255,.92)', borderRadius: '3px',
    transform: 'translate(-50%,-160%)', opacity: '0', transition: 'opacity .18s',
    whiteSpace: 'nowrap', zIndex: '5',
  });
  host.style.position = 'relative';
  host.appendChild(tag);

  /* ---- spin, drag, hover, click ---- */
  let vx = 0.0016, vy = 0.0009, dragging = false, moved = 0, lx = 0, ly = 0;
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(-9, -9);
  let hot = null;
  const el = renderer.domElement;

  el.addEventListener('pointerdown', e => {
    dragging = true; moved = 0; lx = e.clientX; ly = e.clientY;
    el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing';
  });
  el.addEventListener('pointermove', e => {
    const b = el.getBoundingClientRect();
    ptr.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    if (dragging) {
      const dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx) + Math.abs(dy);
      vx = dx * 0.0022; vy = dy * 0.0022;
      orbit.rotation.y += vx; orbit.rotation.x += vy;
      lx = e.clientX; ly = e.clientY;
    }
  });
  const stop = () => { dragging = false; el.style.cursor = 'grab'; };
  el.addEventListener('pointerup', e => {
    if (moved < 5 && hot) location.href = hot.href;     /* a click, not a drag */
    stop();
  });
  el.addEventListener('pointercancel', stop);
  el.addEventListener('pointerleave', () => { stop(); ptr.set(-9, -9); });

  let W = 0, H = 0;
  function resize() {
    W = host.clientWidth; if (!W) return false;
    H = Math.round(Math.min(W * 0.70, 700));
    renderer.setSize(W, H, false); el.style.height = H + 'px';
    camera.aspect = W / H; camera.updateProjectionMatrix();
    return true;
  }

  const v3 = new THREE.Vector3();
  function frame() {
    requestAnimationFrame(frame);
    if (!W && !resize()) return;

    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(orbit.children, false)[0];
    hot = hit ? units.find(u => u.m === hit.object) : null;
    el.style.cursor = dragging ? 'grabbing' : (hot ? 'pointer' : 'grab');

    if (!dragging && !hot) {                       /* hovering holds it still */
      orbit.rotation.y += vx; orbit.rotation.x += vy;
      vx += (0.0016 - vx) * 0.02; vy += (0.0009 - vy) * 0.02;
    } else if (!dragging) { vx *= 0.90; vy *= 0.90; }
    orbit.rotation.x = Math.max(-0.55, Math.min(0.55, orbit.rotation.x));

    units.forEach(u => {
      u.m.quaternion.copy(camera.quaternion);      /* always face the reader */
      const want = u === hot ? 1 : 0;
      u.hov += (want - u.hov) * 0.18;
      u.m.getWorldPosition(v3);
      const depth = (v3.z + R) / (2 * R);          /* 0 at the back, 1 at the front */
      u.m.material.opacity = Math.min(1, (0.09 + 0.91 * Math.pow(depth, 2.1)) * (1 + u.hov * 0.7));
      u.m.scale.setScalar(1 + u.hov * 0.34);
      u.m.renderOrder = Math.round(depth * 100);
    });

    if (hot) {
      hot.m.getWorldPosition(v3); v3.project(camera);
      tag.textContent = hot.name;
      tag.style.left = ((v3.x * 0.5 + 0.5) * W) + 'px';
      tag.style.top = ((-v3.y * 0.5 + 0.5) * H) + 'px';
      tag.style.opacity = '1';
    } else tag.style.opacity = '0';

    glow.material.uniforms.c.value.setHSL(0.56, 0.62, 0.62);
    renderer.render(scene, camera);
  }
  addEventListener('resize', () => { W = 0; });
  frame();
}
