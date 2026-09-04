/* ---------------------------------------------------------------
   THE ARRAY — the catalogue as a cloud of bottles.

   Every offering, as the render it actually is, on a Fibonacci sphere
   over the flat Field. Nothing in the middle: the blue bottle is the
   brand, so the bottles are the whole object. Drag to spin (it keeps
   momentum and settles), wheel to zoom, hover to lift one, click to
   bring it to the centre and dim the rest. 2D canvas, no WebGL.
----------------------------------------------------------------*/
(function () {
  const host = document.getElementById('arraySphere');
  if (!host) return;
  const FIELD = '#244399', HREF = 'https://skocompounds.com/products';
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { display: 'block', width: '100%', cursor: 'grab', touchAction: 'none' });
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: false });
  const tag = document.createElement('div');
  Object.assign(tag.style, { position: 'absolute', pointerEvents: 'none', transform: 'translate(-50%,-100%)',
    background: 'rgba(9,34,102,.92)', color: '#fff', font: '500 12px/1.3 Inter, system-ui, sans-serif',
    padding: '7px 10px', borderRadius: '3px', whiteSpace: 'nowrap', opacity: '0', transition: 'opacity .12s', letterSpacing: '.01em' });
  host.style.position = 'relative'; host.appendChild(tag);

  const S = { yaw: 0.4, pitch: -0.12, vx: 0.0022, vy: 0, zoom: 1, drag: false, moved: false,
              px: 0, py: 0, hover: -1, focus: -1, cards: [], W: 0, H: 0, dpr: 1 };

  function fit() {
    const W = host.clientWidth; if (!W) return false;
    const H = Math.round(Math.min(W * 0.62, 720));
    S.dpr = Math.min(devicePixelRatio || 1, 2); S.W = W; S.H = H;
    canvas.width = W * S.dpr; canvas.height = H * S.dpr; canvas.style.height = H + 'px';
    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); return true;
  }

  function fib(i, n) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r };
  }

  function build(cat) {
    S.cards = cat.map((d, i) => {
      const img = new Image(); img.src = d.img;
      return { ...d, img, p: fib(i, cat.length), hov: 0, foc: 0, dim: 0, jit: (i * 0.37) % 1 - 0.5 };
    });
  }

  function project(p) {
    /* yaw about Y, pitch about X, camera on +Z */
    const cy = Math.cos(S.yaw), sy = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
    const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
    const y2 = p.y * cp - z1 * sp, z2 = p.y * sp + z1 * cp;
    return { x: x1, y: y2, z: z2 };
  }

  function metrics(c) {
    const r = Math.min(S.W, S.H) * 0.47 * S.zoom;
    const q = project(c.p);
    let sx = S.W / 2 + q.x * r, sy = S.H / 2 - q.y * r * 0.92, z = q.z;
    sx += (S.W / 2 - sx) * 0.86 * c.foc; sy += (S.H / 2 - sy) * 0.86 * c.foc; z += (1.4 - z) * 0.85 * c.foc;
    z += 0.12 * c.hov;
    const depth = (z + 1) / 2;                                  /* 0 back .. 1 front */
    const scale = (0.5 + depth * 0.8) * S.zoom * (1 + c.foc * 0.95 + c.hov * 0.10 - c.dim * 0.12);
    const h = S.H * 0.185 * scale;                               /* a front vial is about a quarter of the frame */
    const ar = c.img.naturalWidth && c.img.naturalHeight ? c.img.naturalWidth / c.img.naturalHeight : 0.44;
    const w = h * ar;
    const alpha = Math.min(1, (0.10 + 0.90 * Math.pow(depth, 1.8)) + c.hov * 0.2 + c.foc) * (1 - c.dim * 0.72);
    return { sx, sy, z, w, h, alpha, depth };
  }

  function draw(c, m) {
    if (!c.img.complete || !c.img.naturalWidth) return;
    ctx.save(); ctx.translate(m.sx, m.sy);
    ctx.globalAlpha = m.alpha * 0.28;
    ctx.fillStyle = '#061842';
    ctx.beginPath(); ctx.ellipse(0, m.h * 0.5, m.w * 0.42, m.h * 0.035 + 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = m.alpha;
    ctx.drawImage(c.img, -m.w / 2, -m.h / 2, m.w, m.h);
    ctx.restore();
  }

  let order = [];
  function frame(now) {
    requestAnimationFrame(frame);
    if (!S.W && !fit()) return;
    if (!S.drag && S.hover === -1 && S.focus === -1) {
      S.yaw += S.vx; S.pitch += S.vy;
      S.vx += (0.0022 - S.vx) * 0.02; S.vy += (0 - S.vy) * 0.03;
    } else if (!S.drag) { S.vx *= 0.9; S.vy *= 0.9; }
    S.pitch = Math.max(-0.6, Math.min(0.6, S.pitch));
    for (const c of S.cards) {
      c.hov += ((S.hover === c.idx ? 1 : 0) - c.hov) * 0.18;
      c.foc += ((S.focus === c.idx ? 1 : 0) - c.foc) * 0.12;
      c.dim += ((S.focus !== -1 && S.focus !== c.idx ? 1 : 0) - c.dim) * 0.12;
    }
    ctx.fillStyle = FIELD; ctx.fillRect(0, 0, S.W, S.H);
    order = S.cards.map(c => ({ c, m: metrics(c) })).sort((a, b) => a.m.z - b.m.z);
    for (const o of order) draw(o.c, o.m);
    const hot = S.focus !== -1 ? S.cards[S.focus] : (S.hover !== -1 ? S.cards[S.hover] : null);
    if (hot) {
      const m = metrics(hot);
      tag.innerHTML = '<b>' + hot.name + '</b><span style="opacity:.6;margin-left:7px">' + (hot.size || '') + '</span><span style="margin-left:9px">' + (hot.price || '') + '</span>';
      tag.style.left = m.sx + 'px'; tag.style.top = (m.sy - m.h / 2 - 8) + 'px'; tag.style.opacity = '1';
    } else tag.style.opacity = '0';
  }

  function hit(x, y) {
    for (let i = order.length - 1; i >= 0; i--) {
      const { c, m } = order[i];
      if (Math.abs(x - m.sx) <= m.w / 2 && Math.abs(y - m.sy) <= m.h / 2) return c.idx;
    }
    return -1;
  }
  const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  canvas.addEventListener('pointerdown', e => {
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    const p = pos(e);
    S.drag = true; S.moved = false; S.px = p.x; S.py = p.y; S.vx = 0; S.vy = 0; canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointermove', e => {
    const p = pos(e);
    if (S.drag) {
      const dx = p.x - S.px, dy = p.y - S.py; S.px = p.x; S.py = p.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) S.moved = true;
      S.yaw += dx * 0.006; S.pitch += dy * 0.004; S.vx = dx * 0.006 * 0.35; S.vy = dy * 0.004 * 0.35;
    } else {
      S.hover = hit(p.x, p.y); canvas.style.cursor = S.hover === -1 ? 'grab' : 'pointer';
    }
  });
  const up = e => {
    if (!S.drag) return; S.drag = false; canvas.style.cursor = 'grab';
    if (!S.moved) {
      const i = hit(S.px, S.py);
      if (i === -1 || i === S.focus) { if (S.focus !== -1 && i === S.focus) window.open(HREF, '_blank'); S.focus = -1; }
      else S.focus = i;
    }
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', () => { if (!S.drag) S.hover = -1; });
  canvas.addEventListener('wheel', e => {
    e.preventDefault(); S.zoom = Math.max(0.6, Math.min(1.8, S.zoom - e.deltaY * 0.0008));
  }, { passive: false });
  addEventListener('resize', () => { S.W = 0; });

  fetch('js/catalogue.json').then(r => r.json()).then(cat => {
    build(cat); S.cards.forEach((c, i) => { c.idx = i; }); requestAnimationFrame(frame);
  });
})();
