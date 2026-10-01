(function(){
  const css = `
.x-ninja{font-family:var(--body);color:#ececf0;cursor:crosshair;touch-action:pan-y;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;
  background:
    radial-gradient(120% 86% at 50% -10%, rgba(255,214,150,.14), rgba(255,214,150,.03) 46%, transparent 72%),
    repeating-linear-gradient(90deg, rgba(0,0,0,.34) 0 2px, rgba(0,0,0,0) 2px 4px, rgba(255,255,255,.022) 4px 5px, rgba(0,0,0,0) 5px 74px),
    repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 2px, rgba(0,0,0,.05) 2px 6px),
    linear-gradient(180deg, #4b3527 0%, #3a2619 58%, #2a1b12 100%)}
.x-ninja::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(112% 86% at 50% 42%, transparent 44%, rgba(0,0,0,.42) 100%)}
.x-ninja .nj-splat{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1}
.x-ninja .nj-canvas{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:6}
.x-ninja .nj-card{position:absolute;left:0;top:0;height:58px;z-index:2;border-radius:12px;outline:none;will-change:transform;
  transition:transform .55s cubic-bezier(.22,1.25,.36,1),opacity .35s ease}
.x-ninja .nj-card:focus-visible{outline:2px solid #8b7dff;outline-offset:3px}
.x-ninja .nj-card.nj-pre{opacity:0}
.x-ninja .nj-face{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;
  padding:0 20px;box-sizing:border-box;border-radius:999px;overflow:hidden;
  background:radial-gradient(128% 150% at 24% 16%, var(--hi), var(--fruit) 62%);
  border:5px solid var(--rind);
  box-shadow:inset 0 0 0 2px rgba(255,255,255,.2), inset 0 -8px 16px rgba(0,0,0,.14), 0 10px 22px rgba(0,0,0,.34)}
.x-ninja .nj-gloss{position:absolute;left:8%;top:10%;width:38%;height:34%;border-radius:50%;background:rgba(255,255,255,.22);filter:blur(2px);pointer-events:none}
.x-ninja .nj-pip{position:absolute;width:7px;height:10px;border-radius:50%;background:rgba(0,0,0,.36);pointer-events:none}
.x-ninja .nj-txt{position:relative;display:grid;min-width:0;line-height:1.25;flex:1}
.x-ninja .nj-from{font:700 15px/1.2 var(--display);letter-spacing:-.01em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.x-ninja .nj-subj{font-size:12.5px;color:var(--ink);opacity:.66;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.x-ninja .nj-time{position:relative;font:400 11px/1 var(--mono);color:var(--ink);opacity:.55;align-self:center}
.x-ninja .nj-piece{position:absolute;z-index:4;pointer-events:none;will-change:transform,opacity}
.x-ninja .nj-wobble{animation:nj-wobble .52s cubic-bezier(.3,.7,.3,1)}
.x-ninja .nj-wobble.nj-left{animation-name:nj-wobble-l}
@keyframes nj-wobble{0%{transform:none}18%{transform:translateX(5px) rotate(1.8deg)}42%{transform:translateX(-3px) rotate(-1.2deg)}68%{transform:translateX(1.5px) rotate(.5deg)}100%{transform:none}}
@keyframes nj-wobble-l{0%{transform:none}18%{transform:translateX(-5px) rotate(-1.8deg)}42%{transform:translateX(3px) rotate(1.2deg)}68%{transform:translateX(-1.5px) rotate(-.5deg)}100%{transform:none}}
.x-ninja .nj-toast{position:absolute;left:50%;bottom:14px;z-index:7;display:flex;align-items:center;gap:7px;padding:6px 12px 6px 9px;border-radius:999px;
  background:#ececf0;color:#141417;font:500 13px/1 var(--body);box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:none;
  opacity:0;transform:translate(-50%,14px) scale(.96);transition:opacity .2s ease,transform .38s cubic-bezier(.2,1.4,.4,1)}
.x-ninja .nj-toast.nj-show{opacity:1;transform:translate(-50%,0) scale(1)}
.x-ninja .nj-toast svg{width:14px;height:14px}
.x-ninja .nj-combo{position:absolute;left:50%;top:14px;z-index:8;padding:6px 13px;border-radius:999px;
  background:#ececf0;color:#141417;font:700 15px/1 var(--display);letter-spacing:-.01em;box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:none;
  opacity:0;transform:translate(-50%,-8px) scale(.88);transition:opacity .16s ease,transform .34s cubic-bezier(.2,1.5,.4,1)}
.x-ninja .nj-combo.nj-show{opacity:1;transform:translate(-50%,0) scale(1)}
.x-ninja .nj-empty{position:absolute;left:0;top:0;right:0;bottom:0;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  opacity:0;pointer-events:none;transform:translateY(8px);transition:opacity .35s ease,transform .5s cubic-bezier(.2,1.3,.4,1)}
.x-ninja .nj-empty.nj-show{opacity:1;pointer-events:auto;transform:none}
.x-ninja .nj-empty strong{font:700 22px/1.1 var(--display);letter-spacing:-.01em}
.x-ninja .nj-empty span{color:#8d8d97;font-size:14px;margin-bottom:10px}
.x-ninja .nj-empty.nj-bare span{margin-bottom:0}
.x-ninja .nj-refill{font:500 13px/1 var(--body);color:#ececf0;background:transparent;border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:9px 18px;cursor:pointer;
  transition:border-color .2s ease,transform .15s ease}
.x-ninja .nj-refill:hover{border-color:rgba(255,255,255,.6)}
.x-ninja .nj-refill:active{transform:scale(.96)}
/* nj-plain: normal cards instead of fruit, for a board that is not a chopping board */
.x-ninja.nj-plain{color:#141417}
.x-ninja.nj-plain::after{display:none}
.x-ninja.nj-plain .nj-face{border:0;border-radius:14px;padding:0 18px;background:#FFFFFF;
  box-shadow:inset 0 0 0 1px rgba(20,20,23,.08),0 6px 16px rgba(20,20,23,.14)}
.x-ninja.nj-plain .nj-gloss,.x-ninja.nj-plain .nj-pip{display:none}
.x-ninja.nj-plain .nj-from{font-weight:500;font-size:15.5px;color:#16161A}
.x-ninja.nj-plain .nj-subj,.x-ninja.nj-plain .nj-time{color:#16161A}
.x-ninja.nj-plain .nj-empty strong{color:#141417}
.x-ninja.nj-plain .nj-empty span{color:rgba(20,20,23,.62)}
.x-ninja.nj-plain .nj-refill{color:#141417;border-color:rgba(20,20,23,.35)}
.x-ninja.nj-plain .nj-refill:hover{border-color:#141417}
/* nj-overlay: the cleared board as a sheet over the game, with a way out of it */
.x-ninja .nj-empty.nj-overlay{background:rgba(20,20,23,.18);gap:0}
.x-ninja .nj-sheet{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;
  min-width:260px;padding:34px 46px 30px;border-radius:20px;background:#FFFFFF;
  box-shadow:0 26px 60px rgba(20,20,23,.3),inset 0 0 0 1px rgba(20,20,23,.06);
  transform:scale(.92);transition:transform .5s cubic-bezier(.2,1.3,.4,1)}
.x-ninja .nj-empty.nj-show .nj-sheet{transform:none}
.x-ninja .nj-sheet strong{font:700 27px/1.15 var(--display);letter-spacing:-.02em;color:#141417}
.x-ninja .nj-empty .nj-sheet span{margin:2px 0 16px;font-size:16.5px;font-weight:500;color:#12A150}
.x-ninja .nj-sheet .nj-refill{font-size:15px;padding:12px 24px;color:#141417;border-color:rgba(20,20,23,.35)}
.x-ninja .nj-sheet .nj-refill:hover{border-color:#141417;background:rgba(20,20,23,.05)}
.x-ninja .nj-x{position:absolute;top:10px;right:10px;width:30px;height:30px;display:grid;place-items:center;
  padding:0;border:0;border-radius:50%;background:transparent;color:rgba(20,20,23,.45);cursor:pointer;
  transition:color .2s ease,background-color .2s ease}
.x-ninja .nj-x svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
.x-ninja .nj-x:hover{color:#141417;background:rgba(20,20,23,.08)}
.x-ninja .nj-x:focus-visible{outline:2px solid #141417;outline-offset:2px}
/* nj-panel: the cleared board as a win card, one colour, with the blade's own marks behind the text */
.x-ninja .nj-empty.nj-panel{background:rgba(0,0,0,.42);gap:0;z-index:5}
.x-ninja .nj-panel .nj-panel-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;
  padding:26px 42px 28px;border-radius:24px;overflow:hidden;color:#fffdf5;
  background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(0,0,0,.16)),var(--win,#ff5470);
  box-shadow:inset 0 0 0 3px rgba(255,255,255,.5),inset 0 -12px 26px rgba(0,0,0,.14),
    0 20px 48px rgba(0,0,0,.5),0 0 70px var(--winglow,rgba(255,84,112,.3));
  transform:scale(.72) rotate(-4deg);transition:transform .6s cubic-bezier(.18,1.5,.4,1)}
.x-ninja .nj-empty.nj-show .nj-panel-card{transform:none}
.x-ninja .nj-slashes{position:absolute;left:-8%;top:-8%;width:116%;height:116%;pointer-events:none;
  animation:nj-drift 13s ease-in-out infinite alternate}
.x-ninja .nj-slashes svg{display:block;width:100%;height:100%}
.x-ninja .nj-stars{position:relative;display:flex;gap:6px;margin-bottom:2px}
.x-ninja .nj-stars b{display:block;transform:scale(0)}
.x-ninja .nj-empty.nj-show .nj-stars b{animation:nj-star .58s cubic-bezier(.2,1.7,.4,1) forwards;animation-delay:calc(var(--i) * .12s)}
.x-ninja .nj-stars svg{display:block;width:26px;height:26px;fill:#fffdf5;stroke:rgba(20,20,23,.3);stroke-width:1;
  filter:drop-shadow(0 3px 5px rgba(0,0,0,.28))}
.x-ninja .nj-stars b:nth-child(2) svg{width:32px;height:32px;margin-top:-5px}
.x-ninja .nj-panel strong{position:relative;font:700 25px/1.1 var(--display);letter-spacing:-.02em;color:#fffdf5;
  text-shadow:0 2px 0 rgba(0,0,0,.18)}
.x-ninja .nj-panel .nj-cheer{position:relative;margin:2px 0 0;padding:7px 16px;border-radius:999px;
  background:#141417;color:#fffdf5;font:400 13px/1 var(--body);letter-spacing:.01em;
  box-shadow:0 6px 16px rgba(0,0,0,.3)}
.x-ninja .nj-panel .nj-refill{position:relative;margin-top:12px;color:#fffdf5;border-color:rgba(255,255,255,.55);font-weight:500}
.x-ninja .nj-panel .nj-refill:hover{border-color:#fffdf5;background:rgba(255,255,255,.18)}
.x-ninja .nj-confetti{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none}
.x-ninja .nj-confetti i{position:absolute;top:-24px;width:9px;height:14px;border-radius:2px;opacity:0;
  left:var(--x);background:var(--c)}
.x-ninja .nj-empty.nj-show .nj-confetti i{animation:nj-fall var(--dur) cubic-bezier(.35,.4,.5,1) var(--delay) forwards}
@keyframes nj-drift{from{transform:translate3d(-7px,-5px,0) rotate(-1.2deg)}to{transform:translate3d(7px,5px,0) rotate(1.2deg)}}
@keyframes nj-star{0%{transform:scale(0) rotate(-40deg)}70%{transform:scale(1.18) rotate(6deg)}100%{transform:scale(1) rotate(0)}}
@keyframes nj-fall{0%{opacity:0;transform:translateY(0) rotate(0)}
  8%{opacity:1}
  100%{opacity:0;transform:translateY(var(--fall)) rotate(var(--spin))}}
@media (prefers-reduced-motion:reduce){
  .x-ninja .nj-slashes{animation:none}
  .x-ninja .nj-empty.nj-show .nj-confetti i{animation:none}
  .x-ninja .nj-stars b{transform:none}
  .x-ninja .nj-empty.nj-show .nj-stars b{animation:none}
}
`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  const DATA = [
    { from: 'Maya Chen', subj: 'Quarterly numbers, final draft', time: '9:41', col: '#ff5470', ini: 'M' },
    { from: 'Stripe', subj: 'Your payout is on the way', time: '9:12', col: '#ffa63a', ini: 'S' },
    { from: 'Leo at Figma', subj: '3 comments on Onboarding v4', time: '8:30', col: '#9ee34a', ini: 'L' },
    { from: 'Calendar', subj: 'Design crit moved to 4 pm', time: 'Tue', col: '#b58cff', ini: 'C' }
  ];
  // a page can set window.NINJA_CARDS before this script to slice its own cards (subj and time are optional)
  const CARDS = Array.isArray(window.NINJA_CARDS) && window.NINJA_CARDS.length ? window.NINJA_CARDS : DATA;
  // and window.NINJA_CLEAR = { src, start, seconds } to play a clip once the last card is cut (only while sound is on)
  const CLEAR = window.NINJA_CLEAR && window.NINJA_CLEAR.src ? window.NINJA_CLEAR : null;
  // window.NINJA_PLAIN = true for normal cards, and window.NINJA_BG for the board behind them
  const PLAIN = window.NINJA_PLAIN === true;
  const BG = window.NINJA_BG || '';
  // and window.NINJA_CARD_W to hold the cards at one width while the board around them grows
  const CARD_MAX = Number(window.NINJA_CARD_W) > 0 ? Number(window.NINJA_CARD_W) : 460;
  // and window.NINJA_EMPTY = { title, line, refill } to word the cleared board, or drop its Refill button
  const E = window.NINJA_EMPTY || {};
  const EMPTY = {
    title: E.title || 'Inbox zero',
    line: E.line || 'Everything is archived.',
    refill: E.refill !== false,
    button: E.button || 'Refill',
    card: E.card === true,
    overlay: E.overlay === true,
    col: E.col || ''
  };

  window.EXPERIMENTS.push({
    id: 'ninja', name: 'To-Do list', source: 'Fruit Ninja',
    hint: 'Swipe fast across a card to slice it into the archive.',
    mount(stage) {
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      if (PLAIN) stage.classList.add('nj-plain');
      if (BG) stage.style.background = BG;
      // the blade is a white flash on the wood; on a light board it has to be ink
      const BLADE = PLAIN
        ? { glow: 'rgba(20,20,23,.3)', body: 'rgba(20,20,23,.26)', tipGlow: 'rgba(20,20,23,.4)', core: '#1b1b20', flash: '20,20,23', comp: 'source-over' }
        : { glow: 'rgba(120,190,255,0.95)', body: 'rgba(150,205,255,0.55)', tipGlow: 'rgba(255,255,255,0.9)', core: '#ffffff', flash: '255,255,255', comp: 'lighter' };
      let swooshT = 0, moveX = 0, moveY = 0, moveT = 0;
      let touched = false, ghost = null, idleTimer = 0;
      let clip = null;
      function stopClip() {
        if (!clip) return;
        // fade it out, and pause it after 400ms whatever the volume did (iPhones ignore volume changes)
        const a = clip; clip = null;
        const fade = setInterval(() => { try { a.volume = Math.max(0, a.volume - 0.1); } catch (e) {} }, 40);
        setTimeout(() => { clearInterval(fade); a.pause(); }, 400);
      }
      function playClip() {
        if (!CLEAR || !(window.LAB_SFX && LAB_SFX.isOn())) return;
        stopClip();
        const a = new Audio(CLEAR.src); a.volume = CLEAR.volume == null ? 0.8 : CLEAR.volume;
        a.currentTime = CLEAR.start || 0;
        a.play().then(() => later(() => { if (clip === a) stopClip(); }, (CLEAR.seconds || 5) * 1000)).catch(() => {});
        clip = a;
      }
      // ---------- the blade: its own bus, so the swipe and the cut can be shaped ----------
      let A = null;
      function audio() {
        if (A) return A;
        const a = window.LAB_SFX && LAB_SFX.audio && LAB_SFX.audio();
        if (!a) return null;
        const bus = a.ctx.createGain(); bus.gain.value = 0.9; bus.connect(a.out);
        A = { ctx: a.ctx, bus, noise: a.noise };
        return A;
      }
      function dropAudio() { if (!A) return; const a = A; A = null; try { a.bus.disconnect(); } catch (e) {} }
      function air(t, dur, f0, f1, q, vol) {
        const { ctx, bus, noise } = A;
        const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q;
        f.frequency.setValueAtTime(f0, t);
        f.frequency.exponentialRampToValueAtTime(f1, t + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.2));
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(bus);
        s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.03);
      }
      function ring(t, freq, dur, vol, type) {
        const { ctx, bus } = A;
        const o = ctx.createOscillator(); o.type = type || 'triangle'; o.frequency.setValueAtTime(freq, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.03);
      }
      function drop(t, f0, f1, dur, vol, type) {
        const { ctx, bus } = A;
        const o = ctx.createOscillator(); o.type = type || 'sine';
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.03);
      }
      // the sword going past: air rising, the steel ringing thin on top of it, then the tail falling away
      function bladeSfx(speed) {
        if (!audio()) return;
        const t = A.ctx.currentTime, v = Math.min(1, speed / 3);
        air(t, 0.13, 900, 6200, 1.4, 0.06 + 0.12 * v);
        air(t + 0.05, 0.19, 5200, 1100, 1.1, 0.05 + 0.08 * v);
        ring(t + 0.015, 2600 + 900 * v, 0.15, 0.02 + 0.025 * v, 'sine');
        ring(t + 0.032, 3900 + 1200 * v, 0.11, 0.012 + 0.018 * v, 'sine');
      }
      // the chop: the blade parts the skin, the knock lands, the wet of it follows,
      // and the ring on top steps up for each fruit caught in the same swipe
      function cutSfx(n) {
        if (!audio()) return;
        const t = A.ctx.currentTime, step = Math.min(n - 1, 7), sc = Math.pow(2, step / 12);
        air(t, 0.05, 7000, 2800, 3.6, 0.3);
        drop(t + 0.004, 430 * sc, 110, 0.12, 0.26, 'triangle');
        drop(t + 0.004, 180, 58, 0.16, 0.2, 'sine');
        air(t + 0.016, 0.26, 1500, 230, 0.8, 0.16);
        ring(t + 0.01, 780 * sc, 0.2, 0.07, 'triangle');
      }

      const onSoundChange = on => { if (!on) { stopClip(); dropAudio(); } };
      if (window.LAB_SFX) LAB_SFX.onChange(onSoundChange);
      const R = !!window.REDUCED;
      const H = 58, GAP = 10, TRAIL_MS = 130;
      let W = stage.clientWidth || 360, HH = stage.clientHeight || 320, dpr = 1;
      let cardW = 0, left = 0, top = 0;
      const timers = new Set();
      const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };

      const canvas = document.createElement('canvas'); canvas.className = 'nj-canvas';
      const ctx = canvas.getContext('2d');
      const splat = document.createElement('canvas'); splat.className = 'nj-splat';
      const sctx = splat.getContext('2d');
      const toast = document.createElement('div'); toast.className = 'nj-toast';
      toast.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>Archived';
      toast.setAttribute('role', 'status');
      const combo = document.createElement('div'); combo.className = 'nj-combo'; combo.setAttribute('aria-hidden', 'true');
      const empty = document.createElement('div');
      empty.className = 'nj-empty' + (EMPTY.refill ? '' : ' nj-bare') + (EMPTY.card ? ' nj-panel' : '') + (EMPTY.overlay ? ' nj-overlay' : '');
      const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.4l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.42l-5.88 3.09 1.12-6.55L2.48 9.32l6.58-.96z"/></svg>';
      // the blade's own marks: tapered slashes across the card, each with a little juice
      const SLASHES = (function () {
        // a slash is a lens: pointed at both ends, fattest in the middle, like a cut through fruit
        const lens = (x1, y1, x2, y2, w) => {
          const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len * w, ny = dx / len * w;
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          return 'M' + x1 + ' ' + y1 + 'Q' + (mx + nx) + ' ' + (my + ny) + ' ' + x2 + ' ' + y2 +
            'Q' + (mx - nx) + ' ' + (my - ny) + ' ' + x1 + ' ' + y1 + 'Z';
        };
        const cuts = [
          [-40, 74, 440, 6, 17, .2],
          [-30, 168, 440, 92, 11, .13],
          [-20, 250, 430, 182, 22, .17],
          [46, -30, 168, 290, 13, .12],
          [286, -30, 408, 290, 9, .11],
          [-30, 214, 250, 290, 8, .1]
        ];
        const drops = [[60, 96], [124, 44], [198, 78], [272, 132], [92, 184], [334, 196], [226, 220], [156, 124], [376, 66], [30, 214], [352, 118], [104, 250]];
        let g = '';
        for (const c of cuts) g += '<path d="' + lens(c[0], c[1], c[2], c[3], c[4]) + '" fill="#fffdf5" fill-opacity="' + c[5] + '"/>';
        for (let i = 0; i < drops.length; i++) {
          g += '<circle cx="' + drops[i][0] + '" cy="' + drops[i][1] + '" r="' + (2.4 + (i % 3) * 2.4) +
            '" fill="#fffdf5" fill-opacity="' + (0.09 + (i % 4) * 0.035).toFixed(3) + '"/>';
        }
        return '<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + g + '</svg>';
      })();
      // confetti in the colours of the cards that were just cut
      const cols = CARDS.map(d => d.col);
      const winCol = EMPTY.col || cols[0] || '#ff5470';
      const winRGB = (function (h) {
        const n = String(h).replace('#', '');
        const f = n.length === 3 ? n.split('').map(x => x + x).join('') : n;
        return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16) || 0);
      })(winCol);
      const winVars = '--win:' + winCol + ';--winglow:rgba(' + winRGB.join(',') + ',.34)';
      let bits = '';
      for (let i = 0; i < 22; i++) {
        const r = (n, m) => (n + Math.random() * (m - n)).toFixed(2);
        bits += '<i style="--x:' + r(2, 96) + '%;--c:' + cols[i % cols.length] +
          ';--dur:' + r(1.5, 2.6) + 's;--delay:' + r(0, .7) + 's;--fall:' + r(300, 460) + 'px;--spin:' + r(240, 900) + 'deg"></i>';
      }
      const inner = (EMPTY.card ? '<div class="nj-slashes" aria-hidden="true">' + SLASHES + '</div><div class="nj-stars" aria-hidden="true"><b style="--i:0">' + STAR + '</b><b style="--i:1">' + STAR + '</b><b style="--i:2">' + STAR + '</b></div>' : '') +
        '<strong>' + esc(EMPTY.title) + '</strong>' +
        '<span' + (EMPTY.card ? ' class="nj-cheer"' : '') + '>' + esc(EMPTY.line) + '</span>' +
        (EMPTY.refill ? '<button class="nj-refill" type="button">' + esc(EMPTY.button) + '</button>' : '');
      const CLOSE = '<button class="nj-x" type="button" aria-label="Close"><svg viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2.5 2.5l9 9M11.5 2.5l-9 9"/></svg></button>';
      empty.innerHTML = EMPTY.card
        ? '<div class="nj-confetti" aria-hidden="true">' + bits + '</div><div class="nj-panel-card" style="' + winVars + '">' + inner + '</div>'
        : (EMPTY.overlay ? '<div class="nj-sheet" role="dialog" aria-label="' + esc(EMPTY.title) + '">' + CLOSE + inner + '</div>' : inner);
      const closeBtn = empty.querySelector('.nj-x');
      if (closeBtn) closeBtn.addEventListener('click', () => { sfx('tick'); empty.classList.remove('nj-show'); });
      const refillBtn = empty.querySelector('.nj-refill');
      stage.appendChild(splat); stage.appendChild(empty); stage.appendChild(canvas); stage.appendChild(toast); stage.appendChild(combo);

      function sizeCanvas() {
        W = stage.clientWidth || 360; HH = stage.clientHeight || 320;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(HH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        splat.width = canvas.width; splat.height = canvas.height;
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cardW = Math.min(W - 40, CARD_MAX); left = (W - cardW) / 2;
        top = Math.max(12, (HH - (4 * H + 3 * GAP)) / 2 - 10);
      }
      sizeCanvas();

      // the fruit is built out of the card's own colour: flesh, a lighter middle, a rind, and ink you can read on it
      const hex = c => {
        const h = String(c || '#888888').replace('#', '');
        const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
        return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
      };
      const mix = (rgb, to, amt) => 'rgb(' + rgb.map(v => Math.round(v + (to - v) * amt)).join(',') + ')';
      const fruitOf = col => {
        const rgb = hex(col);
        const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
        return { fruit: col, hi: mix(rgb, 255, 0.34), rind: mix(rgb, 0, 0.46), ink: lum > 0.62 ? '#141417' : '#fffdf5' };
      };
      function makeFace(d) {
        const f = document.createElement('div'); f.className = 'nj-face';
        const k = d._fruit || (d._fruit = fruitOf(d.col));
        f.style.cssText = '--fruit:' + k.fruit + ';--hi:' + k.hi + ';--rind:' + k.rind + ';--ink:' + k.ink;
        let pips = '';
        // three seeds, in the same spots every time this card is drawn so the halves keep their pips
        const seeds = d._pips || (d._pips = [[62, 24], [74, 62], [84, 34]].map(([x, y], i) => [x + ((i * 7) % 5), y + ((i * 11) % 9)]));
        seeds.forEach(([x, y]) => { pips += '<i class="nj-pip" style="left:' + x + '%;top:' + y + '%"></i>'; });
        f.innerHTML = '<span class="nj-gloss"></span>' + pips +
          '<span class="nj-txt"><span class="nj-from">' + d.from + '</span>' +
          (d.subj ? '<span class="nj-subj">' + d.subj + '</span>' : '') + '</span>' +
          (d.time ? '<span class="nj-time">' + d.time + '</span>' : '');
        return f;
      }

      let cards = [];
      function layout() {
        let i = 0;
        for (const c of cards) {
          if (!c.alive) continue;
          c.el.style.width = cardW + 'px';
          c.el.style.transform = 'translate(' + left + 'px,' + (top + i * (H + GAP)) + 'px)';
          i++;
        }
      }
      function refill() {
        sctx.clearRect(0, 0, W, HH);
        for (const c of cards) c.el.remove();
        empty.classList.remove('nj-show');
        stopClip();
        cards = CARDS.map((d, i) => {
          const el = document.createElement('div'); el.className = 'nj-card nj-pre';
          el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', (d.subj ? 'Archive email from ' : 'Slice ') + d.from);
          const face = makeFace(d); el.appendChild(face);
          el.style.width = cardW + 'px';
          el.style.transition = 'none';
          el.style.transform = 'translate(' + left + 'px,' + (top + i * (H + GAP) - 18) + 'px)';
          stage.insertBefore(el, canvas);
          const c = { d, el, face, alive: true, run: null };
          el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); keyCut(c); } });
          return c;
        });
        void stage.offsetWidth;
        cards.forEach((c, i) => {
          c.el.style.transition = '';
          c.el.style.transitionDelay = (R ? 0 : i * 55) + 'ms';
          c.el.classList.remove('nj-pre');
          later(() => { c.el.style.transitionDelay = ''; }, 700);
        });
        layout();
      }

      /* geometry */
      const inRect = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
      const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
      function clipSeg(a, b, r) {
        let t0 = 0, t1 = 1; const dx = b.x - a.x, dy = b.y - a.y;
        const p = [-dx, dx, -dy, dy], q = [a.x - r.x, r.x + r.w - a.x, a.y - r.y, r.y + r.h - a.y];
        for (let i = 0; i < 4; i++) {
          if (p[i] === 0) { if (q[i] < 0) return null; continue; }
          const t = q[i] / p[i];
          if (p[i] < 0) { if (t > t1) return null; if (t > t0) t0 = t; } else { if (t < t0) return null; if (t < t1) t1 = t; }
        }
        return t1 - t0 > 0.001 ? [t0, t1] : null;
      }
      function splitPoly(poly, px, py, dx, dy) {
        const pos = [], neg = [], cuts = [];
        const side = (v) => dx * (v[1] - py) - dy * (v[0] - px);
        for (let i = 0; i < poly.length; i++) {
          const cur = poly[i], nxt = poly[(i + 1) % poly.length];
          const sc = side(cur), sn = side(nxt);
          if (sc >= 0) pos.push(cur);
          if (sc <= 0) neg.push(cur);
          if ((sc > 0 && sn < 0) || (sc < 0 && sn > 0)) {
            const t = sc / (sc - sn);
            const ip = [cur[0] + (nxt[0] - cur[0]) * t, cur[1] + (nxt[1] - cur[1]) * t];
            pos.push(ip); neg.push(ip); cuts.push(ip);
          }
        }
        return { pos, neg, cuts };
      }
      function area(P) { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a) / 2; }
      function centroid(P) { let x = 0, y = 0; for (const p of P) { x += p[0]; y += p[1]; } return [x / P.length, y / P.length]; }

      /* effects state */
      const trail = [], particles = [], pieces = [], flashes = [];
      let raf = 0, lastT = 0;
      function kick() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); } }

      function splash(P1, P2, col) {
        const ang = Math.atan2(P2.y - P1.y, P2.x - P1.x);
        const mx = (P1.x + P2.x) / 2, my = (P1.y + P2.y) / 2;
        sctx.save();
        sctx.fillStyle = col;
        const body = R ? 4 : 9;
        for (let i = 0; i < body; i++) {
          const t = body === 1 ? 0.5 : i / (body - 1);
          const x = P1.x + (P2.x - P1.x) * t + (Math.random() - 0.5) * 12;
          const y = P1.y + (P2.y - P1.y) * t + (Math.random() - 0.5) * 12;
          const r = 6 + Math.random() * 13;
          sctx.globalAlpha = 0.5 + Math.random() * 0.3;
          sctx.beginPath(); sctx.ellipse(x, y, r, r * (0.55 + Math.random() * 0.5), ang + (Math.random() - 0.5), 0, Math.PI * 2); sctx.fill();
        }
        const drops = R ? 5 : 20;
        for (let i = 0; i < drops; i++) {
          const a = ang + (Math.random() - 0.5) * 1.5 + (Math.random() < 0.5 ? Math.PI : 0);
          const dist = 14 + Math.random() * 86;
          const x = mx + Math.cos(a) * dist + (Math.random() - 0.5) * 24;
          const y = my + Math.sin(a) * dist * 0.72 + (Math.random() - 0.5) * 24;
          const r = 1.1 + Math.random() * 4;
          sctx.globalAlpha = 0.4 + Math.random() * 0.45;
          sctx.beginPath(); sctx.ellipse(x, y, r, r * (0.7 + Math.random() * 0.7), a, 0, Math.PI * 2); sctx.fill();
        }
        sctx.restore();
      }

      let comboN = 0, comboT = 0, comboTimer = 0;
      function bumpCombo() {
        const now = performance.now();
        comboN = now - comboT < 420 ? comboN + 1 : 1;
        comboT = now;
        if (comboN > 1) {
          combo.textContent = comboN + 'x combo';
          combo.classList.remove('nj-show'); void combo.offsetWidth; combo.classList.add('nj-show');
          if (comboTimer) { clearTimeout(comboTimer); timers.delete(comboTimer); }
          comboTimer = later(() => combo.classList.remove('nj-show'), 950);
        }
        return comboN;
      }

      let toastTimer = 0;
      function showToast() {
        toast.classList.add('nj-show');
        if (toastTimer) { clearTimeout(toastTimer); timers.delete(toastTimer); }
        toastTimer = later(() => toast.classList.remove('nj-show'), 1300);
      }

      function wobble(c, dir) {
        const f = c.face;
        f.classList.remove('nj-wobble', 'nj-left'); void f.offsetWidth;
        f.classList.add('nj-wobble'); if (dir < 0) f.classList.add('nj-left');
        later(() => f.classList.remove('nj-wobble', 'nj-left'), 560);
      }

      function doCut(c, a, b, anchor) {
        const r = c.rect;
        let dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
        if (L < 1) { dx = 1; dy = 0; L = 1; }
        dx /= L; dy /= L;
        const poly = [[0, 0], [r.w, 0], [r.w, r.h], [0, r.h]];
        let sp = splitPoly(poly, anchor.x - r.x, anchor.y - r.y, dx, dy);
        const minA = r.w * r.h * 0.06;
        if (sp.pos.length < 3 || sp.neg.length < 3 || area(sp.pos) < minA || area(sp.neg) < minA) {
          sp = splitPoly(poly, r.w / 2, r.h / 2, dx, dy);
        }
        if (sp.cuts.length < 2) { sfx('tick'); wobble(c, dx); return; }
        c.alive = false; c.run = null;
        cutSfx(bumpCombo());
        const hadFocus = document.activeElement === c.el;
        c.el.remove();
        const nx = -dy, ny = dx;
        [[sp.pos, 1], [sp.neg, -1]].forEach(([P, sgn]) => {
          const el = document.createElement('div'); el.className = 'nj-piece';
          el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px';
          el.style.clipPath = 'polygon(' + P.map(p => p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px').join(',') + ')';
          const cen = centroid(P);
          el.style.transformOrigin = cen[0].toFixed(1) + 'px ' + cen[1].toFixed(1) + 'px';
          el.appendChild(makeFace(c.d));
          stage.insertBefore(el, canvas);
          const spd = R ? 40 : 150 + Math.random() * 70;
          pieces.push({
            el, x: 0, y: 0, rot: 0, age: 0, life: R ? 0.35 : 0.9,
            vx: nx * sgn * spd + dx * 110, vy: ny * sgn * spd + dy * 110 - (R ? 0 : 140),
            av: R ? 0 : sgn * (dx >= 0 ? 1 : -1) * (110 + Math.random() * 150)
          });
        });
        const c1 = sp.cuts[0], c2 = sp.cuts[1];
        const P1 = { x: r.x + c1[0], y: r.y + c1[1] }, P2 = { x: r.x + c2[0], y: r.y + c2[1] };
        flashes.push({ a: P1, b: P2, dx: (P2.x - P1.x), dy: (P2.y - P1.y), age: 0, col: c.d.col });
        splash(P1, P2, c.d.col);
        const n = R ? 6 : 34;
        for (let i = 0; i < n; i++) {
          const t = Math.random();
          const sgn = Math.random() < 0.5 ? 1 : -1;
          const sp2 = 60 + Math.pow(Math.random(), 0.7) * 340;
          const along = (Math.random() - 0.35) * 220;
          particles.push({
            x: P1.x + (P2.x - P1.x) * t, y: P1.y + (P2.y - P1.y) * t,
            vx: nx * sgn * sp2 + dx * along + (Math.random() - 0.5) * 60,
            vy: ny * sgn * sp2 + dy * along - 90 * Math.random(),
            r: 1 + Math.random() * 2.8, age: 0, life: 0.45 + Math.random() * 0.5,
            col: Math.random() < 0.18 ? '#ffffff' : c.d.col
          });
        }
        showToast();
        later(layout, R ? 0 : 90);
        if (hadFocus) {
          const next = cards.find(k => k.alive);
          if (next) next.el.focus({ preventScroll: true });
        }
        if (!cards.some(k => k.alive)) {
          playClip();
          later(() => { empty.classList.add('nj-show'); if (hadFocus && refillBtn) refillBtn.focus({ preventScroll: true }); }, 650);
        }
        kick();
      }

      function finishRun(c, exitPt, exited) {
        const run = c.run; c.run = null;
        const r = c.rect;
        const crossed = run.entered && exited;
        const chord = dist(run.entry, exitPt);
        const dt = Math.max(1, exitPt.t - run.entry.t);
        const speed = chord / dt;
        const ok = speed > 0.45 && (crossed ? chord > 30 : (run.len > r.w * 0.5 || chord > r.w * 0.5));
        if (ok) doCut(c, run.entry, exitPt, run.pts[Math.floor(run.pts.length / 2)]);
        else if (run.len > 4 || !exited) wobble(c, exitPt.x - run.entry.x);
      }

      let down = false, pid = null, last = null;
      function refreshRects() {
        const sr = stage.getBoundingClientRect();
        for (const c of cards) {
          if (!c.alive) continue;
          const b = c.el.getBoundingClientRect();
          c.rect = { x: b.left - sr.left, y: b.top - sr.top, w: b.width, h: b.height };
        }
        return sr;
      }
      function process(p, isUp) {
        for (const c of cards) {
          if (!c.alive) continue;
          const r = c.rect;
          const inside = inRect(p, r);
          if (!c.run) {
            if (inside) {
              const entered = !!(last && !inRect(last, r));
              c.run = { entry: entered ? last : p, entered, pts: [p], len: entered ? dist(last, p) : 0 };
              if (isUp) finishRun(c, p, false);
            } else if (last && !inRect(last, r)) {
              const seg = clipSeg(last, p, r);
              if (seg) {
                const tm = (seg[0] + seg[1]) / 2;
                c.run = { entry: last, entered: true, pts: [{ x: last.x + (p.x - last.x) * tm, y: last.y + (p.y - last.y) * tm, t: p.t }], len: dist(last, p) };
                finishRun(c, p, true);
              }
            }
          } else {
            const prev = c.run.pts[c.run.pts.length - 1];
            c.run.len += dist(prev, p);
            if (inside) { c.run.pts.push(p); if (isUp) finishRun(c, p, false); }
            else finishRun(c, p, true);
          }
        }
      }
      function localPt(e, sr) { return { x: e.clientX - sr.left, y: e.clientY - sr.top, t: e.timeStamp || performance.now() }; }

      function onDown(e) {
        if (e.target.closest && e.target.closest('.nj-refill, .nj-x')) return;
        touched = true; ghost = null;
        if (e.button > 0) return;
        down = true; pid = e.pointerId;
        try { stage.setPointerCapture(pid); } catch (err) {}
        const sr = refreshRects();
        const p = localPt(e, sr); p.t = performance.now();
        last = null; trail.length = 0;
        trail.push(p); process(p, false); last = p;
        kick();
      }
      function onMove(e) {
        if (!down || e.pointerId !== pid) return;
        const sr = refreshRects();
        let evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
        if (!evs || !evs.length) evs = [e];
        const now = performance.now();
        for (let i = 0; i < evs.length; i++) {
          const p = localPt(evs[i], sr);
          p.t = now - (evs.length - 1 - i) * 4;
          if (last && dist(last, p) < 1.5) continue;
          trail.push(p); process(p, false); last = p;
        }
        const sp = moveT ? Math.hypot(e.clientX - moveX, e.clientY - moveY) / Math.max(1, now - moveT) : 0;
        moveX = e.clientX; moveY = e.clientY; moveT = now;
        if (sp > 1.4 && now - swooshT > 240) { swooshT = now; bladeSfx(sp); }
        kick();
      }
      function onUp(e) {
        if (!down || e.pointerId !== pid) return;
        const sr = refreshRects();
        const p = localPt(e, sr); p.t = performance.now();
        if (e.type === 'pointerup') process(p, true);
        for (const c of cards) c.run = null;
        down = false; last = null; pid = null;
      }
      function keyCut(c) {
        const sr = refreshRects();
        void sr;
        const r = c.rect;
        const ang = -0.28 + (Math.random() - 0.5) * 0.35;
        const dx = Math.cos(ang), dy = Math.sin(ang);
        const cx = r.x + r.w / 2, cy = r.y + r.h / 2, half = r.w / 2 + 30;
        const a = { x: cx - dx * half, y: cy - dy * half }, b = { x: cx + dx * half, y: cy + dy * half };
        const now = performance.now(); trail.length = 0;
        for (let i = 0; i <= 12; i++) trail.push({ x: a.x + (b.x - a.x) * i / 12, y: a.y + (b.y - a.y) * i / 12, t: now - (12 - i) * 7 });
        doCut(c, a, b, { x: cx, y: cy });
      }

      function chaikin(pts) {
        if (pts.length < 3) return pts;
        const out = [pts[0]];
        for (let i = 0; i < pts.length - 1; i++) {
          const p = pts[i], q = pts[i + 1];
          out.push({ x: p.x * 0.75 + q.x * 0.25, y: p.y * 0.75 + q.y * 0.25, t: p.t * 0.75 + q.t * 0.25 });
          out.push({ x: p.x * 0.25 + q.x * 0.75, y: p.y * 0.25 + q.y * 0.75, t: p.t * 0.25 + q.t * 0.75 });
        }
        out.push(pts[pts.length - 1]);
        return out;
      }
      function drawTrail(now) {
        while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
        if (trail.length < 2) return;
        const pts = chaikin(chaikin(trail));
        const n = pts.length;
        const L = [], Rr = [];
        for (let i = 0; i < n; i++) {
          const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
          let tx = b.x - a.x, ty = b.y - a.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
          const life = Math.max(0, 1 - (now - p.t) / TRAIL_MS);
          const w = 4.2 * Math.pow(i / (n - 1), 0.8) * life;
          L.push([p.x - ty * w, p.y + tx * w]); Rr.push([p.x + ty * w, p.y - tx * w]);
        }
        const head = pts[n - 1], prev = pts[n - 2];
        let hx = head.x - prev.x, hy = head.y - prev.y; const hl = Math.hypot(hx, hy) || 1;
        const tip = [head.x + hx / hl * 5, head.y + hy / hl * 5];
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.moveTo(L[0][0], L[0][1]);
        for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
        ctx.lineTo(tip[0], tip[1]);
        for (let i = n - 1; i >= 0; i--) ctx.lineTo(Rr[i][0], Rr[i][1]);
        ctx.closePath();
        ctx.shadowColor = BLADE.glow; ctx.shadowBlur = 16;
        ctx.fillStyle = BLADE.body; ctx.fill();
        ctx.shadowBlur = 5; ctx.shadowColor = BLADE.tipGlow;
        ctx.fillStyle = BLADE.core; ctx.fill();
        ctx.restore();
      }

      function frame(now) {
        raf = 0;
        const dt = Math.min(0.034, Math.max(0, (now - lastT) / 1000)); lastT = now;
        ctx.clearRect(0, 0, W, HH);

        for (let i = pieces.length - 1; i >= 0; i--) {
          const p = pieces[i];
          p.age += dt; p.vy += 1500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.av * dt;
          const k = p.age / p.life;
          if (k >= 1) { p.el.remove(); pieces.splice(i, 1); continue; }
          p.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) rotate(' + p.rot.toFixed(2) + 'deg)';
          p.el.style.opacity = (1 - k * k * k).toFixed(3);
        }

        for (let i = flashes.length - 1; i >= 0; i--) {
          const f = flashes[i]; f.age += dt;
          const k = f.age / 0.24; if (k >= 1) { flashes.splice(i, 1); continue; }
          const L = Math.hypot(f.dx, f.dy) || 1, ux = f.dx / L, uy = f.dy / L, ext = 26 + 30 * k;
          ctx.save(); ctx.globalCompositeOperation = BLADE.comp;
          ctx.strokeStyle = 'rgba(' + BLADE.flash + ',' + (1 - k).toFixed(3) + ')';
          ctx.shadowColor = f.col; ctx.shadowBlur = 18;
          ctx.lineWidth = 3 * (1 - k) + 0.5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(f.a.x - ux * ext, f.a.y - uy * ext); ctx.lineTo(f.b.x + ux * ext, f.b.y + uy * ext); ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.lineCap = 'round';
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.age += dt;
          if (p.age >= p.life) { particles.splice(i, 1); continue; }
          p.vx *= Math.pow(0.12, dt); p.vy = p.vy * Math.pow(0.12, dt) + 900 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          const k = p.age / p.life;
          ctx.globalAlpha = 1 - k * k;
          ctx.strokeStyle = p.col;
          ctx.lineWidth = p.r * 2 * (1 - k * 0.5);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.022, p.y - p.vy * 0.022); ctx.stroke();
        }
        ctx.restore();

        drawTrail(now);
        if (ghost) drawGhost(now);

        if (trail.length || particles.length || pieces.length || flashes.length || down || ghost) raf = requestAnimationFrame(frame);
      }

      // until the first swipe, a faint blade sweeps across the top card every few seconds to show the gesture
      idleTimer = setInterval(() => {
        if (touched || ghost || R || document.hidden) return;
        const c = cards.find(k => k.alive);
        if (!c) return;
        refreshRects();
        ghost = { t0: performance.now(), r: c.rect };
        kick();
      }, 4200);

      function drawGhost(now) {
        const k = (now - ghost.t0) / 820;
        if (k >= 1 || !ghost.r) { ghost = null; return; }
        const r = ghost.r, y = r.y + r.h * 0.58;
        const x0 = r.x - 26, x1 = r.x + r.w + 26;
        const head = x0 + (x1 - x0) * Math.min(1, k / 0.7);
        const tail = Math.max(x0, head - r.w * 0.55);
        const fade = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
        const g = ctx.createLinearGradient(tail, 0, head, 0);
        g.addColorStop(0, 'rgba(' + BLADE.flash + ',0)');
        g.addColorStop(1, 'rgba(' + BLADE.flash + ',' + (0.5 * fade).toFixed(3) + ')');
        ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(tail, y + (head - tail) * 0.04); ctx.lineTo(head, y); ctx.stroke();
        ctx.restore();
      }

      if (refillBtn) refillBtn.addEventListener('click', () => { sfx('pop'); refill(); });
      stage.addEventListener('pointerdown', onDown);
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerup', onUp);
      stage.addEventListener('pointercancel', onUp);

      let ro = null;
      if (window.ResizeObserver) {
        ro = new ResizeObserver(() => { sizeCanvas(); layout(); });
        ro.observe(stage);
      }
      refill();

      return {
        destroy() {
          stage.classList.remove('nj-plain');
          if (BG) stage.style.background = '';
          if (raf) cancelAnimationFrame(raf); raf = 0;
          clearInterval(idleTimer);
          timers.forEach(clearTimeout); timers.clear();
          if (clip) { clip.pause(); clip = null; }
          dropAudio();
          if (window.LAB_SFX && LAB_SFX.offChange) LAB_SFX.offChange(onSoundChange);
          if (ro) ro.disconnect();
          stage.removeEventListener('pointerdown', onDown);
          stage.removeEventListener('pointermove', onMove);
          stage.removeEventListener('pointerup', onUp);
          stage.removeEventListener('pointercancel', onUp);
          if (refillBtn) refillBtn.removeEventListener('click', refill);
        }
      };
    }
  });
})();
