// Slider: pull the car back against the line and let go (a pull-back toy car)
// Same build as slingshot-slider.html: the tile is painted the car's red, the slider sits on black.
(function () {
  const css = `
.x-slingshot { font-family: var(--body); color: #F5F5F5; background: #E2231A; }
.x-slingshot .sg-wrap, .x-slingshot .sg-wrap * { box-sizing: border-box; }
.x-slingshot .sg-wrap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 30px 26px; }

.x-slingshot .sg-card { position: relative; width: 100%; max-width: 272px; padding: 18px 16px 14px; border-radius: 14px;
  background: #000; border: 1px solid #262626; }

.x-slingshot .sg-read { display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px; }
.x-slingshot .sg-num, .x-slingshot .sg-unit, .x-slingshot .sg-power { font-size: 22px; line-height: 1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.x-slingshot .sg-num { color: #F5F5F5; }
.x-slingshot .sg-unit { color: #8C8C8C; }

.x-slingshot .sg-lane { position: relative; height: 84px; display: flex; align-items: center; padding: 0 28px; }
.x-slingshot .sg-track { position: relative; width: 100%; height: 2px; border-radius: 2px; background: #262626; }

.x-slingshot .sg-tick { position: absolute; top: 50%; width: 3px; height: 3px; margin: -1.5px 0 0 -1.5px; border-radius: 50%;
  background: #3D3D3D; transition: background .25s ease, transform .25s ease; }
.x-slingshot .sg-tick.lit { background: #606060; transform: scale(1.5); }

.x-slingshot .sg-fill { position: absolute; left: 0; top: 0; height: 2px; border-radius: 2px; background: #808080; }
.x-slingshot .sg-prev { position: absolute; top: 0; height: 2px; border-radius: 2px; background: #E2231A; opacity: .55; }
.x-slingshot .sg-anchor { position: absolute; top: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%;
  border: 1px solid #3D3D3D; opacity: 0; transition: opacity .2s ease; }
.x-slingshot .sg-anchor.on { opacity: 1; }
.x-slingshot .sg-band { position: absolute; top: 50%; height: 1.5px; margin-top: -.75px; border-radius: 2px; background: currentColor; opacity: 0; }
.x-slingshot .sg-band.on { opacity: 1; }

.x-slingshot .sg-dot { position: absolute; top: 50%; width: 3.5px; height: 3.5px; margin: -1.75px 0 0 -1.75px; border-radius: 50%; background: #E2231A; opacity: 0; }

.x-slingshot .sg-ghost { position: absolute; top: 50%; left: 0; width: 58px; margin-left: -29px; transform: translate3d(0,-50%,0); opacity: 0; transition: opacity .18s ease; }
.x-slingshot .sg-ghost svg { display: block; width: 100%; height: auto; filter: grayscale(1) brightness(.55); }

.x-slingshot .sg-bubble { position: absolute; left: 0; top: 50%; margin-top: -40px; opacity: 0; transition: opacity .18s ease; pointer-events: none; }
.x-slingshot .sg-bubble b { display: block; transform: translateX(-50%); font: 400 13px/1 var(--body); color: #E2231A; font-variant-numeric: tabular-nums; }
.x-slingshot .sg-ghost.on, .x-slingshot .sg-bubble.on { opacity: 1; }

.x-slingshot .sg-car { position: absolute; top: 50%; left: 0; width: 58px; margin-left: -29px; transform: translate3d(0,-50%,0); cursor: grab; touch-action: none; outline: none; ;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
.x-slingshot .sg-car:active { cursor: grabbing; }
.x-slingshot .sg-car::after { content: ''; position: absolute; inset: -18px -12px; border-radius: 14px; }
.x-slingshot .sg-flip { display: block; transform-origin: 50% 50%; }
.x-slingshot .sg-car svg { display: block; width: 100%; height: auto; }
.x-slingshot .sg-car:focus-visible .sg-hull { stroke: #fff; stroke-width: 1.6; stroke-opacity: .9; }

.x-slingshot .sg-lines { position: absolute; right: 100%; top: 50%; margin-top: -16px; width: 26px; height: 11px; opacity: 0; }
.x-slingshot .sg-lines i { position: absolute; right: 0; height: 1.5px; background: #fff; border-radius: 2px; opacity: .55; }
.x-slingshot .sg-lines i:nth-child(1) { top: 0; width: 16px; }
.x-slingshot .sg-lines i:nth-child(2) { top: 5px; width: 24px; }
.x-slingshot .sg-lines i:nth-child(3) { top: 10px; width: 12px; }

.x-slingshot .sg-end { position: absolute; top: 26px; white-space: nowrap; font-size: 11px; line-height: 14px; color: #8C8C8C; font-variant-numeric: tabular-nums; }
.x-slingshot .sg-end.sg-a { left: 0; transform: translateX(-50%); }
.x-slingshot .sg-end.sg-b { left: 100%; transform: translateX(-50%); }

.x-slingshot .sg-power { margin-left: auto; color: #8C8C8C; transition: color .2s ease; }
.x-slingshot .sg-power.hot { color: #E2231A; }

@media (max-width: 720px) {
  .x-slingshot .sg-lane { padding: 0 24px; }
  .x-slingshot .sg-car, .x-slingshot .sg-ghost { width: 54px; margin-left: -27px; }
}
`;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  const CAR =
    '<svg viewBox="0 0 130 84" aria-hidden="true" focusable="false">' +
      // rear wing
      '<rect x="4" y="9" width="27" height="4.2" rx="2.1" fill="#E2231A"/>' +
      '<rect x="4" y="9" width="3.6" height="14" rx="1.6" fill="#B3160F"/>' +
      '<rect x="17" y="12.6" width="4.2" height="14.5" fill="#B3160F"/>' +
      // body, airbox to nose
      '<path class="sg-hull" d="M20 36 L20 27 Q20 24 24.5 24 L44 24 Q47.5 17.5 58 17.5 Q63.5 17.5 64.5 22.5 L67 25.6 L79 25 L93 26.2 L95 38 L24 38 Q20 38 20 36 Z" fill="#E2231A"/>' +
      '<path d="M86 26.4 Q102 28.2 112 33.8 L121 35.6 Q125.2 36.6 120.6 38.2 L110.5 37.6 Q99 32.6 86 30.6 Z" fill="#E2231A"/>' +
      // sidepod and floor
      '<path d="M46 38 L46 30.5 Q46 27.6 52 27.6 L80 27.6 Q88 28.6 90.5 34 L90.5 38 Z" fill="#C81C14"/>' +
      '<path d="M20 36.6 L106 37.4 L106 39.6 L24 39.6 Q20 39.6 20 38 Z" fill="#8E1109"/>' +
      // cockpit, helmet, halo
      '<path d="M66 25.6 Q69 21.4 74.5 21.4 Q79 21.4 80.6 25.2 Z" fill="#121212"/>' +
      '<circle cx="73.6" cy="22.6" r="3" fill="#F5F5F5"/>' +
      '<path d="M64.8 25.8 Q74 17.4 83.4 25.2" fill="none" stroke="#121212" stroke-width="2.1" stroke-linecap="round"/>' +
      // front wing
      '<rect x="106" y="37" width="24" height="4" rx="2" fill="#E2231A"/>' +
      '<rect x="126" y="31.5" width="4" height="10.5" rx="1.6" fill="#B3160F"/>' +
      // wheels
      '<g><circle cx="34" cy="32.5" r="9.5" fill="#121212"/><circle cx="34" cy="32.5" r="8.4" fill="none" stroke="#2E2E2E" stroke-width="1.1"/>' +
        '<g class="sg-hub" style="transform-origin:34px 32.5px"><circle cx="34" cy="32.5" r="3.8" fill="#3D3D3D"/>' +
        '<rect x="33.2" y="27.6" width="1.6" height="9.8" rx=".8" fill="#4F4F4F"/>' +
        '<rect x="29.1" y="31.7" width="9.8" height="1.6" rx=".8" fill="#4F4F4F"/></g></g>' +
      '<g><circle cx="98" cy="32.5" r="9.5" fill="#121212"/><circle cx="98" cy="32.5" r="8.4" fill="none" stroke="#2E2E2E" stroke-width="1.1"/>' +
        '<g class="sg-hub" style="transform-origin:98px 32.5px"><circle cx="98" cy="32.5" r="3.8" fill="#3D3D3D"/>' +
        '<rect x="97.2" y="27.6" width="1.6" height="9.8" rx=".8" fill="#4F4F4F"/>' +
        '<rect x="93.1" y="31.7" width="9.8" height="1.6" rx=".8" fill="#4F4F4F"/></g></g>' +
    '</svg>';

  const MIN = 0, MAX = 100, START = 35;
  // tuned by hand, then frozen: the numbers that make the throw feel right
  const POWER = 3.2;               // how much of the pull turns into travel
  const ROLL = 3;                  // decay exponent: higher reads as more friction
  const OVER = 0.22, OVER_CAP = 22; // rubber band past the usable pull
  const DOTS = 16;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  window.EXPERIMENTS.push({
    id: 'slingshot',
    name: 'Slider',
    source: 'Pull-back toy car',
    hint: 'Pull the car back and let go. The wind-up is how far it travels.',
    mount(stage) {
      const R = !!window.REDUCED;
      const sfx = window.LAB_SFX;

      stage.innerHTML = `
        <div class="sg-wrap">
          <div class="sg-card">
            <div class="sg-read"><span class="sg-num">35</span><span class="sg-unit">/ 100</span><span class="sg-power"></span></div>
            <div class="sg-lane">
              <div class="sg-track">
                <div class="sg-ticks"></div>
                <span class="sg-end sg-a">0</span>
                <span class="sg-end sg-b">100</span>
                <div class="sg-fill"></div>
                <div class="sg-prev" style="opacity:0"></div>
                <div class="sg-anchor"></div>
                <div class="sg-band"></div>
                <div class="sg-dots"></div>
                <div class="sg-ghost">${CAR}</div>
                <div class="sg-bubble"><b>62</b></div>
                <div class="sg-car" role="slider" tabindex="0" aria-label="Value"
                     aria-valuemin="0" aria-valuemax="100" aria-valuenow="35">
                  <span class="sg-flip">${CAR}<span class="sg-lines"><i></i><i></i><i></i></span></span>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      const q = s => stage.querySelector(s);
      const lane = q('.sg-lane'), track = q('.sg-track');
      const fill = q('.sg-fill'), prev = q('.sg-prev'), anchorEl = q('.sg-anchor'), band = q('.sg-band');
      const ghost = q('.sg-ghost'), bubble = q('.sg-bubble'), bubbleV = bubble.querySelector('b');
      const car = q('.sg-car'), flip = q('.sg-flip'), numEl = q('.sg-num'), lines = q('.sg-lines'), power = q('.sg-power');
      const hubs = flip.querySelectorAll('.sg-hub');

      const dotsBox = q('.sg-dots'), dots = [];
      for (let i = 0; i < DOTS; i++) {
        const d = document.createElement('i'); d.className = 'sg-dot'; dotsBox.appendChild(d); dots.push(d);
      }
      const ticksBox = q('.sg-ticks'), ticks = [];
      for (let v = MIN; v <= MAX; v += 5) {
        const t = document.createElement('i'); t.className = 'sg-tick'; t.style.left = v + '%';
        ticksBox.appendChild(t); ticks.push({ el: t, v });
      }

      // ---- sound -----------------------------------------------------------
      // the engine and the rubber band are built here out of the lab's audio, so the
      // section's sound switch still turns the whole thing off

      let A = null, eng = null, creak = null;
      function audio() {
        if (A) return A;
        const a = sfx && sfx.audio && sfx.audio();
        if (!a) return null;
        const bus = a.ctx.createGain(); bus.gain.value = 0.8; bus.connect(a.out);
        A = { ctx: a.ctx, bus, noise: a.noise };
        return A;
      }
      const hiss = () => { const s = A.ctx.createBufferSource(); s.buffer = A.noise; s.loop = true; return s; };

      function tone(type, f0, f1, peak, dur, delay) {
        const c = audio(); if (!c) return;
        const t = c.ctx.currentTime + (delay || 0), o = c.ctx.createOscillator(), g = c.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(c.bus); o.start(t); o.stop(t + dur + 0.03);
      }
      function click(freq, qv, peak, dur, delay) {
        const c = audio(); if (!c) return;
        const t = c.ctx.currentTime + (delay || 0), s = hiss(), bp = c.ctx.createBiquadFilter(), g = c.ctx.createGain();
        bp.type = 'bandpass'; bp.frequency.setValueAtTime(freq, t); bp.Q.value = qv;
        g.gain.setValueAtTime(peak, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(bp); bp.connect(g); g.connect(c.bus); s.start(t); s.stop(t + dur + 0.03);
      }

      // the engine note, held open from the first pull until the car stops
      function engineOn() {
        const c = audio(); if (!c || eng) return;
        const t = c.ctx.currentTime;
        const lp = c.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.Q.value = 1.1;
        const g = c.ctx.createGain(); g.gain.value = 0.0001;
        const o1 = c.ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 60;
        const o2 = c.ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 90; o2.detune.value = 11;
        const o3 = c.ctx.createOscillator(); o3.type = 'square'; o3.frequency.value = 120;
        const g3 = c.ctx.createGain(); g3.gain.value = 0.22;
        o1.connect(lp); o2.connect(lp); o3.connect(g3); g3.connect(lp);
        lp.connect(g); g.connect(c.bus);
        const ns = hiss();
        const bp = c.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.6;
        const ng = c.ctx.createGain(); ng.gain.value = 0.0001;
        ns.connect(bp); bp.connect(ng); ng.connect(c.bus);
        o1.start(t); o2.start(t); o3.start(t); ns.start(t);
        eng = { g, ng, lp, bp, o1, o2, o3, ns };
        rev(0.06, 0.25);
      }
      function rev(rpm, vol) {
        if (!eng || !A) return;
        const t = A.ctx.currentTime, tc = 0.035;
        const f = 46 + rpm * rpm * 210 + rpm * 120;
        eng.o1.frequency.setTargetAtTime(f, t, tc);
        eng.o2.frequency.setTargetAtTime(f * 1.5, t, tc);
        eng.o3.frequency.setTargetAtTime(f * 2, t, tc);
        eng.lp.frequency.setTargetAtTime(380 + rpm * 2600, t, tc);
        eng.g.gain.setTargetAtTime(Math.max(0.0001, 0.018 + 0.085 * vol), t, tc);
        eng.bp.frequency.setTargetAtTime(900 + rpm * 1700, t, tc);
        eng.ng.gain.setTargetAtTime(Math.max(0.0001, 0.008 + 0.03 * vol), t, tc);
      }
      function engineOff(fade) {
        if (!eng || !A) return;
        const e = eng, t = A.ctx.currentTime, d = fade || 0.2;
        eng = null;
        e.g.gain.cancelScheduledValues(t);
        e.g.gain.setTargetAtTime(0.0001, t, d / 3);
        e.ng.gain.setTargetAtTime(0.0001, t, d / 3);
        e.o1.frequency.setTargetAtTime(40, t, d / 2);
        setTimeout(() => { try { e.o1.stop(); e.o2.stop(); e.o3.stop(); e.ns.stop(); } catch (err) {} }, (d + 0.25) * 1000);
      }
      // the rubber band: a creak that only speaks while the band is moving
      function creakOn() {
        const c = audio(); if (!c || creak) return;
        const s = hiss(), bp = c.ctx.createBiquadFilter(), g = c.ctx.createGain();
        bp.type = 'bandpass'; bp.frequency.value = 280; bp.Q.value = 7;
        g.gain.value = 0.0001;
        s.connect(bp); bp.connect(g); g.connect(c.bus); s.start(c.ctx.currentTime);
        creak = { s, bp, g };
      }
      function creakOff() {
        if (!creak || !A) return;
        const k = creak, t = A.ctx.currentTime; creak = null;
        k.g.gain.cancelScheduledValues(t);
        k.g.gain.setTargetAtTime(0.0001, t, 0.04);
        setTimeout(() => { try { k.s.stop(); } catch (err) {} }, 300);
      }

      const S = {
        grab() {
          click(1800, 4, 0.07, 0.05);
          tone('sine', 220, 120, 0.05, 0.08);
          engineOn(); creakOn();
        },
        // every pointer move: ratio 0-1 of full stretch, vel in px of travel
        pull(ratio, vel, maxed) {
          if (!audio()) return;
          rev(0.08 + ratio * 0.92, 0.1 + ratio * 0.9);
          if (creak) {
            const t = A.ctx.currentTime;
            creak.bp.frequency.setTargetAtTime(240 + ratio * 620, t, 0.05);
            creak.bp.Q.setTargetAtTime(6 + ratio * 8, t, 0.05);
            // held at full stretch the band keeps groaning even when nothing moves
            const body = Math.min(0.095, vel * 0.028) + (maxed ? 0.03 : 0);
            creak.g.gain.setTargetAtTime(body * (0.35 + ratio), t, 0.03);
          }
        },
        // one tooth of the ratchet, higher as the band tightens
        notch(ratio) {
          click(2200 + ratio * 2600, 14, 0.1, 0.024);
          tone('square', 900 + ratio * 900, 700 + ratio * 700, 0.034, 0.014);
        },
        wall() { tone('square', 1500, 900, 0.05, 0.07); click(3000, 6, 0.05, 0.06); },
        // let go: the band snaps, the air moves, the engine takes over
        release(ratio) {
          const c = audio(); if (!c) return;
          const r = Math.max(0.12, ratio);
          creakOff();
          tone('triangle', 120 + r * 320, 60 + r * 90, 0.22 * r + 0.06, 0.26);
          tone('sawtooth', 240 + r * 620, 90, 0.07 * r, 0.16);
          click(1200 + r * 900, 1.2, 0.09 * r + 0.02, 0.22);
          const t = c.ctx.currentTime, s = hiss(), bp = c.ctx.createBiquadFilter(), g = c.ctx.createGain();
          bp.type = 'bandpass'; bp.Q.value = 1.4;
          bp.frequency.setValueAtTime(380, t);
          bp.frequency.exponentialRampToValueAtTime(2400, t + 0.12);
          bp.frequency.exponentialRampToValueAtTime(420, t + 0.42);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.1 * r + 0.02, t + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
          s.connect(bp); bp.connect(g); g.connect(c.bus); s.start(t); s.stop(t + 0.5);
          engineOn(); rev(Math.min(1, r * 1.15), Math.min(1, r * 1.2));
        },
        roll(speed) { const s = Math.min(1, speed / 9); engineOn(); rev(s, s); },
        // one tick per mark the car passes
        gate(speed) {
          const s = Math.min(1, speed / 9);
          if (s < 0.08) return;
          click(700 + s * 900, 14, 0.012 + 0.03 * s, 0.03);
        },
        land(speed) {
          const s = Math.min(1, speed / 9);
          engineOff(0.22);
          tone('sine', 150, 52, 0.07 + 0.09 * s, 0.16);
          click(900, 3, 0.02 + 0.05 * s, 0.09);
          if (s > 0.42) click(2100, 16, 0.035 * s, 0.13);   // a scrub of tyre
        },
        nudge() { click(1500, 8, 0.035, 0.03); tone('sine', 520, 380, 0.03, 0.06); },
        quiet() { engineOff(0.12); creakOff(); }
      };
      const onSound = on => { if (!on) { engineOff(0.08); creakOff(); A = null; } };
      sfx && sfx.onChange && sfx.onChange(onSound);

      // ---- the line --------------------------------------------------------

      let W = 0, RUNOFF = 32, MAXPULL = 90;
      let value = START, dir = 1, drag = null, raf = 0, dip = 0, liveX = null;

      const px = v => (v - MIN) / (MAX - MIN) * W;
      const val = x => (W > 0 ? MIN + (x / W) * (MAX - MIN) : value);

      function measure() {
        const w = track.clientWidth;
        if (w > 0) W = w;                                   // never measure a hidden track
        // the apron each side of the line: there has to be room to wind up at either end
        RUNOFF = parseFloat(getComputedStyle(lane).paddingLeft) || 32;
        MAXPULL = Math.max(70, W * 0.34);                   // a slingshot only stretches so far
      }

      const setCar = (x, tilt) => {
        car.style.transform = `translate3d(${x}px,-50%,0)`;
        flip.style.transform = `scaleX(${dir}) rotate(${tilt || 0}deg)`;
      };
      const spin = deg => { for (const h of hubs) h.style.transform = `rotate(${deg}deg)`; };
      const paintTicks = v => { for (const t of ticks) t.el.classList.toggle('lit', t.v <= v + 0.5); };

      function show(v) {
        const n = Math.round(v);
        numEl.textContent = n;
        car.setAttribute('aria-valuenow', n);
      }

      function render(v) {
        const x = px(v);
        setCar(x, 0);
        fill.style.width = x + 'px';
        show(v);
        paintTicks(v);
      }

      function stopRoll() {
        if (!raf) return;
        cancelAnimationFrame(raf); raf = 0;
        if (liveX !== null) { value = clamp(val(liveX), MIN, MAX); liveX = null; }
      }

      // ---- the pull --------------------------------------------------------

      function onDown(e) {
        stopRoll();
        car.setPointerCapture(e.pointerId);
        car.focus();
        drag = { id: e.pointerId, startX: e.clientX, anchor: value, anchorX: px(value), pull: 0, target: value,
                 maxed: false, wasMaxed: false, ratio: 0, lastPull: 0, notch: 0 };
        S.grab();
        anchorEl.style.left = drag.anchorX + 'px';
        anchorEl.classList.add('on');
        aim(e.clientX);
        e.preventDefault();
      }

      function aim(clientX) {
        const raw = clientX - drag.startX, ax = drag.anchorX;
        // pull stops paying off at whichever comes first: the stretch, the apron, or the far end
        const wallRoom = raw < 0 ? ax + RUNOFF : (W - ax) + RUNOFF;
        const reach = raw < 0 ? (W - ax) / POWER : ax / POWER;
        const limit = Math.max(5, Math.min(MAXPULL, wallRoom, reach));

        const mag = Math.abs(raw), sign = raw < 0 ? -1 : 1;
        let eff = mag, maxed = false;
        if (mag > limit) { eff = limit + Math.min((mag - limit) * OVER, OVER_CAP); maxed = true; }

        const pull = sign * eff, usable = sign * Math.min(mag, limit);
        const carX = clamp(ax + pull, -RUNOFF - 10, W + RUNOFF + 10);
        const targetX = clamp(ax - usable * POWER, 0, W);
        const target = clamp(val(targetX), MIN, MAX);
        const ratio = clamp(Math.abs(usable) / limit, 0, 1);

        drag.pull = pull; drag.target = target; drag.maxed = maxed && limit > 2;
        if (Math.abs(raw) > 2) dir = raw < 0 ? 1 : -1;

        setCar(carX, -2.6 * ratio * dir);
        spin(-(pull / 8) * (180 / Math.PI) * 0.35);

        // the line already shows where it will land
        fill.style.width = Math.min(ax, targetX) + 'px';
        prev.style.opacity = Math.abs(targetX - ax) > 1 ? 1 : 0;
        prev.style.left = Math.min(ax, targetX) + 'px';
        prev.style.width = Math.abs(targetX - ax) + 'px';
        paintTicks(target);

        // the rubber band, anchor to car
        band.classList.add('on');
        band.style.left = Math.min(carX, ax) + 'px';
        band.style.width = Math.abs(carX - ax) + 'px';
        band.style.color = drag.maxed ? '#E2231A'
          : `rgb(${Math.round(110 + 116 * ratio)},${Math.round(110 - 75 * ratio)},${Math.round(110 - 84 * ratio)})`;

        // trajectory
        const span = targetX - carX;
        for (let i = 0; i < DOTS; i++) {
          const f = (i + 1) / (DOTS + 1);
          dots[i].style.left = (carX + span * f) + 'px';
          dots[i].style.opacity = ratio > 0.02 ? (0.14 + 0.5 * f) * Math.min(1, ratio * 1.6) : 0;
          dots[i].style.transform = `scale(${0.6 + 0.6 * f})`;
        }

        ghost.classList.toggle('on', ratio > 0.04);
        ghost.style.transform = `translate3d(${targetX}px,-50%,0) scaleX(${dir})`;
        bubble.classList.toggle('on', ratio > 0.04);
        bubble.style.transform = `translate3d(${targetX}px,0,0)`;
        bubbleV.textContent = Math.round(target);

        // sound follows the same numbers the visuals do
        const vel = Math.abs(pull - drag.lastPull); drag.lastPull = pull;
        S.pull(ratio, vel, drag.maxed);
        const notch = Math.round(ratio * 13);
        if (notch !== drag.notch) { drag.notch = notch; if (ratio > 0.02) S.notch(ratio); }
        if (drag.maxed && !drag.wasMaxed) S.wall();
        drag.wasMaxed = drag.maxed;
        drag.ratio = ratio;

        show(drag.anchor);
        power.textContent = drag.maxed ? 'Full power' : Math.round(ratio * 100) + '% power';
        power.classList.toggle('hot', drag.maxed);
      }

      function clearAim() {
        power.textContent = '';
        power.classList.remove('hot');
        band.classList.remove('on');
        anchorEl.classList.remove('on');
        ghost.classList.remove('on');
        bubble.classList.remove('on');
        prev.style.opacity = 0;
        for (const d of dots) d.style.opacity = 0;
      }

      function onMove(e) { if (drag && e.pointerId === drag.id) aim(e.clientX); }

      function onUp() {
        if (!drag) return;
        const from = val(drag.anchorX + drag.pull);
        const to = Math.round(drag.target);
        S.release(drag.ratio || 0);
        drag = null;
        clearAim();
        roll(from, to);
      }

      // ---- the roll --------------------------------------------------------

      function roll(from, to) {
        const x0 = px(from), x1 = px(to), dist = x1 - x0;
        if (Math.abs(dist) < 0.6) {
          value = to; liveX = null; render(value);
          flip.style.transform = `scaleX(${dir})`;
          S.quiet();
          return;
        }
        if (Math.abs(dist) > 4) dir = dist > 0 ? 1 : -1;

        const dur = R ? 180 : clamp(240 + Math.abs(dist) * 1.9, 240, 950);
        const t0 = performance.now();
        let prevX = x0, gate = Math.floor(from / 5), lastSpeed = 0;

        lines.style.opacity = 1;

        const frame = now => {
          const t = clamp((now - t0) / dur, 0, 1);
          const e = 1 - Math.pow(1 - t, ROLL);      // rolls out, no bounce
          const x = x0 + dist * e;
          const speed = Math.abs(x - prevX); prevX = x; liveX = x; lastSpeed = speed;
          S.roll(speed);

          spin(((x - x0) / 9) * (180 / Math.PI) * 0.5);
          setCar(x, -3.2 * (1 - e) * dir);
          fill.style.width = x + 'px';
          const v = val(x);
          show(v); paintTicks(v);
          const g = Math.floor(v / 5);
          if (g !== gate) { gate = g; S.gate(speed); }
          lines.style.opacity = Math.min(1, speed / 4) * (1 - t);

          if (t < 1) { raf = requestAnimationFrame(frame); }
          else {
            raf = 0; liveX = null; value = to; render(value);
            flip.style.transform = `scaleX(${dir})`;
            lines.style.opacity = 0;
            S.land(lastSpeed);
            settle();
          }
        };
        raf = requestAnimationFrame(frame);
      }

      // the nose dips as it stops
      function settle() {
        if (R) return;
        const t0 = performance.now();
        const step = now => {
          const t = clamp((now - t0) / 260, 0, 1);
          flip.style.transform = `scaleX(${dir}) rotate(${Math.sin(t * Math.PI) * 2.2 * dir}deg)`;
          if (t < 1) dip = requestAnimationFrame(step); else dip = 0;
        };
        dip = requestAnimationFrame(step);
      }

      function onKey(e) {
        const step = e.shiftKey ? 10 : 1;
        let next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = value + step;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = value - step;
        else if (e.key === 'Home') next = MIN;
        else if (e.key === 'End') next = MAX;
        if (next === null) return;
        e.preventDefault();
        stopRoll();
        S.nudge();
        roll(value, clamp(Math.round(next), MIN, MAX));
      }

      car.addEventListener('pointerdown', onDown);
      car.addEventListener('pointermove', onMove);
      car.addEventListener('pointerup', onUp);
      car.addEventListener('pointercancel', onUp);
      car.addEventListener('keydown', onKey);

      let ro = null;
      if (window.ResizeObserver) {
        ro = new ResizeObserver(() => {
          measure();
          if (drag) drag.anchorX = px(drag.anchor);          // keep a live drag honest
          else if (!raf) render(value);
        });
        ro.observe(track);
      }

      measure();
      render(value);

      return {
        destroy() {
          if (raf) cancelAnimationFrame(raf);
          if (dip) cancelAnimationFrame(dip);
          raf = dip = 0; drag = null; liveX = null;
          engineOff(0.08); creakOff(); A = null;
          sfx && sfx.offChange && sfx.offChange(onSound);
          if (ro) { ro.disconnect(); ro = null; }
          car.removeEventListener('pointerdown', onDown);
          car.removeEventListener('pointermove', onMove);
          car.removeEventListener('pointerup', onUp);
          car.removeEventListener('pointercancel', onUp);
          car.removeEventListener('keydown', onKey);
        }
      };
    }
  });
})();
