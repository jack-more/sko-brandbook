/* ---------------------------------------------------------------
   SKO — HELIX

   The path is constant. The substance is not.

   Read off the reference at 36 frames: the helix never changes shape,
   but what it is made of keeps being replaced — monospace rungs, glyph
   chains, particle accretion, dust, a flattened readout, and the
   inspection pass. It glitches between them and the silhouette holds.

   Geometry stays honest: strands offset 0.42 of a turn (major and
   minor groove), depth from cos() driving size, brightness and order.
----------------------------------------------------------------*/
(function () {
  const cv = document.getElementById('helixField');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  const PHI = Math.PI * 2 * 0.42;
  const TURNS = 2.55;
  const INK = '200,221,255';
  const FOIL = ['#9CA1DF', '#BAC7F2', '#A1CEF5', '#5BAEE5', '#7578B0', '#C3AFD7', '#F0E6D8'];
  const GLYPH = '01ACGT{}[]<>/\\|=+-*#%$@&';
  const HOLD = 2200, TURN = 620;

  let W, H, DPR, t0 = null, seedn = 1;
  const rnd = () => (seedn = (seedn * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  function layout() {
    W = cv.parentElement.clientWidth; if (!W) return false;
    H = Math.round(Math.min(W * 1.05, 760));
    DPR = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * DPR; cv.height = H * DPR; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return true;
  }

  /* the path, sampled once per frame */
  function strands(n, spin) {
    const amp = W * 0.20, cx = W / 2, pad = H * 0.07;
    const A = [], B = [];
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const y = pad + u * (H - pad * 2);
      const a = Math.PI * 2 * TURNS * u + spin;
      A.push([cx + Math.sin(a) * amp, y, Math.cos(a)]);
      B.push([cx + Math.sin(a + PHI) * amp, y, Math.cos(a + PHI)]);
    }
    return [A, B, amp];
  }
  const sh = (d, lo = 0.30) => lo + (1 - lo) * Math.pow((d + 1) / 2, 1.6);

  /* ---- substances ---- */
  function subGlyph(A, B, k) {                       /* chains of characters */
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const S of [A, B]) for (let i = 0; i < S.length; i += 9) {
      const [x, y, d] = S[i], s = sh(d);
      ctx.font = `${(5 + 5 * s).toFixed(1)}px "DM Mono",ui-monospace,monospace`;
      ctx.fillStyle = `rgba(${INK},${(0.85 * s * k).toFixed(3)})`;
      ctx.fillText(GLYPH[(i * 7) % GLYPH.length], x, y);
    }
  }
  function subRungs(A, B, k) {                       /* monospace ladder */
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '9px "DM Mono",ui-monospace,monospace';
    for (let i = 0; i < A.length; i += 18) {
      const [ax, ay, ad] = A[i], [bx, , bd] = B[i];
      const open = Math.abs(ax - bx) / (W * 0.4);
      if (open < 0.12) continue;
      const s = sh((ad + bd) / 2), n = Math.max(2, Math.round(Math.abs(ax - bx) / 13));
      for (let j = 0; j <= n; j++) {
        const x = ax + (bx - ax) * (j / n);
        ctx.fillStyle = `rgba(${INK},${(0.72 * s * open * k).toFixed(3)})`;
        ctx.fillText('=', x, ay);
      }
    }
  }
  function subBloom(A, B, k) {                       /* luminous accretion */
    for (const S of [A, B]) for (let i = 0; i < S.length; i += 2) {
      const [x, y, d] = S[i], s = sh(d);
      ctx.fillStyle = `rgba(${INK},${(0.9 * s * k).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, 0.7 + 1.5 * s, 0, 7); ctx.fill();
      if (rnd() < 0.045 * s) {
        const c = FOIL[(i * 3) % FOIL.length], R = 5 + rnd() * 20 * s;
        for (let p = 0; p < 16; p++) {
          const a = rnd() * 7, r = Math.pow(rnd(), 2) * R;
          ctx.fillStyle = c + Math.round(40 + rnd() * 130 * k).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 0.6 + rnd() * 2.1, 0, 7);
          ctx.fill();
        }
      }
    }
  }
  function subDust(A, B, k) {                        /* dissolving */
    for (const S of [A, B]) for (let i = 0; i < S.length; i += 2) {
      const [x, y, d] = S[i], s = sh(d, 0.12);
      const j = 26 * (1 - s);
      ctx.fillStyle = `rgba(${INK},${(0.5 * s * k).toFixed(3)})`;
      ctx.fillRect(x + (rnd() - 0.5) * j, y + (rnd() - 0.5) * j, 1.4, 1.4);
    }
  }
  function subReadout(A, B, k) {                     /* flattened to bands */
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = '9px "DM Mono",ui-monospace,monospace';
    for (let i = 0; i < A.length; i += 12) {
      const [ax, ay, ad] = A[i], [bx, , bd] = B[i];
      const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), s = sh((ad + bd) / 2);
      let str = '';
      for (let c = 0; c < Math.round((x1 - x0) / 6); c++) str += GLYPH[(i + c * 5) % GLYPH.length];
      ctx.fillStyle = `rgba(${INK},${(0.62 * s * k).toFixed(3)})`;
      ctx.fillText(str, x0, ay);
    }
  }
  /* The inspection pass, ported to spec from amirmushichge/machine-vision
     (MIT): anchor kinds and their odds, two-corner brackets, the box corner
     tick, the label vocabulary, square caps and mitre joins. Their feature
     source is a video frame; ours is the helix. */
  function mvLabel(i, x, y, score) {
    const o = [
      'X ' + x.toFixed(3).replace('0.', '.'),
      'Y ' + y.toFixed(3).replace('0.', '.'),
      'IDX ' + String(i).padStart(3, '0'),
      'S ' + score.toFixed(2).replace('0.', '.'),
      'F ' + String((i * 37) % 999).padStart(3, '0'),
      'A' + String((i * 11) % 28).padStart(2, '0'),
      'C ' + Math.min(0.99, score + 0.07).toFixed(2),
    ];
    return o[i % o.length];
  }
  function subVision(A, B, k) {
    ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
    const pts = [];
    for (const S of [A, B]) for (let i = 0; i < S.length; i += 7) {
      const [x, y, d] = S[i];
      pts.push({ x, y, d, s: 0.55 + 0.44 * (d + 1) / 2, i });
    }
    /* connections: max two per point, y compressed 0.7 */
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      let n = 0;
      for (let j = i + 1; j < pts.length && n < 2; j++) {
        const a = pts[i], b = pts[j];
        const dist = Math.hypot((a.x - b.x) / W, ((a.y - b.y) / H) * 0.7);
        if (dist < 0.052 && ((i * 7 + j) % 5) < 2) {
          const dep = sh(Math.max(a.d, b.d));
          ctx.strokeStyle = `rgba(${INK},${(0.55 * dep * k).toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          n++;
        }
      }
    }
    /* anchors: point 50 / cross 28 / square 22, far strand first */
    pts.slice().sort((p, q) => p.d - q.d).forEach((p, n) => {
      const dep = sh(p.d), size = 2.5 * (0.7 + ((n * 13) % 75) / 100) * (0.55 + 0.65 * dep);
      const r = (n * 29) % 100;
      ctx.strokeStyle = ctx.fillStyle = `rgba(${INK},${(dep * k).toFixed(3)})`;
      ctx.lineWidth = 1;
      if (r < 50) { ctx.beginPath(); ctx.arc(p.x, p.y, size * 0.72, 0, 7); ctx.fill(); }
      else if (r < 78) {
        ctx.beginPath();
        ctx.moveTo(p.x - size * 1.8, p.y); ctx.lineTo(p.x + size * 1.8, p.y);
        ctx.moveTo(p.x, p.y - size * 1.8); ctx.lineTo(p.x, p.y + size * 1.8);
        ctx.stroke();
      } else ctx.strokeRect(p.x - size, p.y - size, size * 2, size * 2);
    });
    /* brackets: two opposite corners, never four */
    pts.forEach((p, n) => {
      if ((n * 17) % 100 > 15) return;
      const s = 9 + ((n * 7) % 11), dep = sh(p.d);
      ctx.strokeStyle = `rgba(${INK},${(0.9 * dep * k).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(p.x - s, p.y - s * 0.3); ctx.lineTo(p.x - s, p.y - s); ctx.lineTo(p.x - s * 0.3, p.y - s);
      ctx.moveTo(p.x + s * 0.3, p.y + s); ctx.lineTo(p.x + s, p.y + s); ctx.lineTo(p.x + s, p.y + s * 0.3);
      ctx.stroke();
    });
    /* tracking boxes: four corners, plus the tick off the top right */
    ctx.font = '9px Manrope,"DM Mono",ui-monospace,monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    for (let m = 0; m < 4; m++) {
      const p = pts[Math.floor(pts.length * (m + 0.5) / 4)];
      if (!p || p.d < -0.2) continue;
      const bw = 46, bh = 33, cn = Math.min(18, bw * 0.24, bh * 0.24);
      const x0 = p.x - bw / 2, y0 = p.y - bh / 2;
      ctx.strokeStyle = ctx.fillStyle = `rgba(${INK},${(0.85 * k).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + cn); ctx.lineTo(x0, y0); ctx.lineTo(x0 + cn, y0);
      ctx.moveTo(x0 + bw - cn, y0); ctx.lineTo(x0 + bw, y0); ctx.lineTo(x0 + bw, y0 + cn);
      ctx.moveTo(x0 + bw, y0 + bh - cn); ctx.lineTo(x0 + bw, y0 + bh); ctx.lineTo(x0 + bw - cn, y0 + bh);
      ctx.moveTo(x0 + cn, y0 + bh); ctx.lineTo(x0, y0 + bh); ctx.lineTo(x0, y0 + bh - cn);
      ctx.moveTo(x0 + bw, y0 + 8); ctx.lineTo(x0 + bw + 13, y0 + 8);
      ctx.stroke();
      ctx.fillText('B' + String(m + 1).padStart(2, '0') + '  ' + (0.88 + m * 0.03).toFixed(2), x0 + bw + 5, y0 - 5);
    }
    /* labels */
    ctx.textBaseline = 'middle';
    pts.forEach((p, n) => {
      if ((n * 23) % 100 > 9) return;
      const align = p.x > W * 0.72 ? 'right' : 'left';
      ctx.textAlign = align;
      ctx.fillStyle = `rgba(${INK},${(0.9 * sh(p.d) * k).toFixed(3)})`;
      ctx.fillText(mvLabel(n, p.x / W, p.y / H, p.s),
                   p.x + (align === 'left' ? 14 : -14), p.y - 9);
    });
    ctx.textBaseline = 'alphabetic';
  }
  const SUBS = [subVision, subBloom, subRungs, subGlyph, subReadout, subDust];
  const NAMES = ['INSPECTION', 'ACCRETION', 'LADDER', 'CHAIN', 'READOUT', 'DISPERSE'];

  /* Behaviour, read off the reference at 24fps:
     - every state change is a HARD CUT in one frame. There are no crossfades.
     - structure and bloom are two independent layers. The bloom flickers on
       and off frame to frame while the structure holds.
     - the structure holds roughly 0.3-0.5s, then cuts.
     - occasional single-frame flat blue flash as a cut.                        */
  const STRUCT = [subVision, subRungs, subGlyph, subReadout, subDust];
  const SNAMES = ['INSPECTION', 'LADDER', 'CHAIN', 'READOUT', 'DISPERSE'];
  let sIdx = 0, sUntil = 0, bloomOn = true, bUntil = 0, flashUntil = 0;

  function frame(ts) {
    requestAnimationFrame(frame);
    if (!W && !layout()) return;
    if (t0 === null) t0 = ts;
    const el = ts - t0;

    if (el > sUntil) {                       /* hard cut, no blend */
      sIdx = (sIdx + 1 + Math.floor(Math.random() * (STRUCT.length - 1))) % STRUCT.length;
      sUntil = el + 300 + Math.random() * 420;
      if (Math.random() < 0.16) flashUntil = el + 42;   /* one-frame flash */
    }
    if (el > bUntil) {                       /* the bloom toggles on its own clock */
      bloomOn = Math.random() < 0.62;
      bUntil = el + 60 + Math.random() * 260;
    }

    if (el < flashUntil) {
      ctx.fillStyle = '#2F55E8'; ctx.fillRect(0, 0, W, H);
      return;
    }

    ctx.fillStyle = '#07090F'; ctx.fillRect(0, 0, W, H);
    seedn = 1 + sIdx * 977;
    const [A, B] = strands(560, el * 0.00016);

    STRUCT[sIdx](A, B, 1);
    if (bloomOn) subBloom(A, B, 0.92);       /* the accretion rides on top */

    ctx.font = '10px Manrope,"DM Mono",ui-monospace,monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = `rgba(${INK},.5)`;
    ctx.fillText(SNAMES[sIdx] + (bloomOn ? '  +  ACCRETION' : ''), 14, H - 14);
    ctx.textAlign = 'right';
    ctx.fillText(String(sIdx + 1) + ' / ' + STRUCT.length, W - 14, H - 14);
  }

  addEventListener('resize', () => { W = 0; });
  requestAnimationFrame(frame);
})();
