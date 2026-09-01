/* ---------------------------------------------------------------
   THE COVER

   The old cover was a photograph of five vials on a rail against a
   pale sky. It contradicted the book: three pages later the colour
   section says the blue runs flat, edge to edge, with one machined
   object in it and no gradient anywhere. So the cover is that rule,
   executed — a flat Field ground and one machined object.

   The object is the helix in liquid metal, because it is the one form
   that appears in every part of this system. Strands offset 0.42 of a
   turn, pitch near twice the diameter so it reads as DNA rather than
   as a spring. Real thin-film iridescence, the same physics as the
   foil on the label, and a slow lateral wave so the metal moves like
   metal instead of spinning like a prop.

   It renders only while it is on screen.
----------------------------------------------------------------*/
import * as THREE from '../vendor/three.module.min.js';

const HOST = document.getElementById('coverStage');
if (HOST) start(HOST);

function start(host) {
  /* pitch over diameter lands near 1.5 — B-DNA territory. Tighter than
     that and it stops reading as a helix and starts reading as a spring,
     which is exactly what 4.2 turns at this radius looked like. */
  const H = 6.6, RAD = 0.86, TURNS = 2.5, PHASE = 0.42;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  host.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 16 / 9, 0.1, 100);
  camera.position.set(0, 0, 15.5);

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
    x.fillStyle = 'rgba(255,255,255,.94)';
    x.fillRect(0, 92, 1024, 12); x.fillRect(0, 300, 1024, 7);
    const s = x.createRadialGradient(300, 90, 8, 300, 90, 210);
    s.addColorStop(0, '#fff'); s.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = s; x.beginPath(); x.ellipse(300, 90, 210, 120, 0, 0, 7); x.fill();
    const t = new THREE.Texture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
    const p = new THREE.PMREMGenerator(renderer);
    scene.environment = p.fromEquirectangular(t).texture;
    p.dispose(); t.dispose();
  })();

  scene.add(new THREE.AmbientLight(0x40538c, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-5, 7, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9DBFD9, 0.7); rim.position.set(6, -3, 3);
  scene.add(rim);

  const shaders = [];
  function liquidMetal() {
    const m = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 1, roughness: 0.04,
      iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [340, 760],
    });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uT = { value: 0 };
      sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float wy = transformed.y;
         transformed.x += sin(wy * 0.9 + uT * 1.05) * 0.10;
         transformed.z += cos(wy * 0.8 + uT * 0.85) * 0.10;`);
      shaders.push(sh);
    };
    return m;
  }

  const mat = liquidMetal();
  const helix = new THREE.Group();
  scene.add(helix);

  for (const phase of [0, PHASE * Math.PI * 2]) {
    const pts = [];
    for (let i = 0; i <= 320; i++) {
      const t = i / 320, a = t * TURNS * Math.PI * 2 + phase;
      pts.push(new THREE.Vector3(Math.cos(a) * RAD, (t - 0.5) * H, Math.sin(a) * RAD));
    }
    helix.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 320, 0.098, 18, false), mat));
  }
  for (let i = 1; i < 30; i++) {
    const t = i / 30, a = t * TURNS * Math.PI * 2, b = a + PHASE * Math.PI * 2;
    const p1 = new THREE.Vector3(Math.cos(a) * RAD, (t - 0.5) * H, Math.sin(a) * RAD);
    const p2 = new THREE.Vector3(Math.cos(b) * RAD, (t - 0.5) * H, Math.sin(b) * RAD);
    const len = p1.distanceTo(p2);
    if (len < 0.18) continue;              /* foreshorten to nothing at a crossing */
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, len, 12), mat);
    r.position.copy(p1).add(p2).multiplyScalar(0.5);
    r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
    helix.add(r);
  }

  /* only draw while on screen; default on, so it never fails silent */
  let onScreen = true;
  const seen = new IntersectionObserver(
    es => { onScreen = es[0].isIntersecting; }, { rootMargin: '150px' });
  seen.observe(host);

  let W = 0;
  function resize() {
    W = host.clientWidth; if (!W) return false;
    const Ht = host.clientHeight || Math.round(W * 9 / 16);
    renderer.setSize(W, Ht, false);
    camera.aspect = W / Ht;
    /* sit the helix right of centre so the title has clean air */
    helix.position.x = camera.aspect > 1.5 ? 3.05 : 0;
    camera.updateProjectionMatrix();
    return true;
  }

  (function frame() {
    requestAnimationFrame(frame);
    if (!onScreen) return;
    if (!W && !resize()) return;
    const t = performance.now() * 0.001;
    helix.rotation.y = t * 0.26;
    helix.rotation.z = Math.sin(t * 0.5) * 0.03;
    for (const sh of shaders) sh.uniforms.uT.value = t;
    renderer.render(scene, camera);
  })();
  addEventListener('resize', () => { W = 0; });
}
