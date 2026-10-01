(function () {
  const css = `
.x-dock{font-family:var(--body);color:#ececf0;background:#06070b}
.x-dock canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.x-dock .dk-hud{position:absolute;left:10px;top:10px;padding:7px 9px 8px;border-radius:9px;background:rgba(6,7,11,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:grid;gap:4px;font-size:12px;line-height:1.2;color:#8d8d97;font-variant-numeric:tabular-nums;opacity:0;transition:opacity .4s ease;pointer-events:none}
.x-dock.dk-live .dk-hud{opacity:1}
.x-dock .dk-hud div{display:flex;justify-content:space-between;gap:14px;min-width:118px}
.x-dock .dk-hud b{font-weight:400;color:#ececf0}
.x-dock .dk-meter{position:relative;height:3px;margin-top:5px;border-radius:3px;background:#2a2d36}
.x-dock .dk-meter::after{content:"";position:absolute;left:50%;top:-3px;width:1px;height:9px;background:#5a5f6b}
.x-dock .dk-dot{position:absolute;top:50%;left:50%;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:#ececf0;transition:background-color .2s ease}
.x-dock .dk-dot.dk-ok{background:#7fd4ff;box-shadow:0 0 8px rgba(127,212,255,.7)}
.x-dock .dk-bottom{position:absolute;left:12px;right:12px;bottom:12px;display:flex;justify-content:center}
.x-dock .dk-toast{display:flex;align-items:center;gap:12px;max-width:100%;box-sizing:border-box;padding:8px 8px 8px 14px;border-radius:12px;
  background:rgba(30,31,38,.82);border:1px solid #36363f;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font-size:13px;line-height:1.3}
.x-dock .dk-msg{flex:1;min-width:0}
.x-dock .dk-btn{flex:none;font:400 13px/1 var(--body);color:#ececf0;background:transparent;border:1px solid rgba(255,255,255,.3);border-radius:999px;height:32px;padding:0 14px;cursor:pointer;transition:border-color .2s ease,background-color .2s ease,transform .12s ease}
.x-dock .dk-btn:hover{border-color:rgba(255,255,255,.7)}
.x-dock .dk-btn:active{transform:scale(.96)}
.x-dock .dk-btn:focus-visible{outline:2px solid #7fd4ff;outline-offset:2px}
.x-dock .dk-spin{width:34px;padding:0;display:grid;place-items:center;touch-action:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
.x-dock .dk-spin svg{width:16px;height:16px;display:block}
.x-dock .dk-spin.dk-held{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.7)}
.x-dock .dk-hide{display:none}
/* nothing has happened yet, so Connect keeps a slow pulse going until it is pressed */
@keyframes dk-call{
  0%,100%{background:rgba(127,212,255,.10);border-color:rgba(127,212,255,.45);box-shadow:0 0 0 0 rgba(127,212,255,0)}
  45%{background:rgba(127,212,255,.30);border-color:rgba(127,212,255,1);box-shadow:0 0 0 6px rgba(127,212,255,.10)}
  75%{background:rgba(127,212,255,.10);border-color:rgba(127,212,255,.45);box-shadow:0 0 0 12px rgba(127,212,255,0)}
}
.x-dock .dk-act.dk-call{animation:dk-call 2.2s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.x-dock .dk-act.dk-call{animation:none;border-color:rgba(127,212,255,.8)}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const TAU = Math.PI * 2, RAD = Math.PI / 180;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const wrap180 = a => ((a + 180) % 360 + 360) % 360 - 180;
  const wrap45 = a => ((a + 45) % 90 + 90) % 90 - 45;
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  const DEVICE = '“Studio headphones”';
  // an A minor pad while you chase the spin, resolving to F major once you're docked
  const TENSE = [110, 164.81, 220, 261.63, 329.63];
  const RESOLVE = [87.31, 130.81, 174.61, 220, 261.63];
  const HARM = [[1, 1], [2, 0.45], [3, 0.2], [4, 0.1]];

  const ICON_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5H4v4"/><path d="M4.6 8.4A8 8 0 1 1 4 12"/></svg>';
  const ICON_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 5h4v4"/><path d="M19.4 8.4A8 8 0 1 0 20 12"/></svg>';

  window.EXPERIMENTS.push({
    id: 'dock', name: 'Dock a Device', source: 'Interstellar',
    hint: 'Dock my Headphones Murph!',
    mount(stage) {
      const sfx = window.LAB_SFX;
      const R = !!window.REDUCED;
      const STATION_SPEED = R ? 144 : 402; // degrees a second; 402 is 67 rpm

      stage.innerHTML =
        '<canvas aria-hidden="true"></canvas>' +
        '<div class="dk-hud" aria-hidden="true"><div>Device <b class="dk-rs"></b></div><div>You <b class="dk-rp"></b></div><div class="dk-meter"><i class="dk-dot"></i></div></div>' +
        '<div class="dk-bottom"><div class="dk-toast">' +
          '<button class="dk-btn dk-spin dk-l dk-hide" type="button" aria-label="Spin anticlockwise, hold">' + ICON_L + '</button>' +
          '<span class="dk-msg" role="status" aria-live="polite"></span>' +
          '<button class="dk-btn dk-spin dk-r dk-hide" type="button" aria-label="Spin clockwise, hold">' + ICON_R + '</button>' +
          '<button class="dk-btn dk-act" type="button">Connect</button>' +
        '</div></div>';

      const $ = s => stage.querySelector(s);
      const canvas = $('canvas'), g = canvas.getContext('2d');
      const msg = $('.dk-msg'), act = $('.dk-act'), btnL = $('.dk-l'), btnR = $('.dk-r');
      let touched = false;   // the Connect pulse is only for someone who hasn't pressed it yet
      const rsEl = $('.dk-rs'), rpEl = $('.dk-rp'), dot = $('.dk-dot');

      // ---------- world ----------
      let W = 350, H = 320, S = 130, cx = 175, cy = 150;
      const stars = [];
      function size() {
        W = stage.clientWidth || 350; H = stage.clientHeight || 320;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        S = Math.min(W * 0.95, H - 56) * 0.4; cx = W / 2; cy = (H - 52) / 2 + 8;
        stars.length = 0;
        const r = rng(7), diag = Math.hypot(W, H) * 0.6;
        for (let i = 0; i < 170; i++) stars.push({ a: r() * TAU, d: Math.sqrt(r()) * diag, s: 0.4 + r() * 1.1, o: 0.25 + r() * 0.75 });
      }
      size();
      const ro = new ResizeObserver(size); ro.observe(stage);

      // the module pieces stay together here; broken stays 0 for a device that is intact
      const pieces = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([qx, qy], i) => ({ qx, qy, dx: qx * 0.5 + (i % 2 ? 0.2 : -0.15), dy: -1 - i * 0.25, spin: (i % 2 ? 1 : -1) * (40 + i * 25) }));
      const LOST = 7;

      let phase = 'deleted', pt = 0;          // phase and seconds spent in it
      let thS = 0, wS = STATION_SPEED;         // station angle and speed (deg, deg/s)
      let thP = 0, wP = 0;                     // Ranger angle and speed
      let locked = false, camHold = 0;         // camera rides with the Ranger once it arrives
      let broken = 0, rangerIn = 0, rangerSc = 2.4, near = 0, alignT = 0, flash = 0;
      let thrust = 0, dragPull = 0;
      const keys = { l: false, r: false }, held = { l: false, r: false };
      const puffs = [];

      // ---------- sound ----------
      let A = null;
      function ensureAudio() {
        if (A) return A;
        const a = sfx && sfx.audio();
        if (!a) return null;
        const { ctx } = a, t = ctx.currentTime;
        const bus = ctx.createGain(); bus.gain.value = 0.9; bus.connect(a.out);
        // the room tone of space: two low sines beating slowly
        const drone = ctx.createGain(); drone.gain.value = 0.0001; drone.connect(bus);
        const dl = ctx.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 260; dl.connect(drone);
        const dOsc = [55, 55.35].map(f => { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(dl); o.start(t); return o; });
        // the organ
        const pad = ctx.createGain(); pad.gain.value = 0.0001;
        const pf = ctx.createBiquadFilter(); pf.type = 'lowpass'; pf.frequency.value = 500; pf.Q.value = 0.4;
        pad.connect(pf); pf.connect(bus);
        const voices = TENSE.map(f => HARM.map(([h, v]) => {
          const o = ctx.createOscillator(), og = ctx.createGain();
          o.frequency.value = f * h; og.gain.value = v * 0.16; o.connect(og); og.connect(pad); o.start(t);
          return { o, h };
        }));
        // thrusters: looped noise through a band
        const thr = ctx.createBufferSource(); thr.buffer = a.noise; thr.loop = true;
        const tf = ctx.createBiquadFilter(); tf.type = 'bandpass'; tf.frequency.value = 900; tf.Q.value = 0.7;
        const tg = ctx.createGain(); tg.gain.value = 0.0001;
        thr.connect(tf); tf.connect(tg); tg.connect(bus); thr.start(t);
        drone.gain.setTargetAtTime(0.09, t, 0.6);
        A = { ctx, bus, drone, dOsc, pad, pf, voices, thr, tg };
        return A;
      }
      function dropAudio() {
        if (!A) return;
        const a = A; A = null;
        const t = a.ctx.currentTime;
        a.bus.gain.setTargetAtTime(0.0001, t, 0.08);
        const end = t + 0.5;
        a.dOsc.forEach(o => o.stop(end)); a.voices.forEach(v => v.forEach(x => x.o.stop(end))); a.thr.stop(end);
        setTimeout(() => a.bus.disconnect(), 700);
      }
      function chord(freqs, secs) {
        if (!A) return;
        const t = A.ctx.currentTime;
        A.voices.forEach((v, i) => v.forEach(x => {
          x.o.frequency.cancelScheduledValues(t);
          x.o.frequency.setValueAtTime(x.o.frequency.value, t);
          x.o.frequency.exponentialRampToValueAtTime(freqs[i] * x.h, t + secs);
        }));
      }
      const play = (n, d) => sfx && sfx.play(n, d);
      const onSound = on => { if (!on) dropAudio(); else if (phase !== 'deleted') ensureAudio(); };
      sfx && sfx.onChange(onSound);

      // ---------- phases ----------
      function say(text) { if (msg.textContent !== text) msg.textContent = text; }
      function go(p) {
        phase = p; pt = 0;
        const live = p === 'match';
        stage.classList.toggle('dk-live', p !== 'deleted' && p !== 'done');
        btnL.classList.toggle('dk-hide', !live); btnR.classList.toggle('dk-hide', !live);
        act.classList.toggle('dk-hide', !(p === 'deleted' || p === 'done'));
        act.classList.toggle('dk-call', p === 'deleted' && !touched);
        if (p === 'deleted') { say(DEVICE + ' is nearby.'); act.textContent = 'Connect'; }
        if (p === 'approach') say('Searching');
        if (p === 'match') say('Match the spin to pair');
        if (p === 'dock') { say('Pairing'); keys.l = keys.r = held.l = held.r = false; btnL.classList.remove('dk-held'); btnR.classList.remove('dk-held'); }
        if (p === 'despin') say('Connecting');
        if (p === 'done') { say('Connected to ' + DEVICE + '.'); act.textContent = 'Disconnect'; }
      }
      function onAct() {
        touched = true; act.classList.remove('dk-call');
        if (phase === 'deleted') {
          ensureAudio(); play('swoosh');
          camHold = 0; thP = 0; wP = 0; locked = !R; rangerIn = 0;
          go('approach');
          if (A) chord(TENSE, 0.05);
        } else if (phase === 'done') {
          play('fizzle'); play('swoosh', 200);
          camHold = locked ? -thP : 0; locked = false;
          go('leave');
          say('Disconnected.');
          act.classList.add('dk-hide');
        }
      }
      act.addEventListener('click', onAct);

      // ---------- controls ----------
      function holdBtn(btn, side) {
        const on = e => { if (phase !== 'match') return; held[side] = true; try { if (e.pointerId != null) btn.setPointerCapture(e.pointerId); } catch (err) {} btn.classList.add('dk-held'); ensureAudio(); };
        const off = () => { held[side] = false; btn.classList.remove('dk-held'); };
        const kd = e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); on(e); } };
        const ku = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); off(); } };
        btn.addEventListener('pointerdown', on); btn.addEventListener('pointerup', off); btn.addEventListener('pointercancel', off); btn.addEventListener('lostpointercapture', off);
        btn.addEventListener('keydown', kd); btn.addEventListener('keyup', ku); btn.addEventListener('blur', off);
        btn.addEventListener('contextmenu', e => e.preventDefault());
        return () => {
          btn.removeEventListener('pointerdown', on); btn.removeEventListener('pointerup', off); btn.removeEventListener('pointercancel', off); btn.removeEventListener('lostpointercapture', off);
          btn.removeEventListener('keydown', kd); btn.removeEventListener('keyup', ku); btn.removeEventListener('blur', off);
        };
      }
      const unL = holdBtn(btnL, 'l'), unR = holdBtn(btnR, 'r');

      function onKeyDown(e) {
        if (phase !== 'match') return;
        if (e.key === 'ArrowLeft') { keys.l = true; e.preventDefault(); ensureAudio(); }
        if (e.key === 'ArrowRight') { keys.r = true; e.preventDefault(); ensureAudio(); }
      }
      function onKeyUp(e) { if (e.key === 'ArrowLeft') keys.l = false; if (e.key === 'ArrowRight') keys.r = false; }
      stage.addEventListener('keydown', onKeyDown); stage.addEventListener('keyup', onKeyUp);

      // drag in a circle around the station to spin the Ranger up or down
      let drag = null;
      const angleAt = e => { const r = stage.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - cy, e.clientX - r.left - cx) / RAD; };
      function onDown(e) {
        if (phase !== 'match' || e.target !== canvas) return;
        canvas.setPointerCapture(e.pointerId); ensureAudio();
        drag = { id: e.pointerId, a: angleAt(e) };
      }
      function onMove(e) {
        if (!drag || e.pointerId !== drag.id) return;
        const a = angleAt(e), d = wrap180(a - drag.a); drag.a = a;
        if (phase !== 'match') return;
        const r = stage.getBoundingClientRect(), dist = Math.hypot(e.clientX - r.left - cx, e.clientY - r.top - cy);
        if (dist < 18) return; // too close to the middle to read a direction
        wP += d * 4.2;
        dragPull = Math.min(1, dragPull + Math.abs(d) / 20);
      }
      function onUp(e) { if (drag && e.pointerId === drag.id) drag = null; }
      canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
      canvas.style.cursor = 'grab';

      // ---------- simulation ----------
      let lastTick = 0;
      function step(dt) {
        pt += dt;
        const pushing = (held.r || keys.r ? 1 : 0) - (held.l || keys.l ? 1 : 0);
        thrust = mix(thrust, Math.abs(pushing) + dragPull, 1 - Math.exp(-dt * 10));
        dragPull *= Math.exp(-dt * 6);

        if (phase === 'deleted') {
        } else if (phase === 'approach') {
          const k = ease(clamp(pt / 1.1, 0, 1));
          rangerIn = k; rangerSc = mix(2.4, 1.28, k);
          if (pt >= 1.1) go('match');
        } else if (phase === 'match') {
          wP += pushing * 220 * dt;
          wP = clamp(wP, -900, 900);
          const dw = wS - wP, ph = wrap45(thS - thP);
          if (Math.abs(dw) >= 36) wP *= Math.exp(-dt * 0.05);
          near = clamp(1 - Math.abs(dw) / STATION_SPEED, 0, 1);
          // inside the window the docking computer takes the last few degrees
          if (Math.abs(dw) < 36 && !pushing && dragPull < 0.2) {
            wP += (dw * 2.4 + ph * 3.2) * dt;
            if (Math.abs(ph) < 2.5 && Math.abs(dw) < 8) alignT += dt; else alignT = Math.max(0, alignT - dt);
            say(Math.abs(ph) < 10 ? 'Lining up the port' : 'Close. Hold it steady.');
          } else {
            alignT = 0;
            say(Math.abs(dw) < 36 ? 'Close. Let go of the controls.' : wP > wS ? 'Too fast' : 'Match the spin to pair');
          }
          if (alignT > 0.5) { play('ok'); go('dock'); }
          // the clock keeps ticking while you try
          if (pt - lastTick > 1.25 || pt < lastTick) { lastTick = pt; play('tick'); }
        } else if (phase === 'dock') {
          const ph = wrap45(thS - thP);
          wP = wS; thP += ph * Math.min(1, dt * 8);
          const k = ease(clamp(pt / 1.3, 0, 1));
          rangerSc = mix(1.28, 1, k);
          if (pt >= 1.3 && pt - dt < 1.3) {
            [0, 90, 180, 270].forEach((_, i) => play('clunk', i * 80));
            flash = 1;
            if (A) chord(RESOLVE, 2.2);
          }
          if (pt >= 1.7) go('despin');
        } else if (phase === 'despin') {
          const k = ease(clamp(pt / 2.6, 0, 1));
          wS = STATION_SPEED * (1 - k); wP = wS;
          thP = thS - wrap45(thS - thP) * (1 - k);
          broken = Math.max(0, mix(broken, 0, Math.min(1, dt * 2.2)));
          if (pt >= 2.6) { broken = 0; wS = wP = 0; go('done'); play('win'); }
        } else if (phase === 'leave') {
          const k = ease(clamp(pt / 1.2, 0, 1));
          rangerIn = 1 - k; rangerSc = mix(1, 2.6, k);
          wS = STATION_SPEED * k;
          if (pt >= 1.2) { rangerIn = 0; wS = STATION_SPEED; go('deleted'); }
        }

        thS += wS * dt; thP += wP * dt;
        flash *= Math.exp(-dt * 3);

        // RCS puffs at the wingtips while the thrusters fire
        if (rangerIn > 0.5 && thrust > 0.15 && !R) {
          const dir = (held.r || keys.r) ? 1 : (held.l || keys.l) ? -1 : Math.sign(wP || 1);
          const rot = (locked ? 0 : thP) * RAD, L = S * 0.62 * rangerSc;
          [[0.34, 0.3, -1], [-0.34, -0.2, 1]].forEach(([x, y, s]) => {
            if (Math.random() > thrust * 0.9) return;
            const px = x * L, py = y * L, c = Math.cos(rot), sn = Math.sin(rot);
            puffs.push({ x: cx + px * c - py * sn, y: cy + px * sn + py * c, vx: -dir * s * 40 * c, vy: -dir * s * 40 * sn, life: 1 });
          });
        }
        for (let i = puffs.length - 1; i >= 0; i--) { const p = puffs[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 2.4; if (p.life <= 0) puffs.splice(i, 1); }

        if (A) {
          const t = A.ctx.currentTime;
          let padTo = 0.0001, open = 500;
          if (phase === 'approach') { padTo = 0.05; open = 700; }
          if (phase === 'match') { padTo = 0.05 + 0.3 * near * near; open = 500 + 3200 * near * near; }
          if (phase === 'dock') { padTo = 0.42; open = 4200; }
          if (phase === 'despin') { padTo = 0.42 * (1 - clamp(pt / 3.2, 0, 1)) + 0.06; open = 3000; }
          if (phase === 'done') { padTo = pt < 2 ? 0.06 * (1 - pt / 2) + 0.0001 : 0.0001; }
          A.pad.gain.setTargetAtTime(padTo, t, 0.25);
          A.pf.frequency.setTargetAtTime(open, t, 0.25);
          A.tg.gain.setTargetAtTime(0.0001 + 0.22 * thrust, t, 0.05);
        }
      }

      // ---------- drawing ----------
      function drawStars(cam, spin) {
        const trail = R ? 0 : clamp(Math.abs(spin) * RAD * 0.045, 0, 0.5) * Math.sign(spin);
        g.save(); g.translate(cx, cy);
        for (const s of stars) {
          const a = s.a + cam * RAD;
          g.globalAlpha = s.o * (Math.abs(trail) > 0.004 ? 0.75 : 1);
          if (Math.abs(trail) > 0.004) {
            g.strokeStyle = '#dfe6f2'; g.lineWidth = s.s; g.beginPath();
            g.arc(0, 0, s.d, a, a + trail, trail < 0); g.stroke();
          } else {
            g.fillStyle = '#dfe6f2'; g.fillRect(Math.cos(a) * s.d, Math.sin(a) * s.d, s.s, s.s);
          }
        }
        g.restore(); g.globalAlpha = 1;
      }

      function module(w, h, lw) {
        g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h * 0.22);
        g.fillStyle = '#d3d6dc'; g.fill(); g.lineWidth = lw; g.strokeStyle = '#6c717b'; g.stroke();
        g.beginPath(); g.moveTo(-w / 2 + h * 0.2, 0); g.lineTo(w / 2 - h * 0.2, 0); g.strokeStyle = '#9ca1ab'; g.stroke();
        g.fillStyle = '#2a2f3a';
        for (let i = -1; i <= 1; i++) g.fillRect(i * w * 0.24 - w * 0.03, -h * 0.34, w * 0.06, h * 0.14);
      }

      function drawStation(rot) {
        const Rr = S * 0.8, mw = S * 0.24, mh = S * 0.15, lw = Math.max(1, S * 0.008);
        g.save(); g.translate(cx, cy); g.rotate(rot * RAD);
        // spokes
        g.strokeStyle = '#555a64'; g.lineWidth = S * 0.024;
        for (let i = 0; i < 4; i++) { const a = i * 90 * RAD; g.beginPath(); g.moveTo(Math.cos(a) * S * 0.17, Math.sin(a) * S * 0.17); g.lineTo(Math.cos(a) * (Rr - mh / 2), Math.sin(a) * (Rr - mh / 2)); g.stroke(); }
        // the tube between modules
        g.strokeStyle = '#7a7f89'; g.lineWidth = S * 0.05;
        for (let i = 0; i < 12; i++) {
          const a0 = (i * 30 + 9) * RAD, a1 = ((i + 1) * 30 - 9) * RAD;
          g.beginPath(); g.arc(0, 0, Rr, a0 - Math.PI / 2, a1 - Math.PI / 2); g.stroke();
        }
        for (let i = 0; i < 12; i++) {
          g.save(); g.rotate(i * 30 * RAD); g.translate(0, -Rr);
          if (i !== LOST || broken < 0.001) module(mw, mh, lw);
          else {
            // the deleted file, in pieces
            for (const p of pieces) {
              g.save();
              g.translate(p.qx * mw / 4 + p.dx * S * 0.3 * broken, p.qy * mh / 4 + p.dy * S * 0.26 * broken);
              g.rotate(p.spin * broken * RAD);
              g.beginPath(); g.rect(-mw / 4, -mh / 4, mw / 2, mh / 2);
              g.fillStyle = '#d3d6dc'; g.fill(); g.lineWidth = lw; g.strokeStyle = '#6c717b'; g.stroke();
              g.restore();
            }
            if (broken > 0.15 && Math.sin(performance.now() / 180) > 0) {
              g.fillStyle = '#ff5a4e'; g.beginPath(); g.arc(0, mh * 0.9, S * 0.018, 0, TAU); g.fill();
            }
          }
          g.restore();
        }
        // hub and its four-way port
        g.beginPath(); g.arc(0, 0, S * 0.18, 0, TAU); g.fillStyle = '#c3c7cf'; g.fill(); g.lineWidth = lw; g.strokeStyle = '#6c717b'; g.stroke();
        g.beginPath(); g.arc(0, 0, S * 0.105, 0, TAU); g.fillStyle = '#1b1f28'; g.fill();
        g.fillStyle = '#e8eaee';
        for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * 90 * RAD); g.fillRect(-S * 0.012, -S * 0.105, S * 0.024, S * 0.04); g.restore(); }
        g.restore();
      }

      function drawRanger(rot, sc, alpha, offX, offY) {
        const L = S * 0.62;
        g.save(); g.globalAlpha = alpha;
        g.translate(cx + offX, cy + offY); g.rotate(rot * RAD); g.scale(sc, sc);
        // shadow on the station below
        g.save(); g.translate(S * 0.05 * (sc - 0.9), S * 0.07 * (sc - 0.9)); g.scale(L, L);
        ranger(); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill(); g.restore();
        g.save(); g.scale(L, L);
        ranger();
        g.fillStyle = '#e4e7ec'; g.fill(); g.lineWidth = 1.2 / L; g.strokeStyle = '#8a909a'; g.stroke();
        g.beginPath(); g.moveTo(-0.05, -0.33); g.lineTo(0.05, -0.33); g.lineTo(0.075, -0.24); g.lineTo(-0.075, -0.24); g.closePath(); g.fillStyle = '#1b2130'; g.fill();
        g.beginPath(); g.moveTo(0, -0.18); g.lineTo(0, 0.42); g.moveTo(-0.11, 0.18); g.lineTo(-0.3, 0.3); g.moveTo(0.11, 0.18); g.lineTo(0.3, 0.3); g.strokeStyle = '#a9aeb7'; g.stroke();
        g.fillStyle = '#3a404c'; g.fillRect(-0.07, 0.42, 0.05, 0.04); g.fillRect(0.02, 0.42, 0.05, 0.04);
        g.restore();
        g.restore(); g.globalAlpha = 1;
      }
      function ranger() {
        g.beginPath();
        g.moveTo(0, -0.5);
        g.bezierCurveTo(0.07, -0.47, 0.1, -0.38, 0.11, -0.25);
        g.lineTo(0.12, 0.08); g.lineTo(0.36, 0.26); g.lineTo(0.36, 0.34); g.lineTo(0.12, 0.3); g.lineTo(0.1, 0.44);
        g.lineTo(-0.1, 0.44); g.lineTo(-0.12, 0.3); g.lineTo(-0.36, 0.34); g.lineTo(-0.36, 0.26); g.lineTo(-0.12, 0.08);
        g.lineTo(-0.11, -0.25);
        g.bezierCurveTo(-0.1, -0.38, -0.07, -0.47, 0, -0.5);
        g.closePath();
      }

      // the alignment ring: triangles for the station's port, ticks for the Ranger's collar
      function drawReticle(stRot, rgRot, alpha, ok) {
        const r = S * 0.46;
        g.save(); g.translate(cx, cy); g.globalAlpha = alpha;
        g.setLineDash([2, 5]); g.lineWidth = 1; g.strokeStyle = ok ? 'rgba(127,212,255,.8)' : 'rgba(255,255,255,.22)';
        g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); g.setLineDash([]);
        for (let i = 0; i < 4; i++) {
          g.save(); g.rotate((stRot + i * 90) * RAD);
          g.beginPath(); g.moveTo(0, -r + 1); g.lineTo(-5, -r - 8); g.lineTo(5, -r - 8); g.closePath();
          g.fillStyle = ok ? '#7fd4ff' : 'rgba(255,255,255,.55)'; g.fill();
          g.restore();
          g.save(); g.rotate((rgRot + i * 90) * RAD);
          g.beginPath(); g.moveTo(0, -r + 6); g.lineTo(0, -r - 13);
          g.lineWidth = 2; g.strokeStyle = ok ? '#7fd4ff' : '#ececf0'; g.stroke();
          g.restore();
        }
        g.restore(); g.globalAlpha = 1;
      }

      function draw() {
        const cam = locked ? -thP : camHold;
        const spinOnScreen = locked ? wP : 0;
        g.fillStyle = '#06070b'; g.fillRect(0, 0, W, H);
        const neb = g.createRadialGradient(W * 0.2, H * 0.15, 0, W * 0.2, H * 0.15, W * 0.8);
        neb.addColorStop(0, 'rgba(90,110,160,.18)'); neb.addColorStop(1, 'rgba(90,110,160,0)');
        g.fillStyle = neb; g.fillRect(0, 0, W, H);
        drawStars(cam, spinOnScreen);

        drawStation(thS + cam);

        if (rangerIn > 0.001) {
          const off = 1 - rangerIn;
          const rgRot = locked ? 0 : thP + cam;
          const matched = phase === 'match' && Math.abs(wS - wP) < 36;
          if (phase === 'match' || phase === 'approach' || phase === 'dock') {
            const ok = phase === 'dock' || (matched && Math.abs(wrap45(thS - thP)) < 4);
            drawReticle(thS + cam, rgRot, rangerIn * (phase === 'dock' ? 1 - clamp((pt - 1.3) / 0.4, 0, 1) : 1), ok);
          }
          drawRanger(rgRot, rangerSc, Math.min(1, rangerIn * 1.4), off * W * 0.55, off * H * 0.4);
        }

        for (const p of puffs) { g.globalAlpha = p.life * 0.6; g.fillStyle = '#f2f4f8'; g.beginPath(); g.arc(p.x, p.y, 2 + (1 - p.life) * 5, 0, TAU); g.fill(); }
        g.globalAlpha = 1;

        if (flash > 0.01) {
          g.save(); g.translate(cx, cy);
          g.strokeStyle = 'rgba(127,212,255,' + (flash * 0.8).toFixed(3) + ')'; g.lineWidth = 2;
          g.beginPath(); g.arc(0, 0, S * (0.12 + (1 - flash) * 1.1), 0, TAU); g.stroke();
          g.restore();
        }

        // HUD
        const rs = Math.round(wS / 6), rp = Math.round(wP / 6);
        rsEl.textContent = rs + ' rpm'; rpEl.textContent = rp + ' rpm';
        const dw = clamp((wP - wS) / STATION_SPEED, -1, 1);
        dot.style.transform = 'translateX(' + (dw * 55).toFixed(1) + 'px)';
        dot.classList.toggle('dk-ok', Math.abs(wS - wP) < 36);
      }

      let raf = 0, last = performance.now();
      function frame(ts) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
        step(dt); draw();
      }
      go('deleted');
      raf = requestAnimationFrame(frame);

      return {
        destroy() {
          cancelAnimationFrame(raf); ro.disconnect(); dropAudio();
          sfx && sfx.offChange && sfx.offChange(onSound);
          act.removeEventListener('click', onAct); unL(); unR();
          stage.removeEventListener('keydown', onKeyDown); stage.removeEventListener('keyup', onKeyUp);
          canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
          canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp);
        }
      };
    }
  });
})();
