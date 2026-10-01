(function () {
  const css = `
.x-shaker{font-family:var(--body);color:#ececf0}
.x-shaker .sk-list{position:absolute;left:20px;right:20px;top:18px;margin:0;padding:0;list-style:none}
.x-shaker .sk-label{position:absolute;left:20px;top:0;transform:translateY(-100%);font-size:12px;color:#8d8d97;padding-bottom:6px}
.x-shaker .sk-row{display:flex;align-items:center;gap:10px;height:34px;overflow:hidden;font-size:13px;color:#c9c9d1;border-bottom:1px solid #2a2a31;
  transition:height .38s cubic-bezier(.2,.9,.3,1),opacity .3s ease,background-color .9s ease}
.x-shaker .sk-row.sk-gone{height:0;opacity:0;border-bottom-color:transparent}
.x-shaker .sk-row.sk-back{background:rgba(216,178,90,.16)}
.x-shaker .sk-thumb{flex:none;width:22px;height:22px;border-radius:5px}
.x-shaker .sk-row small{margin-left:auto;color:#6f6f78;font-size:12px}
.x-shaker .sk-card{position:absolute;left:20px;right:20px;bottom:20px;height:104px;box-sizing:border-box;padding:14px 16px 14px 12px;display:flex;align-items:center;gap:14px;
  background:linear-gradient(180deg,#2a2a32,#232329);border:1px solid #36363f;border-radius:14px;box-shadow:0 10px 26px rgba(0,0,0,.35);
  cursor:grab;touch-action:none;outline:none;will-change:transform;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;transition:transform .5s cubic-bezier(.3,1.6,.5,1)}
.x-shaker .sk-card.sk-drag{cursor:grabbing;transition:none}
.x-shaker .sk-card:focus-visible{outline:2px solid #d8b25a;outline-offset:3px}
.x-shaker .sk-can{flex:none;width:46px;height:76px;overflow:visible}
.x-shaker .sk-txt{min-width:0;flex:1}
.x-shaker .sk-title{font-size:14px;font-weight:500;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.x-shaker .sk-sub{font-size:12px;color:#8d8d97;margin-top:2px;min-height:16px}
.x-shaker .sk-meter{margin-top:10px;height:6px;border-radius:99px;background:#34343c;overflow:hidden}
.x-shaker .sk-meter i{display:block;height:100%;width:100%;border-radius:99px;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#9a7a35,#d8b25a 70%,#f4dc9c)}
.x-shaker .sk-again{margin-top:8px;padding:5px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.28);background:transparent;color:#ececf0;font-size:12px;cursor:pointer;display:none}
.x-shaker .sk-again:hover{border-color:rgba(255,255,255,.6)}
.x-shaker .sk-again:focus-visible{outline:2px solid #d8b25a;outline-offset:2px}
.x-shaker.sk-done .sk-meter{display:none}
.x-shaker.sk-done .sk-again{display:inline-block}
.x-shaker.sk-done .sk-card{cursor:default}
`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  const FILES = [
    { name: 'Tuxedo fitting.jpg', meta: '2.1 MB', col: '#6c7bd9' },
    { name: 'Casino night.jpg', meta: '3.4 MB', col: '#d8b25a', target: true },
    { name: 'Aston receipt.pdf', meta: '180 KB', col: '#63b98a' }
  ];

  // an original cocktail shaker: a steel cap over a glass tin, with ice that rattles around inside
  const CAN =
    '<svg class="sk-can" viewBox="0 0 46 76" aria-hidden="true">' +
      '<defs><linearGradient id="skSteel" x1="0" x2="1"><stop offset="0" stop-color="#8b8f98"/><stop offset=".45" stop-color="#e4e6ea"/><stop offset="1" stop-color="#7d818a"/></linearGradient>' +
      '<clipPath id="skGlass"><path d="M9 27h28l-4 45H13z"/></clipPath></defs>' +
      '<rect x="19" y="2" width="8" height="7" rx="2" fill="url(#skSteel)"/>' +
      '<path d="M13 9h20l4 16H9z" fill="url(#skSteel)"/>' +
      '<rect x="7" y="24" width="32" height="4" rx="1.5" fill="url(#skSteel)"/>' +
      '<path d="M9 27h28l-4 45H13z" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>' +
      '<g clip-path="url(#skGlass)">' +
        '<rect class="sk-liq" x="0" y="52" width="46" height="30" fill="#d8b25a" opacity=".55"/>' +
        '<rect class="sk-ice" x="13" y="44" width="10" height="10" rx="2.5" fill="rgba(235,245,255,.75)"/>' +
        '<rect class="sk-ice" x="23" y="50" width="9" height="9" rx="2.5" fill="rgba(235,245,255,.65)"/>' +
        '<rect class="sk-ice" x="16" y="57" width="9" height="9" rx="2.5" fill="rgba(235,245,255,.7)"/>' +
      '</g>' +
    '</svg>';

  window.EXPERIMENTS.push({
    id: 'shaker', name: 'Shake to Undo', source: 'James Bond',
    hint: 'Grab the card and shake it hard, side to side. Stirring won’t do it.',
    mount(stage) {
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      const R = !!window.REDUCED;
      const timers = new Set();
      const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };

      const box = document.createElement('div');
      box.innerHTML =
        '<ul class="sk-list">' + FILES.map(f => '<li class="sk-row' + (f.target ? ' sk-target' : '') + '"><span class="sk-thumb" style="background:' + f.col + '"></span><span>' + f.name + '</span><small>' + f.meta + '</small></li>').join('') + '</ul>' +
        '<div class="sk-card" tabindex="0" role="group" aria-label="Deleted Casino night.jpg. Shake to undo, or press the left and right arrow keys in turn.">' + CAN +
          '<div class="sk-txt"><div class="sk-title"></div><div class="sk-sub" aria-live="polite"></div>' +
          '<div class="sk-meter" role="progressbar" aria-label="Undo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
          '<button class="sk-again" type="button">Delete it again</button></div>' +
        '</div>';
      while (box.firstChild) stage.appendChild(box.firstChild);
      const $ = q => stage.querySelector(q);
      const card = $('.sk-card'), title = $('.sk-title'), sub = $('.sk-sub'), meter = $('.sk-meter'), fill = $('.sk-meter i'),
        again = $('.sk-again'), row = $('.sk-target'), ice = [...stage.querySelectorAll('.sk-ice')], liq = $('.sk-liq');

      let energy = 0, done = false, raf = 0, last = 0, lastShake = 0, subT = 0;
      const cubes = ice.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));

      function setSub(text, ms) {
        sub.textContent = text;
        if (subT) { clearTimeout(subT); timers.delete(subT); subT = 0; }
        if (ms) subT = later(() => { subT = 0; if (!done) sub.textContent = 'Shake to undo'; }, ms);
      }
      function deleted() {
        done = false; energy = 0;
        stage.classList.remove('sk-done');
        row.classList.remove('sk-back'); row.classList.add('sk-gone');
        title.textContent = 'Deleted Casino night.jpg';
        setSub('Shake to undo');
        render();
      }

      // ---- the shaker's own sounds: ice on steel, a pour, and a chord to finish ----
      let SND = null;
      function audio() {
        if (SND) return SND;
        const a = window.LAB_SFX && LAB_SFX.audio && LAB_SFX.audio();
        if (!a) return null;
        const bus = a.ctx.createGain(); bus.gain.value = 0.9; bus.connect(a.out);
        // a short plate-ish tail so the tin rings in a room instead of a vacuum
        const send = a.ctx.createGain(); send.gain.value = 0.28;
        const dl = a.ctx.createDelay(0.3); dl.delayTime.value = 0.031;
        const fb = a.ctx.createGain(); fb.gain.value = 0.42;
        const tone = a.ctx.createBiquadFilter(); tone.type = 'highpass'; tone.frequency.value = 700;
        send.connect(dl); dl.connect(fb); fb.connect(tone); tone.connect(dl); dl.connect(bus);
        SND = { ctx: a.ctx, out: bus, send, noise: a.noise };
        return SND;
      }
      function burst(t, dur, f, q, vol, type) {
        const { ctx, out, send, noise } = SND;
        const s = ctx.createBufferSource(); s.buffer = noise;
        const bp = ctx.createBiquadFilter(); bp.type = type || 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(bp); bp.connect(g); g.connect(out); g.connect(send);
        s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.05);
      }
      function ring(t, f, dur, vol, glide) {
        const { ctx, out, send } = SND;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
        if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(out); g.connect(send);
        o.start(t); o.stop(t + dur + 0.05);
      }
      // one swing: a handful of cubes hitting the tin, plus the body of the tin ringing
      function iceHit(power) {
        if (!audio()) { sfx('tick'); return; }
        const t = SND.ctx.currentTime + 0.005;
        const hits = 3 + Math.round(power * 4);
        for (let i = 0; i < hits; i++) {
          const at = t + i * (0.012 + Math.random() * 0.026);
          burst(at, 0.05 + Math.random() * 0.05, 2600 + Math.random() * 2600, 2.2, (0.1 + power * 0.16) * (0.6 + Math.random() * 0.7));
          if (Math.random() < 0.5) ring(at, 900 + Math.random() * 1400, 0.09 + Math.random() * 0.08, 0.05 + power * 0.05, 0.85);
        }
        // the shell: low metallic thud with a wash of liquid
        burst(t, 0.16, 180 + Math.random() * 90, 1.1, 0.16 + power * 0.14, 'lowpass');
        ring(t, 300 + Math.random() * 60, 0.2, 0.07 + power * 0.06, 0.7);
        burst(t + 0.02, 0.22, 1200, 0.7, 0.05 + power * 0.07);
      }
      // the finish: cap off, a pour into the glass, then the chord
      function pourAndChord() {
        if (!audio()) { sfx('ok'); return; }
        const { ctx } = SND, t = ctx.currentTime + 0.01;
        ring(t, 520, 0.1, 0.16, 0.6);                       // the cap coming off
        burst(t + 0.06, 0.1, 900, 1.4, 0.12, 'lowpass');
        for (let i = 0; i < 14; i++) {                      // the pour, thinning out as it goes
          const at = t + 0.16 + i * 0.03;
          burst(at, 0.09, 1500 - i * 60, 0.8, 0.09 - i * 0.004);
        }
        ring(t + 0.58, 2100, 0.5, 0.1, 0.99);               // glass
        ring(t + 0.6, 3150, 0.4, 0.05, 0.99);
        // a single minor-major chord, plucked, in the spirit of the films
        const chord = [82.41, 123.47, 164.81, 196.0, 246.94, 311.13];
        chord.forEach((f, i) => {
          const at = t + 0.78 + i * 0.012;
          const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
          o.type = 'sawtooth'; o.frequency.value = f;
          lp.type = 'lowpass'; lp.Q.value = 1.2;
          lp.frequency.setValueAtTime(2600, at);
          lp.frequency.exponentialRampToValueAtTime(600, at + 1.1);
          g.gain.setValueAtTime(0.0001, at);
          g.gain.exponentialRampToValueAtTime(0.1, at + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, at + 1.5);
          o.connect(lp); lp.connect(g); g.connect(SND.out); g.connect(SND.send);
          o.start(at); o.stop(at + 1.6);
        });
      }
      function capOn() {
        if (!audio()) { sfx('clunk'); return; }
        const t = SND.ctx.currentTime + 0.005;
        burst(t, 0.1, 260, 1, 0.22, 'lowpass');
        ring(t, 420, 0.14, 0.12, 0.7);
      }
      // one good shake: the ice jumps, the meter climbs, and it undoes once it's full
      function shake(power) {
        if (done) return;
        lastShake = performance.now();
        energy = Math.min(1, energy + 0.1 + 0.1 * power);
        iceHit(power);
        cubes.forEach(c => { c.vx += (Math.random() - 0.5) * 60 * (0.5 + power); c.vy -= 30 + Math.random() * 40 * power; });
        if (energy >= 1) undo();
        kick();
      }
      function undo() {
        done = true; energy = 1;
        endDrag();
        stage.classList.add('sk-done');
        title.textContent = 'Restored Casino night.jpg';
        setSub('Shaken, not stirred.');
        row.classList.remove('sk-gone'); row.classList.add('sk-back');
        later(() => row.classList.remove('sk-back'), 1400);
        pourAndChord();
        const hadFocus = card.contains(document.activeElement);
        if (hadFocus) later(() => again.focus({ preventScroll: true }), 50);
      }

      function render() {
        fill.style.transform = 'scaleX(' + energy.toFixed(3) + ')';
        meter.setAttribute('aria-valuenow', Math.round(energy * 100));
        liq.setAttribute('y', (62 - energy * 16).toFixed(1));
        cubes.forEach((c, i) => ice[i].setAttribute('transform', 'translate(' + c.x.toFixed(1) + ' ' + c.y.toFixed(1) + ')'));
      }
      function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
      function frame(now) {
        raf = 0;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        // the meter drains when the shaking stops, so a lazy wobble never gets there
        if (!done && now - lastShake > 350) energy = Math.max(0, energy - dt * 0.35);
        let moving = false;
        cubes.forEach(c => {
          c.vx += (-c.x * 90 - c.vx * 9) * dt; c.vy += (-c.y * 90 - c.vy * 9) * dt;
          c.x += c.vx * dt; c.y += c.vy * dt;
          c.x = Math.max(-5, Math.min(5, c.x)); c.y = Math.max(-14, Math.min(4, c.y));
          if (Math.abs(c.vx) + Math.abs(c.vy) + Math.abs(c.x) + Math.abs(c.y) > 0.05) moving = true;
        });
        render();
        if (moving || drag || (!done && energy > 0)) raf = requestAnimationFrame(frame);
      }

      // ---- dragging: a swing only counts when it's wide and quick, and turns back the other way ----
      let drag = null;
      function onDown(e) {
        if (done || e.button > 0 || e.target.closest('.sk-again')) return;
        nudged = true;
        e.preventDefault();
        try { card.setPointerCapture(e.pointerId); } catch (err) {}
        drag = { id: e.pointerId, x0: e.clientX, x: 0, dir: 0, ext: 0, extT: performance.now(), vx: 0, lx: 0, lt: performance.now() };
        card.classList.add('sk-drag');
        kick();
      }
      function onMove(e) {
        if (!drag || e.pointerId !== drag.id) return;
        const now = performance.now();
        const x = Math.max(-80, Math.min(80, (e.clientX - drag.x0) * 0.8));
        const dt = Math.max(1, now - drag.lt);
        drag.vx = drag.vx * 0.6 + ((x - drag.lx) / dt) * 0.4;
        drag.lx = x; drag.lt = now;
        const d = Math.sign(x - drag.x);
        if (d && drag.dir && d !== drag.dir) {
          // turned around: how far and how fast was the swing that just ended?
          const swing = Math.abs(drag.x - drag.ext), time = now - drag.extT;
          if (swing > 26 && time < 420) shake(Math.min(1, swing / 90) * Math.min(1, 260 / Math.max(80, time)));
          else if (swing > 8 && !done) setSub('Harder. It needs a proper shake.', 1100);
          if (!drag) return;   // that swing finished the undo, which let go of the card
          drag.ext = drag.x; drag.extT = now;
        }
        if (d) drag.dir = d;
        drag.x = x;
        if (!R) card.style.transform = 'translateX(' + x.toFixed(1) + 'px) rotate(' + Math.max(-9, Math.min(9, drag.vx * 5)).toFixed(2) + 'deg)';
        cubes.forEach(c => { c.vx -= drag.vx * 14; });
      }
      function endDrag() {
        if (!drag) return;
        drag = null;
        card.classList.remove('sk-drag');
        card.style.transform = '';
      }
      function onUp(e) { if (drag && e.pointerId === drag.id) endDrag(); }

      // keyboard: left, right, left, right
      let lastKey = '';
      function onKey(e) {
        if (done || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
        e.preventDefault();
        const dir = e.key === 'ArrowLeft' ? -1 : 1;
        if (!R) card.animate([{ transform: 'none' }, { transform: 'translateX(' + dir * 14 + 'px) rotate(' + dir * 4 + 'deg)' }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
        if (lastKey && lastKey !== e.key) shake(0.7);
        lastKey = e.key;
      }

      // on a phone that reports motion without asking, a real shake counts too
      let motionT = 0;
      const onMotion = e => {
        const a = e.accelerationIncludingGravity || e.acceleration;
        if (!a || done) return;
        const now = performance.now();
        if (Math.abs(a.x || 0) > 16 && now - motionT > 160) { motionT = now; shake(0.8); }
      };
      const canMotion = typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission !== 'function';
      if (canMotion) window.addEventListener('devicemotion', onMotion);

      // until someone grabs it, the card nudges itself every few seconds and the ice shifts
      let nudged = false;
      const nudgeTimer = setInterval(() => {
        if (R || nudged || done || drag || document.hidden) return;
        card.animate([{ transform: 'none' }, { transform: 'translateX(-5px) rotate(-1.4deg)' }, { transform: 'translateX(4px) rotate(1deg)' }, { transform: 'none' }],
          { duration: 620, easing: 'cubic-bezier(.3,.9,.4,1)' });
        cubes.forEach(c => { c.vx += (Math.random() - 0.5) * 26; c.vy -= 10 + Math.random() * 10; });
        kick();
      }, 4600);

      const onAgain = () => { capOn(); deleted(); card.focus({ preventScroll: true }); };
      card.addEventListener('pointerdown', onDown);
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerup', onUp);
      card.addEventListener('pointercancel', onUp);
      card.addEventListener('lostpointercapture', onUp);
      card.addEventListener('keydown', onKey);
      again.addEventListener('click', onAgain);

      // when the visitor mutes the section, drop our own nodes too
      const onSound = on => {
        if (on || !SND) return;
        const n = SND.ctx.currentTime; SND.out.gain.setTargetAtTime(0.0001, n, 0.05);
        const s = SND; SND = null; setTimeout(() => { s.out.disconnect(); s.send.disconnect(); }, 500);
      };
      window.LAB_SFX && LAB_SFX.onChange && LAB_SFX.onChange(onSound);

      row.style.transition = 'none';
      deleted();
      void row.offsetHeight; row.style.transition = '';

      return {
        destroy() {
          cancelAnimationFrame(raf);
          clearInterval(nudgeTimer);
          timers.forEach(clearTimeout); timers.clear();
          if (canMotion) window.removeEventListener('devicemotion', onMotion);
          if (SND) { const n = SND.ctx.currentTime; SND.out.gain.setTargetAtTime(0.0001, n, 0.05); const s = SND; SND = null; setTimeout(() => { s.out.disconnect(); s.send.disconnect(); }, 500); }
          window.LAB_SFX && LAB_SFX.offChange && LAB_SFX.offChange(onSound);
          stage.classList.remove('sk-done');
        }
      };
    }
  });
})();
