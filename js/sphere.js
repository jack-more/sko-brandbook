/* ---------------------------------------------------------------
   THE ARRAY — SKO Compounds

   The catalogue in orbit. Every unit is a real vial in three
   dimensions, not a picture of one: the profile is the silhouette
   measured off that SKU's catalogue render and revolved, so the
   body, shoulder, neck, crimp collar and flip-top are the shape the
   product actually is. The label is that SKU's own artwork, un-
   projected off the front-on render — the render is orthographic, so
   x = xc + R sin(theta) inverts to give a true cylindrical wrap.

   Units are held at one height, the way the rail shot holds them.
   Diameter is left alone, so a tall vial reads correctly as a thin
   one. At the centre, a machined core carrying real thin-film
   iridescence — the same physics as the foil on the label.

   Drag to spin. It carries momentum and settles. Hover holds it and
   raises that unit; click opens that product.
----------------------------------------------------------------*/
import * as THREE from '../vendor/three.module.min.js';

const HOST = document.getElementById('arraySphere');
if (HOST) start(HOST);

function start(host) {
  /* The storefront has no per-product route — every card is a button,
     there is not one product anchor on the site — so a click can only
     open the catalogue. Point HREF at a product page the day one exists. */
  const HREF = () => 'https://skocompounds.com/products';

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', cursor: 'grab' });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 0, 23.5);

  /* ---- the room the glass and metal reflect ---- */
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

  /* ---------------- the vial ----------------------------------
     Three revolved sections cut out of one measured profile, plus
     the label as a cylinder standing just proud of the glass.
     Colours are the ones sampled off the pack: flip-top #172E7A,
     collar aluminium, glass all but colourless.                  */

  const RADIAL = 40;
  const UNIT_H = 1.95;          /* every unit at one height, like the rail */

  /* pull the profile between two heights, resampled and closed */
  function section(prof, y0, y1, capBase, capTop) {
    const pts = [];
    if (capBase) pts.push(new THREE.Vector2(0.001, y0));
    for (const [y, r] of prof) {
      if (y < y0 - 1e-6 || y > y1 + 1e-6) continue;
      pts.push(new THREE.Vector2(Math.max(r, 0.004), y));
    }
    if (pts.length < 2) return null;
    if (capTop) pts.push(new THREE.Vector2(0.001, y1));
    return new THREE.LatheGeometry(pts, RADIAL);
  }

  /* radius of the profile at a given height */
  function radiusAt(prof, y) {
    let best = prof[0];
    for (const p of prof) if (Math.abs(p[0] - y) < Math.abs(best[0] - y)) best = p;
    return best[1];
  }

  const glassMat = () => new THREE.MeshPhysicalMaterial({
    color: 0xdfeaff, metalness: 0, roughness: 0.045,
    clearcoat: 1, clearcoatRoughness: 0.02,
    transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false,
  });
  const collarMat = () => new THREE.MeshPhysicalMaterial({
    color: 0xd6d8de, metalness: 1, roughness: 0.26, transparent: true,
  });
  const capMat = () => new THREE.MeshPhysicalMaterial({
    color: 0x172e7a, metalness: 0.3, roughness: 0.3,
    clearcoat: 0.85, clearcoatRoughness: 0.18, transparent: true,
  });

  function buildVial(g, tex) {
    const grp = new THREE.Group();
    const parts = [];
    const add = (geo, mat) => {
      if (!geo) return null;
      const m = new THREE.Mesh(geo, mat); grp.add(m); parts.push(m); return m;
    };
    const glass  = add(section(g.prof, 0, g.colBot, true, false), glassMat());
    const collar = add(section(g.prof, g.colBot, g.capBot, false, false), collarMat());
    const cap    = add(section(g.prof, g.capBot, g.h, false, true), capMat());

    /* the label: a cylinder at the glass radius, its own artwork wrapped
       on. u = 0.5 is the front of the label, which is why it is turned a
       quarter here — the un-projection put the wordmark at 0.5. */
    const lh = g.labTop - g.labBot;
    const lr = radiusAt(g.prof, (g.labTop + g.labBot) / 2) + 0.006;
    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(lr, lr, lh, RADIAL, 1, true),
      new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.44, metalness: 0.05,
        side: THREE.DoubleSide, transparent: true,
      }));
    label.position.y = (g.labTop + g.labBot) / 2;
    label.rotation.y = Math.PI;         /* u=0.5 to camera-facing */
    grp.add(label); parts.push(label);

    /* one height for every unit; diameter left alone */
    const s = UNIT_H / g.h;
    grp.scale.setScalar(s);
    /* hang it on its own centre so it orbits about the middle of the vial */
    grp.position.y = -g.h * s / 2;
    const inner = new THREE.Group();
    inner.add(grp);
    /* glass draws last so it reads over the label it encloses */
    if (glass) glass.renderOrder = 1;
    return { grp: inner, spin: grp, parts,
             mats: [glass, collar, cap, label].filter(Boolean).map(m => m.material) };
  }

  /* ---- the units, on a Fibonacci sphere so spacing stays even ---- */
  const R = 7.9;
  const loader = new THREE.TextureLoader();
  const orbit = new THREE.Group(); scene.add(orbit);
  const units = [];
  let CAT = [], GEO = {};

  function build() {
    const N = CAT.length;
    const GA = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = GA * i;
      const d = CAT[i];
      const id = (d.img.match(/(\d+)\.webp$/) || [])[1];   /* img/cat/NN.webp */
      const g = GEO[id];
      if (!g) continue;
      const tex = loader.load('img/cat/label/' + id + '.png');
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const v = buildVial(g, tex);
      v.grp.position.set(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R);
      orbit.add(v.grp);
      units.push({ ...v, ...d, href: HREF(), hov: 0 });
    }
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
  el.addEventListener('pointerup', () => {
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
    const hit = ray.intersectObjects(orbit.children, true)[0];
    hot = hit ? units.find(u => u.parts.includes(hit.object)) : null;
    el.style.cursor = dragging ? 'grabbing' : (hot ? 'pointer' : 'grab');

    if (!dragging && !hot) {                       /* hovering holds it still */
      orbit.rotation.y += vx; orbit.rotation.x += vy;
      vx += (0.0016 - vx) * 0.02; vy += (0.0009 - vy) * 0.02;
    } else if (!dragging) { vx *= 0.90; vy *= 0.90; }
    orbit.rotation.x = Math.max(-0.55, Math.min(0.55, orbit.rotation.x));

    units.forEach(u => {
      /* the vial stands up and turns on its own axis to present the
         label — it is a bottle in the round, not a card facing front */
      u.grp.getWorldPosition(v3);
      u.spin.rotation.y = Math.atan2(camera.position.x - v3.x, camera.position.z - v3.z)
                          - orbit.rotation.y;

      const want = u === hot ? 1 : 0;
      u.hov += (want - u.hov) * 0.18;
      const depth = (v3.z + R) / (2 * R);          /* 0 at the back, 1 at the front */
      const a = Math.min(1, (0.10 + 0.90 * Math.pow(depth, 2.1)) * (1 + u.hov * 0.7));
      u.mats.forEach((m, i) => { m.opacity = i === 0 ? a * 0.26 : a; });
      u.grp.scale.setScalar(1 + u.hov * 0.34);
      const ro = Math.round(depth * 100) * 4;
      u.parts.forEach(p => { p.renderOrder = ro + (p === u.parts[0] ? 1 : 0); });
    });

    if (hot) {
      hot.grp.getWorldPosition(v3); v3.project(camera);
      tag.innerHTML = '<b>' + hot.name + '</b>'
        + '<span style="opacity:.55;margin-left:7px">' + hot.size + '</span>'
        + '<span style="margin-left:9px">' + hot.price + '</span>'
        + (hot.status ? '<span style="margin-left:9px;color:#9a3b3b">' + hot.status + '</span>' : '');
      tag.style.left = ((v3.x * 0.5 + 0.5) * W) + 'px';
      tag.style.top = ((-v3.y * 0.5 + 0.5) * H) + 'px';
      tag.style.opacity = '1';
    } else tag.style.opacity = '0';

    glow.material.uniforms.c.value.setHSL(0.56, 0.62, 0.62);
    renderer.render(scene, camera);
  }
  addEventListener('resize', () => { W = 0; });

  Promise.all([
    fetch('js/catalogue.json').then(r => r.json()),
    fetch('img/cat/label/geom.json').then(r => r.json()),
  ]).then(([cat, geo]) => { CAT = cat; GEO = geo; build(); frame(); });
}
