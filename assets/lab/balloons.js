(function () {
  const css = `
.lab-stage.x-balloons{font-family:var(--body);color:#1F324A;background:#89C9F1}
.x-balloons canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.x-balloons .bl-badge{position:absolute;left:12px;top:12px;z-index:3;display:flex;align-items:center;gap:7px;max-width:calc(100% - 24px);box-sizing:border-box;
  padding:5px 11px 5px 9px;border-radius:999px;background:rgba(255,255,255,.86);border:1px solid rgba(31,50,74,.1);color:#1F324A;
  box-shadow:0 2px 8px rgba(20,45,75,.14);font:400 13px/16px var(--body);pointer-events:none;white-space:nowrap}
.x-balloons .bl-dot{flex:none;width:7px;height:7px;border-radius:50%;background:#9AA7B4;transition:background .2s ease}
.x-balloons .bl-dot.on{background:#ff5a5f;box-shadow:0 0 0 3px rgba(255,90,95,.18)}
.x-balloons .bl-txt{overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.x-balloons .bl-toast{position:absolute;left:50%;top:48px;z-index:3;box-sizing:border-box;width:max-content;max-width:calc(100% - 32px);padding:8px 13px;border-radius:12px;text-align:center;
  background:rgba(255,255,255,.94);border:1px solid rgba(31,50,74,.12);box-shadow:0 10px 24px rgba(20,45,75,.22);pointer-events:none;
  opacity:0;transform:translate(-50%,-6px);transition:opacity .2s ease,transform .3s cubic-bezier(.2,1.2,.4,1)}
.x-balloons .bl-toast.on{opacity:1;transform:translate(-50%,0)}
.x-balloons .bl-toast b{display:block;font:400 13px/17px var(--body);color:#1F324A}
.x-balloons .bl-toast span{display:block;font:300 12px/16px var(--body);color:#5C6E82}
.x-balloons .bl-ctrl{position:absolute;left:12px;right:12px;bottom:10px;z-index:3;display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.x-balloons .bl-btn{font:400 13px/1 var(--body);color:#1F324A;background:rgba(255,255,255,.82);border:1px solid rgba(31,50,74,.18);border-radius:999px;
  height:30px;padding:0 14px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(20,45,75,.14);
  transition:border-color .2s ease,background-color .2s ease,transform .15s ease}
.x-balloons .bl-btn:hover{border-color:rgba(31,50,74,.45);background:#fff}
.x-balloons .bl-btn.is-on{background:#1F324A;color:#F4FAFF;border-color:#1F324A}
.x-balloons .bl-btn.is-on:hover{background:#2A4363;border-color:#2A4363}
.x-balloons .bl-btn:active{transform:scale(.96)}
.x-balloons .bl-btn:focus-visible{outline:2px solid #1F324A;outline-offset:3px}
.x-balloons .bl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (prefers-reduced-motion: reduce){.x-balloons .bl-toast{transition:opacity .2s ease;transform:translate(-50%,0)}.x-balloons .bl-btn:active{transform:none}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const WOBBLE_AT = 9, LIFT_AT = 13, LAND_AT = 10, EVERY = 1.3;

  const MSGS = [
    ['New comment', 'It just says "thoughts?"'],
    ['3 tasks due', 'All of them yesterday.'],
    ['Meeting moved', 'Now it overlaps lunch.'],
    ['Reminder', 'About the other reminder.'],
    ['You were mentioned', 'Deep in a very long thread.'],
    ['Invoice paid', 'To you, for once.'],
    ['Someone liked this', 'They did not say what.'],
    ['Password expires soon', 'Pick one you will forget.'],
    ['Weekly digest', 'Of these notifications.'],
    ['New follower', 'Probably a bot.']
  ];
  const PAL = ['#ff5a5f', '#ffb400', '#2ec4b6', '#3d7bff', '#9b5de5', '#ff6fb5', '#35d07f', '#00bbf9', '#ff8a3d', '#e84393'];

  function hex(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
  function shade(c, t) { // t > 0 toward white, t < 0 toward black
    return 'rgb(' + c.map(v => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t))).join(',') + ')';
  }
  const COLS = PAL.map(h => { const c = hex(h); return { base: h, light: shade(c, 0.45), dark: shade(c, -0.35), rgb: c }; });

  // the house from Up, flat and front on
  const K = {
    ol: '#231e28', roof: '#46424f', roofl: '#2f2c38', edge: 'rgba(255,255,255,.3)',
    brick: '#b53c30', brickd: '#8b2b23',
    yel: '#f5c231', yeld: '#cf9810', blu: '#3fa6e4',
    sid: '#2f7fce', sidd: '#2467ab',
    crm: '#f6e6c8', crmd: '#dcc49a',
    door: '#8b4a1c', doord: '#67340f',
    pch: '#f2a882', pchd: '#d78a63',
    pnk: '#ef3d8f', org: '#f5a01c', orgd: '#d9860e', glass: '#f6920f',
    lime: '#b4d62f', limed: '#95b81d',
    wht: '#f6f5f1', whtd: '#c9c9c2', wood: '#bd8449', woodd: '#95602f',
    vane: 'rgba(35,30,40,.7)'
  };

  window.EXPERIMENTS.push({
    id: 'balloons', name: 'Clear Notifications', source: 'Up, 2009',
    hint: 'Let the notifications pile up. Pop them to read.',
    mount(stage, ctl) {
      const sfx = window.LAB_SFX;
      const R = !!window.REDUCED;

      stage.innerHTML =
        '<canvas role="img" aria-label="A small house on the ground, tied to a bunch of notification balloons"></canvas>' +
        '<div class="bl-badge" aria-hidden="true"><i class="bl-dot"></i><span class="bl-txt"></span></div>' +
        '<div class="bl-toast" aria-hidden="true"><b></b><span></span></div>' +
        '<div class="bl-ctrl"><button class="bl-btn bl-one" type="button">Read one</button><button class="bl-btn bl-all" type="button">Mark all as read</button></div>' +
        '<span class="bl-sr" role="status" aria-live="polite"></span>';

      const $ = s => stage.querySelector(s);
      const canvas = $('canvas'), ctx = canvas.getContext('2d');
      const dot = $('.bl-dot'), txt = $('.bl-txt'), toast = $('.bl-toast'), toastT = toast.querySelector('b'), toastS = toast.querySelector('span');
      const oneBtn = $('.bl-one'), allBtn = $('.bl-all'), sr = $('.bl-sr');
      const fam = getComputedStyle(stage).fontFamily || 'sans-serif';

      // ---------- timers ----------
      const timers = new Set();
      function later(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; }

      // ---------- size ----------
      let W = 0, H = 0, groundY = 0;
      function resize() {
        W = stage.clientWidth || 340; H = stage.clientHeight || 320;
        groundY = H - 48;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      let ro = null;
      if (window.ResizeObserver) { ro = new ResizeObserver(() => { if (stage.clientWidth !== W || stage.clientHeight !== H) resize(); }); ro.observe(stage); }

      // ---------- sound ----------
      const au = () => (sfx && sfx.audio ? sfx.audio() : null);
      function popSound(p) {
        const a = au(); if (!a) return;
        const { ctx: ac, out, noise } = a, t = ac.currentTime + 0.005;
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noise; f.type = 'highpass'; f.frequency.value = 1400;
        g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + 0.07);
        const o = ac.createOscillator(), og = ac.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(280 * p, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.09);
        og.gain.setValueAtTime(0.3, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
        o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.13);
      }
      function inflateSound() {
        const a = au(); if (!a) return;
        const { ctx: ac, out, noise } = a, t = ac.currentTime + 0.005;
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noise; f.type = 'bandpass'; f.Q.value = 1.2;
        f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(1500, t + 0.35);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + 0.4);
        const o = ac.createOscillator(), og = ac.createGain();
        o.type = 'sine'; o.frequency.value = 1320 + (Math.random() < 0.5 ? 0 : 440);
        og.gain.setValueAtTime(0.0001, t + 0.3); og.gain.exponentialRampToValueAtTime(0.045, t + 0.31); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o.connect(og); og.connect(out); o.start(t + 0.3); o.stop(t + 0.62);
      }
      function creak(vol, dur) {
        const a = au(); if (!a) return;
        const { ctx: ac, out } = a, t = ac.currentTime + 0.005, r = Math.random();
        const o = ac.createOscillator(), am = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
        const bp = ac.createBiquadFilter(), env = ac.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(58 + r * 20, t); o.frequency.linearRampToValueAtTime(84 + r * 30, t + dur);
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(18 + r * 8, t); lfo.frequency.linearRampToValueAtTime(30 + r * 10, t + dur);
        am.gain.value = 0.5; lg.gain.value = 0.5;
        lfo.connect(lg); lg.connect(am.gain);
        bp.type = 'bandpass'; bp.frequency.value = 650 + r * 300; bp.Q.value = 5;
        env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(vol, t + 0.06);
        env.gain.setValueAtTime(vol, t + dur * 0.7); env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(am); am.connect(bp); bp.connect(env); env.connect(out);
        o.start(t); lfo.start(t); o.stop(t + dur + 0.02); lfo.stop(t + dur + 0.02);
      }
      const play = n => sfx && sfx.play(n);

      // ---------- state ----------
      const balloons = [], parts = [], clouds = [];
      let msgI = 0, colI = 0, uid = 0, time = 0;
      let arriveT = 0.5, landHold = 0, ripple = false;
      // they stay quiet until you turn them on, and you can turn them off again
      let flowing = false;
      let state = 'ground', gone = false, lift = 0, vel = 0, rp = 0, cloudV = 0, sky = 0;
      let wob = 0, creakT = 1, hover = null, pointNext = false, lastAnnounce = -10;
      const LIFT_MAX = () => (groundY + 60) / 0.65;
      const lengths = [150, 95, 130, 70, 165, 110, 85, 145, 120, 60, 155, 100, 135, 78];
      const tufts = Array.from({ length: 14 }, (_, i) => ({ u: (i * 0.618 + 0.07) % 1, h: 3 + ((i * 7) % 4) }));
      for (let i = 0; i < 7; i++) clouds.push({ x: Math.random(), y: Math.random() * 1.6 - 0.4, s: 0.7 + Math.random() * 0.7, d: i % 3 === 0 ? 1.35 : 0.6 });

      // ---------- copy ----------
      function statusText() {
        const n = balloons.length;
        if (state === 'ground') return n ? n + ' unread' : 'Nothing unread';
        if (state === 'down') return 'Coming back down. ' + n + ' unread.';
        return gone ? 'Your house has left. ' + n + ' unread.' : 'Lifting off. ' + n + ' unread.';
      }
      function updateStatus() {
        const s = statusText();
        if (txt.textContent !== s) txt.textContent = s;
        dot.classList.toggle('on', balloons.length > 0);
      }
      function announce(s) { sr.textContent = s || statusText(); lastAnnounce = time; }
      let toastTimer = 0;
      function showToast(a, b) {
        toastT.textContent = a; toastS.textContent = b || '';
        toast.classList.add('on');
        if (toastTimer) { clearTimeout(toastTimer); timers.delete(toastTimer); }
        toastTimer = later(() => { toast.classList.remove('on'); toastTimer = 0; }, 1900);
      }

      // ---------- geometry ----------
      const houseX = () => Math.round(W / 2 + (R ? 0 : Math.sin(time * 0.45) * 14 * sky));
      const cam = () => (R ? 0 : lift * 0.35);
      const baseY = () => groundY - lift + cam();
      const slide = () => -24 * rp;
      function anchor() { return { x: houseX() + 18, y: baseY() - 73 + slide() }; }

      // ---------- arrivals and pops ----------
      function arrive() {
        const m = MSGS[msgI++ % MSGS.length], c = COLS[colI++ % COLS.length];
        balloons.push({
          id: uid++, x: (Math.random() - 0.5) * 2, y: -2, vx: (Math.random() - 0.5) * 50, vy: -20,
          r: 13.5 + Math.random() * 3, L: lengths[uid % lengths.length] + Math.random() * 10,
          grow: 0, ph: Math.random() * TAU, msg: m, col: c, born: time
        });
        inflateSound();
        updateStatus();
        if (time - lastAnnounce > 6) announce();
      }
      function pop(b, quiet) {
        const i = balloons.indexOf(b); if (i < 0) return;
        balloons.splice(i, 1);
        if (hover === b) hover = null;
        const a = anchor(), x = a.x + b.x, y = a.y + b.y, r = b.r * b.grow;
        if (y > -40 && y < H + 40 && rp < 0.9) {
          parts.push({ k: 'ring', x, y, r: r, life: 1, col: b.col });
          if (!R) for (let j = 0; j < 7; j++) {
            const ang = j / 7 * TAU + Math.random() * 0.6, sp = 90 + Math.random() * 90;
            parts.push({ k: 'shred', x: x + Math.cos(ang) * r * 0.6, y: y + Math.sin(ang) * r * 0.6, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 40, rot: ang, vr: (Math.random() - 0.5) * 16, life: 1, col: b.col });
          }
        }
        popSound(0.8 + Math.random() * 0.45);
        if (!quiet) { showToast(b.msg[0], b.msg[1]); announce(b.msg[0] + '. ' + statusText()); }
        updateStatus();
      }
      function readOne() {
        if (!balloons.length) { showToast('Nothing unread', 'Enjoy it while it lasts.'); announce('Nothing unread.'); play('tick'); return; }
        pop(balloons[0]);
      }
      function markAll() {
        if (ripple) return;
        if (!balloons.length) { showToast('Nothing unread', 'Enjoy it while it lasts.'); announce('Nothing unread.'); play('tick'); return; }
        ripple = true;
        const step = () => {
          if (!balloons.length) {
            ripple = false; arriveT = 1.8;
            showToast('Inbox zero', 'For now.'); play('ok');
            announce('All caught up.');
            return;
          }
          pop(balloons[0], true);
          later(step, 85);
        };
        step();
      }

      function land() {
        state = 'ground'; gone = false; lift = 0; vel = 0; rp = 0; landHold = 1.4;
        play('clunk');
        if (!R) {
          const x = houseX(), y = groundY;
          for (let i = 0; i < 10; i++) {
            const side = i % 2 ? 1 : -1;
            parts.push({ k: 'dust', x: x + side * (26 + Math.random() * 8), y: y - 1, vx: side * (30 + Math.random() * 50), vy: -10 - Math.random() * 25, r: 1.5 + Math.random() * 2, life: 1 });
          }
        }
        updateStatus(); announce('Landed. ' + statusText());
      }

      // ---------- simulation ----------
      function physics(h) {
        const grounded = state === 'ground';
        const a = anchor();
        const n = balloons.length;
        for (const b of balloons) {
          b.grow = Math.min(1, b.grow + h / 0.55);
          b.vy -= 240 * h * (0.35 + 0.65 * b.grow);
          if (!R) b.vx += (Math.sin(time * 0.8 + b.ph) * 26 + Math.sin(time * 0.31) * 14) * h;
          const damp = Math.exp(-h * (R ? 4 : 1.8));
          b.vx *= damp; b.vy *= damp;
          b.x += b.vx * h; b.y += b.vy * h;
          const L = 8 + (b.L - 8) * b.grow, d = Math.hypot(b.x, b.y);
          if (d > L) {
            const nx = b.x / d, ny = b.y / d;
            b.x = nx * L; b.y = ny * L;
            const vr = b.vx * nx + b.vy * ny;
            if (vr > 0) { b.vx -= nx * vr; b.vy -= ny * vr; }
          }
        }
        for (let i = 0; i < n; i++) {
          const p = balloons[i], rp1 = p.r * p.grow + 3;
          for (let j = i + 1; j < n; j++) {
            const q = balloons[j], rq = q.r * q.grow + 3;
            const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy), min = rp1 + rq;
            if (d < min && d > 0.01) {
              const nx = dx / d, ny = dy / d, push = (min - d) * 0.3;
              p.x -= nx * push; p.y -= ny * push; q.x += nx * push; q.y += ny * push;
              const rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
              if (rv < 0) { const k = rv * 0.5; p.vx += nx * k; p.vy += ny * k; q.vx -= nx * k; q.vy -= ny * k; }
            }
          }
        }
        for (const b of balloons) {
          const rr = b.r * b.grow + 2, ax = a.x + b.x;
          if (ax < rr + 4) { b.x = rr + 4 - a.x; if (b.vx < 0) b.vx *= -0.3; }
          else if (ax > W - rr - 4) { b.x = W - rr - 4 - a.x; if (b.vx > 0) b.vx *= -0.3; }
          if (grounded) {
            const top = a.y + b.y - rr;
            if (top < 34) b.vy += (34 - top) * 45 * h;
            if (top < 4) b.y = 4 + rr - a.y;
          }
        }
      }

      function update(dt) {
        time += dt;
        const n = balloons.length;
        landHold -= dt;

        if (flowing && state === 'ground' && !ripple && landHold <= 0) {
          arriveT -= dt;
          if (arriveT <= 0) { arriveT = EVERY; arrive(); }
        }

        // the house: wobble, then lift, then leave
        const wobTarget = state === 'ground' || lift < 30 ? clamp((n - WOBBLE_AT + 1) / (LIFT_AT - WOBBLE_AT), 0, 1) : 0;
        wob += (wobTarget - wob) * (1 - Math.exp(-dt * 4));
        if (state === 'ground') {
          if (wob > 0.08) {
            creakT -= dt;
            if (creakT <= 0) { creak(0.03 + 0.05 * wob, 0.3 + Math.random() * 0.35); creakT = 2.4 - 1.3 * wob + Math.random() * 0.8; }
          }
          if (n >= LIFT_AT) {
            state = 'up'; vel = 0; gone = false;
            play('wind'); creak(0.1, 0.7);
            updateStatus(); announce();
          }
        } else if (state === 'up') {
          if (n <= LAND_AT) { state = 'down'; updateStatus(); announce(); }
          else if (R) {
            rp = Math.min(1, rp + dt / 0.6);
            if (rp >= 1 && !gone) { gone = true; updateStatus(); announce(); }
          } else if (!gone) {
            vel = Math.min(vel + 70 * dt, 95);
            lift += vel * dt;
            if (lift >= LIFT_MAX()) { lift = LIFT_MAX(); gone = true; updateStatus(); announce(); }
          }
        } else if (state === 'down') {
          if (n > LAND_AT) { state = 'up'; updateStatus(); }
          else if (R) {
            rp = Math.max(0, rp - dt / 0.6);
            gone = false;
            if (rp <= 0) land();
          } else {
            gone = false;
            vel = -clamp(lift * 0.9, 22, 110);
            lift = Math.max(0, lift + vel * dt);
            if (lift <= 0) land();
          }
        }

        const cvTarget = R ? 0 : state === 'up' ? (gone ? 80 : vel) : state === 'down' ? vel : 0;
        cloudV += (cvTarget - cloudV) * (1 - Math.exp(-dt * 2));
        const skyTarget = R ? 0 : clamp((lift - 40) / 150, 0, 1);
        sky += (skyTarget - sky) * (1 - Math.exp(-dt * 3));
        {
          for (const c of clouds) {
            c.y += cloudV * dt * c.d / H;
            c.x += (R ? 0 : 4 * c.d) * dt / W;
            if (c.y > 1.2) { c.y = -0.2; c.x = Math.random(); }
            else if (c.y < -0.25) { c.y = 1.15; c.x = Math.random(); }
            if (c.x > 1.2) c.x = -0.2;
          }
        }

        const steps = 2;
        for (let i = 0; i < steps; i++) physics(dt / steps);

        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          if (p.k === 'ring') { p.life -= dt / 0.28; p.r += 70 * dt; }
          else if (p.k === 'shred') { p.life -= dt / 0.55; p.vy += 420 * dt; p.vx *= Math.exp(-dt * 2); p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
          else { p.life -= dt / 0.7; p.vx *= Math.exp(-dt * 4); p.vy += 20 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
          if (p.life <= 0) parts.splice(i, 1);
        }
        updateStatus();
      }

      // ---------- drawing ----------
      // daylight: the line work is ink on a blue sky rather than light on black
      const BG = '#1b1b20';
      const INK = (a) => 'rgba(31,50,74,' + a + ')';
      function drawSky() {
        const up = sky;                                  // deeper blue the higher the house gets
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, up > 0.01 ? 'rgb(' + Math.round(62 - up * 18) + ',' + Math.round(150 - up * 28) + ',' + Math.round(220 - up * 10) + ')' : '#3E96DC');
        g.addColorStop(0.58, '#89C9F1');
        g.addColorStop(1, up > 0.5 ? '#9FD6F5' : '#D6ECF8');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // the sun, off in the corner
        const sg = ctx.createRadialGradient(W * 0.84, H * 0.16, 0, W * 0.84, H * 0.16, W * 0.5);
        sg.addColorStop(0, 'rgba(255,246,214,.55)'); sg.addColorStop(1, 'rgba(255,246,214,0)');
        ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      }
      function cloud(x, y, s, alpha) {
        ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
        ctx.beginPath();
        ctx.moveTo(-34, 8);
        ctx.arc(-20, 0, 12, Math.PI * 0.75, Math.PI * 1.55);
        ctx.arc(0, -6, 16, Math.PI * 1.1, Math.PI * 1.9);
        ctx.arc(22, 1, 11, Math.PI * 1.4, Math.PI * 0.3);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.92).toFixed(3) + ')'; ctx.fill();
        ctx.lineWidth = 1.1 / s; ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 0.5).toFixed(3) + ')'; ctx.stroke();
        ctx.restore();
      }
      function drawClouds(front) {
        const a = 0.5 + sky * 0.5;                       // a few are up there before the house is
        for (const c of clouds) if ((c.d > 1) === front) cloud(c.x * W, c.y * H, c.s * (front ? 1.1 : 0.7), a * (front ? 0.85 : 0.6));
      }
      function drawGround() {
        const gy = groundY + cam();
        if (gy > H + 10) return;
        const gg = ctx.createLinearGradient(0, gy, 0, H);
        gg.addColorStop(0, '#79B542'); gg.addColorStop(1, '#4E8C2E');
        ctx.fillStyle = gg; ctx.fillRect(0, Math.round(gy), W, H - Math.round(gy) + 2);
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(46,82,28,.75)';
        ctx.beginPath(); ctx.moveTo(0, Math.round(gy) + 0.5); ctx.lineTo(W, Math.round(gy) + 0.5); ctx.stroke();
        ctx.strokeStyle = 'rgba(46,82,28,.7)';
        ctx.beginPath();
        for (const t of tufts) {
          const x = Math.round(t.u * W) + 0.5;
          if (Math.abs(x - W / 2) < 44) continue;
          ctx.moveTo(x, gy); ctx.lineTo(x - 2, gy - t.h); ctx.moveTo(x + 3, gy); ctx.lineTo(x + 4, gy - t.h + 1);
        }
        ctx.stroke();
        // the mailbox stays behind, flag up while anything is unread
        const mx = Math.round(W / 2) + 50;
        ctx.strokeStyle = INK('.75'); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(mx + 0.5, gy); ctx.lineTo(mx + 0.5, gy - 14); ctx.stroke();
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(mx - 6, gy - 21, 13, 7, [3.5, 3.5, 0, 0]) : ctx.rect(mx - 6, gy - 21, 13, 7);
        ctx.fillStyle = '#E9EEF3'; ctx.fill(); ctx.stroke();
        const up = balloons.length > 0;
        ctx.strokeStyle = up ? '#ff5a5f' : INK('.55'); ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        if (up) { ctx.moveTo(mx + 8.5, gy - 16); ctx.lineTo(mx + 8.5, gy - 27); ctx.stroke(); ctx.fillRect(mx + 8.5, gy - 27, 5, 3.5); }
        else { ctx.moveTo(mx + 8.5, gy - 16); ctx.lineTo(mx + 17, gy - 16); ctx.stroke(); }
        // shadow under the house, shrinking as it rises
        const sh = clamp(1 - lift / 120, 0, 1) * (1 - rp);
        if (sh > 0.02 && lift > 1) {
          ctx.fillStyle = 'rgba(0,0,0,' + (0.35 * sh).toFixed(3) + ')';
          ctx.beginPath(); ctx.ellipse(houseX(), gy + 1, 34 * (0.5 + 0.5 * sh), 3, 0, 0, TAU); ctx.fill();
        }
      }
      function wobAngle() {
        if (R || wob < 0.01) return 0;
        return (Math.sin(time * 11) + 0.5 * Math.sin(time * 6.7 + 1)) / 1.5 * wob * 0.045;
      }
      // ---------- house parts ----------
      function poly(pts, fill, line, lw) {
        ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
        ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (line) { ctx.strokeStyle = line; ctx.lineWidth = lw || 1.1; ctx.stroke(); }
      }
      function bx(x, y, w, h, fill, line, lw) {
        poly([x, y, x + w, y, x + w, y + h, x, y + h], fill, line, lw);
      }
      function rule(col, lw, segs) {
        ctx.save(); ctx.lineCap = 'butt'; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
        for (const s of segs) { ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); }
        ctx.stroke(); ctx.restore();
      }
      function boards(x, y, w, h, col, step) {
        const s = [];
        for (let yy = y + step; yy < y + h - 0.4; yy += step) s.push([x + 0.6, yy, x + w - 0.6, yy]);
        rule(col, 0.7, s);
      }
      function scales(x0, y0, x1, y1, step, col) {
        ctx.save(); ctx.lineCap = 'butt'; ctx.strokeStyle = col; ctx.lineWidth = 0.8; ctx.beginPath();
        let r = 0;
        for (let yy = y0; yy <= y1; yy += step * 0.7, r++) {
          const off = (r & 1) ? step / 2 : 0;
          for (let xx = x0 - step; xx <= x1 + step; xx += step) {
            ctx.moveTo(xx + off, yy); ctx.arc(xx + off + step / 2, yy, step / 2, Math.PI, 0, true);
          }
        }
        ctx.stroke(); ctx.restore();
      }
      function fringe(x0, x1, y, r, fill) {
        ctx.beginPath(); ctx.moveTo(x0, y - 2.5); ctx.lineTo(x0, y);
        for (let xx = x0; xx < x1 - 0.2; xx += r * 2) {
          const e = Math.min(xx + r * 2, x1);
          ctx.arc((xx + e) / 2, y, (e - xx) / 2, Math.PI, 0, true);
        }
        ctx.lineTo(x1, y - 2.5); ctx.closePath();
        ctx.fillStyle = fill; ctx.fill();
        ctx.strokeStyle = K.ol; ctx.lineWidth = 1; ctx.stroke();
      }
      function sash(x, y, w, h, mull, sill) {
        bx(x, y, w, h, K.pnk, K.ol, 1);
        bx(x + 1.7, y + 1.7, w - 3.4, h - 3.4, K.glass, K.ol, 0.9);
        if (mull) rule(K.pnk, 1.3, [[x + 1.7, y + h / 2, x + w - 1.7, y + h / 2]]);
        if (sill) bx(x - 1.7, y + h, w + 3.4, 2.2, K.crm, K.ol, 1);
      }
      function drawHouse(ang) {
        const x = houseX(), y = baseY() + slide();
        if (y < -10 || y > H + 90) return;
        ctx.save();
        const pivot = ang > 0 ? 30 : -30;
        ctx.translate(x + pivot, Math.round(y) + 0.5); ctx.rotate(ang); ctx.translate(-pivot, 0);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 1.1;

        // chimney first so the roof sits over its foot
        bx(13, -69, 10, 23, K.brick, K.ol);
        const br = [];
        for (let k = 1; k < 6; k++) br.push([13, -69 + k * 4, 23, -69 + k * 4]);
        for (let k = 0; k < 6; k++) {
          const t = -69 + k * 4;
          if (k & 1) { br.push([15.6, t, 15.6, t + 4]); br.push([20.4, t, 20.4, t + 4]); }
          else br.push([18, t, 18, t + 4]);
        }
        rule(K.brickd, 0.8, br);
        bx(13, -69, 10, 23, null, K.ol);
        bx(11, -73, 14, 4.4, K.brickd, K.ol);

        // dark scalloped roof: a steep eave on the left, a long slope up to the gable
        const RL = [-40, -35, -30, -54, 23, -58, 23, -35];
        poly(RL, K.roof, null);
        ctx.save(); ctx.clip(); scales(-40, -57, 24, -34, 5, K.roofl); ctx.restore();
        poly(RL, null, K.edge, 1);
        fringe(-40, 11, -35, 2.4, K.roof);
        const RR = [29, -71, 46, -35, 35, -35];
        poly(RR, K.roof, null);
        ctx.save(); ctx.clip(); scales(29, -70, 47, -34, 5, K.roofl); ctx.restore();
        poly(RR, null, K.edge, 1);
        fringe(39, 46, -35, 2.3, K.roof);

        // dormer gable, cut off along the roof line behind it
        ctx.save();
        ctx.beginPath(); ctx.moveTo(-46, -96); ctx.lineTo(50, -96);
        ctx.lineTo(50, -60); ctx.lineTo(-46, -52.8); ctx.closePath(); ctx.clip();
        poly([-31, -50, -16, -70, -1, -50], K.blu, K.ol);
        const DY = [-28, -50, -16, -67, -4, -50];
        poly(DY, K.yel, null);
        ctx.save(); ctx.clip(); scales(-28, -67, -4, -49, 4, K.yeld); ctx.restore();
        poly(DY, null, K.ol, 1);
        sash(-19, -62.5, 6, 7, true, false);
        ctx.restore();

        // left half: blue siding over the porch, door, railing, pink skirt
        bx(-36, -35, 48, 10, K.sid, K.ol);
        boards(-36, -35, 48, 10, K.sidd, 2.6);
        bx(-36, -25, 48, 4, K.crm, K.ol);
        const fz = []; for (let xx = -33; xx < 10; xx += 2.6) fz.push([xx, -24.4, xx, -21.6]);
        rule(K.crmd, 0.8, fz);
        bx(-36, -21, 48, 13, K.pch, K.ol);
        boards(-36, -21, 48, 13, K.pchd, 2.8);
        bx(-36, -21, 4.6, 13, K.crm, K.ol);
        bx(7.4, -21, 4.6, 13, K.crm, K.ol);
        sash(-29, -19.5, 10, 7, true, true);
        bx(-8, -21, 10, 13, K.door, K.ol);
        bx(-6.2, -19.2, 6.4, 4.6, null, K.doord, 0.9);
        bx(-6.2, -13.8, 6.4, 4.6, null, K.doord, 0.9);
        ctx.fillStyle = K.crm; ctx.beginPath(); ctx.arc(0.2, -14.6, 0.9, 0, TAU); ctx.fill();
        bx(-31.5, -10.5, 22, 2.5, K.wht, K.ol, 1);
        const rb = []; for (let xx = -29.5; xx < -10.5; xx += 2.5) rb.push([xx, -10.4, xx, -8.2]);
        rule(K.whtd, 0.9, rb);
        bx(-36, -8, 48, 8, K.pnk, K.ol);
        bx(-31, -6, 16, 4.2, K.wood, K.ol, 1);
        const lt = []; for (let xx = -30.5; xx < -15; xx += 3) lt.push([xx, -2.1, xx + 2.6, -5.9]);
        rule(K.woodd, 0.9, lt);
        bx(-9, -6, 12, 6, K.wht, K.ol, 1);
        rule(K.whtd, 0.9, [[-9, -4, 3, -4], [-9, -2, 3, -2]]);

        // right half: the big scalloped gable over the bay window
        poly([15, -35, 28, -73, 41, -35], K.blu, K.ol);
        const GY = [17.5, -35, 28, -69.5, 38.5, -35];
        poly(GY, K.yel, null);
        ctx.save(); ctx.clip(); scales(17, -70, 39, -34, 4.4, K.yeld); ctx.restore();
        poly(GY, null, K.ol, 1);
        sash(24, -54, 8, 12, true, true);
        bx(10, -36, 34, 6, K.org, K.ol);
        rule(K.orgd, 0.9, [[10.8, -32.3, 43.2, -32.3]]);
        bx(12, -30, 30, 20, K.lime, K.ol);
        boards(12, -30, 30, 20, K.limed, 3);
        sash(14.5, -25, 5.5, 10, false, true);
        sash(22.5, -26, 9, 11, true, true);
        sash(34, -25, 5.5, 10, false, true);
        bx(12, -10.5, 30, 2.5, K.wht, K.ol, 1);
        const rb2 = []; for (let xx = 14; xx < 41; xx += 2.5) rb2.push([xx, -10.4, xx, -8.2]);
        rule(K.whtd, 0.9, rb2);
        bx(12, -8, 30, 8, K.lime, K.ol);
        const vents = [[14, 6], [23, 8], [34, 6]];
        for (const v of vents) {
          bx(v[0], -6, v[1], 4.2, K.wood, K.ol, 1);
          const d = []; for (let xx = v[0] + 0.4; xx < v[0] + v[1]; xx += 3) d.push([xx, -2.1, xx + 2.6, -5.9]);
          rule(K.woodd, 0.9, d);
        }

        // weather vane on the gable
        rule(K.vane, 1, [[28, -73, 28, -82], [24.5, -79, 31.5, -79], [26, -80.5, 28, -79], [30, -80.5, 28, -79]]);
        ctx.fillStyle = K.vane;
        ctx.beginPath(); ctx.moveTo(26, -83.5); ctx.quadraticCurveTo(29.5, -87, 31, -83.8);
        ctx.quadraticCurveTo(30.5, -82, 27.5, -82); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      function chimneyTop(ang) {
        const x = houseX(), y = Math.round(baseY() + slide()) + 0.5, pivot = ang > 0 ? 30 : -30;
        const lx = 18 - pivot, ly = -73, c = Math.cos(ang), s = Math.sin(ang);
        return { x: x + pivot + lx * c - ly * s, y: y + lx * s + ly * c };
      }
      function roundRect(x, y, w, h, r) {
        ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
      }
      function draw() {
        ctx.clearRect(0, 0, W, H);
        drawSky();
        drawClouds(false);
        drawGround();
        const ang = wobAngle();
        ctx.save();
        if (rp > 0) ctx.globalAlpha = 1 - rp;
        drawHouse(ang);

        const a = anchor(), ct = chimneyTop(ang);
        const next = pointNext && balloons.length ? balloons[0] : null;
        const tags = [];
        // strings
        ctx.lineWidth = 0.8; ctx.strokeStyle = INK('.45'); ctx.lineCap = 'round';
        for (const b of balloons) {
          const r = b.r * b.grow, bx = a.x + b.x, by = a.y + b.y + r + 3;
          const d = Math.hypot(bx - ct.x, by - ct.y), L = 8 + (b.L - 8) * b.grow;
          const slack = Math.max(0, L - d) * 0.4 + (R ? 0 : Math.sin(time * 1.3 + b.ph) * 3);
          const mx = (bx + ct.x) / 2, my = (by + ct.y) / 2, nx = d ? -(by - ct.y) / d : 0, ny = d ? (bx - ct.x) / d : 0;
          ctx.beginPath(); ctx.moveTo(ct.x, ct.y); ctx.quadraticCurveTo(mx + nx * slack, my + ny * slack, bx, by); ctx.stroke();
          const ux = d ? (ct.x - bx) / d : 0, uy = d ? (ct.y - by) / d : 1;
          tags.push({ b, x: bx + ux * 11, y: by + uy * 11 });
        }
        // balloons
        for (const b of balloons) {
          const r = b.r * (b.grow < 1 ? 1 - Math.pow(1 - b.grow, 3) : 1) * (hover === b ? 1.07 : 1);
          if (r < 0.5) continue;
          const x = a.x + b.x, y = a.y + b.y;
          if (y < -r * 2 || y > H + r * 2) continue;
          ctx.save(); ctx.translate(x, y); ctx.rotate(R ? 0 : clamp(b.vx * 0.004, -0.3, 0.3));
          const g = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.1);
          g.addColorStop(0, b.col.light); g.addColorStop(0.45, b.col.base); g.addColorStop(1, b.col.dark);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9, r, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = b.col.dark;
          ctx.beginPath(); ctx.moveTo(-2.4, r + 3.2); ctx.lineTo(0, r - 1); ctx.lineTo(2.4, r + 3.2); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.5)';
          ctx.beginPath(); ctx.ellipse(-r * 0.38, -r * 0.42, r * 0.14, r * 0.28, 0.5, 0, TAU); ctx.fill();
          if (next === b) {
            ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.95)';
            ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9 + 5, r + 5, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
          }
          ctx.restore();
        }
        // tags: a tiny card on every string; the words show on one at a time (hovered, next to read, or just arrived)
        ctx.fillStyle = INK('.7');
        for (const t of tags) if (t.b.grow > 0.3 && t.y > -20 && t.y < H + 20) ctx.fillRect(Math.round(t.x - 3), Math.round(t.y - 2), 6, 5);
        const newest = balloons[balloons.length - 1];
        const pick = hover || next || newest;
        const t = pick && tags.find(g => g.b === pick);
        let la = 0;
        if (t) la = (pick === newest && !hover && !next ? clamp((newest.born + 2.6 - time) / 0.4, 0, 1) : 1) * clamp(pick.grow * 2 - 1, 0, 1);
        if (t && la > 0.02) {
          ctx.font = '400 10px ' + fam; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const s = pick.msg[0], w = Math.ceil(ctx.measureText(s).width) + 12, h = 17;
          const x = clamp(t.x - w / 2, 4, W - w - 4), y = t.y + 5;
          ctx.globalAlpha = (1 - rp) * la;
          roundRect(x, y, w, h, 5); ctx.fillStyle = '#ececf0'; ctx.fill();
          ctx.fillStyle = BG; ctx.fillText(s, x + w / 2, y + h / 2 + 0.5);
        }
        ctx.restore();

        // pops and dust
        for (const p of parts) {
          const l = Math.max(0, p.life);
          if (p.k === 'ring') {
            ctx.strokeStyle = 'rgba(' + p.col.rgb.join(',') + ',' + (l * 0.7).toFixed(3) + ')'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.stroke();
          } else if (p.k === 'shred') {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.strokeStyle = 'rgba(' + p.col.rgb.join(',') + ',' + l.toFixed(3) + ')'; ctx.lineWidth = 2; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(0, -3, 3, 0); ctx.stroke(); ctx.restore();
          } else {
            ctx.fillStyle = 'rgba(196,176,138,' + (l * 0.6).toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.6 - l * 0.6), 0, TAU); ctx.fill();
          }
        }
        drawClouds(true);
      }

      // ---------- input ----------
      function hit(e) {
        const rect = canvas.getBoundingClientRect(), px = e.clientX - rect.left, py = e.clientY - rect.top;
        if (rp > 0.5) return null;
        const a = anchor();
        let best = null, bd = Infinity;
        for (let i = balloons.length - 1; i >= 0; i--) {
          const b = balloons[i], r = b.r * b.grow;
          const d = Math.hypot(px - (a.x + b.x), (py - (a.y + b.y)) * 0.9);
          if (d < r + 8 && d < bd) { best = b; bd = d; }
        }
        return best;
      }
      function onDown(e) {
        if (e.button > 0) return;
        const b = hit(e);
        if (b) { e.preventDefault(); pop(b); }
      }
      function onMove(e) {
        if (e.pointerType === 'touch') return;
        hover = hit(e);
        canvas.style.cursor = hover ? 'pointer' : '';
      }
      function onLeave() { hover = null; canvas.style.cursor = ''; }
      const nextOn = () => { pointNext = true; }, nextOff = () => { pointNext = false; };
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerleave', onLeave);
      // the button under the tile is the start arrow until the first one arrives, then it is the reset again
      function begin() {
        if (flowing) return;
        flowing = true;
        arriveT = Math.min(arriveT, 0.35);
        play('pop');
        announce('Notifications on.');
        if (ctl) { ctl.icon('reset'); ctl.press(null); }
      }
      if (ctl) { ctl.icon('play'); ctl.press(begin); }
      oneBtn.addEventListener('click', readOne);
      allBtn.addEventListener('click', markAll);
      oneBtn.addEventListener('pointerenter', nextOn);
      oneBtn.addEventListener('pointerleave', nextOff);
      oneBtn.addEventListener('focus', nextOn);
      oneBtn.addEventListener('blur', nextOff);

      // ---------- loop ----------
      let raf = 0, last = performance.now();
      function frame(ts) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)); last = ts;
        update(dt);
        draw();
      }
      updateStatus();
      raf = requestAnimationFrame(frame);

      return {
        destroy() {
          cancelAnimationFrame(raf);
          timers.forEach(clearTimeout); timers.clear();
          if (ro) ro.disconnect();
          canvas.removeEventListener('pointerdown', onDown);
          canvas.removeEventListener('pointermove', onMove);
          canvas.removeEventListener('pointerleave', onLeave);
          oneBtn.removeEventListener('click', readOne);
          allBtn.removeEventListener('click', markAll);
          oneBtn.removeEventListener('pointerenter', nextOn);
          oneBtn.removeEventListener('pointerleave', nextOff);
          oneBtn.removeEventListener('focus', nextOn);
          oneBtn.removeEventListener('blur', nextOff);
          balloons.length = 0; parts.length = 0;
        }
      };
    }
  });
})();
