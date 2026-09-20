(function () {
  const css = `
/* Switch Account, after Severance — one card, two people, and a line between them.
   The lift is the switch: whatever has passed below the threshold is the innie's. */
.x-elevator {
  --ev-warm: #FFFFF7;
  --ev-warm-dim: rgba(255, 255, 247, .5);
  --ev-cold: #d3f2f5;
  --ev-cold-dim: rgba(211, 242, 245, .5);
  --ev-edge: rgba(126, 214, 224, .3);
  background: #0c0c0f;
  color: var(--ev-warm);
  font-family: var(--body), "Helvetica Neue", Helvetica, Arial, sans-serif;
}
/* the room changes temperature as the card goes down: warm above ground, Lumon below it */
.x-elevator .ev-air { position: absolute; inset: 0; pointer-events: none; }
.x-elevator .ev-air.warm { background: radial-gradient(120% 90% at 50% -10%, #23201c 0%, #121110 60%, #0b0b0c 100%); }
.x-elevator .ev-air.cold { background: radial-gradient(120% 90% at 50% 110%, #123640 0%, #08191f 58%, #050f13 100%); opacity: 0; }
.x-elevator .ev-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 12px var(--ev-pad, 16px) 11px; }

/* the header reads like a session, because that is what it is */
.x-elevator .ev-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.x-elevator .ev-who { font-size: 12px; line-height: 1.2; color: var(--ev-warm-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .3s ease; }
.x-elevator .ev-who b { font-weight: 400; color: var(--ev-warm); transition: color .3s ease; }
.x-elevator .ev-floor { flex: none; width: 26px; height: 26px; display: grid; place-items: center; border: 1px solid rgba(255, 255, 247, .22); border-radius: 3px;
  font-size: 11px; line-height: 1; color: var(--ev-warm); transition: border-color .3s ease, color .3s ease; }
.x-elevator.is-in .ev-who { color: var(--ev-cold-dim); }
.x-elevator.is-in .ev-who b, .x-elevator.is-in .ev-floor { color: var(--ev-cold); }
.x-elevator.is-in .ev-floor { border-color: var(--ev-edge); }

/* the shaft: two rails, a threshold, and the car that rides between them */
.x-elevator .ev-shaft { position: relative; flex: 1; min-height: 0; margin: 8px 0; }
/* the floor the card is not on, waiting for it */
.x-elevator .ev-slot { position: absolute; left: 0; right: 0; border: 1px dashed rgba(255, 255, 247, .16); border-radius: 6px; }
.x-elevator .ev-slot.down { border-color: var(--ev-edge); }
.x-elevator .ev-rail { position: absolute; top: 0; bottom: 0; width: 1px; background: repeating-linear-gradient(to bottom, rgba(255, 255, 247, .16) 0 6px, transparent 6px 14px); }
.x-elevator .ev-rail.l { left: -6px; } .x-elevator .ev-rail.r { right: -6px; }
.x-elevator .ev-line { position: absolute; left: -10px; right: -10px; height: 1px; background: rgba(255, 255, 247, .22); }
.x-elevator .ev-line i { position: absolute; left: 0; right: 0; top: -1px; height: 3px; background: var(--ev-cold); opacity: 0; filter: blur(1px); }
.x-elevator .ev-line span { position: absolute; right: 10px; top: 5px; font-size: 9px; letter-spacing: .12em; color: rgba(255, 255, 247, .3); }
.x-elevator.is-in .ev-line span { color: rgba(211, 242, 245, .32); }
.x-elevator .ev-car { position: absolute; left: 0; right: 0; top: 0; will-change: transform; }
.x-elevator .ev-cards { position: relative; height: 100%; cursor: grab; touch-action: none; }
.x-elevator .ev-cards:active { cursor: grabbing; }
/* the idle nudge: the car breathes until someone takes hold of it */
@keyframes ev-bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(5px) } }
.x-elevator .ev-cards.is-idle { animation: ev-bob 3.4s ease-in-out infinite; }
@keyframes ev-jolt { 0% { transform: translateY(0) } 22% { transform: translateY(5px) } 48% { transform: translateY(-3px) } 72% { transform: translateY(2px) } 100% { transform: translateY(0) } }
.x-elevator .ev-cards.is-jolt { animation: ev-jolt .38s cubic-bezier(.36, .07, .19, .97); }

/* one card drawn twice, in two lives; the innie copy is clipped to whatever is under the line */
.x-elevator .ev-card { position: absolute; inset: 0; border-radius: 6px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: center; gap: 9px;
  box-sizing: border-box; overflow: hidden; }
.x-elevator .ev-out { background: #191714; box-shadow: inset 0 0 0 1px rgba(255, 255, 247, .13); color: var(--ev-warm); }
.x-elevator .ev-in { background: #0a1b22; box-shadow: inset 0 0 0 1px var(--ev-edge); color: var(--ev-cold); }
.x-elevator .ev-id { display: flex; align-items: center; gap: 11px; min-width: 0; }
.x-elevator .ev-ava { flex: none; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; letter-spacing: .04em; }
.x-elevator .ev-out .ev-ava { background: rgba(255, 255, 247, .1); color: var(--ev-warm); }
.x-elevator .ev-in .ev-ava { background: rgba(126, 214, 224, .14); color: var(--ev-cold); }
.x-elevator .ev-name { display: grid; gap: 1px; min-width: 0; }
.x-elevator .ev-name b { font-weight: 400; font-size: 14.5px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.x-elevator .ev-name span { font-size: 10.5px; line-height: 1.25; letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.x-elevator .ev-out .ev-name span { color: var(--ev-warm-dim); }
.x-elevator .ev-in .ev-name span { color: var(--ev-cold-dim); }
.x-elevator .ev-says { margin: 0; font-size: 11.5px; line-height: 1.42; }
.x-elevator .ev-out .ev-says { color: var(--ev-warm-dim); }
.x-elevator .ev-in .ev-says { color: var(--ev-cold-dim); }
/* below the line the same line of facts is set in the company's own lettering */
.x-elevator .ev-in .ev-name span { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 9.5px; }

.x-elevator .ev-foot { display: flex; justify-content: center; }
.x-elevator .ev-go { display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 15px; cursor: pointer;
  font: 400 12px/1 inherit; color: var(--ev-warm); background: transparent; border: 1px solid rgba(255, 255, 247, .34); border-radius: 50px;
  transition: border-color .2s ease, color .2s ease, background-color .2s ease; }
.x-elevator .ev-go:hover { border-color: var(--ev-warm); }
.x-elevator .ev-go svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; transition: transform .35s cubic-bezier(.23, 1, .32, 1); }
.x-elevator.is-in .ev-go { color: var(--ev-cold); border-color: var(--ev-edge); }
.x-elevator.is-in .ev-go:hover { border-color: var(--ev-cold); }
.x-elevator.is-in .ev-go svg { transform: rotate(180deg); }
.x-elevator .ev-go:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .x-elevator .ev-cards.is-idle, .x-elevator .ev-cards.is-jolt { animation: none; }
  .x-elevator .ev-go svg { transition: none; }
}
`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // the lift arrives the way a lift arrives: fast, then a small settle past the floor and back
  const backOut = t => { const c = 1.24; t -= 1; return t * t * ((c + 1) * t + c) + 1; };
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 3v10"/><path d="M4 9.2 8 13.2 12 9.2"/></svg>';

  // the same account, either side of the line
  const LIVES = {
    out: {
      ava: 'SN', name: 'Sharvil Naik', role: 'Personal · signed in on 3 devices',
      says: 'Your outie enjoys films, long drives and finishing things.',
      who: 'Signed in as <b>your outie</b>', floor: 'G', go: 'Take the lift down'
    },
    in: {
      ava: 'S', name: 'Sharvil N.', role: 'Macrodata · badge 0417',
      says: 'Your innie enjoys the work, and is grateful for the melon bar.',
      who: 'Signed in as <b>your innie</b>', floor: 'S', go: 'Take the lift up'
    }
  };
  const cardHTML = k => {
    const L = LIVES[k];
    return `<article class="ev-card ev-${k}" aria-hidden="true">
      <div class="ev-id"><span class="ev-ava">${L.ava}</span>
        <div class="ev-name"><b>${L.name}</b><span>${L.role}</span></div></div>
      <p class="ev-says">${L.says}</p>
    </article>`;
  };

  window.EXPERIMENTS.push({
    id: 'elevator',
    name: 'Switch Account',
    source: 'Severance',
    hint: 'Drag the card down through the line, or take the lift and watch it cross.',
    mount(stage) {
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      const R = !!window.REDUCED;

      stage.innerHTML = `
        <div class="ev-air warm"></div><div class="ev-air cold"></div>
        <div class="ev-wrap">
          <div class="ev-top">
            <span class="ev-who" role="status" aria-live="polite">${LIVES.out.who}</span>
            <span class="ev-floor" aria-hidden="true">G</span>
          </div>
          <div class="ev-shaft">
            <span class="ev-rail l"></span><span class="ev-rail r"></span>
            <div class="ev-slot up"></div><div class="ev-slot down"></div>
            <div class="ev-line"><i></i><span>threshold</span></div>
            <div class="ev-car"><div class="ev-cards is-idle" role="group" aria-label="Account card. Drag it down to switch.">
              ${cardHTML('out')}${cardHTML('in')}
            </div></div>
          </div>
          <div class="ev-foot"><button class="ev-go" type="button">${ARROW}<span>Take the lift down</span></button></div>
        </div>`;
      const q = sel => stage.querySelector(sel);
      const cold = q('.ev-air.cold'), shaft = q('.ev-shaft'), line = q('.ev-line'), glow = q('.ev-line i');
      const car = q('.ev-car'), cards = q('.ev-cards'), innie = q('.ev-in');
      const slotUp = q('.ev-slot.up'), slotDown = q('.ev-slot.down');
      const elWho = q('.ev-who'), elFloor = q('.ev-floor'), btn = q('.ev-go'), btnText = btn.querySelector('span');

      let top = 0, bottom = 0, lineY = 0, cardH = 104;
      let y = 0, p = 0, side = 'out';
      let drag = null, raf = 0, motor = null, joltT = 0;

      // ---------- layout ----------
      function measure() {
        const w = stage.clientWidth || 352;
        stage.style.setProperty('--ev-pad', (w < 320 ? 13 : 16) + 'px');
        const free = shaft.clientHeight || 220;
        cardH = clamp(Math.round(free / 2) - 6, 86, 118);
        lineY = Math.round(free / 2);
        top = Math.max(0, lineY - cardH - 6);
        lineY = Math.min(lineY, top + cardH + 6);          // the card has to start clear of the line
        bottom = Math.min(free - cardH, lineY + 6);
        cards.style.height = cardH + 'px';
        line.style.top = lineY + 'px';
        for (const [el, at] of [[slotUp, top], [slotDown, bottom]]) { el.style.top = at + 'px'; el.style.height = cardH + 'px'; }
        y = side === 'in' ? bottom : top;
        apply();
      }

      // ---------- the one thing that moves ----------
      function apply() {
        car.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
        // the innie copy only exists below the line
        innie.style.clipPath = 'inset(' + Math.max(0, lineY - y).toFixed(1) + 'px 0 0 0)';
        p = clamp((y + cardH - lineY) / cardH, 0, 1);
        cold.style.opacity = p.toFixed(3);
        slotUp.style.opacity = p.toFixed(3);
        slotDown.style.opacity = (1 - p).toFixed(3);
        glow.style.opacity = (1 - Math.abs(p - 0.5) * 2).toFixed(3);   // brightest while the card straddles it
        const now = p > 0.5 ? 'in' : 'out';
        if (now !== side) flip(now);
      }

      // the moment it crosses: the card takes the step, and everything outside it changes hands
      function flip(next) {
        side = next;
        const L = LIVES[next];
        elWho.innerHTML = L.who;
        elFloor.textContent = L.floor;
        btnText.textContent = L.go;
        stage.classList.toggle('is-in', next === 'in');
        if (!R) {
          cards.classList.remove('is-jolt'); void cards.offsetWidth; cards.classList.add('is-jolt');
          clearTimeout(joltT); joltT = setTimeout(() => cards.classList.remove('is-jolt'), 400);
        }
        sfx('clunk');
      }

      // ---------- the ride ----------
      function glide(to, dur, ease) {
        cancelAnimationFrame(raf);
        const from = y, t0 = performance.now(), d = R ? 180 : dur, fn = R ? easeOut : (ease || backOut);
        if (Math.abs(to - from) < 0.5) { y = to; apply(); stopMotor(); return; }
        startMotor();
        const step = now => {
          const k = clamp((now - t0) / d, 0, 1);
          y = from + (to - from) * fn(k);
          apply();
          if (motor) motor.set(clamp(Math.abs(to - from) / 120 * (1 - k), 0, 1));
          if (k < 1) raf = requestAnimationFrame(step);
          else { y = to; apply(); stopMotor(); sfx('ok'); }
        };
        raf = requestAnimationFrame(step);
      }
      // a lift you can hear: one low tone held while the car moves, bent by how fast it is going
      function startMotor() { if (!motor && window.LAB_SFX && LAB_SFX.hum) motor = LAB_SFX.hum({ from: 58, to: 150, type: 'sawtooth', vol: 0.05 }); }
      function stopMotor() { if (motor) { motor.stop(); motor = null; } }

      // ---------- pointer ----------
      function onDown(e) {
        cancelAnimationFrame(raf);
        cards.classList.remove('is-idle');
        try { cards.setPointerCapture(e.pointerId); } catch (err) { /* no live pointer to capture */ }
        drag = { id: e.pointerId, y0: e.clientY, from: y, last: e.clientY, v: 0, t: performance.now() };
        startMotor();
        sfx('click');
        e.preventDefault();
      }
      function onMove(e) {
        if (!drag || e.pointerId !== drag.id) return;
        const now = performance.now(), dt = Math.max(16, now - drag.t);
        drag.v = (e.clientY - drag.last) / dt * 1000;
        drag.last = e.clientY; drag.t = now;
        y = clamp(drag.from + (e.clientY - drag.y0), top, bottom);
        apply();
        if (motor) motor.set(clamp(Math.abs(drag.v) / 900, 0, 1));
      }
      function onUp(e) {
        if (!drag || e.pointerId !== drag.id) return;
        const flick = drag.v;
        drag = null;
        stopMotor();
        // a flick sends it on; otherwise it goes to whichever floor is nearer
        const goDown = Math.abs(flick) > 260 ? flick > 0 : p > 0.5;
        glide(goDown ? bottom : top, 460);
      }

      cards.addEventListener('pointerdown', onDown);
      cards.addEventListener('pointermove', onMove);
      cards.addEventListener('pointerup', onUp);
      cards.addEventListener('pointercancel', onUp);
      btn.addEventListener('click', () => {
        cards.classList.remove('is-idle');
        glide(side === 'in' ? top : bottom, 760);
      });

      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(shaft);

      return {
        destroy() {
          cancelAnimationFrame(raf);
          clearTimeout(joltT);
          stopMotor();
          ro.disconnect();
          cards.removeEventListener('pointerdown', onDown);
          cards.removeEventListener('pointermove', onMove);
          cards.removeEventListener('pointerup', onUp);
          cards.removeEventListener('pointercancel', onUp);
        }
      };
    }
  });
})();
