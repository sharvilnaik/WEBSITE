(function () {
  const css = `
.x-chest { font-family: var(--body); color: #ececf0; }
.x-chest .xc-rig { position: absolute; left: 50%; top: 18px; width: 200px; height: 210px; margin-left: -100px; }
.x-chest .xc-rig > * { position: absolute; }
.x-chest .xc-floor { left: 34px; top: 170px; width: 132px; height: 16px; border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,.55), rgba(0,0,0,0)); transition: opacity .4s; }
.x-chest .xc-ring { left: 0; top: 13px; width: 200px; height: 200px; overflow: visible; transform-origin: 100px 100px; transition: opacity .25s, transform .45s cubic-bezier(.2,1,.3,1); }
.x-chest .xc-ring circle { fill: none; stroke-width: 4; }
.x-chest .xc-ring .xc-track { stroke: rgba(255,255,255,.06); }
.x-chest .xc-ring .xc-fill { stroke-linecap: round; filter: drop-shadow(0 0 6px rgba(255,200,80,.45)); }
.x-chest .xc-rig.is-open .xc-ring { opacity: 0; transform: scale(1.14); }
.x-chest .xc-rays { left: -60px; top: -80px; width: 320px; height: 320px; opacity: 0; transform: scale(.25); transition: opacity .2s, transform .3s cubic-bezier(.5,0,.8,.4); pointer-events: none; }
.x-chest .xc-rays i { position: absolute; inset: 0; border-radius: 50%;
  background: repeating-conic-gradient(from 0deg, rgba(255,222,130,.5) 0deg 5deg, rgba(255,222,130,0) 9deg 21deg, rgba(255,222,130,.5) 25deg 30deg);
  -webkit-mask-image: radial-gradient(closest-side, #000 18%, rgba(0,0,0,.6) 40%, transparent 100%);
          mask-image: radial-gradient(closest-side, #000 18%, rgba(0,0,0,.6) 40%, transparent 100%);
  animation: xc-spin 16s linear infinite; }
.x-chest .xc-rays b { position: absolute; inset: 22%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,236,170,.55), rgba(255,200,90,.18) 55%, transparent); }
.x-chest .xc-rig.is-open .xc-rays { opacity: 1; transform: scale(1); transition: opacity .3s .1s, transform .8s cubic-bezier(.2,1.35,.4,1) .1s; }
.x-chest .xc-squash { left: 0; top: 0; width: 200px; height: 210px; transform-origin: 100px 176px; }
.x-chest .xc-squash.is-pop { animation: xc-pop .42s cubic-bezier(.3,1.5,.5,1); }
.x-chest .xc-squash.is-thud { animation: xc-thud .36s cubic-bezier(.3,1.5,.5,1); }
.x-chest .xc-chest { position: absolute; inset: 0; transform-origin: 100px 176px; will-change: transform; }
.x-chest .xc-chest > * { position: absolute; }
.x-chest .xc-lidwrap { left: 30px; top: 50px; width: 140px; height: 56px; perspective: 380px; perspective-origin: 50% -40%; z-index: 1; }
.x-chest .xc-peek { position: absolute; inset: 0; }
.x-chest .xc-lid { position: absolute; inset: 0; width: 140px; height: 56px; overflow: visible; transform-origin: 50% 100%; transition: transform .3s cubic-bezier(.6,0,.9,.45) .16s; }
.x-chest .xc-rig.is-open .xc-lid { transform: translateY(-12px) rotateX(64deg); transition: transform .62s cubic-bezier(.2,1.6,.4,1) .05s; }
.x-chest .xc-glow { left: 34px; top: 84px; width: 132px; height: 40px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,240,190,.95), rgba(255,196,80,.5) 45%, rgba(255,180,60,0)); opacity: 0; z-index: 2; mix-blend-mode: screen; transition: opacity .25s; }
.x-chest .xc-rig.is-open .xc-glow { opacity: 1 !important; transition: opacity .2s .08s; }
@keyframes xc-breathe { 0%, 100% { opacity: .1 } 50% { opacity: .26 } }
.x-chest .xc-rig:not(.is-open):not(.is-closing) .xc-idle { animation: xc-breathe 3.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .x-chest .xc-idle { animation: none; } }
.x-chest .xc-emerge { left: 0; top: -130px; width: 200px; height: 236px; overflow: hidden; z-index: 3; pointer-events: none; }
.x-chest .xc-file { position: absolute; left: 72px; top: 240px; width: 56px; height: 68px; transition: transform .34s cubic-bezier(.5,0,.8,.35); }
.x-chest .xc-rig.is-open .xc-file { transform: translateY(-110px); transition: transform .85s cubic-bezier(.2,1.3,.35,1) .24s; }
.x-chest .xc-file-in { width: 100%; height: 100%; filter: drop-shadow(0 0 14px rgba(255,210,110,.55)); }
.x-chest .xc-rig.is-open .xc-file-in { animation: xc-bob 2.6s ease-in-out 1.1s infinite; }
.x-chest .xc-base { left: 30px; top: 102px; width: 140px; height: 74px; overflow: visible; z-index: 4; }
.x-chest .xc-spark { width: 24px; height: 24px; margin: -12px 0 0 -12px; opacity: 0; transform: scale(0); z-index: 5; pointer-events: none; filter: drop-shadow(0 0 6px rgba(255,230,150,.9)); transition: opacity .2s, transform .25s; }
.x-chest .xc-rig.is-open .xc-spark { animation: xc-sp .46s cubic-bezier(.2,1.8,.4,1) var(--d) both, xc-tw 1.8s ease-in-out calc(var(--d) + .5s) infinite; }
.x-chest .xc-hit { left: 10px; top: 20px; width: 180px; height: 180px; border-radius: 50%; z-index: 6; cursor: pointer; outline: none; touch-action: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
.x-chest .xc-hit:focus-visible { box-shadow: 0 0 0 2px #1b1b20, 0 0 0 4px #f2c14e; }
.x-chest .xc-cap { position: absolute; left: 16px; right: 16px; bottom: 26px; height: 46px; text-align: center; }
.x-chest .xc-cap > div { position: absolute; inset: 0; display: grid; gap: 4px; align-content: start; transition: opacity .3s, transform .45s cubic-bezier(.2,1.4,.4,1); }
.x-chest .xc-t { font: 500 17px/1.2 var(--display); letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.x-chest .xc-t em { font-style: normal; color: #f5c84c; }
.x-chest .xc-s { font: 400 12px var(--mono); color: #8d8d97; white-space: nowrap; }
.x-chest .xc-done { display: inline-flex; align-items: center; gap: 6px; color: #8ce0a8; }
.x-chest .xc-done svg { width: 14px; height: 14px; flex: none; }
.x-chest .xc-cap-b { opacity: 0; transform: translateY(10px); }
.x-chest.is-got .xc-cap-a { opacity: 0; transform: translateY(-10px); }
.x-chest.is-got .xc-cap-b { opacity: 1; transform: none; }
.x-chest .xc-rig.is-closing .xc-spark { animation: xc-out .22s ease-in both; }
@keyframes xc-out { from { opacity: 1; transform: scale(var(--s)); } to { opacity: 0; transform: scale(0) rotate(90deg); } }
@keyframes xc-spin { to { transform: rotate(360deg); } }
@keyframes xc-bob { 0%, 100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-7px) rotate(1.5deg); } }
@keyframes xc-pop { 0% { transform: none; } 30% { transform: scale(1.07, .9); } 65% { transform: scale(.97, 1.05); } 100% { transform: none; } }
@keyframes xc-thud { 0% { transform: none; } 35% { transform: scale(1.05, .93); } 100% { transform: none; } }
@keyframes xc-sp { 0% { opacity: 0; transform: scale(0) rotate(-120deg); } 100% { opacity: 1; transform: scale(var(--s)) rotate(0); } }
@keyframes xc-tw { 0%, 100% { opacity: 1; transform: scale(var(--s)); } 50% { opacity: .55; transform: scale(calc(var(--s) * .7)) rotate(45deg); } }
.x-chest.xc-reduced .xc-rays i, .x-chest.xc-reduced .xc-rig.is-open .xc-file-in { animation: none; }
.x-chest.xc-reduced .xc-rig.is-open .xc-spark { animation: none; opacity: 1; transform: scale(var(--s)); transition-delay: var(--d); }
.x-chest.xc-reduced .xc-rig.is-open .xc-lid, .x-chest.xc-reduced .xc-rig.is-open .xc-file, .x-chest.xc-reduced .xc-rig.is-open .xc-rays { transition-duration: .2s; transition-timing-function: ease-out; }
`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  let uid = 0;

  window.EXPERIMENTS.push({
    id: 'chest',
    name: 'Download Button',
    source: 'The Legend of Zelda',
    hint: 'Press and hold the chest until the ring fills, then let go.',
    mount(stage) {
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      let hum = null;
      const endHum = () => { if (hum) { hum.stop(); hum = null; } };
      const R = !!window.REDUCED;
      const k = 'xc' + (++uid);
      stage.classList.toggle('xc-reduced', R);
      stage.classList.remove('is-got');

      const RING_R = 88, C = 2 * Math.PI * RING_R;
      const sparks = [
        { x: 30, y: 104, s: .7, d: .62 },
        { x: 44, y: 54, s: .85, d: .82 },
        { x: 158, y: 42, s: 1, d: 1.02 },
        { x: 172, y: -2, s: 1.45, d: 1.3 }
      ];
      const star = 'M12 0C12.8 7.6 16.4 11.2 24 12C16.4 12.8 12.8 16.4 12 24C11.2 16.4 7.6 12.8 0 12C7.6 11.2 11.2 7.6 12 0Z';

      stage.innerHTML = `
        <div class="xc-rig">
          <div class="xc-rays"><i></i><b></b></div>
          <svg class="xc-ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs><linearGradient id="${k}-rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#f5c84c"/><stop offset="1" stop-color="#d8962a"/></linearGradient></defs>
            <circle class="xc-track" cx="100" cy="100" r="${RING_R}"/>
            <circle class="xc-fill" cx="100" cy="100" r="${RING_R}" stroke="url(#${k}-rg)" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 100 100)"/>
          </svg>
          <div class="xc-floor"></div>
          <div class="xc-squash">
            <div class="xc-chest">
              <div class="xc-lidwrap"><div class="xc-peek">
                <svg class="xc-lid" viewBox="0 0 140 56" aria-hidden="true">
                  <defs>
                    <linearGradient id="${k}-wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c0703f"/><stop offset=".5" stop-color="#94502a"/><stop offset="1" stop-color="#6c3618"/></linearGradient>
                    <linearGradient id="${k}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".35" stop-color="#f5c84c"/><stop offset="1" stop-color="#b3741a"/></linearGradient>
                    <linearGradient id="${k}-gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe98f"/><stop offset=".5" stop-color="#e9b43c"/><stop offset="1" stop-color="#a86a16"/></linearGradient>
                    <clipPath id="${k}-lc"><path d="M4 55V25Q4 5 24 5H116Q136 5 136 25V55Z"/></clipPath>
                  </defs>
                  <path d="M4 55V25Q4 5 24 5H116Q136 5 136 25V55Z" fill="url(#${k}-wl)"/>
                  <g clip-path="url(#${k}-lc)">
                    <path d="M0 21Q70 12 140 21" stroke="#5a2a10" stroke-width="1.6" fill="none" opacity=".7"/>
                    <path d="M0 36H140" stroke="#5a2a10" stroke-width="1.6" opacity=".7"/>
                    <path d="M14 13Q70 6 126 13" stroke="#f0ae78" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".55"/>
                    <rect x="19" y="0" width="15" height="56" fill="url(#${k}-gv)"/>
                    <rect x="106" y="0" width="15" height="56" fill="url(#${k}-gv)"/>
                    <path d="M21 0V56M108 0V56" stroke="#fff6c8" stroke-width="1.4" opacity=".6"/>
                    <rect x="0" y="44" width="140" height="12" fill="url(#${k}-g)"/>
                    <path d="M0 45.5H140" stroke="#fff6c8" stroke-width="1.2" opacity=".7"/>
                  </g>
                  <path d="M4 44H136" stroke="#2a1408" stroke-width="2"/>
                  <path d="M19 9V44M34 6V44M106 6V44M121 9V44" stroke="#2a1408" stroke-width="1.6"/>
                  <circle cx="26.5" cy="24" r="1.8" fill="#fff4bf" stroke="#6e4410" stroke-width=".8"/>
                  <circle cx="113.5" cy="24" r="1.8" fill="#fff4bf" stroke="#6e4410" stroke-width=".8"/>
                  <path d="M4 55V25Q4 5 24 5H116Q136 5 136 25V55Z" fill="none" stroke="#2a1408" stroke-width="3" stroke-linejoin="round"/>
                </svg>
              </div></div>
              <div class="xc-glow"></div>
              <div class="xc-glow xc-idle"></div>
              <div class="xc-emerge">
                <div class="xc-file"><div class="xc-file-in">
                  <svg viewBox="0 0 56 68" width="56" height="68" aria-hidden="true">
                    <path d="M4 3H37L52 18V65H4Z" fill="#f7f3e8" stroke="#2a1408" stroke-width="2.4" stroke-linejoin="round"/>
                    <path d="M37 3V18H52" fill="#ddd5c2" stroke="#2a1408" stroke-width="2.4" stroke-linejoin="round"/>
                    <path d="M11 26H40M11 32H44M11 38H34" stroke="#c9c1ae" stroke-width="2.4" stroke-linecap="round"/>
                    <rect x="9" y="46" width="30" height="13" rx="3" fill="#e5484d"/>
                    <text x="24" y="55.9" text-anchor="middle" style="font-family: var(--mono)" font-size="9" font-weight="500" fill="#fff">PDF</text>
                  </svg>
                </div></div>
              </div>
              <svg class="xc-base" viewBox="0 0 140 74" aria-hidden="true">
                <defs>
                  <linearGradient id="${k}-wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4822"/><stop offset="1" stop-color="#4f240d"/></linearGradient>
                  <clipPath id="${k}-bc"><rect x="4" y="2" width="132" height="69" rx="3"/></clipPath>
                </defs>
                <rect x="4" y="2" width="132" height="69" rx="3" fill="url(#${k}-wb)"/>
                <g clip-path="url(#${k}-bc)">
                  <rect x="0" y="2" width="140" height="7" fill="#000" opacity=".22"/>
                  <path d="M0 26H140M0 46H140" stroke="#3e1b08" stroke-width="1.6" opacity=".8"/>
                  <path d="M8 29H64M76 49H132" stroke="#b56a3a" stroke-width="1.4" stroke-linecap="round" opacity=".35"/>
                  <rect x="19" y="0" width="15" height="74" fill="url(#${k}-gv)"/>
                  <rect x="106" y="0" width="15" height="74" fill="url(#${k}-gv)"/>
                  <path d="M21 0V74M108 0V74" stroke="#fff6c8" stroke-width="1.4" opacity=".55"/>
                  <rect x="0" y="59" width="140" height="15" fill="url(#${k}-g)"/>
                  <path d="M0 60.5H140" stroke="#fff6c8" stroke-width="1.2" opacity=".7"/>
                </g>
                <path d="M4 59H136M19 2V59M34 2V59M106 2V59M121 2V59" stroke="#2a1408" stroke-width="1.6"/>
                <circle cx="26.5" cy="16" r="1.8" fill="#fff4bf" stroke="#6e4410" stroke-width=".8"/>
                <circle cx="26.5" cy="48" r="1.8" fill="#fff4bf" stroke="#6e4410" stroke-width=".8"/>
                <circle cx="113.5" cy="16" r="1.8" fill="#fff4bf" stroke="#6e4410" stroke-width=".8"/>
                <circle cx="113.5" cy="48" r="1.8" fill="#fff4bf" stroke="#6e4410" stroke-width=".8"/>
                <rect x="4" y="2" width="132" height="69" rx="3" fill="none" stroke="#2a1408" stroke-width="3"/>
                <path d="M57 1H83V21Q83 32 70 37Q57 32 57 21Z" fill="url(#${k}-g)" stroke="#2a1408" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M60.5 5H79.5" stroke="#fff6c8" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
                <circle cx="70" cy="15" r="3.4" fill="#2a1408"/>
                <path d="M68.4 16.5H71.6L72.6 26H67.4Z" fill="#2a1408"/>
              </svg>
            </div>
          </div>
          ${sparks.map((p) => `<svg class="xc-spark" viewBox="0 0 24 24" style="left:${p.x}px;top:${p.y}px;--s:${p.s};--d:${R ? p.d * 0.5 : p.d}s" aria-hidden="true"><path d="${star}" fill="#fff6cf"/></svg>`).join('')}
          <div class="xc-hit" role="button" tabindex="0" aria-label="Download report.pdf. Press and hold to open."></div>
        </div>
        <div class="xc-cap" aria-live="polite">
          <div class="xc-cap-a"><div class="xc-t">Download report.pdf</div><div class="xc-s">Hold to open · 2.4 MB</div></div>
          <div class="xc-cap-b"><div class="xc-t">You got <em>report.pdf</em></div><div class="xc-s xc-done"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.6" stroke-width="1.5"/><path d="M5.2 8.3l2 2 3.7-4.3"/></svg><span>Saved to Downloads</span></div></div>
        </div>`;

      const q = (sel) => stage.querySelector(sel);
      const rig = q('.xc-rig'), fill = q('.xc-fill'), chest = q('.xc-chest'), squash = q('.xc-squash');
      const peek = q('.xc-peek'), glow = q('.xc-glow'), hit = q('.xc-hit'), hintA = q('.xc-cap-a .xc-s');

      let state = 'closed'; // closed | opening | open | closing
      let holding = false, charge = 0, raf = 0, last = 0;
      const timers = [];
      const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

      function restartAnim(el, cls) { el.classList.remove('is-pop', 'is-thud'); void el.offsetWidth; el.classList.add(cls); }

      function paint(now) {
        fill.setAttribute('stroke-dashoffset', String(C * (1 - charge)));
        const e = charge * charge;
        if (R || e < 0.0005) {
          chest.style.transform = R ? `scale(${1 - 0.03 * charge})` : '';
          peek.style.transform = '';
        } else {
          const t = now / 1000, f = 38 + 60 * charge;
          const x = (Math.sin(t * f) * 0.65 + Math.sin(t * f * 1.73 + 1.2) * 0.35) * 3.2 * e;
          const y = -Math.abs(Math.sin(t * f * 0.9)) * 1.6 * e;
          const rot = Math.sin(t * f * 1.31 + 2.1) * 3.2 * e;
          chest.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${(1 - 0.035 * charge).toFixed(3)})`;
          peek.style.transform = `translateY(${(-Math.abs(Math.sin(t * f * 1.12 + 0.4)) * 5 * e).toFixed(2)}px) rotate(${(Math.sin(t * f * 0.8) * 1.2 * e).toFixed(2)}deg)`;
        }
        glow.style.opacity = (e * 0.55).toFixed(3);
        if (holding) hintA.textContent = charge > 0.6 ? 'Almost…' : 'Keep holding';
      }

      function tick(now) {
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        if (holding) charge = Math.min(1, charge + dt / 0.9);
        else charge = Math.max(0, charge - dt / 0.28);
        if (hum) hum.set(charge);
        if (holding && charge >= 1) {
          holding = false;
          charge = 0;
          chest.style.transform = ''; peek.style.transform = ''; glow.style.opacity = '';
          raf = 0; last = 0;
          endHum();
          open();
          return;
        }
        paint(now);
        if (!holding && charge <= 0) {
          raf = 0; last = 0;
          endHum();
          hintA.textContent = 'Hold to open · 2.4 MB';
          return;
        }
        raf = requestAnimationFrame(tick);
      }

      function startHold() {
        if (state !== 'closed' || holding) return;
        holding = true;
        if (!hum && window.LAB_SFX) hum = LAB_SFX.hum({ from: 130, to: 520, type: 'triangle', vol: 0.07 });
        if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
      }
      function endHold() {
        if (!holding) return;
        holding = false;
        if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
      }

      function open() {
        state = 'opening';
        rig.classList.add('is-open');
        sfx('open');
        if (!R) restartAnim(squash, 'is-pop');
        later(() => stage.classList.add('is-got'), R ? 500 : 1150);
        later(() => {
          state = 'open';
          fill.style.transition = 'none';
          fill.setAttribute('stroke-dashoffset', String(C));
          hit.setAttribute('aria-label', 'You got report.pdf. Press to close.');
        }, R ? 600 : 1500);
      }

      function close() {
        if (state !== 'open') return;
        state = 'closing';
        rig.classList.add('is-closing');
        rig.classList.remove('is-open');
        stage.classList.remove('is-got');
        later(() => { sfx('clunk'); if (!R) restartAnim(squash, 'is-thud'); }, 440);
        later(() => {
          state = 'closed';
          rig.classList.remove('is-closing');
          squash.classList.remove('is-pop', 'is-thud');
          fill.style.transition = '';
          hintA.textContent = 'Hold to open · 2.4 MB';
          hit.setAttribute('aria-label', 'Download report.pdf. Press and hold to open.');
        }, 820);
      }

      function onDown(e) {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        if (state === 'open') { close(); return; }
        if (state !== 'closed') return;
        try { hit.setPointerCapture(e.pointerId); } catch (_) {}
        startHold();
      }
      function onUp() { endHold(); }
      function onKeyDown(e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        if (e.repeat) return;
        if (state === 'open') { close(); return; }
        startHold();
      }
      function onKeyUp(e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        endHold();
      }

      hit.addEventListener('pointerdown', onDown);
      hit.addEventListener('pointerup', onUp);
      hit.addEventListener('pointercancel', onUp);
      hit.addEventListener('lostpointercapture', onUp);
      hit.addEventListener('keydown', onKeyDown);
      hit.addEventListener('keyup', onKeyUp);
      hit.addEventListener('blur', onUp);
      hit.addEventListener('contextmenu', (e) => e.preventDefault());

      return {
        destroy() {
          cancelAnimationFrame(raf);
          timers.forEach(clearTimeout);
          endHum();
          stage.classList.remove('is-got', 'xc-reduced');
        }
      };
    }
  });
})();
