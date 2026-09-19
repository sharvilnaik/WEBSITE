// Hold to Launch: hold the key down through the count. Let go early and the pad safes itself.
// The console is the one from a launch room: phosphor clock, three gauges coming up to pressure, one lit key.
(function () {
  const css = `
.x-launch{
  --green:#6BF0A6;--dim:#2E7A55;--amber:#FFB020;--red:#FF4438;--panel:#1B1E20;--metal:#3A4045;--stencil:#8C949B;
  font-family:var(--body);color:#DDE3E6;
  background:linear-gradient(180deg,#15181A 0%,#101315 62%,#0B0D0E 100%)}
.x-launch .lx-wrap, .x-launch .lx-wrap *{box-sizing:border-box}
.x-launch .lx-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:9px;padding:14px 16px}

/* the clock, and the word for what the pad is doing */
.x-launch .lx-top{display:flex;align-items:center;gap:10px}
.x-launch .lx-clock{font:400 26px/1 var(--body);letter-spacing:.01em;font-variant-numeric:tabular-nums;color:var(--green);
  text-shadow:0 0 12px rgba(107,240,166,.45);transition:color .2s ease,text-shadow .2s ease}
.x-launch.is-abort .lx-clock{color:var(--red);text-shadow:0 0 12px rgba(255,68,56,.45)}
.x-launch .lx-state{margin-left:auto;display:flex;align-items:center;gap:7px;font:400 11px/14px var(--body);
  text-transform:uppercase;letter-spacing:.08em;color:var(--stencil);white-space:nowrap}
.x-launch .lx-lamp{width:9px;height:9px;border-radius:50%;background:#2A2F33;box-shadow:inset 0 0 0 1px #454C52;transition:background-color .2s ease,box-shadow .2s ease}
.x-launch.is-hold .lx-lamp{background:var(--amber);box-shadow:0 0 9px rgba(255,176,32,.8)}
.x-launch.is-abort .lx-lamp{background:var(--red);box-shadow:0 0 9px rgba(255,68,56,.8)}
.x-launch.is-fly .lx-lamp, .x-launch.is-done .lx-lamp{background:var(--green);box-shadow:0 0 9px rgba(107,240,166,.8)}

/* the window onto the pad */
.x-launch .lx-sky{position:relative;flex:1;min-height:0;border-radius:8px;overflow:hidden;background:#07090C;
  box-shadow:inset 0 0 0 1px #2A3035}
.x-launch .lx-sky canvas{position:absolute;inset:0;width:100%;height:100%;display:block}

/* three needles coming up to pressure */
.x-launch .lx-gauges{flex:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.x-launch .lx-g{display:grid;gap:4px}
.x-launch .lx-g span{font:400 9px/11px var(--body);text-transform:uppercase;letter-spacing:.09em;color:var(--stencil)}
.x-launch .lx-bar{position:relative;height:4px;border-radius:2px;background:#22272B;overflow:hidden}
.x-launch .lx-bar i{position:absolute;left:0;top:0;bottom:0;width:0%;border-radius:2px;background:linear-gradient(90deg,var(--dim),var(--green))}
.x-launch.is-abort .lx-bar i{background:linear-gradient(90deg,#7A2A24,var(--red))}

/* one key, held down with a thumb */
.x-launch .lx-foot{flex:none;display:flex;align-items:stretch;gap:8px;height:52px}
.x-launch .lx-key{flex:1;position:relative;border:0;padding:0;border-radius:9px;cursor:pointer;outline:none;
  -webkit-tap-highlight-color:transparent;touch-action:none;-webkit-user-select:none;user-select:none;
  background:linear-gradient(180deg,#43494F,#2B3035);box-shadow:0 4px 0 #171A1C,0 8px 14px rgba(0,0,0,.5);
  font:400 13px/1 var(--body);text-transform:uppercase;letter-spacing:.1em;color:#0F1214;
  transition:transform .07s ease,box-shadow .07s ease}
.x-launch .lx-face{position:absolute;inset:4px;border-radius:6px;display:grid;place-items:center;
  background:linear-gradient(180deg,#C8922E,#A06F16);box-shadow:inset 0 1px 0 rgba(255,255,255,.35);
  transition:background .2s ease,color .2s ease}
.x-launch.is-hold .lx-face{background:linear-gradient(180deg,#FFD37A,#FFB020);box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 18px rgba(255,176,32,.5)}
.x-launch.is-abort .lx-face{background:linear-gradient(180deg,#FF7368,#E0291C);color:#1A0B09}
.x-launch.is-fly .lx-face, .x-launch.is-done .lx-face{background:linear-gradient(180deg,#8CFFC0,#2FCE7C);color:#08170F}
.x-launch .lx-key:active, .x-launch.is-hold .lx-key{transform:translateY(4px);box-shadow:0 0 0 #171A1C,0 3px 8px rgba(0,0,0,.45)}
.x-launch .lx-key:focus-visible{box-shadow:0 4px 0 #171A1C,0 0 0 3px #0B0D0E,0 0 0 6px var(--amber)}
.x-launch .lx-reset{flex:none;width:46px;display:grid;place-items:center;padding:0;border:1px solid var(--metal);border-radius:9px;
  background:#1B1E20;color:var(--stencil);cursor:pointer;transition:color .2s ease,border-color .2s ease,transform .2s ease}
.x-launch .lx-reset svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.x-launch .lx-reset:hover{color:#DDE3E6;border-color:#5A636A;transform:rotate(-40deg)}
.x-launch .lx-reset:focus-visible{outline:2px solid var(--amber);outline-offset:2px}

/* what the room is told, under the key */
.x-launch .lx-msg{position:absolute;left:16px;right:16px;bottom:74px;margin:0;text-align:center;
  font:400 12px/16px var(--body);color:var(--stencil);pointer-events:none}
@media (prefers-reduced-motion: reduce){.x-launch .lx-key{transition:none}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const RESET_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 12a7.4 7.4 0 1 1-2.2-5.25"/><path d="M13.2 6.9 17.2 6.75 17.4 2.7"/></svg>';

  window.EXPERIMENTS.push({
    id: 'launch', name: 'Hold to Launch', source: 'Apollo 13',
    hint: 'Hold the key through the count. Let go early and the pad safes itself.',
    mount(stage) {
      const sfx = window.LAB_SFX;
      const R = !!window.REDUCED;
      const COUNT = R ? 3 : 5;               // seconds you have to keep your thumb down

      stage.innerHTML =
        '<div class="lx-wrap">' +
          '<div class="lx-top">' +
            '<span class="lx-clock">T-00:0' + COUNT + '.0</span>' +
            '<span class="lx-state"><i class="lx-lamp"></i><b class="lx-word">Ready</b></span>' +
          '</div>' +
          '<div class="lx-sky"><canvas aria-hidden="true"></canvas></div>' +
          '<div class="lx-gauges" aria-hidden="true">' +
            '<div class="lx-g"><span>Thrust</span><div class="lx-bar"><i></i></div></div>' +
            '<div class="lx-g"><span>LOX</span><div class="lx-bar"><i></i></div></div>' +
            '<div class="lx-g"><span>Guidance</span><div class="lx-bar"><i></i></div></div>' +
          '</div>' +
          '<p class="lx-msg" role="status" aria-live="polite">Hold the key to start the count.</p>' +
          '<div class="lx-foot">' +
            '<button class="lx-key" type="button" aria-label="Hold to launch"><span class="lx-face">Hold</span></button>' +
            '<button class="lx-reset" type="button" aria-label="Reset the pad" title="Reset">' + RESET_ICON + '</button>' +
          '</div>' +
        '</div>';

      const $ = s => stage.querySelector(s);
      const skyEl = $('.lx-sky'), canvas = $('canvas'), g = canvas.getContext('2d');
      const clockEl = $('.lx-clock'), wordEl = $('.lx-word'), msgEl = $('.lx-msg');
      const keyEl = $('.lx-key'), faceEl = $('.lx-face'), resetEl = $('.lx-reset');
      const bars = [...stage.querySelectorAll('.lx-bar i')];

      // ---------- the pad ----------
      let W = 300, H = 150, dpr = 1;
      const stars = [];
      function size() {
        W = skyEl.clientWidth || 300; H = skyEl.clientHeight || 150;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        stars.length = 0;
        for (let i = 0; i < 40; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * 0.7, r: Math.random() > 0.85 ? 1.4 : 0.8, o: 0.25 + Math.random() * 0.6 });
      }
      size();
      const ro = new ResizeObserver(size); ro.observe(skyEl);

      let phase = 'idle', t = 0;             // idle | hold | abort | fly | done
      let held = false, thrust = 0, rise = 0, vel = 0, shake = 0, flash = 0;
      let lastBeep = -1;
      const puffs = [];

      // ---------- sound ----------
      let A = null;
      function ensureAudio() {
        if (A) return A;
        const a = sfx && sfx.audio && sfx.audio();
        if (!a) return null;
        const { ctx } = a, now = ctx.currentTime;
        const bus = ctx.createGain(); bus.gain.value = 0.9; bus.connect(a.out);
        // the pad's rumble: noise held open behind a lowpass, opened by thrust
        const src = ctx.createBufferSource(); src.buffer = a.noise; src.loop = true;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160; lp.Q.value = 0.6;
        const rg = ctx.createGain(); rg.gain.value = 0.0001;
        src.connect(lp); lp.connect(rg); rg.connect(bus); src.start(now);
        A = { ctx, bus, src, lp, rg };
        return A;
      }
      function dropAudio() {
        if (!A) return;
        const a = A; A = null;
        const now = a.ctx.currentTime;
        a.rg.gain.setTargetAtTime(0.0001, now, 0.06);
        try { a.src.stop(now + 0.4); } catch (e) {}
        setTimeout(() => { try { a.bus.disconnect(); } catch (e) {} }, 600);
      }
      // the klaxon the room hears when a hold is broken
      function klaxon() {
        if (!ensureAudio()) return;
        const { ctx, bus } = A, now = ctx.currentTime;
        for (let i = 0; i < 2; i++) {
          const o = ctx.createOscillator(), gg = ctx.createGain();
          o.type = 'square'; o.frequency.setValueAtTime(i ? 300 : 380, now + i * 0.22);
          gg.gain.setValueAtTime(0.0001, now + i * 0.22);
          gg.gain.exponentialRampToValueAtTime(0.09, now + i * 0.22 + 0.01);
          gg.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.22 + 0.2);
          o.connect(gg); gg.connect(bus); o.start(now + i * 0.22); o.stop(now + i * 0.22 + 0.24);
        }
      }
      const play = (n, d) => sfx && sfx.play(n, d);
      const onSound = on => { if (!on) dropAudio(); else if (phase === 'hold' || phase === 'fly') ensureAudio(); };
      sfx && sfx.onChange && sfx.onChange(onSound);

      // ---------- states ----------
      function setPhase(p) {
        phase = p; t = 0;
        stage.classList.remove('is-hold', 'is-abort', 'is-fly', 'is-done');
        if (p !== 'idle') stage.classList.add('is-' + p);
        if (p === 'idle') { wordEl.textContent = 'Ready'; faceEl.textContent = 'Hold'; msgEl.textContent = 'Hold the key to start the count.'; }
        if (p === 'hold') { wordEl.textContent = 'Holding'; faceEl.textContent = 'Hold'; msgEl.textContent = 'Keep it down.'; }
        if (p === 'abort') { wordEl.textContent = 'Abort'; faceEl.textContent = 'Abort'; }
        if (p === 'fly') { wordEl.textContent = 'Liftoff'; faceEl.textContent = 'Away'; msgEl.textContent = 'Tower cleared.'; }
        if (p === 'done') { wordEl.textContent = 'Away'; faceEl.textContent = 'Again'; msgEl.textContent = 'Good ascent. Hold again to fly another.'; }
      }
      function reset() {
        held = false; thrust = 0; rise = 0; vel = 0; shake = 0; flash = 0; lastBeep = -1;
        puffs.length = 0;
        setPhase('idle');
        clock(COUNT);
        play('clunk');
      }
      function clock(secs) {
        const s = Math.max(0, secs), sign = phase === 'fly' || phase === 'done' ? '+' : '-';
        const m = Math.floor(s / 60), r = s - m * 60;
        clockEl.textContent = 'T' + sign + '00:' + String(Math.floor(r)).padStart(2, '0') + '.' + Math.floor((r % 1) * 10);
      }

      function down() {
        if (phase === 'fly') return;
        if (phase === 'abort' || phase === 'done') reset();
        if (held) return;
        held = true; ensureAudio(); play('click');
        if (phase === 'idle') { setPhase('hold'); lastBeep = -1; }
      }
      function up() {
        if (!held) return;
        held = false;
        if (phase !== 'hold') return;
        // let go early and the pad safes itself
        const at = Math.max(0, COUNT - t);
        setPhase('abort');
        klaxon(); play('bad');
        msgEl.textContent = 'Hold broken at T-' + at.toFixed(1) + '. Pad safed.';
      }

      // ---------- the loop ----------
      function step(dt) {
        t += dt;
        if (phase === 'hold') {
          thrust = clamp(thrust + dt * 1.4, 0, 1);
          const left = COUNT - t;
          clock(left);
          const beep = Math.ceil(left);
          if (beep !== lastBeep && beep >= 0) { lastBeep = beep; play(beep <= 2 ? 'click' : 'tick'); }
          if (left <= 0) {
            setPhase('fly'); flash = 1; vel = 8;
            play('swoosh'); play('clunk', 40);
          }
        } else if (phase === 'abort') {
          thrust = Math.max(0, thrust - dt * 2.2);
          if (t > 1.6) { setPhase('idle'); clock(COUNT); }
        } else if (phase === 'fly') {
          thrust = 1;
          vel += dt * 90;                    // it keeps building the whole way up
          rise += vel * dt;
          clock(t);
          if (rise > H * 1.5) { setPhase('done'); clock(t); }
        } else if (phase === 'done') {
          thrust = Math.max(0, thrust - dt * 0.6);
        } else {
          thrust = Math.max(0, thrust - dt * 1.6);
        }

        shake = R ? 0 : (phase === 'hold' ? thrust * 1.1 : phase === 'fly' ? 2.2 : 0);
        flash *= Math.exp(-dt * 4);

        // smoke off the pad while the engines are lit
        const rate = phase === 'fly' ? 5 : phase === 'hold' ? thrust * 2.2 : 0;
        if (!R && rate > 0 && Math.random() < rate * dt * 12) {
          const base = H * 0.86;
          puffs.push({ x: W * 0.5 + (Math.random() - 0.5) * 26, y: base, r: 6 + Math.random() * 10,
            vx: (Math.random() - 0.5) * 70, vy: -8 - Math.random() * 18, life: 1 });
        }
        for (let i = puffs.length - 1; i >= 0; i--) {
          const p = puffs[i];
          p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 26; p.life -= dt * 0.5;
          if (p.life <= 0) puffs.splice(i, 1);
        }

        bars[0].style.width = (thrust * 100).toFixed(0) + '%';
        bars[1].style.width = (clamp(thrust * 1.15, 0, 1) * 100).toFixed(0) + '%';
        bars[2].style.width = (clamp(thrust * 0.9 + (phase === 'fly' ? 0.1 : 0), 0, 1) * 100).toFixed(0) + '%';

        if (A) {
          const now = A.ctx.currentTime;
          A.rg.gain.setTargetAtTime(0.0001 + 0.5 * thrust * (phase === 'fly' ? 1 : 0.55), now, 0.08);
          A.lp.frequency.setTargetAtTime(120 + thrust * (phase === 'fly' ? 900 : 260), now, 0.08);
        }
      }

      // ---------- drawing ----------
      function rocket(x, y, h) {
        const w = h * 0.17;
        g.save(); g.translate(x, y);
        // body
        g.fillStyle = '#E8ECEF';
        g.beginPath();
        g.moveTo(0, -h);
        g.lineTo(w * 0.5, -h + w * 1.5);
        g.lineTo(w * 0.5, 0);
        g.lineTo(-w * 0.5, 0);
        g.lineTo(-w * 0.5, -h + w * 1.5);
        g.closePath(); g.fill();
        // the roll pattern
        g.fillStyle = '#1C2226';
        g.fillRect(-w * 0.5, -h * 0.72, w, h * 0.05);
        g.fillRect(-w * 0.5, -h * 0.40, w, h * 0.04);
        g.fillRect(-w * 0.5, -h * 0.16, w * 0.5, h * 0.04);
        // fins
        g.fillStyle = '#C3CBD0';
        g.beginPath(); g.moveTo(-w * 0.5, -h * 0.13); g.lineTo(-w * 1.05, 0); g.lineTo(-w * 0.5, 0); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(w * 0.5, -h * 0.13); g.lineTo(w * 1.05, 0); g.lineTo(w * 0.5, 0); g.closePath(); g.fill();
        g.restore();
      }

      function flame(x, y, h, power) {
        if (power < 0.02) return;
        const len = h * (0.25 + power * 0.9) * (0.85 + Math.random() * 0.3);
        const w = h * 0.1 * (0.8 + power * 0.7);
        const grd = g.createLinearGradient(0, y, 0, y + len);
        grd.addColorStop(0, 'rgba(255,255,236,' + (0.85 * power).toFixed(2) + ')');
        grd.addColorStop(0.35, 'rgba(255,186,66,' + (0.8 * power).toFixed(2) + ')');
        grd.addColorStop(1, 'rgba(255,90,30,0)');
        g.fillStyle = grd;
        g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + w, y); g.lineTo(x, y + len); g.closePath(); g.fill();
      }

      function draw() {
        const sx = shake ? (Math.random() - 0.5) * shake : 0, sy = shake ? (Math.random() - 0.5) * shake : 0;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        // night over the cape
        const sky = g.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#070A0F'); sky.addColorStop(0.72, '#0C131A'); sky.addColorStop(1, '#131A1C');
        g.fillStyle = sky; g.fillRect(0, 0, W, H);
        for (const s of stars) { g.globalAlpha = s.o; g.fillStyle = '#CFE0EA'; g.fillRect(s.x, s.y, s.r, s.r); }
        g.globalAlpha = 1;

        g.translate(sx, sy);
        const ground = H * 0.88, padY = H * 0.86, cx = W * 0.5;
        const hRocket = Math.min(H * 0.6, 108);
        const y = padY - rise;

        // the light the engines throw on the pad
        if (thrust > 0.02) {
          const glow = g.createRadialGradient(cx, padY, 0, cx, padY, W * 0.5);
          glow.addColorStop(0, 'rgba(255,170,70,' + (0.25 * thrust).toFixed(2) + ')');
          glow.addColorStop(1, 'rgba(255,170,70,0)');
          g.fillStyle = glow; g.fillRect(0, 0, W, H);
        }

        // gantry: a lattice beside the stack, with one arm across
        g.strokeStyle = '#39434A'; g.lineWidth = 2;
        const gx = cx - hRocket * 0.42, top = padY - hRocket * 0.95;
        g.beginPath(); g.moveTo(gx, padY); g.lineTo(gx, top); g.moveTo(gx - 9, padY); g.lineTo(gx - 9, top + 6); g.stroke();
        g.lineWidth = 1.2;
        for (let i = 0; i < 7; i++) {
          const y0 = padY - i * ((padY - top) / 7), y1 = y0 - (padY - top) / 7;
          g.beginPath(); g.moveTo(gx - 9, y0); g.lineTo(gx, y1); g.moveTo(gx, y0); g.lineTo(gx - 9, y1); g.stroke();
        }
        g.lineWidth = 2;
        g.beginPath(); g.moveTo(gx, top + 14); g.lineTo(cx - hRocket * 0.1, top + 14); g.stroke();

        // the stack
        rocket(cx, y, hRocket);
        flame(cx, y, hRocket, thrust);

        // smoke, then the ground it rolls across
        for (const p of puffs) {
          g.globalAlpha = clamp(p.life, 0, 1) * 0.45;
          g.fillStyle = '#9AA6AD';
          g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = 1;

        g.fillStyle = '#171D20'; g.fillRect(0, ground, W, H - ground);
        g.fillStyle = '#20282C'; g.fillRect(cx - 34, padY - 3, 68, 5);

        if (flash > 0.01) { g.fillStyle = 'rgba(255,236,190,' + (flash * 0.5).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      let raf = 0, last = performance.now();
      function frame(ts) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
        step(dt); draw();
      }

      // ---------- controls ----------
      const onDown = e => { e.preventDefault(); try { if (e.pointerId != null) keyEl.setPointerCapture(e.pointerId); } catch (err) {} down(); };
      const onUp = () => up();
      const onKeyDown = e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); down(); } };
      const onKeyUp = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); up(); } };
      const onReset = () => reset();
      keyEl.addEventListener('pointerdown', onDown);
      keyEl.addEventListener('pointerup', onUp);
      keyEl.addEventListener('pointercancel', onUp);
      keyEl.addEventListener('lostpointercapture', onUp);
      keyEl.addEventListener('blur', onUp);
      keyEl.addEventListener('keydown', onKeyDown);
      keyEl.addEventListener('keyup', onKeyUp);
      keyEl.addEventListener('contextmenu', e => e.preventDefault());
      resetEl.addEventListener('click', onReset);

      reset();
      raf = requestAnimationFrame(frame);

      return {
        destroy() {
          cancelAnimationFrame(raf); ro.disconnect(); dropAudio();
          sfx && sfx.offChange && sfx.offChange(onSound);
          keyEl.removeEventListener('pointerdown', onDown);
          keyEl.removeEventListener('pointerup', onUp);
          keyEl.removeEventListener('pointercancel', onUp);
          keyEl.removeEventListener('lostpointercapture', onUp);
          keyEl.removeEventListener('blur', onUp);
          keyEl.removeEventListener('keydown', onKeyDown);
          keyEl.removeEventListener('keyup', onKeyUp);
          resetEl.removeEventListener('click', onReset);
        }
      };
    }
  });
})();
