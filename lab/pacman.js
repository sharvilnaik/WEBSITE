(function () {
  const css = `
/* Loading Bar, after Pac-Man — the cabinet, not a dark app card:
   true arcade black, the maze palette already used on the canvas, and the HUD set in the machine's own lettering. */
.x-pacman {
  --pix: "Press Start 2P", "Courier New", monospace;
  --pac: #ffd23f;      /* Pac yellow */
  --pellet: #ffb897;   /* pellet peach: the HUD's reading colour */
  --dim: rgba(255, 184, 151, 0.52);
  --maze: #3a4bff;
  --ghost: #ff5a6e;
  background: #000;
  /* the screen's own edge: a maze-blue rim and the CRT's glow, so true black still reads as a tile on a black page */
  box-shadow: inset 0 0 0 1px rgba(58, 75, 255, 0.3), inset 0 0 90px rgba(33, 33, 222, 0.09);
  font-family: var(--body);
  color: var(--pellet);
}
.x-pacman .xp-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; gap: 20px; padding: 0 var(--xp-pad, 32px); }
.x-pacman .xp-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
.x-pacman .xp-file { display: grid; gap: 8px; min-width: 0; }
/* the pixel face carries no lowercase authority — the HUD is set in caps because the machine's is */
.x-pacman .xp-name { font: 400 9px/1.2 var(--pix); letter-spacing: 0; text-transform: uppercase; color: var(--pellet); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.x-pacman .xp-size { font: 400 7px/1.2 var(--pix); letter-spacing: 0; text-transform: uppercase; color: var(--dim); white-space: nowrap; }
.x-pacman .xp-pct { font: 400 24px/1 var(--pix); letter-spacing: 0; color: var(--pac); transition: color .3s; }
.x-pacman .xp-pct.is-err { color: var(--ghost); }
.x-pacman .xp-pct.is-done { color: var(--pac); }
.x-pacman canvas { display: block; width: 100%; height: 64px; }
.x-pacman .xp-foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 40px; }
.x-pacman .xp-status { font: 400 7px/1.6 var(--pix); letter-spacing: 0; text-transform: uppercase; color: var(--dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .3s; }
.x-pacman .xp-status.is-err { color: var(--ghost); }
.x-pacman .xp-actions { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.x-pacman button { cursor: pointer; border: 0; animation: xp-in .32s cubic-bezier(.2,1.4,.4,1) both; }
.x-pacman button[hidden] { display: none; }
/* a cabinet button: square, maze-blue walled, and it travels down when pressed rather than shrinking */
.x-pacman .xp-primary {
  font: 400 8px/1 var(--pix); letter-spacing: 0; text-transform: uppercase;
  background: var(--pac); color: #17140a; border: 2px solid var(--maze); border-radius: 2px;
  padding: 11px 14px; box-shadow: 0 3px 0 var(--maze);
  transition: background .2s, transform .12s ease, box-shadow .12s ease;
}
.x-pacman .xp-primary:hover { background: #ffdd66; }
.x-pacman .xp-primary:active { transform: translateY(3px); box-shadow: 0 0 0 var(--maze); }
.x-pacman .xp-primary.is-done, .x-pacman .xp-primary.is-done:hover { display: inline-flex; align-items: center; gap: 8px; background: #1f5f3f; color: #b7f2cf; border-color: #1f5f3f; box-shadow: 0 3px 0 #123a26; cursor: default; transform: none; opacity: 1; }
.x-pacman .xp-primary.is-done svg { width: 13px; height: 13px; flex: none; }
/* the secondary action has to look pressable on its own: it is walled like the primary,
   just in the ghost's colour and unfilled, and it fills in on hover so there is no doubt */
.x-pacman .xp-text {
  font: 400 7px/1 var(--pix); letter-spacing: 0; text-transform: uppercase;
  background: none; color: var(--ghost); border: 2px solid var(--ghost); border-radius: 2px;
  padding: 10px 12px; box-shadow: 0 3px 0 rgba(255, 90, 110, 0.42);
  transition: background .18s ease, color .18s ease, transform .12s ease, box-shadow .12s ease;
}
.x-pacman .xp-text:hover { background: var(--ghost); color: #14060a; }
.x-pacman .xp-text:active { transform: translateY(3px); box-shadow: 0 0 0 rgba(255, 90, 110, 0.42); }
.x-pacman button:focus-visible { outline: 2px solid var(--pac); outline-offset: 3px; }
@keyframes xp-in { from { opacity: 0; transform: translateY(6px) scale(.96); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .x-pacman button { animation: none; } .x-pacman .xp-primary:active, .x-pacman .xp-text:active { transform: none; } }
`;
  const XP_CHECK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.6" stroke-width="1.5"/><path d="M5.2 8.3l2 2 3.7-4.3"/></svg>';
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  const TOTAL_MB = 48.0;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const backOut = (t) => { const c = 1.9; t -= 1; return t * t * ((c + 1) * t + c) + 1; };

  window.EXPERIMENTS.push({
    id: 'pacman',
    name: 'Loading Bar',
    source: 'Pac-Man',
    hint: 'Start the download, then try simulating an error before it finishes.',
    mount(stage) {
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      let wakaT = 0;
      const R = !!window.REDUCED;
      stage.innerHTML = `
        <div class="xp-wrap">
          <div class="xp-head">
            <div class="xp-file"><span class="xp-name">report-2026.zip</span><span class="xp-size">0.0 of 48.0 MB</span></div>
            <div class="xp-pct" aria-live="off">0%</div>
          </div>
          <canvas role="progressbar" aria-label="Download progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></canvas>
          <div class="xp-foot">
            <span class="xp-status">Ready</span>
            <div class="xp-actions">
              <button type="button" class="xp-text" hidden>Simulate error</button>
              <button type="button" class="xp-primary">Start download</button>
            </div>
          </div>
        </div>`;
      const q = (sel) => stage.querySelector(sel);
      const wrap = q('.xp-wrap'), cv = q('canvas'), ctx = cv.getContext('2d');
      const elSize = q('.xp-size'), elPct = q('.xp-pct'), elStatus = q('.xp-status');
      const btnPrimary = q('.xp-primary'), btnError = q('.xp-text');

      const H = 64, CY = 32, PR = 12;
      let W = 300, dpr = 1, sx = 0, ex = 0, pellets = [];

      function measure() {
        const sw = stage.clientWidth || 360;
        const pad = sw < 420 ? 20 : 32;
        wrap.style.setProperty('--xp-pad', pad + 'px');
        W = Math.max(200, sw - pad * 2);
        dpr = Math.min(2, window.devicePixelRatio || 1);
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        sx = 26; ex = W - 24;
        const first = sx + 20, last = ex - 20;
        const count = Math.max(2, Math.round((last - first) / 15));
        pellets = [];
        for (let i = 0; i <= count; i++) pellets.push(first + (last - first) * i / count);
      }
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(stage);

      // state
      let state = 'idle';
      let stateT = 0, p = 0, shown = 0, speed = 0, paused = false, segEnd = 0;
      let phase = 0, lastPacX = 0;
      let ghostOn = false, gx = -30, gv = 0;
      let spawnT = performance.now();
      let raf = 0, last = 0, statusT = 0;

      const STATE_SFX = { run: 'click', chase: 'alarm', dying: 'fall', win: 'win' };
      function setState(next, now) { state = next; stateT = now; syncUI(now); if (STATE_SFX[next]) sfx(STATE_SFX[next]); }

      function syncUI() {
        const hadFocus = stage.contains(document.activeElement);
        btnError.hidden = state !== 'run';
        btnPrimary.hidden = !(state === 'idle' || state === 'error' || state === 'done');
        btnPrimary.disabled = state === 'done';
        btnPrimary.classList.toggle('is-done', state === 'done');
        if (state === 'done') btnPrimary.innerHTML = XP_CHECK + '<span>Downloaded</span>';
        else btnPrimary.textContent = state === 'error' ? 'Retry' : 'Start download';
        elStatus.classList.toggle('is-err', state === 'error' || state === 'chase' || state === 'dying');
        elPct.classList.toggle('is-err', state === 'error');
        elPct.classList.toggle('is-done', state === 'done' || state === 'win');
        if (state === 'idle') elStatus.textContent = 'Ready · 48.0 MB';
        if (state === 'run') elStatus.textContent = 'Connecting';
        if (state === 'chase' || state === 'dying') elStatus.textContent = 'Connection unstable';
        if (state === 'error') elStatus.textContent = 'Connection lost';
        if (state === 'win') elStatus.textContent = 'Verifying';
        if (state === 'done') elStatus.textContent = 'Done · saved to Downloads';
        if (hadFocus && !stage.contains(document.activeElement)) {
          if (!btnPrimary.hidden) btnPrimary.focus();
          else if (!btnError.hidden) btnError.focus();
        }
        // restart the entrance animation on visible buttons
        [btnPrimary, btnError].forEach((b) => { if (!b.hidden) { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; } });
      }

      function resetRun(now) {
        p = 0; shown = 0; speed = 0; paused = false; segEnd = now + rand(500, 900);
        speed = rand(0.16, 0.34);
        ghostOn = false; gx = -30; gv = 0;
        spawnT = now;
      }

      btnPrimary.addEventListener('click', () => {
        const now = performance.now();
        if (state === 'idle' || state === 'error' || state === 'done') { resetRun(now); setState('run', now); }
      });
      btnError.addEventListener('click', () => {
        const now = performance.now();
        if (state !== 'run') return;
        if (!ghostOn) { ghostOn = true; gx = -30; }
        gv = 40;
        setState('chase', now);
      });

      function pacX() { return sx + shown * (ex - sx); }

      function update(now, dt) {
        if (state === 'idle') { phase += dt * 7; return; }

        if (state === 'run') {
          if (now > segEnd) {
            if (!paused && p > 0.04 && p < 0.95 && Math.random() < 0.62) {
              paused = true;
              segEnd = now + (Math.random() < 0.18 ? rand(900, 1300) : rand(220, 650));
            } else {
              paused = false;
              speed = Math.random() < 0.25 ? rand(0.36, 0.55) : rand(0.1, 0.3);
              segEnd = now + rand(320, 900);
            }
          }
          if (!paused) p = Math.min(1, p + speed * dt);
          shown += (p - shown) * (1 - Math.exp(-dt * 9));
          if (p >= 1 && shown > 0.997) { shown = 1; setState('win', now); }
          if (now - statusT > 260 && state === 'run') {
            statusT = now;
            elStatus.textContent = paused ? 'Waiting for server' : (speed * TOTAL_MB * (0.92 + Math.random() * 0.16)).toFixed(1) + ' MB/s';
          }
        }

        const px = pacX();
        const moved = Math.abs(px - lastPacX);
        lastPacX = px;

        if (state === 'run') {
          phase += moved * 0.32 + dt * 1.2;
          if (moved > 0.15 && now - wakaT > 170) { wakaT = now; sfx('waka'); }
          if (!ghostOn && shown > 0.05) { ghostOn = true; gx = -30; }
          if (ghostOn) {
            const target = px - 60;
            gx += (target - gx) * (1 - Math.exp(-dt * 2.4));
          }
        } else if (state === 'chase') {
          phase += dt * 5;
          gv += (R ? 5000 : 1100) * dt;
          gx += gv * dt;
          if (gx >= px - PR * 1.3) { gx = px - PR * 1.3; setState('dying', now); }
        } else if (state === 'dying') {
          const t = now - stateT;
          if (t > (R ? 700 : 2000)) setState('error', now);
        } else if (state === 'win') {
          const t = now - stateT;
          if (t < 420) phase += dt * 16;
          if (t > 180) { gv -= 1400 * dt; gv = Math.max(gv, -300); gx += gv * dt; }
          else gv = 0;
          if (t > (R ? 500 : 1100)) setState('done', now);
        } else if (state === 'done') {
          phase += dt * 2.2;
        }
      }

      function rr(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      function drawPac(x, y, mouth, dir) {
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, PR, dir + mouth, dir + TAU - mouth);
        ctx.closePath();
        ctx.fill();
      }

      function drawGhost(x, y, now, fright, look, flicker) {
        const r = PR;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = fright ? (flicker ? '#e9ecff' : '#3144ff') : '#ff5a6e';
        ctx.beginPath();
        const top = -r * 0.1;
        ctx.arc(0, top, r, Math.PI, 0);
        const base = r * 0.92, amp = r * 0.16, ph = now * 0.014;
        ctx.lineTo(r, base);
        for (let i = r; i >= -r; i -= 1) ctx.lineTo(i, base - amp * (1 + Math.sin((i / r) * Math.PI * 2 + ph)));
        ctx.lineTo(-r, top);
        ctx.closePath();
        ctx.fill();
        if (fright) {
          ctx.fillStyle = flicker ? '#ff5a6e' : '#ffc7b8';
          ctx.fillRect(-r * 0.42, -r * 0.34, r * 0.24, r * 0.24);
          ctx.fillRect(r * 0.18, -r * 0.34, r * 0.24, r * 0.24);
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (let k = 0; k <= 6; k++) {
            const mx = -r * 0.55 + k * (r * 1.1 / 6), my = r * 0.34 + (k % 2 ? -r * 0.12 : 0);
            if (k === 0) ctx.moveTo(mx, my); else ctx.lineTo(mx, my);
          }
          ctx.stroke();
        } else {
          for (const side of [-1, 1]) {
            const ex0 = side * r * 0.36, ey0 = -r * 0.2;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(ex0 + look * r * 0.06, ey0, r * 0.25, r * 0.32, 0, 0, TAU);
            ctx.fill();
            ctx.fillStyle = '#2438ff';
            ctx.beginPath();
            ctx.arc(ex0 + look * r * 0.16, ey0 + r * 0.05, r * 0.13, 0, TAU);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      function draw(now) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        // maze walls
        let wall = '#3a4bff';
        if (state === 'win' && !R) {
          const t = now - stateT;
          if (t > 120 && t < 1000 && Math.floor((t - 120) / 110) % 2 === 0) wall = '#e9ecff';
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = wall;
        ctx.globalAlpha = 0.95;
        rr(1.5, 1.5, W - 3, H - 3, 17);
        ctx.stroke();
        ctx.globalAlpha = 0.42;
        rr(7.5, 7.5, W - 15, H - 15, 11);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.save();
        rr(9, 9, W - 18, H - 18, 10);
        ctx.clip();

        const px = pacX();
        const eatenTo = (state === 'idle') ? -1 : px + 2;

        // pellets
        ctx.fillStyle = '#ffb8ae';
        for (let i = 0; i < pellets.length; i++) {
          const x = pellets[i];
          if (x < eatenTo) continue;
          let k = 1;
          if (!R) k = backOut(clamp((now - spawnT - i * 16) / 260, 0, 1));
          if (k <= 0.01) continue;
          const sz = 4 * k;
          ctx.fillRect(x - sz / 2, CY - sz / 2, sz, sz);
        }

        // power pellet
        const powerEaten = state === 'win' || state === 'done';
        if (!powerEaten) {
          const near = shown > 0.85 && (state === 'run');
          const blinkRate = near ? 90 : 220;
          if (R || Math.floor(now / blinkRate) % 2 === 0) {
            ctx.beginPath();
            ctx.arc(ex, CY, 6.5, 0, TAU);
            ctx.fill();
          }
        } else if (state === 'win' && !R) {
          const t = now - stateT;
          if (t < 450) {
            ctx.strokeStyle = 'rgba(255, 210, 63,' + (1 - t / 450) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ex, CY, 8 + t * 0.09, 0, TAU);
            ctx.stroke();
          }
        }

        // ghost
        if (ghostOn && (state === 'run' || state === 'chase' || (state === 'dying' && now - stateT < (R ? 150 : 420)) || state === 'win')) {
          const fright = state === 'win';
          const flicker = fright && (now - stateT) > 700 && Math.floor(now / 120) % 2 === 0;
          drawGhost(gx, CY, now, fright, fright ? -1 : 1, flicker);
        }

        // pac-man
        if (state === 'dying') {
          const t = now - stateT;
          const hold = R ? 150 : 420, dur = R ? 350 : 1150;
          if (t < hold) {
            drawPac(px, CY, 0.05 + 0.6 * Math.abs(Math.sin(phase)), 0);
          } else if (t < hold + dur) {
            const a = clamp((t - hold) / dur, 0, 1);
            const ang = 0.05 + a * (Math.PI - 0.05);
            ctx.fillStyle = '#ffd23f';
            ctx.beginPath();
            ctx.moveTo(px, CY + a * 3);
            ctx.arc(px, CY + a * 3, PR * (1 - a * 0.1), -Math.PI / 2 + ang, -Math.PI / 2 + TAU - ang);
            ctx.closePath();
            ctx.fill();
          } else if (!R && t < hold + dur + 320) {
            const b = (t - hold - dur) / 320;
            ctx.strokeStyle = 'rgba(255, 210, 63,' + (1 - b) + ')';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
              const an = i / 8 * TAU;
              const r0 = 4 + b * 6, r1 = 8 + b * 10;
              ctx.moveTo(px + Math.cos(an) * r0, CY + Math.sin(an) * r0);
              ctx.lineTo(px + Math.cos(an) * r1, CY + Math.sin(an) * r1);
            }
            ctx.stroke();
          }
        } else if (state !== 'error') {
          let mouth;
          if (state === 'done') mouth = 0.22 + 0.12 * Math.sin(phase);
          else if (state === 'win' && now - stateT > 420) mouth = 0.3;
          else mouth = 0.04 + 0.7 * Math.abs(Math.sin(phase));
          drawPac(px, CY, mouth, 0);
        }
        ctx.restore();
      }

      let lastPct = -1, lastMb = '';
      function syncText() {
        const pct = Math.floor(shown * 100 + 1e-6);
        if (pct !== lastPct) {
          lastPct = pct;
          elPct.textContent = pct + '%';
          cv.setAttribute('aria-valuenow', String(pct));
        }
        const mb = (shown * TOTAL_MB).toFixed(1) + ' of ' + TOTAL_MB.toFixed(1) + ' MB';
        if (mb !== lastMb) { lastMb = mb; elSize.textContent = mb; }
      }

      function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        update(now, dt);
        draw(now);
        syncText();
      }
      syncUI();
      raf = requestAnimationFrame(frame);

      return {
        destroy() {
          cancelAnimationFrame(raf);
          ro.disconnect();
        }
      };
    }
  });
})();
