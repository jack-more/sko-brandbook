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
  function subVision(A, B, k) {                      /* the inspection pass */
    for (const S of [A, B]) for (let i = 0; i < S.length; i += 3) {
      const [x, y, d] = S[i], s = sh(d), r = 0.9 + 2.1 * s;
      ctx.strokeStyle = `rgba(${INK},${(0.9 * s * k).toFixed(3)})`;
      ctx.lineWidth = 1;
      if (i % 9 === 0) ctx.strokeRect(x - r, y - r, r * 2, r * 2);
      else { ctx.fillStyle = `rgba(${INK},${(0.8 * s * k).toFixed(3)})`;
             ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, 7); ctx.fill(); }
    }
    ctx.font = '8px "DM Mono",ui-monospace,monospace'; ctx.textAlign = 'left';
    for (let m = 0; m < 6; m++) {
      const i = Math.floor(A.length * (m + 0.5) / 6), S = m % 2 ? A : B;
      const [x, y, d] = S[i]; if (d < -0.2) continue;
      const bw = 30, bh = 22, tk = 8, al = (0.85 * sh(d) * k).toFixed(3);
      ctx.strokeStyle = `rgba(${INK},${al})`;
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sy]) => {
        const cx2 = x + sx * bw / 2, cy2 = y + sy * bh / 2;
        ctx.beginPath();
        ctx.moveTo(cx2 - sx * tk, cy2); ctx.lineTo(cx2, cy2); ctx.lineTo(cx2, cy2 - sy * tk);
        ctx.stroke();
      });
      ctx.fillStyle = `rgba(${INK},${al})`;
      ctx.fillText((0.9 + (m * 17 % 9) / 100).toFixed(2), x - bw / 2, y - bh / 2 - 7);
    }
  }
  const SUBS = [subVision, subBloom, subRungs, subGlyph, subReadout, subDust];
  const NAMES = ['INSPECTION', 'ACCRETION', 'LADDER', 'CHAIN', 'READOUT', 'DISPERSE'];

  function frame(ts) {
    requestAnimationFrame(frame);
    if (!W && !layout()) return;
    if (t0 === null) t0 = ts;
    const el = ts - t0, cyc = HOLD + TURN;
    const idx = Math.floor(el / cyc) % SUBS.length;
    const nxt = (idx + 1) % SUBS.length;
    const into = Math.max(0, (el % cyc) - HOLD) / TURN;   /* 0 hold, ->1 crossing */

    ctx.fillStyle = '#07090F'; ctx.fillRect(0, 0, W, H);
    seedn = 1 + idx * 977;
    const [A, B] = strands(560, el * 0.00016);

    /* glitch only while crossing: torn horizontal offsets */
    const tear = into > 0 && into < 1;
    if (tear) {
      const bands = 7;
      for (let b = 0; b < bands; b++) {
        ctx.save();
        const y0 = H * b / bands, hh = H / bands;
        ctx.beginPath(); ctx.rect(0, y0, W, hh); ctx.clip();
        ctx.translate((rnd() - 0.5) * 26 * Math.sin(into * Math.PI), 0);
        SUBS[idx](A, B, 1 - into); SUBS[nxt](A, B, into);
        ctx.restore();
      }
    } else {
      SUBS[idx](A, B, 1);
    }

    ctx.font = '10px "DM Mono",ui-monospace,monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = `rgba(${INK},.5)`;
    ctx.fillText(NAMES[into > 0.5 ? nxt : idx], 14, H - 14);
    ctx.textAlign = 'right';
    ctx.fillText(`${(into > 0.5 ? nxt : idx) + 1} / ${SUBS.length}`, W - 14, H - 14);
  }
  addEventListener('resize', () => { W = 0; });
  requestAnimationFrame(frame);
})();
