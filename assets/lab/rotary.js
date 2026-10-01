(function(){
  const css = `
.x-rotary .rp-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 0 12px; }
.x-rotary .rp-dialwrap { position: relative; flex: none; border-radius: 50%; outline: none; }
.x-rotary .rp-dialwrap:focus-visible { outline: 2px solid #8b7dff; outline-offset: 4px; }
.x-rotary .rp-dial { display: block; width: 100%; height: 100%; overflow: visible; cursor: grab; -webkit-tap-highlight-color: transparent; touch-action: none; ;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
.x-rotary .rp-dialwrap.is-dragging .rp-dial { cursor: grabbing; }
.x-rotary .rp-num { font-family: var(--body); font-weight: 700; font-size: 23px; fill: #111113; stroke: #111113; stroke-width: .7px; paint-order: stroke; }
.x-rotary .rp-hl { fill: none; stroke: #fff; stroke-width: 3.2; opacity: 0; transition: opacity .18s ease; }
.x-rotary .rp-hole.is-grab .rp-hl { opacity: .9; }
/* until someone dials, the first hole blinks softly to show where a finger goes */
@keyframes rp-invite { 0%, 62%, 100% { opacity: 0 } 18%, 40% { opacity: .5 } }
.x-rotary .rp-hole.is-invite .rp-hl { animation: rp-invite 2.8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .x-rotary .rp-hole.is-invite .rp-hl { animation: none; } }
.x-rotary .rp-stop { transform-box: view-box; }
.x-rotary .rp-card-arc { font-family: var(--body); font-weight: 400; font-size: 7.4px; fill: #3c3c3a; letter-spacing: .03em; }
.x-rotary .rp-card-text { font-family: var(--body); font-weight: 400; font-size: 9.4px; fill: #333331; }
.x-rotary .rp-card-no { font-family: var(--body); font-weight: 400; font-size: 9.4px; fill: #333331; }
.x-rotary .rp-uline { stroke: #4a4a47; stroke-width: .8; }
.x-rotary .rp-slot text { font-family: var(--body); font-weight: 700; font-size: 11px; fill: #1f1f1e; opacity: 0; transform-box: fill-box; transform-origin: center; transform: translateY(4px) scale(.6); transition: opacity .16s ease, transform .28s cubic-bezier(.3,1.5,.5,1); }
.x-rotary .rp-slot circle { fill: #2a2a28; transform-box: fill-box; transform-origin: center; transform: scale(0); transition: transform .26s cubic-bezier(.3,1.7,.5,1), fill .25s ease; }
.x-rotary .rp-slot.has-digit text { opacity: 1; transform: none; }
.x-rotary .rp-slot.is-masked text { opacity: 0; transform: scale(.4); }
.x-rotary .rp-slot.is-masked circle { transform: scale(1); }
.x-rotary .rp-glow { fill: none; stroke: #8ff0ae; stroke-width: 7; opacity: 0; transition: opacity .5s ease; }
.x-rotary .rp-tint { fill: #8ff0ae; opacity: 0; transition: opacity .5s ease; }
.x-rotary .rp-wrap.is-ok .rp-glow { opacity: .55; }
.x-rotary .rp-wrap.is-ok .rp-tint { opacity: .12; }
.x-rotary .rp-wrap.is-ok .rp-slot circle { fill: #2f7a4a; }
.x-rotary .rp-wrap.is-bad .rp-slot circle { fill: #b6382c; }
.x-rotary .rp-pin { transform-box: fill-box; }
.x-rotary .rp-status { font: 400 12px/1.2 var(--body); color: #8d8d97; min-height: 15px; text-align: center; white-space: nowrap; transition: color .25s ease; }
.x-rotary .rp-wrap.is-ok .rp-status { color: #8ff0ae; }
.x-rotary .rp-wrap.is-bad .rp-status { color: #ff7a66; }
.x-rotary .is-shaking { animation: x-rotary-shake .42s cubic-bezier(.36,.07,.19,.97); }
@keyframes x-rotary-shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-6px); }
  30% { transform: translateX(5px); }
  45% { transform: translateX(-4px); }
  60% { transform: translateX(3px); }
  75% { transform: translateX(-2px); }
  90% { transform: translateX(1px); }
}
@media (prefers-reduced-motion: reduce) {
  .x-rotary .is-shaking { animation: none; }
}
`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  window.EXPERIMENTS.push({
    id: 'rotary',
    name: 'PIN Entry',
    source: 'Rotary phone',
    hint: 'Put a finger in a hole and drag it round to the metal stop, or type the digits.',
    mount(stage) {
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      const REDUCED = !!window.REDUCED;
      const PIN = '1984';
      const IDLE_TEXT = 'Dial 1984 to unlock';
      const WHEEL_R = 132, HOLE_R = 102, HOLE_SIZE = 19.5, SP = 27, FIRST = -36, STOP = 57, STOP_GAP = 12;
      const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      const baseAngle = i => FIRST - i * SP;
      const travelOf = i => (STOP - STOP_GAP) - baseAngle(i);
      const rad = d => d * Math.PI / 180;
      const norm = d => { d = ((d + 180) % 360 + 360) % 360 - 180; return d; };
      const u = 'rp' + Math.random().toString(36).slice(2, 8);

      // holes: mask cut-outs, chrome bevels (both rotate), numbers on the fixed plate
      let holesMask = '', holesSvg = '', numsSvg = '';
      DIGITS.forEach((d, i) => {
        const a = rad(baseAngle(i));
        const x = (Math.cos(a) * HOLE_R).toFixed(2), y = (Math.sin(a) * HOLE_R).toFixed(2);
        holesMask += `<circle cx="${x}" cy="${y}" r="${HOLE_SIZE}" fill="#000"/>`;
        holesSvg += `<g class="rp-hole">
          <circle cx="${x}" cy="${y}" r="${HOLE_SIZE - 1.6}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="2"/>
          <circle cx="${x}" cy="${y}" r="${HOLE_SIZE + 2.2}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width=".8"/>
          <circle cx="${x}" cy="${y}" r="${HOLE_SIZE + .6}" fill="none" stroke="url(#${u}-ring)" stroke-width="2.9"/>
          <circle class="rp-hl" cx="${x}" cy="${y}" r="${HOLE_SIZE + .6}"/>
        </g>`;
        numsSvg += `<circle cx="${x}" cy="${y}" r="${HOLE_SIZE - 1.2}" fill="url(#${u}-disc)"/>` +
          `<text class="rp-num" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${d}</text>`;
      });

      // conic-ish reflections: thin grey wedges whose brightness varies with angle
      let conic = '';
      const N = 120;
      for (let k = 0; k < N; k++) {
        const a0 = k * 360 / N, a1 = a0 + 360 / N + 0.8, mid = a0 + 180 / N;
        let l = 0.56 + 0.24 * Math.cos(rad(2 * (mid + 55))) + 0.16 * Math.cos(rad(mid - 40)) + 0.06 * Math.cos(rad(5 * mid + 20));
        l = Math.max(0, Math.min(1, l));
        const g = Math.round(70 + l * 185);
        const p0x = (Math.cos(rad(a0)) * WHEEL_R).toFixed(2), p0y = (Math.sin(rad(a0)) * WHEEL_R).toFixed(2);
        const p1x = (Math.cos(rad(a1)) * WHEEL_R).toFixed(2), p1y = (Math.sin(rad(a1)) * WHEEL_R).toFixed(2);
        conic += `<path d="M0 0L${p0x} ${p0y}A${WHEEL_R} ${WHEEL_R} 0 0 1 ${p1x} ${p1y}Z" fill="rgb(${g},${g},${g + 3})"/>`;
      }

      const wrap = document.createElement('div');
      wrap.className = 'rp-wrap';
      wrap.innerHTML = `
        <div class="rp-dialwrap" tabindex="0" role="application" aria-label="Rotary dial. Type digits 0 to 9 to dial, Backspace to clear.">
          <svg class="rp-dial" viewBox="-140 -140 280 280" aria-hidden="true">
            <defs>
              <linearGradient id="${u}-chrome" gradientUnits="userSpaceOnUse" x1="-132" y1="-132" x2="132" y2="132">
                <stop offset="0" stop-color="#d9dadd"/><stop offset=".22" stop-color="#8e9096"/><stop offset=".42" stop-color="#eeeff1"/>
                <stop offset=".55" stop-color="#b3b5ba"/><stop offset=".72" stop-color="#fafafb"/><stop offset=".88" stop-color="#9fa1a6"/><stop offset="1" stop-color="#d6d7da"/>
              </linearGradient>
              <radialGradient id="${u}-edge" cx="0" cy="0" r="${WHEEL_R}" gradientUnits="userSpaceOnUse">
                <stop offset=".86" stop-color="#000" stop-opacity="0"/><stop offset=".97" stop-color="#000" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".38"/>
              </radialGradient>
              <linearGradient id="${u}-sweep" gradientUnits="userSpaceOnUse" x1="-60" y1="-120" x2="60" y2="120">
                <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".48" stop-color="#fff" stop-opacity=".5"/>
                <stop offset=".56" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
              </linearGradient>
              <linearGradient id="${u}-bevel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#8a8c92"/><stop offset="1" stop-color="#3e3f44"/>
              </linearGradient>
              <linearGradient id="${u}-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#c9cacf"/><stop offset=".6" stop-color="#6f7177"/><stop offset="1" stop-color="#f4f4f6"/>
              </linearGradient>
              <linearGradient id="${u}-bezel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#fdfdfe"/><stop offset=".3" stop-color="#c3c5ca"/><stop offset=".55" stop-color="#707278"/>
                <stop offset=".8" stop-color="#e4e5e8"/><stop offset="1" stop-color="#8b8d93"/>
              </linearGradient>
              <linearGradient id="${u}-bezel-in" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0" stop-color="#fbfbfc"/><stop offset=".5" stop-color="#9a9ca2"/><stop offset="1" stop-color="#55565c"/>
              </linearGradient>
              <radialGradient id="${u}-card" cx="42%" cy="35%" r="75%">
                <stop offset="0" stop-color="#f3f2e3"/><stop offset=".75" stop-color="#e8e6d2"/><stop offset="1" stop-color="#d5d2bb"/>
              </radialGradient>
              <linearGradient id="${u}-glass" x1="0" y1="0" x2=".7" y2="1">
                <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
              </linearGradient>
              <radialGradient id="${u}-plate" cx="0" cy="0" r="${WHEEL_R}" gradientUnits="userSpaceOnUse">
                <stop offset=".55" stop-color="#8f9095"/><stop offset=".8" stop-color="#c4c5c9"/><stop offset="1" stop-color="#8a8b90"/>
              </radialGradient>
              <radialGradient id="${u}-disc" cx="45%" cy="40%" r="65%">
                <stop offset="0" stop-color="#ffffff"/><stop offset=".8" stop-color="#f0f0f1"/><stop offset="1" stop-color="#d4d5d8"/>
              </radialGradient>
              <radialGradient id="${u}-shadow" cx="50%" cy="50%" r="50%">
                <stop offset=".86" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
              </radialGradient>
              <linearGradient id="${u}-fin" gradientUnits="userSpaceOnUse" x1="92" y1="-14" x2="140" y2="16">
                <stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#d8d9dd"/><stop offset=".6" stop-color="#76787e"/>
                <stop offset=".8" stop-color="#e9eaed"/><stop offset="1" stop-color="#9c9ea3"/>
              </linearGradient>
              <filter id="${u}-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
              <path id="${u}-arc" d="M-45.5 0A45.5 45.5 0 0 1 45.5 0"/>
              <mask id="${u}-mask" maskUnits="userSpaceOnUse" x="-140" y="-140" width="280" height="280">
                <circle r="${WHEEL_R}" fill="#fff"/>
                <g class="rp-maskholes">${holesMask}</g>
              </mask>
            </defs>

            <circle r="140" cy="5" fill="url(#${u}-shadow)"/>
            <circle r="${WHEEL_R - 1}" fill="url(#${u}-plate)"/>
            ${numsSvg}

            <g mask="url(#${u}-mask)">
              <circle r="${WHEEL_R}" fill="url(#${u}-chrome)"/>
              <g opacity=".55">${conic}</g>
              <circle r="${WHEEL_R}" fill="url(#${u}-sweep)"/>
              <circle r="${WHEEL_R}" fill="url(#${u}-edge)"/>
              <circle r="${WHEEL_R - 1}" fill="none" stroke="url(#${u}-bevel)" stroke-width="2"/>
            </g>
            <g class="rp-holes">${holesSvg}</g>

            <g class="rp-center">
              <circle class="rp-glow" r="62" filter="url(#${u}-blur)"/>
              <circle r="66.5" cy="2.5" fill="#000" opacity=".28" filter="url(#${u}-blur)"/>
              <circle r="66" fill="url(#${u}-bezel)"/>
              <circle r="60.5" fill="url(#${u}-bezel-in)"/>
              <circle r="57.5" fill="url(#${u}-card)"/>
              <circle class="rp-tint" r="57.5"/>
              <circle r="57.5" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1"/>
              <text class="rp-card-arc" text-anchor="middle"><textPath href="#${u}-arc" startOffset="50%">Listen before calling</textPath></text>
              <text class="rp-card-text" x="0" y="-3" text-anchor="middle" dominant-baseline="central">Pull dial round</text>
              <text class="rp-card-text" x="0" y="9" text-anchor="middle" dominant-baseline="central">to stop &amp; let go</text>
              <g class="rp-pin">
                <text class="rp-card-no" x="-37" y="27" dominant-baseline="central">No</text>
                <line class="rp-uline" x1="-22" y1="33" x2="34" y2="33"/>
                <g class="rp-slot"><text x="-13" y="26.5" text-anchor="middle" dominant-baseline="central"></text><circle cx="-13" cy="28" r="2.4"/></g>
                <g class="rp-slot"><text x="0" y="26.5" text-anchor="middle" dominant-baseline="central"></text><circle cx="0" cy="28" r="2.4"/></g>
                <g class="rp-slot"><text x="13" y="26.5" text-anchor="middle" dominant-baseline="central"></text><circle cx="13" cy="28" r="2.4"/></g>
                <g class="rp-slot"><text x="26" y="26.5" text-anchor="middle" dominant-baseline="central"></text><circle cx="26" cy="28" r="2.4"/></g>
              </g>
              <path d="M-52 -18A55 55 0 0 1 30 -46Q-10 -30 -52 -18Z" fill="url(#${u}-glass)" opacity=".7"/>
            </g>

            <g transform="rotate(${STOP})">
              <g class="rp-stop">
                <path d="M138 -12C124 -12.5 106 -9 94 -3.2L92.6 -1.4C103 1.5 113 5.5 121 11.5C127 15.5 133 16.5 138 15Z" transform="translate(1 2.2)" fill="#000" opacity=".35"/>
                <path d="M138 -12C124 -12.5 106 -9 94 -3.2L92.6 -1.4C103 1.5 113 5.5 121 11.5C127 15.5 133 16.5 138 15Z" fill="url(#${u}-fin)" stroke="#55575d" stroke-width=".6"/>
                <path d="M134 -10C122 -10 108 -7 97 -2.6" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.1" stroke-linecap="round"/>
              </g>
            </g>
          </svg>
        </div>
        <div class="rp-status" aria-live="polite">${IDLE_TEXT}</div>`;
      stage.appendChild(wrap);

      const dialWrap = wrap.querySelector('.rp-dialwrap');
      const svg = wrap.querySelector('svg');
      const maskHoles = svg.querySelector('.rp-maskholes');
      const holesG = svg.querySelector('.rp-holes');
      const holes = Array.from(holesG.children);
      const uline = svg.querySelector('.rp-uline');
      const stopEl = svg.querySelector('.rp-stop');
      const pinG = svg.querySelector('.rp-pin');
      const textEl = wrap.querySelector('.rp-status');
      const slots = Array.from(svg.querySelectorAll('.rp-slot'));

      // ---------- layout ----------
      const layout = () => {
        const w = stage.clientWidth || 360, h = stage.clientHeight || 320;
        const size = Math.max(180, Math.min(h - 44, w - 24));
        dialWrap.style.width = size + 'px';
        dialWrap.style.height = size + 'px';
      };
      layout();
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(layout) : null;
      if (ro) ro.observe(stage);

      // ---------- state ----------
      let theta = 0, mode = 'idle', grab = -1, raw = 0, prevA = 0, atStop = false, dialed = false;
      let raf = 0, last = 0, autoStart = 0, autoDur = 0, busy = false, resultShown = false;
      let digits = [];
      const queue = [];
      const timers = new Set();
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

      const setTheta = t => {
        theta = t;
        const tr = `rotate(${t.toFixed(2)})`;
        maskHoles.setAttribute('transform', tr);
        holesG.setAttribute('transform', tr);
      };

      const pulse = () => {
        sfx('tick');
        if (!uline.animate) return;
        uline.animate([
          { strokeOpacity: .25 },
          { strokeOpacity: 1 }
        ], { duration: REDUCED ? 60 : 110, easing: 'ease-out' });
      };

      const hitStop = () => {
        sfx('clunk');
        if (REDUCED || !stopEl.animate) return;
        stopEl.animate([
          { transform: 'translate(0px,0px)' },
          { transform: 'translate(0px,1.6px)' },
          { transform: 'translate(0px,-.5px)' },
          { transform: 'translate(0px,0px)' }
        ], { duration: 170, easing: 'ease-out' });
        const hl = holes[grab] && holes[grab].querySelector('.rp-hl');
        if (hl && hl.animate) hl.animate([{ strokeWidth: 4.6 }, { strokeWidth: 3.2 }], { duration: 200, easing: 'ease-out' });
      };

      const setStatus = (cls, text) => {
        wrap.classList.remove('is-ok', 'is-bad');
        if (cls) wrap.classList.add(cls);
        textEl.textContent = text;
      };

      const clearSlots = () => {
        slots.forEach(el => el.classList.remove('has-digit', 'is-masked'));
      };

      const startEntry = () => {
        if (resultShown || digits.length >= 4) {
          digits = [];
          resultShown = false;
          setStatus(null, IDLE_TEXT);
          clearSlots();
        }
      };

      const registerDigit = d => {
        const i = digits.length;
        digits.push(d);
        const el = slots[i];
        el.classList.remove('is-masked');
        el.querySelector('text').textContent = String(d);
        el.classList.add('has-digit');
      };

      const shake = () => {
        [pinG, textEl].forEach(el => {
          el.classList.remove('is-shaking');
          void el.getBoundingClientRect();
          if (!REDUCED) el.classList.add('is-shaking');
        });
      };

      const check = () => {
        const ok = digits.join('') === PIN;
        slots.forEach(el => el.classList.add('is-masked'));
        resultShown = true;
        queue.length = 0;
        if (ok) {
          setStatus('is-ok', 'Unlocked');
          sfx('ok');
          busy = false;
        } else {
          setStatus('is-bad', 'Wrong number');
          sfx('bad');
          shake();
          later(() => {
            pinG.classList.remove('is-shaking');
            textEl.classList.remove('is-shaking');
            digits = [];
            clearSlots();
            busy = false;
          }, REDUCED ? 700 : 520);
          later(() => {
            if (!digits.length && wrap.classList.contains('is-bad')) { resultShown = false; setStatus(null, IDLE_TEXT); }
          }, 1600);
        }
      };

      const onReturned = () => {
        const i = digits.length - 1;
        if (i < 0) return;
        const el = slots[i];
        later(() => {
          if (digits[i] === undefined || resultShown) return;
          el.classList.add('is-masked');
        }, 320);
        if (digits.length === 4) {
          busy = true;
          later(check, 560);
        }
      };

      const kick = () => {
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      };

      const release = () => {
        const T = travelOf(grab);
        dialed = theta >= T - 1.5;
        dialWrap.classList.remove('is-dragging');
        if (holes[grab]) holes[grab].classList.remove('is-grab');
        if (dialed) registerDigit(DIGITS[grab]);
        mode = theta > 0.01 ? 'return' : 'idle';
        if (mode === 'return') kick();
        else finishReturn();
      };

      const finishReturn = () => {
        const wasDialed = dialed;
        mode = 'idle';
        grab = -1;
        dialed = false;
        setTheta(0);
        if (wasDialed) onReturned();
        next();
      };

      const next = () => {
        if (mode !== 'idle' || !queue.length) return;
        if (busy) { later(next, 120); return; }
        startAuto(queue.shift());
      };

      const startAuto = d => {
        const i = DIGITS.indexOf(d);
        if (i < 0) return;
        startEntry();
        if (digits.length >= 4) return;
        grab = i;
        mode = 'auto';
        atStop = false;
        autoStart = performance.now();
        const T = travelOf(i);
        autoDur = REDUCED ? 120 : 160 + T * 1.25;
        holes[i].classList.add('is-grab');
        kick();
      };

      const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      function frame(now) {
        raf = 0;
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        if (mode === 'auto') {
          const T = travelOf(grab);
          const el = now - autoStart;
          if (el < autoDur) {
            setTheta(T * ease(el / autoDur));
          } else {
            setTheta(T);
            if (!atStop) { atStop = true; hitStop(); }
            if (el > autoDur + (REDUCED ? 40 : 110)) release();
          }
        } else if (mode === 'return') {
          const speed = REDUCED ? 1600 : 340;
          const t = theta - speed * dt;
          if (dialed) {
            const T = travelOf(grab), n = grab + 1;
            for (let k = 0; k < n; k++) {
              const thr = T - (k + 0.5) * SP;
              if (theta > thr && t <= thr) pulse();
            }
          }
          if (t <= 0) finishReturn();
          else setTheta(t);
        }
        if (mode === 'auto' || mode === 'return') raf = requestAnimationFrame(frame);
      }

      // ---------- pointer ----------
      const toLocal = e => {
        const r = svg.getBoundingClientRect();
        const k = 280 / (r.width || 1);
        return { x: (e.clientX - r.left) * k - 140, y: (e.clientY - r.top) * k - 140 };
      };
      const angleOf = p => Math.atan2(p.y, p.x) * 180 / Math.PI;

      let dragStep = 0;
      const stopInvite = () => { holes.forEach(h => h.classList.remove('is-invite')); };

      const onDown = e => {
        stopInvite();
        if (e.button !== undefined && e.button > 0) return;
        try { dialWrap.focus({ preventScroll: true }); } catch (_) {}
        if (mode !== 'idle' || busy) return;
        const p = toLocal(e);
        const dist = Math.hypot(p.x, p.y);
        if (dist < HOLE_R - 26 || dist > HOLE_R + 26) return;
        const a = angleOf(p);
        let best = -1, bestD = 14;
        for (let i = 0; i < 10; i++) {
          const dd = Math.abs(norm(a - baseAngle(i) - theta));
          if (dd < bestD) { bestD = dd; best = i; }
        }
        if (best < 0) return;
        e.preventDefault();
        queue.length = 0;
        startEntry();
        if (digits.length >= 4) return;
        try { svg.setPointerCapture(e.pointerId); } catch (_) {}
        grab = best; mode = 'drag'; raw = 0; prevA = a; atStop = false; dragStep = 0;
        holes[best].classList.add('is-grab');
        dialWrap.classList.add('is-dragging');
      };

      const onMove = e => {
        if (mode !== 'drag') return;
        const p = toLocal(e);
        if (Math.hypot(p.x, p.y) < 8) return;
        const a = angleOf(p);
        const d = norm(a - prevA);
        prevA = a;
        const T = travelOf(grab);
        raw = Math.max(-45, Math.min(T + 45, raw + d));
        const t = Math.max(0, Math.min(T, raw));
        if (t >= T - 0.01) {
          if (!atStop) { atStop = true; hitStop(); }
        } else if (t < T - 4) {
          atStop = false;
        }
        setTheta(t);
        // a click for each hole the finger drags past, like the real ratchet
        const n = Math.floor(t / SP);
        if (n !== dragStep) { dragStep = n; sfx('tick'); }
      };

      const onUp = () => {
        if (mode !== 'drag') return;
        release();
      };

      svg.addEventListener('pointerdown', onDown);
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
      svg.addEventListener('pointercancel', onUp);
      svg.addEventListener('lostpointercapture', onUp);

      // ---------- keyboard ----------
      const onKey = e => {
        stopInvite();
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          if (queue.length >= 4) return;
          queue.push(Number(e.key));
          next();
        } else if ((e.key === 'Backspace' || e.key === 'Escape') && mode === 'idle' && !busy) {
          e.preventDefault();
          queue.length = 0;
          resultShown = false;
          digits = [];
          setStatus(null, IDLE_TEXT);
          clearSlots();
        }
      };
      dialWrap.addEventListener('keydown', onKey);

      setTheta(0);

      if (holes[0] && !REDUCED) holes[0].classList.add('is-invite');

      return {
        destroy() {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
          timers.forEach(t => clearTimeout(t));
          timers.clear();
          if (ro) ro.disconnect();
          svg.removeEventListener('pointerdown', onDown);
          svg.removeEventListener('pointermove', onMove);
          svg.removeEventListener('pointerup', onUp);
          svg.removeEventListener('pointercancel', onUp);
          svg.removeEventListener('lostpointercapture', onUp);
          dialWrap.removeEventListener('keydown', onKey);
          wrap.remove();
        }
      };
    }
  });
})();
