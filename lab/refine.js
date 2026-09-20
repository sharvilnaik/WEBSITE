(function () {
  const css = `
/* Multi-Select, after Severance — a refinement terminal, not a web form:
   one green-black screen, numbers that float, and five bins along the floor.
   Everything but the words is drawn on the canvas, so the numbers can fall into the bins. */
.x-refine {
  --mdr-ink: #d3f2f5;
  --mdr-dim: rgba(211, 242, 245, .48);
  --mdr-line: rgba(126, 214, 224, .26);
  background: radial-gradient(120% 85% at 50% -12%, #123640 0%, #081b21 56%, #050f13 100%);
  box-shadow: inset 0 0 0 1px rgba(126, 214, 224, .15), inset 0 0 80px rgba(18, 92, 110, .2);
  color: var(--mdr-ink);
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  cursor: crosshair;
}
.x-refine .rf-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 13px var(--rf-pad, 15px) 11px; }
.x-refine .rf-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
/* the file has a name and the name is the point of the day; it is set in caps because the terminal's is */
.x-refine .rf-file { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.x-refine .rf-pct { font-size: 12px; letter-spacing: .06em; font-variant-numeric: tabular-nums; flex: none; }
.x-refine .rf-rail { position: relative; height: 2px; margin-top: 7px; background: rgba(126, 214, 224, .16); }
.x-refine .rf-rail i { position: absolute; inset: 0 auto 0 0; display: block; width: 0%; background: var(--mdr-ink); transition: width .5s cubic-bezier(.23, 1, .32, 1); }
.x-refine canvas { display: block; flex: 1; width: 100%; min-height: 0; }
/* the CRT the numbers live behind: scan lines and a soft corner falloff, both untouchable */
.x-refine .rf-crt { position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(to bottom, rgba(0, 0, 0, .18) 0 1px, transparent 1px 3px),
              radial-gradient(130% 100% at 50% 50%, transparent 55%, rgba(0, 0, 0, .45) 100%); }
/* the sheet that drops when the file is finished */
.x-refine .rf-done { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; gap: 6px;
  background: rgba(5, 15, 19, .82); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
  animation: rf-in .5s cubic-bezier(.23, 1, .32, 1) both; }
.x-refine .rf-done[hidden] { display: none; }
.x-refine .rf-done h3 { margin: 0; font: 400 15px/1.2 inherit; letter-spacing: .2em; text-transform: uppercase; }
.x-refine .rf-done p { margin: 0; font: 400 12px/1.5 inherit; color: var(--mdr-dim); }
.x-refine .rf-done button { margin-top: 12px; font: 400 10px/1 inherit; letter-spacing: .14em; text-transform: uppercase;
  color: var(--mdr-ink); background: transparent; border: 1px solid var(--mdr-line); border-radius: 2px; padding: 11px 16px;
  cursor: pointer; transition: background-color .2s ease, border-color .2s ease; }
.x-refine .rf-done button:hover { background: rgba(126, 214, 224, .12); border-color: var(--mdr-ink); }
.x-refine .rf-done button:focus-visible { outline: 2px solid var(--mdr-ink); outline-offset: 3px; }
@keyframes rf-in { from { opacity: 0 } to { opacity: 1 } }
@media (prefers-reduced-motion: reduce) { .x-refine .rf-done { animation: none } }
`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  const FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  const FILE = 'Cold Harbor';
  const BINS = 5;                    // five bins, one cluster each: the file is done in five finds
  const CLUSTER = 5;                 // numbers in a bad bunch
  const NEED = 3;                    // how many of them the box has to catch for it to count
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const rnd = (a, b) => a + Math.random() * (b - a);
  // the blob shapes a bad bunch can take, as cell offsets from its first number
  const SHAPES = [
    [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [1, 2], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
    [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]]
  ];

  window.EXPERIMENTS.push({
    id: 'refine',
    name: 'Multi-Select',
    source: 'Severance',
    hint: 'Move over the field until numbers tremble, then drag a box round them to bin them.',
    mount(stage) {
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      const R = !!window.REDUCED;

      stage.innerHTML = `
        <div class="rf-wrap">
          <div class="rf-top"><span class="rf-file">${FILE}</span><span class="rf-pct">0%</span></div>
          <div class="rf-rail"><i></i></div>
          <canvas role="img" aria-label="Macrodata refinement: a field of numbers above five bins"></canvas>
        </div>
        <div class="rf-crt"></div>
        <div class="rf-done" hidden>
          <h3>${FILE}</h3>
          <p>100% refined</p>
          <button type="button">Start a new file</button>
        </div>`;
      const q = sel => stage.querySelector(sel);
      const wrap = q('.rf-wrap'), cv = q('canvas'), ctx = cv.getContext('2d');
      const elPct = q('.rf-pct'), elFill = q('.rf-rail i'), sheet = q('.rf-done'), btnAgain = q('.rf-done button');

      let W = 320, H = 240, dpr = 1;
      let cols = 12, rows = 7, cellW = 26, cellH = 26, fieldTop = 8, fieldH = 150;
      let binTop = 200, binH = 46, binW = 56, binGap = 8, binLeft = 0;
      let digits = [], bins = [], cluster = null, flyers = [];
      let state = 'scan';            // scan → filing → scan … → done
      let done = 0, prog = 0, progShown = 0;
      let px = -999, py = -999, inside = false;
      let drag = null, ghost = null; // ghost: the box fading out after a miss
      let status = 'Scanning', statusT = 0, tickT = 0;
      let raf = 0, last = 0, t0 = performance.now();

      // ---------- layout ----------
      function measure() {
        const pad = (stage.clientWidth || 360) < 420 ? 13 : 15;
        wrap.style.setProperty('--rf-pad', pad + 'px');
        W = Math.max(200, cv.clientWidth || 300);
        H = Math.max(140, cv.clientHeight || 220);
        dpr = Math.min(2, window.devicePixelRatio || 1);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);

        binH = H < 230 ? 40 : 46;
        binGap = W < 300 ? 5 : 8;
        binLeft = 0;
        binW = (W - binGap * (BINS - 1)) / BINS;
        fieldTop = 4;
        fieldH = H - binH - 26 - fieldTop;   // 26 leaves the status line its own row

        const nc = clamp(Math.round(W / 27), 8, 16), nr = clamp(Math.floor(fieldH / 25), 4, 9);
        const regrid = digits.length && (nc !== cols || nr !== rows);
        cols = nc; rows = nr;
        cellW = W / cols; cellH = fieldH / rows;
        // a different number of cells means the old field no longer fits: lay a fresh one out
        if (regrid && state === 'scan') { makeDigits(); spawnCluster(); }
        else for (const d of digits) place(d);
      }
      function place(d) {
        d.x = (d.c + 0.5) * cellW + d.jx * cellW * 0.12;
        d.y = fieldTop + (d.r + 0.5) * cellH + d.jy * cellH * 0.12;
      }

      // ---------- the field ----------
      function makeDigits() {
        digits = [];
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const d = { c, r, v: Math.floor(Math.random() * 10), ph: Math.random() * 7, jx: rnd(-1, 1), jy: rnd(-1, 1), fade: 1, bad: false };
          place(d); digits.push(d);
        }
      }
      const at = (c, r) => digits.find(d => d.c === c && d.r === r);

      // a bad bunch: one blob of neighbours that trembles when the cursor comes near
      function spawnCluster() {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const w = Math.max(...shape.map(o => o[0])) + 1, h = Math.max(...shape.map(o => o[1])) + 1;
        const c0 = Math.floor(rnd(0, cols - w + 1)), r0 = Math.floor(rnd(0, rows - h + 1));
        const picked = [];
        for (const [ox, oy] of shape) { const d = at(c0 + ox, r0 + oy); if (d) { d.bad = true; picked.push(d); } }
        cluster = { members: picked, fear: 0, cx: 0, cy: 0 };
      }

      function reset() {
        state = 'scan'; done = 0; prog = 0; progShown = 0; flyers = []; drag = null; ghost = null;
        bins = Array.from({ length: BINS }, () => ({ fill: 0, shown: 0, lid: 0, lidTo: 0 }));
        makeDigits(); spawnCluster();
        setStatus('Scanning');
        sheet.hidden = true;
        syncNumbers();
      }
      function setStatus(txt) { status = txt; statusT = performance.now(); }
      function syncNumbers() {
        const pct = Math.round(progShown * 100);
        elPct.textContent = pct + '%';
        elFill.style.width = (progShown * 100) + '%';
      }

      // ---------- picking ----------
      function boxRect() {
        if (!drag) return null;
        return { x: Math.min(drag.x0, drag.x1), y: Math.min(drag.y0, drag.y1), w: Math.abs(drag.x1 - drag.x0), h: Math.abs(drag.y1 - drag.y0) };
      }
      const inRect = (d, b) => d.x >= b.x && d.x <= b.x + b.w && d.y >= b.y && d.y <= b.y + b.h;

      function release() {
        const b = boxRect();
        drag = null;
        if (!b || state !== 'scan' || !cluster) return;
        const caught = cluster.members.filter(d => inRect(d, b));
        if (caught.length >= NEED && b.w > 6 && b.h > 6) file(caught, b);
        else { ghost = { ...b, t: 0, ok: false }; sfx('bad'); setStatus('Nothing to refine there'); }
      }

      // the numbers leave the field and fall into the bin, one after another
      function file(caught, b) {
        state = 'filing';
        const bin = bins[done];
        const bx = binLeft + done * (binW + binGap) + binW / 2, by = binTop + 2;
        bin.lidTo = 1;
        flyers = caught.map((d, i) => {
          d.filed = true;
          return { v: d.v, x0: d.x, y0: d.y, x1: bx + rnd(-binW * 0.2, binW * 0.2), y1: by + binH * 0.55,
                   cx: lerp(d.x, bx, 0.45), cy: Math.min(d.y, by) - rnd(40, 80), t: 0, delay: i * (R ? 40 : 90), src: d };
        });
        // whatever the box missed stops being bad and goes back to being a number
        for (const d of cluster.members) if (!d.filed) { d.bad = false; d.v = Math.floor(Math.random() * 10); }
        cluster = null;
        ghost = { ...b, t: 0, ok: true };
        sfx('swoosh');
        setStatus('Refining');
      }

      function land(f) {
        const bin = bins[done];
        bin.fill = clamp(bin.fill + 1 / flyers.length, 0, 1);
        prog = (done + bin.fill) / BINS;
        sfx('pop');
        // the number that left is replaced by a fresh one fading into the same cell
        const d = f.src;
        d.filed = false; d.bad = false; d.v = Math.floor(Math.random() * 10); d.fade = 0; d.jx = rnd(-1, 1); d.jy = rnd(-1, 1);
        place(d);
      }

      function finishFiling() {
        const bin = bins[done];
        bin.lidTo = 0; bin.fill = 1; prog = (done + 1) / BINS;
        done++;
        sfx('ok');
        if (done >= BINS) {
          state = 'done';
          setStatus('File complete');
          setTimeout(() => { if (state === 'done') { sheet.hidden = false; sfx('win'); } }, R ? 120 : 520);
        } else {
          setStatus('Bin 0' + done + ' sealed');
          setTimeout(() => { if (state === 'filing') { state = 'scan'; spawnCluster(); setStatus('Scanning'); } }, R ? 120 : 420);
        }
      }

      // ---------- pointer ----------
      const local = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      function onDown(e) {
        if (state !== 'scan') return;
        const p = local(e);
        if (p.y > binTop - 8) return;            // the bins are furniture, not a place to start a box
        try { cv.setPointerCapture(e.pointerId); } catch (err) { /* no live pointer to capture */ }
        drag = { id: e.pointerId, x0: p.x, y0: p.y, x1: p.x, y1: p.y };
        px = p.x; py = p.y; inside = true;
        sfx('click');
        e.preventDefault();
      }
      function onMove(e) {
        const p = local(e);
        px = p.x; py = p.y; inside = true;
        if (drag && e.pointerId === drag.id) { drag.x1 = p.x; drag.y1 = clamp(p.y, 0, binTop - 4); }
      }
      function onUp(e) { if (drag && e.pointerId === drag.id) release(); }
      function onLeave() { if (!drag) { inside = false; px = py = -999; } }

      cv.addEventListener('pointerdown', onDown);
      cv.addEventListener('pointermove', onMove);
      cv.addEventListener('pointerup', onUp);
      cv.addEventListener('pointercancel', onUp);
      cv.addEventListener('pointerleave', onLeave);
      btnAgain.addEventListener('click', () => { reset(); sfx('click'); });

      // ---------- frame ----------
      function update(now, dt) {
        const T = (now - t0) / 1000;

        // the field breathes: every number drifts on its own phase, and a few re-roll now and then
        for (const d of digits) {
          if (d.fade < 1) d.fade = Math.min(1, d.fade + dt * 3);
          d.dx = Math.sin(T * 0.7 + d.ph) * 1.6;
          d.dy = Math.cos(T * 0.55 + d.ph * 1.3) * 1.4;
        }
        if (!R && now - tickT > 2200) {
          tickT = now;
          for (let i = 0; i < 3; i++) {
            const d = digits[Math.floor(Math.random() * digits.length)];
            if (d && !d.bad && !d.filed) { d.v = Math.floor(Math.random() * 10); d.fade = 0.2; }
          }
        }

        // how frightened the bad bunch is: near cursor, and fully once a box is round it
        if (cluster && cluster.members.length) {
          let sx = 0, sy = 0;
          for (const d of cluster.members) { sx += d.x; sy += d.y; }
          cluster.cx = sx / cluster.members.length; cluster.cy = sy / cluster.members.length;
          let target = 0;
          if (inside) {
            const dist = Math.hypot(px - cluster.cx, py - cluster.cy);
            target = clamp(1 - (dist - 26) / 120, 0, 1);
          }
          const b = boxRect();
          if (b) { const n = cluster.members.filter(d => inRect(d, b)).length; if (n) target = Math.max(target, 0.55 + 0.45 * (n / CLUSTER)); }
          cluster.fear = lerp(cluster.fear, target, 1 - Math.exp(-dt * 9));
          if (cluster.fear > 0.55 && now - statusT > 900 && status === 'Scanning') setStatus('Something is here');
        }

        // flyers
        if (state === 'filing') {
          let allDone = true;
          for (const f of flyers) {
            if (f.delay > 0) { f.delay -= dt * 1000; allDone = false; continue; }
            if (f.t < 1) { f.t = Math.min(1, f.t + dt / (R ? 0.2 : 0.52)); if (f.t >= 1 && !f.landed) { f.landed = true; land(f); } }
            if (f.t < 1) allDone = false;
          }
          if (allDone && flyers.length && !flyers.closed) { flyers.closed = true; finishFiling(); }
        }

        for (const bin of bins) {
          bin.shown = lerp(bin.shown, bin.fill, 1 - Math.exp(-dt * 8));
          bin.lid = lerp(bin.lid, bin.lidTo, 1 - Math.exp(-dt * (bin.lidTo ? 12 : 6)));
        }
        if (ghost) { ghost.t += dt / 0.4; if (ghost.t >= 1) ghost = null; }

        const before = Math.round(progShown * 100);
        progShown = lerp(progShown, prog, 1 - Math.exp(-dt * 6));
        if (Math.round(progShown * 100) !== before) syncNumbers();
      }

      // ---------- drawing ----------
      function drawDigit(v, x, y, size, alpha, weight, glow) {
        ctx.font = (weight || 400) + ' ' + size.toFixed(1) + 'px ' + FONT;
        ctx.globalAlpha = alpha;
        if (glow) { ctx.shadowColor = 'rgba(146, 232, 242, .9)'; ctx.shadowBlur = glow; }
        ctx.fillText(String(v), x, y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      function draw(now) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#d3f2f5';

        const box = boxRect();
        const fear = cluster ? cluster.fear : 0;

        for (const d of digits) {
          if (d.filed) continue;
          const x = d.x + d.dx, y = d.y + d.dy;
          // the cursor magnifies what is under it, the way the terminal does
          const md = inside ? Math.hypot(px - x, py - y) : 999;
          const mag = clamp(1 - md / 78, 0, 1);
          let size = 13 + mag * 4, alpha = (0.42 + mag * 0.44) * d.fade, ox = 0, oy = 0, weight = 400, glow = 0;

          if (d.bad && cluster) {
            const f = fear;
            // frightened numbers grow, shake, back away from the middle of their own bunch, and light up:
            // the glow is what tells them apart from anything else the cursor happens to be magnifying
            if (!R) {
              ox = Math.sin(now * 0.021 + d.ph * 5) * 3.4 * f;
              oy = Math.cos(now * 0.017 + d.ph * 7) * 2.8 * f;
              const away = Math.atan2(y - cluster.cy, x - cluster.cx);
              ox += Math.cos(away) * 3.2 * f; oy += Math.sin(away) * 3.2 * f;
            }
            size += f * 7; alpha = Math.max(alpha, 0.4 + f * 0.6); weight = 500; glow = f * 13;
          }
          if (box && inRect(d, box)) { alpha = Math.min(1, alpha + 0.45); size += 1.5; }
          drawDigit(d.v, x + ox, y + oy, size, alpha, weight, glow);
        }

        // flyers, above the field and behind the bin walls
        if (state === 'filing') for (const f of flyers) {
          if (f.delay > 0 || f.t >= 1) continue;
          const t = f.t, it = 1 - t;
          const x = it * it * f.x0 + 2 * it * t * f.cx + t * t * f.x1;
          const y = it * it * f.y0 + 2 * it * t * f.cy + t * t * f.y1;
          drawDigit(f.v, x, y, 18 - t * 5, 1 - t * 0.35, 500);
        }

        // the selection box, and the one fading out after a release
        if (box) drawBox(box.x, box.y, box.w, box.h, 1, null);
        if (ghost) drawBox(ghost.x, ghost.y, ghost.w, ghost.h, 1 - ghost.t, ghost.ok);

        // status line above the bins
        ctx.textAlign = 'left';
        ctx.font = '400 9px ' + FONT;
        ctx.globalAlpha = 0.55;
        ctx.fillText(status.toUpperCase(), 1, binTop - 13);
        ctx.globalAlpha = 1;

        drawBins();
      }

      function drawBox(x, y, w, h, a, ok) {
        ctx.save();
        ctx.globalAlpha = a * 0.1;
        ctx.fillStyle = ok === false ? '#ff8f7a' : '#7ed6e0';
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = a * 0.9;
        ctx.strokeStyle = ok === false ? '#ff8f7a' : '#a9eaf1';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.lineDashOffset = -(performance.now() * 0.02) % 7;
        ctx.strokeRect(x + 0.5, y + 0.5, w, h);
        ctx.restore();
      }

      function drawBins() {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < BINS; i++) {
          const b = bins[i], x = binLeft + i * (binW + binGap), y = binTop;
          const active = state === 'filing' && i === done;

          // the fill first, so the wall draws over its edge
          if (b.shown > 0.001) {
            const fh = (binH - 6) * b.shown;
            ctx.fillStyle = 'rgba(126, 214, 224, ' + (0.18 + b.shown * 0.16) + ')';
            ctx.fillRect(x + 3, y + binH - 3 - fh, binW - 6, fh);
          }
          ctx.strokeStyle = active ? 'rgba(169, 234, 241, .85)' : 'rgba(126, 214, 224, .3)';
          ctx.lineWidth = 1;
          ctx.beginPath();                       // three walls: the mouth stays open at the top
          ctx.moveTo(x + 0.5, y + 0.5);
          ctx.lineTo(x + 0.5, y + binH - 0.5);
          ctx.lineTo(x + binW - 0.5, y + binH - 0.5);
          ctx.lineTo(x + binW - 0.5, y + 0.5);
          ctx.stroke();

          // the lid: two flaps hinged on the outer corners that swing up while numbers fall in
          const ang = b.lid * 1.05;
          ctx.save();
          ctx.strokeStyle = 'rgba(126, 214, 224, ' + (0.32 + b.lid * 0.5) + ')';
          ctx.lineWidth = 1.4;
          for (const side of [-1, 1]) {
            const hx = side < 0 ? x + 0.5 : x + binW - 0.5;   // hinged on its own outer corner
            ctx.save();
            ctx.translate(hx, y + 0.5);
            ctx.rotate(side * ang);                            // the free end swings up, not out
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-side * (binW / 2 - 1), 0); ctx.stroke();
            ctx.restore();
          }
          ctx.restore();

          ctx.fillStyle = '#d3f2f5';
          ctx.globalAlpha = b.fill >= 1 ? 0.8 : 0.42;
          ctx.font = '400 9px ' + FONT;
          ctx.fillText('0' + (i + 1), x + binW / 2, y + binH - 10);
          ctx.globalAlpha = 1;
        }
      }

      function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        binTop = H - binH - 4;
        update(now, dt);
        draw(now);
      }

      measure();
      reset();
      const ro = new ResizeObserver(measure);
      ro.observe(cv);
      raf = requestAnimationFrame(frame);

      return {
        destroy() {
          cancelAnimationFrame(raf);
          ro.disconnect();
          cv.removeEventListener('pointerdown', onDown);
          cv.removeEventListener('pointermove', onMove);
          cv.removeEventListener('pointerup', onUp);
          cv.removeEventListener('pointercancel', onUp);
          cv.removeEventListener('pointerleave', onLeave);
        }
      };
    }
  });
})();
