// Match My Tempo: the drummer's seat. A slim metronome runs along the top of the card, four beats to
// the bar, and the play button at the bottom is the stick. Each beat belongs to a drum, so four in a row
// plays a pattern rather than a click. Clear a bar and the tempo goes up: 100, 120, 140, 180, 200.
// Miss, and Fletcher has something to say about it.
(function () {
  const css = `
.x-tempo{font-family:var(--body);color:#ececf0}
.x-tempo .tp-kit{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:
    radial-gradient(90% 60% at 50% 96%, rgba(242,181,68,.16), rgba(242,181,68,.03) 48%, transparent 74%),
    repeating-linear-gradient(97deg, rgba(0,0,0,.26) 0 2px, transparent 2px 46px),
    linear-gradient(180deg,#241811 0%,#1b1310 62%,#120d0b 100%)}
.x-tempo .tp-kit svg{position:absolute;inset:0;width:100%;height:100%}
.x-tempo .tp-pad{transform-box:fill-box;transform-origin:center;transition:transform .18s ease}
.x-tempo .tp-pad .tp-glow{opacity:0;transition:opacity .22s ease}
.x-tempo .tp-pad.lit .tp-glow{opacity:1;transition:none}
.x-tempo .tp-pad.lit{transform:scale(.97);transition:none}
.x-tempo .tp-spot{opacity:.3;transition:opacity .2s ease}
.x-tempo .tp-pad.in-bar .tp-spot{opacity:.75}
.x-tempo .tp-pad.next .tp-spot{opacity:1;animation:tp-spot .9s ease-in-out infinite}
@keyframes tp-spot{0%,100%{opacity:.45}50%{opacity:1}}
@media (prefers-reduced-motion: reduce){.x-tempo .tp-pad{transition:none}.x-tempo .tp-pad.next .tp-spot{animation:none}}

.x-tempo .tp-cam{position:absolute;inset:0;z-index:2;display:flex;align-items:flex-start;justify-content:center;padding:14px 16px 0;pointer-events:none}
.x-tempo .tp-card{pointer-events:auto;position:relative;box-sizing:border-box;width:100%;max-width:286px;padding:10px 12px 12px;border-radius:14px;
  background:linear-gradient(180deg,rgba(38,38,46,.96),rgba(30,30,36,.96));border:1px solid #3a3a44;
  box-shadow:0 1px 0 rgba(255,255,255,.05) inset,0 14px 30px rgba(0,0,0,.4);transition:border-color .3s ease}
.x-tempo .tp-card.tp-bad{border-color:rgba(255,90,78,.75)}

/* the metronome: one bar, four beats, each dot wearing the colour of the drum it plays */
.x-tempo .tp-bpm{display:block;text-align:right;font:300 11px/14px var(--body);color:#8d8d97;font-variant-numeric:tabular-nums;margin-bottom:6px}
.x-tempo .tp-meter{position:relative;display:flex;height:24px;border-radius:7px;background:#191920;overflow:hidden}
.x-tempo .tp-seg{position:relative;flex:1;display:flex;align-items:center;justify-content:center}
.x-tempo .tp-seg+.tp-seg::before{content:"";position:absolute;left:0;top:6px;bottom:6px;width:1px;background:#2f2f38}
.x-tempo .tp-win{position:absolute;top:0;bottom:0;left:50%;border-radius:4px;background:rgba(255,255,255,.05);transform:translateX(-50%);transition:background-color .08s linear}
.x-tempo .tp-win.in{background:rgba(242,181,68,.16)}
.x-tempo .tp-dot{position:relative;width:9px;height:9px;border-radius:50%;box-sizing:border-box;border:1.5px solid var(--c);opacity:.7;
  transition:background-color .12s ease,opacity .12s ease,transform .12s ease}
.x-tempo .tp-dot.hit{background:var(--c);opacity:1;transform:scale(1.25)}
.x-tempo .tp-dot.miss{background:#ff5a4e;border-color:#ff5a4e;opacity:1}
.x-tempo .tp-line{position:absolute;left:0;top:2px;bottom:2px;width:2px;border-radius:2px;background:#ececf0;will-change:transform}
.x-tempo .tp-line.idle{opacity:.28}
.x-tempo .tp-line.stop{background:#ff5a4e}
.x-tempo .tp-play{display:block;width:100%;height:38px;margin-top:10px;border:0;border-radius:9px;background:#ececf0;color:#16161a;
  font:400 15px/1 var(--body);cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
  transition:transform .08s ease,background-color .15s ease}
.x-tempo .tp-play:focus-visible{box-shadow:0 0 0 3px #232329,0 0 0 5px #8b7dff}
.x-tempo .tp-play:active{transform:scale(.98)}
/* while it waits, the button breathes, so the beat is there before you start */
@keyframes tp-idle-beat{0%,100%{box-shadow:0 0 0 0 rgba(236,236,240,0)}8%{box-shadow:0 0 0 5px rgba(236,236,240,.14)}40%{box-shadow:0 0 0 9px rgba(236,236,240,0)}}
.x-tempo[data-idle="1"] .tp-play{animation:tp-idle-beat 1.05s ease-out infinite}
@media (prefers-reduced-motion: reduce){.x-tempo .tp-play{animation:none}}
.x-tempo.tp-r .tp-play:active{transform:none}

.x-tempo .tp-fl{position:absolute;inset:0;z-index:3;display:flex;align-items:flex-end;justify-content:center;pointer-events:none;opacity:0;background:#0f0d0c;transition:opacity .22s ease}
.x-tempo .tp-fl.on{opacity:1}
.x-tempo .tp-fl img{position:absolute;left:50%;bottom:0;width:100%;height:100%;object-fit:contain;object-position:50% 100%;transform:translate(-50%,24px) scale(.96);transform-origin:50% 100%;transition:transform .45s cubic-bezier(.2,1.2,.4,1)}
.x-tempo .tp-fl.on img{transform:translate(-50%,0)}
.x-tempo.tp-r .tp-fl img{transition:none;transform:translate(-50%,0)}
.x-tempo .tp-cap{position:relative;margin:0 16px 16px;padding:7px 12px;border-radius:10px;background:rgba(16,14,13,.78);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);text-align:center;font-size:15px;line-height:19px;color:#f3ece2}
.x-tempo .tp-cap small{display:block;font-size:12px;line-height:16px;font-weight:300;color:#b9aea0}

/* the poster the tile opens on: the audition is a door you knock on before the kit starts */
.x-tempo .tp-cover{position:absolute;inset:0;z-index:5;overflow:hidden;background:#0f0d0c;transition:opacity .34s ease}
.x-tempo .tp-cover.off{opacity:0;pointer-events:none}
.x-tempo .tp-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:32% 18%;transform:scale(1.14) translateX(7%)}
.x-tempo .tp-cover::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,13,12,0) 44%,rgba(15,13,12,.58) 76%,rgba(15,13,12,.9))}
.x-tempo .tp-cover-in{position:absolute;inset:0;z-index:2;display:flex;align-items:flex-end;justify-content:center;padding:0 18px 20px}
/* the brass of the room it is set in: square-cut, no radius */
.x-tempo .tp-cover-go{height:42px;padding:0 26px;border:0;border-radius:0;background:linear-gradient(180deg,#F6C85A,#D99A1E);color:#1A1206;
  font:400 15px/1 var(--body);
  cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .08s ease,background .15s ease}
.x-tempo .tp-cover-go{position:relative;overflow:hidden}
/* the brass catches the light every few seconds, so the poster reads as a door you can open */
.x-tempo .tp-cover-go::after{content:"";position:absolute;top:0;bottom:0;left:0;width:38%;
  background:linear-gradient(105deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.85) 50%,rgba(255,255,255,0) 100%);
  transform:translateX(-180%);animation:tp-shine 2.6s ease-in-out infinite;pointer-events:none}
@keyframes tp-shine{0%{transform:translateX(-180%)}42%,100%{transform:translateX(420%)}}
.x-tempo .tp-cover-in{animation:tp-glow 2.6s ease-in-out infinite}
@keyframes tp-glow{0%,100%{filter:drop-shadow(0 0 0 rgba(246,200,90,0))}42%{filter:drop-shadow(0 0 14px rgba(246,200,90,.55))}}
.x-tempo .tp-cover.off .tp-cover-go::after,.x-tempo .tp-cover.off .tp-cover-in{animation:none}
@media (prefers-reduced-motion: reduce){.x-tempo .tp-cover-go::after,.x-tempo .tp-cover-in{animation:none}}
.x-tempo .tp-cover-go:active{transform:scale(.97)}
.x-tempo .tp-cover-go:focus-visible{box-shadow:0 0 0 3px #0f0d0c,0 0 0 5px #F6C85A}
@media (hover:hover) and (pointer:fine){.x-tempo .tp-cover-go:hover{background:linear-gradient(180deg,#FFD873,#E9A922)}}
.x-tempo .tp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // Fletcher's reactions sit next to this file; the fourth picture is the rare approval
  const BASE = (document.currentScript && document.currentScript.src) ? new URL('fletcher/', document.currentScript.src).href : 'assets/lab/fletcher/';
  const FACES = [1, 2, 3, 4].map(i => BASE + 'fletcher-' + i + '.webp');
  const COVER = BASE + 'audition-cover.jpg';

  // the colour that says which drum a beat belongs to, on the strip and on the kit
  const COL = { kick: '#ff8a4c', snare: '#f2b544', tom1: '#8bd17c', tom2: '#6fc3f2', floor: '#c79cff', hat: '#ffe08a', ride: '#ffd166', crash: '#ff6f6f' };

  // ---------- the kit, from the stool ----------
  // what a drummer actually sees: cymbals cropped by the edges, two rack toms across the middle,
  // snare under the left hand, floor tom right, the kick between your knees, sticks in from your lap
  const lugs = (cx, cy, rx, ry, n) => {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      out += '<ellipse cx="' + (cx + Math.cos(a) * rx).toFixed(1) + '" cy="' + (cy + Math.sin(a) * ry).toFixed(1) + '" rx="2.6" ry="2" fill="#c3c6cc"/>';
    }
    return out;
  };
  const spot = (id, cx, cy) => '<circle class="tp-spot" cx="' + cx + '" cy="' + cy + '" r="3.4" fill="' + (COL[id] || '#f2b544') + '"/>';
  const drum = (id, cx, cy, rx, ry, depth, shell, dark, head) =>
    '<g class="tp-pad" data-pad="' + id + '">' +
      '<ellipse cx="' + cx + '" cy="' + (cy + depth) + '" rx="' + rx + '" ry="' + ry + '" fill="' + dark + '"/>' +
      '<rect x="' + (cx - rx) + '" y="' + cy + '" width="' + rx * 2 + '" height="' + depth + '" fill="' + shell + '"/>' +
      lugs(cx, cy + depth * 0.5, rx * 1.02, ry * 1.02, 8) +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#d7dade"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (rx - 3.4) + '" ry="' + (ry - 2.6) + '" fill="' + head + '"/>' +
      '<ellipse cx="' + (cx - rx * 0.26) + '" cy="' + (cy - ry * 0.32) + '" rx="' + rx * 0.44 + '" ry="' + ry * 0.36 + '" fill="rgba(255,255,255,.5)"/>' +
      spot(id, cx, cy) +
      '<ellipse class="tp-glow" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="rgba(242,181,68,.6)"/>' +
    '</g>';
  const cymbal = (id, cx, cy, rx, ry, stand) =>
    (stand ? '<path d="M' + cx + ' ' + cy + 'L' + (cx + stand[0]) + ' ' + (cy + stand[1]) + '" stroke="#42424c" stroke-width="2.6"/>' : '') +
    '<g class="tp-pad" data-pad="' + id + '">' +
      '<ellipse cx="' + cx + '" cy="' + (cy + 4) + '" rx="' + rx + '" ry="' + ry + '" fill="#6b5313"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#tpGold)"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx * 0.74 + '" ry="' + ry * 0.74 + '" fill="none" stroke="rgba(0,0,0,.14)" stroke-width="1"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx * 0.5 + '" ry="' + ry * 0.5 + '" fill="none" stroke="rgba(0,0,0,.14)" stroke-width="1"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx * 0.26 + '" ry="' + ry * 0.26 + '" fill="none" stroke="rgba(0,0,0,.14)" stroke-width="1"/>' +
      spot(id, cx, cy) +
      '<ellipse class="tp-glow" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="rgba(255,238,190,.55)"/>' +
    '</g>';
  const KIT =
    '<svg viewBox="0 0 352 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="tpGold" x1="0" y1="0" x2="0.4" y2="1">' +
        '<stop offset="0" stop-color="#e9c65c"/><stop offset=".55" stop-color="#c79e30"/><stop offset="1" stop-color="#a5801f"/></linearGradient>' +
        '<linearGradient id="tpStick" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#d9b483"/><stop offset="1" stop-color="#f0dcbb"/></linearGradient></defs>' +
      '<path d="M140 218L132 268M218 216L226 268M296 274L296 300" stroke="#3a3a44" stroke-width="2.4"/>' +
      cymbal('crash', 22, 182, 64, 21, [26, 66]) +
      cymbal('ride', 334, 186, 66, 22, [-28, 62]) +
      cymbal('hat', 30, 246, 46, 15, [10, 52]) +
      drum('tom1', 140, 206, 38, 17, 15, '#7e2a24', '#551713', '#efe7d7') +
      drum('tom2', 218, 204, 38, 17, 15, '#7e2a24', '#551713', '#efe7d7') +
      drum('floor', 298, 258, 46, 21, 24, '#7e2a24', '#551713', '#efe7d7') +
      drum('snare', 92, 274, 46, 20, 18, '#9a9ca4', '#5f6067', '#f6f1e6') +
      '<g class="tp-pad" data-pad="kick">' +
        '<ellipse cx="186" cy="288" rx="56" ry="25" fill="#17171b"/>' +
        '<ellipse cx="186" cy="285" rx="56" ry="25" fill="#22222a"/>' +
        '<ellipse cx="186" cy="285" rx="48" ry="19" fill="#15151a"/>' +
        '<rect x="176" y="278" width="20" height="34" rx="4" fill="#2f2f38"/>' +
        '<rect x="180" y="272" width="12" height="16" rx="3" fill="#43434f"/>' +
        spot('kick', 186, 285) +
        '<ellipse class="tp-glow" cx="186" cy="285" rx="56" ry="25" fill="rgba(242,181,68,.5)"/>' +
      '</g>' +
      '<path d="M104 320 L150 292 Q186 282 222 292 L268 320 Z" fill="#2b2d33"/>' +
      '<g class="tp-sticks">' +
        '<path d="M168 318 L86 258" stroke="url(#tpStick)" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M204 318 L232 214" stroke="url(#tpStick)" stroke-width="6" stroke-linecap="round"/>' +
      '</g>' +
    '</svg>';

  window.EXPERIMENTS.push({
    id: 'tempo', name: 'Match My Tempo', source: 'Whiplash',
    hint: 'If you sabotage my band. I will gut you like a pig',
    mount(stage) {
      const sfx = window.LAB_SFX;
      const R = !!window.REDUCED;
      if (R) stage.classList.add('tp-r');

      let segs = '';
      for (let i = 0; i < 4; i++) segs += '<span class="tp-seg"><i class="tp-win"></i><i class="tp-dot"></i></span>';
      stage.innerHTML =
        '<div class="tp-kit">' + KIT + '</div>' +
        '<div class="tp-cam"><div class="tp-card" role="group" aria-label="Band audition">' +
          '<span class="tp-bpm"></span>' +
          '<div class="tp-meter">' + segs + '<i class="tp-line idle"></i></div>' +
          '<button type="button" class="tp-play">Play</button>' +
        '</div></div>' +
        '<div class="tp-fl" aria-hidden="true"><img alt=""><p class="tp-cap"></p></div>' +
        '<div class="tp-cover"><img src="' + COVER + '" alt="">' +
          '<div class="tp-cover-in"><button type="button" class="tp-cover-go">Audition</button></div></div>' +
        '<div class="tp-sr" aria-live="polite"></div>';

      const $ = s => stage.querySelector(s);
      const card = $('.tp-card'), meter = $('.tp-meter'), line = $('.tp-line'), btn = $('.tp-play');
      const bpmEl = $('.tp-bpm'), live = $('.tp-sr');
      const dots = [...stage.querySelectorAll('.tp-dot')], wins = [...stage.querySelectorAll('.tp-win')];
      const fl = $('.tp-fl'), flImg = fl.querySelector('img'), flCap = fl.querySelector('.tp-cap');
      const pads = {};
      for (const el of stage.querySelectorAll('.tp-pad')) pads[el.dataset.pad] = el;
      FACES.forEach(src => { const i = new Image(); i.src = src; });

      let flTimer = 0;
      function fletcher(face, text, detail, ms) {
        clearTimeout(flTimer);
        flImg.src = FACES[face];
        flCap.innerHTML = '';
        flCap.appendChild(document.createTextNode(text));
        if (detail) { const sm = document.createElement('small'); sm.textContent = detail; flCap.appendChild(sm); }
        fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on');
        flTimer = setTimeout(() => fl.classList.remove('on'), ms);
      }

      // ---------- sound: a small kit on its own bus, and a click track that can be cut dead ----------
      let A = null;
      function ensureAudio() {
        if (A) return A;
        const a = sfx && sfx.audio();
        if (!a) return null;
        const bus = a.ctx.createGain(); bus.gain.value = 0.9; bus.connect(a.out);
        A = { ctx: a.ctx, bus, noise: a.noise, run: null };
        return A;
      }
      function dropAudio() {
        if (!A) return;
        const a = A; A = null;
        const t = a.ctx.currentTime;
        a.bus.gain.cancelScheduledValues(t); a.bus.gain.setTargetAtTime(0.0001, t, 0.03);
        setTimeout(() => a.bus.disconnect(), 300);
      }
      function noiseHit(t, dur, type, freq, q, vol, dest) {
        const { ctx } = A, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = A.noise; f.type = type; f.frequency.value = freq; f.Q.value = q;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(dest || A.bus);
        s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
      }
      function toneHit(t, f, to, dur, type, vol, dest) {
        const { ctx } = A, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(to, t + dur * 0.7);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(dest || A.bus); o.start(t); o.stop(t + dur + 0.02);
      }
      const hat = (t, accent, dest) => {
        noiseHit(t, accent ? 0.06 : 0.035, 'highpass', 7000, 0.7, accent ? 0.42 : 0.2, dest);
        toneHit(t, accent ? 1900 : 1500, accent ? 1700 : 1400, 0.03, 'triangle', accent ? 0.12 : 0.05, dest);
      };
      const snare = (t, vol) => {
        noiseHit(t, 0.16, 'highpass', 1500, 0.7, vol);
        noiseHit(t, 0.08, 'bandpass', 3500, 1, vol * 0.5);
        toneHit(t, 230, 160, 0.1, 'triangle', vol * 0.6);
      };
      const kick = (t, vol) => toneHit(t, 130, 45, 0.25, 'sine', vol);
      const tom = (t, f, vol) => { toneHit(t, f, f * 0.62, 0.24, 'sine', vol); noiseHit(t, 0.04, 'lowpass', 1400, 0.7, vol * 0.25); };
      function crash(t, vol, dur) {
        noiseHit(t, dur, 'highpass', 4500, 0.5, vol);
        noiseHit(t, dur * 0.6, 'bandpass', 7200, 2, vol * 0.6);
        const f = A.ctx.createBiquadFilter(), g = A.ctx.createGain();
        f.type = 'highpass'; f.frequency.value = 3000;
        g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.5);
        f.connect(g); g.connect(A.bus);
        [417, 563, 791, 1107, 1433].forEach(fr => {
          const o = A.ctx.createOscillator(); o.type = 'square'; o.frequency.value = fr;
          o.connect(f); o.start(t); o.stop(t + dur * 0.5 + 0.02);
        });
      }
      const VOICE = {
        hat: t => hat(t, true),
        crash: t => crash(t, 0.3, 1.1),
        ride: t => crash(t, 0.16, 0.7),
        snare: t => snare(t, 0.6),
        tom1: t => tom(t, 300, 0.6),
        tom2: t => tom(t, 215, 0.6),
        floor: t => tom(t, 145, 0.65),
        kick: t => kick(t, 0.95)
      };
      // an original fill in sixteenths, for when a bar goes clean
      function fill(s) {
        const t = A.ctx.currentTime + 0.02;
        [0.5, 0.3, 0.2, 0.45].forEach((v, i) => snare(t + i * s, v));
        [[4, 300], [5, 300], [6, 210], [7, 210], [8, 140], [9, 140]].forEach(([i, f]) => tom(t + i * s, f, 0.55));
        kick(t + 10 * s, 0.7); snare(t + 10 * s, 0.45);
        kick(t + 12 * s, 0.8); crash(t + 12 * s, 0.28, 0.8);
      }

      // ---------- the clock: what is coming out of the speaker now, so presses are judged against what was heard ----------
      function clock() {
        if (!A) return performance.now() / 1000;
        const c = A.ctx;
        if (c.getOutputTimestamp) {
          const ts = c.getOutputTimestamp();
          if (ts && ts.contextTime > 0 && ts.performanceTime > 0) return ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
        }
        return c.currentTime - (c.outputLatency || c.baseLatency || 0);
      }
      const schedNow = () => (A ? A.ctx.currentTime : performance.now() / 1000);
      function pressTime(e) {
        const t = clock();
        const lag = e && e.timeStamp ? (performance.now() - e.timeStamp) / 1000 : 0;
        return lag > 0 && lag < 0.25 ? t - lag : t;
      }

      // ---------- state ----------
      // the ladder Fletcher runs you up, and what the kit plays on each beat of it
      const BPMS = [100, 120, 140, 180, 200];
      const PATTERNS = [
        ['kick', 'snare', 'kick', 'snare'],
        ['kick', 'snare', 'tom1', 'snare'],
        ['kick', 'tom1', 'snare', 'tom2'],
        ['kick', 'snare', 'tom2', 'floor'],
        ['kick', 'tom1', 'tom2', 'floor']
      ];
      let round = 0, bpm = BPMS[0], spb = 60 / bpm, tol = 0.09, pattern = PATTERNS[0];
      let state = 'idle';                         // idle, run, stopped, done, finished
      let t0 = 0, nextN = 0, sched = 0, streak = 0, lastHit = -1, frozenPh = 0, lastFloor = -1;
      const timers = new Set();
      const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
      const beatT = n => t0 + n * spb;
      const say = text => { live.textContent = text; };
      const setBtn = text => { btn.textContent = text; };

      // the drum the next beat belongs to is the one pulsing on the kit
      function markNext() {
        const id = state === 'run' ? pattern[streak % 4] : null;
        for (const k in pads) pads[k].classList.toggle('next', k === id);
      }

      function flash(padId) {
        const el = pads[padId];
        if (!el) return;
        el.classList.add('lit');
        clearTimeout(el._lit);
        el._lit = setTimeout(() => el.classList.remove('lit'), 150);
      }

      function setTempo() {
        bpm = BPMS[Math.min(round, BPMS.length - 1)];
        pattern = PATTERNS[Math.min(round, PATTERNS.length - 1)];
        spb = 60 / bpm;
        tol = Math.max(0.055, 0.09 - round * 0.008);
        bpmEl.textContent = bpm + ' bpm';
        const w = Math.min(90, (2 * tol / spb) * 100);
        wins.forEach(el => { el.style.width = w + '%'; });
        // each beat's dot wears the colour of the drum that beat plays
        dots.forEach((d, i) => { d.style.setProperty('--c', COL[pattern[i]] || '#f2b544'); });
        // and so does the drum it belongs to, so the kit reads as the same pattern
        for (const id in pads) { pads[id].classList.toggle('in-bar', pattern.indexOf(id) > -1); pads[id].classList.remove('next'); }
      }
      const clearDots = () => dots.forEach(d => d.classList.remove('hit', 'miss'));

      function stopRun() {
        if (sched) { clearInterval(sched); sched = 0; }
        if (A && A.run) {
          const r = A.run, t = A.ctx.currentTime;
          r.gain.cancelScheduledValues(t); r.gain.setTargetAtTime(0, t, 0.004);
          setTimeout(() => r.disconnect(), 300);
          A.run = null;
        }
      }

      function countIn() {
        stopRun();
        clearDots();
        card.classList.remove('tp-bad');
        streak = 0; lastHit = -1; lastFloor = -1;
        setTempo();
        ensureAudio();
        if (A) { A.run = A.ctx.createGain(); A.run.connect(A.bus); }
        t0 = schedNow() + 0.15; nextN = 0;
        state = 'run';
        delete stage.dataset.idle;
        say('Counting in at ' + bpm + ' bpm.');
        markNext();
        sched = setInterval(tick, 25);
        tick();
      }

      function tick() {
        if (state !== 'run') return;
        const ahead = schedNow() + 0.12;
        while (beatT(nextN) < ahead) {
          if (A && A.run) hat(beatT(nextN), nextN % 4 === 0, A.run);
          nextN++;
        }
        // silence counts as a miss too
        const h = clock();
        if (streak > 0 && h > beatT(lastHit + 1) + tol) miss('You skipped a beat.', lastHit + 1, false);
        else if (streak === 0 && h > beatT(8) + tol) miss('A whole bar went by.', -1, false);
      }

      function miss(detail, n, early) {
        state = 'stopped';
        frozenPh = (clock() - t0) / spb;
        stopRun();
        if (A) { const t = A.ctx.currentTime + 0.005; kick(t, 0.9); crash(t, 0.6, 1.8); }
        streak = 0; lastHit = -1;
        clearDots();
        markNext();
        if (n >= 0) dots[((n % 4) + 4) % 4].classList.add('miss');
        card.classList.add('tp-bad');
        if (!R) card.animate([
          { transform: 'translateX(0)' }, { transform: 'translateX(-9px) rotate(-.6deg)' }, { transform: 'translateX(7px) rotate(.4deg)' },
          { transform: 'translateX(-4px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }
        ], { duration: 380, easing: 'ease-out' });
        setBtn('Play');
        // beat 1: the silent cut-off; beat 2: rushing or dragging; beats 3 and 4: not quite my tempo
        const beat = n < 0 ? 0 : ((n % 4) + 4) % 4;
        const face = Math.min(beat, 2);
        const text = face === 0 ? '\u2026' : face === 1 ? (early ? 'Rushing.' : 'Dragging.') : 'Not quite my tempo.';
        fletcher(face, text, '', 1650);
        say(text + ' ' + detail);
        // nobody played: stop and wait rather than crashing the cymbal every bar
        if (n === -1) later(() => {
          if (state !== 'stopped') return;
          state = 'idle'; stage.dataset.idle = '1';
          fl.classList.remove('on'); card.classList.remove('tp-bad');
        }, 1600);
        else later(countIn, 1950);
      }

      function hit(n, diff) {
        streak++; lastHit = n;
        const pad = pattern[(streak - 1) % 4];
        if (A) VOICE[pad](A.ctx.currentTime + 0.002);
        flash(pad);
        dots[(streak - 1) % 4].classList.add('hit');
        markNext();
        btn.animate([{ boxShadow: '0 0 0 4px rgba(242,181,68,.55)' }, { boxShadow: '0 0 0 0 rgba(242,181,68,0)' }], { duration: 320, easing: 'ease-out' });
        if (streak < 4) { say('On time.'); return; }

        // four in a row: the round is yours
        state = 'done';
        frozenPh = (clock() - t0) / spb;
        stopRun();
        if (A) fill(spb / 4);
        setBtn('Play');
        if (round >= BPMS.length - 1) {
          // 200 and still with him
          fletcher(3, 'You\u2019re in the band', '(for now)', 3000);
          say("On tempo at 200. You're in the band, for now.");
          later(() => { state = 'finished'; stage.dataset.idle = '1'; }, 1400);
          return;
        }
        round++;
        fletcher(3, 'That\u2019s my boy.', 'Again. ' + BPMS[round] + ' bpm.', 1700);
        say('On tempo. Again, ' + BPMS[round] + ' bpm.');
        later(countIn, Math.round(spb * 3 * 1000) + 900);
      }

      function press(e) {
        if (state === 'idle') { countIn(); return; }
        if (state === 'finished') { round = 0; setTempo(); countIn(); return; }
        if (state !== 'run') return;
        const p = pressTime(e);
        const n = Math.round((p - t0) / spb);
        if (n < 4) return;                        // still counting you in
        const diff = p - beatT(n);
        if (Math.abs(diff) > tol) {
          const ms = Math.round(Math.abs(diff) * 1000);
          miss(diff < 0 ? 'Rushing, ' + ms + 'ms early' : 'Dragging, ' + ms + 'ms late', n, diff < 0);
        } else if (n === lastHit) miss('Twice on one beat.', n, true);
        else if (streak > 0 && n !== lastHit + 1) miss('You skipped a beat.', lastHit + 1, false);
        else hit(n, diff);
      }

      let keyAt = -1e9;
      const onPointer = e => { if (e.button > 0) return; ensureAudio(); press(e); };
      const onKey = e => {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        keyAt = performance.now();
        if (e.repeat) return;
        ensureAudio(); press(e);
      };
      const onKeyUp = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); keyAt = performance.now(); } };
      const onClick = e => { if (e.detail > 0 || performance.now() - keyAt < 600) return; ensureAudio(); press(e); };
      btn.addEventListener('pointerdown', onPointer);
      btn.addEventListener('keydown', onKey);
      btn.addEventListener('keyup', onKeyUp);
      btn.addEventListener('click', onClick);

      // sound switched mid-bar: the clock changes, so count in again from the top
      const onSound = on => {
        if (!on) { stopRun(); dropAudio(); }
        if (state === 'run') countIn();
      };
      sfx && sfx.onChange(onSound);

      // ---------- the marker ----------
      let raf = 0;
      function frame() {
        raf = requestAnimationFrame(frame);
        const W = meter.clientWidth;
        let ph = null;
        if (state === 'run') ph = (clock() - t0) / spb;
        else if (state === 'stopped' || state === 'done') ph = frozenPh;

        line.classList.toggle('idle', ph == null || state === 'done');
        line.classList.toggle('stop', state === 'stopped');
        const p = ph == null ? 0 : Math.max(-0.5, ph);
        line.style.transform = 'translateX(' + ((((((p + 0.5) % 4) + 4) % 4) / 4 * W) - 1).toFixed(1) + 'px)';

        let inWin = -1;
        if (state === 'run') {
          const n = Math.round(ph);
          if (Math.abs(ph - n) * spb <= tol) inWin = ((n % 4) + 4) % 4;
          const f = Math.floor(ph);
          if (f !== lastFloor && f >= 0) {
            lastFloor = f;
            if (f < 4) setBtn(String(f + 1));      // the count-in reads out on the button
            else if (f === 4) setBtn('Play');
            if (!R) dots[f % 4].animate([{ transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 160, easing: 'ease-out' });
          }
        }
        wins.forEach((w, i) => w.classList.toggle('in', i === inWin));
      }

      setTempo();

      const cover = $('.tp-cover'), coverGo = $('.tp-cover-go');
      btn.setAttribute('tabindex', '-1');
      let coverTimer = 0;
      function startAudition() {
        if (!cover || cover.classList.contains('off')) return;
        ensureAudio();                            // the click is the gesture the audio needs
        cover.classList.add('off');
        btn.removeAttribute('tabindex');
        stage.dataset.idle = '1';
        coverTimer = setTimeout(() => { cover.hidden = true; }, 400);
        btn.focus({ preventScroll: true });
      }
      coverGo.addEventListener('click', startAudition);

      raf = requestAnimationFrame(frame);

      return {
        destroy() {
          state = 'idle';
          cancelAnimationFrame(raf);
          timers.forEach(id => clearTimeout(id)); timers.clear();
          clearTimeout(flTimer); clearTimeout(coverTimer);
          for (const id in pads) clearTimeout(pads[id]._lit);
          stopRun(); dropAudio();
          sfx && sfx.offChange && sfx.offChange(onSound);
          coverGo.removeEventListener('click', startAudition);
          btn.removeEventListener('pointerdown', onPointer);
          btn.removeEventListener('keydown', onKey);
          btn.removeEventListener('keyup', onKeyUp);
          btn.removeEventListener('click', onClick);
        }
      };
    }
  });
})();
