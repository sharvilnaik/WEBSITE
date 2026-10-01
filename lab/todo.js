// Strike to complete: a plain to-do list you finish by swiping a line through the task.
// Same slicing idea as the Fruit Ninja tile, in the UI it would actually ship in.
(function () {
  const css = `
.x-todo{position:relative;display:flex;flex-direction:column;min-height:100%;
  background:#FFFFFF;color:#141417;cursor:crosshair;
  font-family:-apple-system,BlinkMacSystemFont,"Aspekta","Helvetica Neue",Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased}
.x-todo *{box-sizing:border-box}
.x-todo .td-head{padding:30px 32px 18px;flex:none}
.x-todo .td-head h2{margin:0;font-size:29px;line-height:1.1;font-weight:600;letter-spacing:-.025em;color:#101014}
.x-todo .td-head p{margin:7px 0 0;font-size:14px;line-height:1.3;color:#8E8E96}
.x-todo .td-list{flex:1 1 auto;list-style:none;margin:0;padding:4px 32px 40px;display:flex;flex-direction:column;gap:10px}
.x-todo .td-row{position:relative;display:flex;align-items:center;gap:14px;padding:15px 18px;border-radius:14px;
  background:#FFFFFF;box-shadow:inset 0 0 0 1px #ECECEF;
  transition:background-color .35s ease,box-shadow .35s ease,opacity .35s ease}
.x-todo .td-row.td-done{background:#FAFAFB;box-shadow:inset 0 0 0 1px #F1F1F4}
.x-todo .td-box{flex:none;width:26px;height:26px;padding:0;border:0;border-radius:50%;background:#FFFFFF;
  box-shadow:inset 0 0 0 2px #D6D6DC;cursor:pointer;display:grid;place-items:center;
  transition:background-color .25s ease,box-shadow .25s ease,transform .25s cubic-bezier(.2,1.4,.4,1)}
.x-todo .td-box svg{width:15px;height:15px;fill:none;stroke:#FFFFFF;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;
  stroke-dasharray:18;stroke-dashoffset:18;transition:stroke-dashoffset .3s ease .05s}
.x-todo .td-row.td-done .td-box{background:#1FBF63;box-shadow:inset 0 0 0 2px #1FBF63;transform:scale(1.06)}
.x-todo .td-row.td-done .td-box svg{stroke-dashoffset:0}
.x-todo .td-box:focus-visible{outline:2px solid #101014;outline-offset:3px}
@media (hover:hover) and (pointer:fine){ .x-todo .td-box:hover{box-shadow:inset 0 0 0 2px #B4B4BD} }
.x-todo .td-main{min-width:0}
.x-todo .td-name{position:relative;display:inline-block;max-width:100%;font-size:16.5px;line-height:1.3;letter-spacing:-.01em;
  color:#16161A;transition:color .35s ease}
.x-todo .td-row.td-done .td-name{color:#9C9CA5}
.x-todo .td-strike{position:absolute;left:-2px;right:-2px;top:52%;height:1.6px;border-radius:2px;background:#16161A;
  transform:scaleX(0);transform-origin:left center;transition:transform .34s cubic-bezier(.2,.85,.3,1),background-color .35s ease}
.x-todo .td-row.td-done .td-strike{transform:scaleX(1);background:#9C9CA5}
.x-todo .td-meta{display:flex;align-items:center;gap:6px;margin:5px 0 0;font-size:13px;line-height:1;color:#9C9CA5}
.x-todo .td-meta svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.x-todo .td-blade{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:4}

/* the finish: one colour, the blade's own marks behind the text */
.x-todo .td-win{position:absolute;left:0;top:0;right:0;bottom:0;z-index:6;display:flex;align-items:center;justify-content:center;
  background:rgba(252,252,253,.72);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);
  opacity:0;pointer-events:none;transition:opacity .35s ease}
.x-todo .td-win.td-show{opacity:1;pointer-events:auto}
.x-todo .td-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;overflow:hidden;
  padding:24px 40px 26px;border-radius:24px;color:#fffdf5;
  background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(0,0,0,.16)),var(--win,#ff5470);
  box-shadow:inset 0 0 0 3px rgba(255,255,255,.5),0 22px 44px rgba(20,20,23,.28);
  transform:scale(.72) rotate(-4deg);transition:transform .6s cubic-bezier(.18,1.5,.4,1)}
.x-todo .td-win.td-show .td-card{transform:none}
.x-todo .td-slashes{position:absolute;left:-8%;top:-8%;width:116%;height:116%;pointer-events:none;
  animation:td-drift 13s ease-in-out infinite alternate}
.x-todo .td-slashes svg{display:block;width:100%;height:100%}
.x-todo .td-stars{position:relative;display:flex;gap:6px}
.x-todo .td-stars b{display:block;transform:scale(0)}
.x-todo .td-win.td-show .td-stars b{animation:td-star .58s cubic-bezier(.2,1.7,.4,1) forwards;animation-delay:calc(var(--i) * .12s)}
.x-todo .td-stars svg{display:block;width:24px;height:24px;fill:#fffdf5;stroke:rgba(20,20,23,.28);stroke-width:1;
  filter:drop-shadow(0 3px 5px rgba(0,0,0,.22))}
.x-todo .td-stars b:nth-child(2) svg{width:30px;height:30px;margin-top:-5px}
.x-todo .td-card strong{position:relative;font-size:24px;line-height:1.1;font-weight:700;letter-spacing:-.02em;
  text-shadow:0 2px 0 rgba(0,0,0,.16)}
.x-todo .td-aura{position:relative;margin-top:2px;padding:7px 16px;border-radius:999px;background:#141417;color:#fffdf5;
  font-size:13px;line-height:1;font-weight:400;box-shadow:0 6px 16px rgba(0,0,0,.24)}
.x-todo .td-confetti{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none}
.x-todo .td-confetti i{position:absolute;top:-24px;width:8px;height:13px;border-radius:2px;opacity:0;left:var(--x);background:var(--c)}
.x-todo .td-win.td-show .td-confetti i{animation:td-fall var(--dur) cubic-bezier(.35,.4,.5,1) var(--delay) forwards}
@keyframes td-drift{from{transform:translate3d(-7px,-5px,0) rotate(-1.2deg)}to{transform:translate3d(7px,5px,0) rotate(1.2deg)}}
@keyframes td-star{0%{transform:scale(0) rotate(-40deg)}70%{transform:scale(1.18) rotate(6deg)}100%{transform:scale(1) rotate(0)}}
@keyframes td-fall{0%{opacity:0;transform:translateY(0) rotate(0)}8%{opacity:1}
  100%{opacity:0;transform:translateY(var(--fall)) rotate(var(--spin))}}

/* the board keeps its side margins on a phone, so there is always somewhere to start the swipe */
@media (max-width:560px){
  .x-todo .td-head{padding:24px 20px 14px}
  .x-todo .td-head h2{font-size:25px}
  .x-todo .td-list{padding:2px 20px 24px;gap:9px}
  .x-todo .td-row{padding:13px 15px;gap:12px}
  .x-todo .td-name{font-size:15.5px}
  .x-todo .td-card{padding:22px 30px 24px}
  .x-todo .td-card strong{font-size:21px}
}
@media (prefers-reduced-motion:reduce){
  .x-todo .td-slashes{animation:none}
  .x-todo .td-win.td-show .td-confetti i{animation:none}
  .x-todo .td-stars b{transform:none}
  .x-todo .td-win.td-show .td-stars b{animation:none}
}
`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  const DATA = [
    { name: 'Reply to emails', time: '9:00 AM' },
    { name: 'Prepare presentation', time: '11:30 AM' },
    { name: 'Team stand-up', time: '1:00 PM' },
    { name: 'Review report', time: '3:30 PM' }
  ];
  // a page can set window.TODO_TASKS before this script to list its own tasks
  const TASKS = Array.isArray(window.TODO_TASKS) && window.TODO_TASKS.length ? window.TODO_TASKS : DATA;
  // and window.TODO_CLEAR = { src, start, seconds } to play a clip once the last one is struck
  const CLEAR = window.TODO_CLEAR && window.TODO_CLEAR.src ? window.TODO_CLEAR : null;
  const WIN = window.TODO_WIN || { title: 'Tasks Completed', line: 'Aura +100', col: '#ff5470' };
  const CONFETTI = ['#ff5470', '#ffa63a', '#9ee34a', '#b58cff'];

  const CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.4 8.6l3 3 6.2-7.2"/></svg>';
  const CLOCK = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.6"/></svg>';
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.4l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.42l-5.88 3.09 1.12-6.55L2.48 9.32l6.58-.96z"/></svg>';
  const esc = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // the blade's own marks, for the back of the win card
  const SLASHES = (function () {
    const lens = (x1, y1, x2, y2, w) => {
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len * w, ny = dx / len * w, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return 'M' + x1 + ' ' + y1 + 'Q' + (mx + nx) + ' ' + (my + ny) + ' ' + x2 + ' ' + y2 +
        'Q' + (mx - nx) + ' ' + (my - ny) + ' ' + x1 + ' ' + y1 + 'Z';
    };
    const cuts = [[-40, 74, 440, 6, 17, .2], [-30, 168, 440, 92, 11, .13], [-20, 250, 430, 182, 22, .17],
      [46, -30, 168, 290, 13, .12], [286, -30, 408, 290, 9, .11], [-30, 214, 250, 290, 8, .1]];
    const drops = [[60, 96], [124, 44], [198, 78], [272, 132], [92, 184], [334, 196], [226, 220], [156, 124], [376, 66], [30, 214]];
    let g = '';
    for (const c of cuts) g += '<path d="' + lens(c[0], c[1], c[2], c[3], c[4]) + '" fill="#fffdf5" fill-opacity="' + c[5] + '"/>';
    for (let i = 0; i < drops.length; i++) {
      g += '<circle cx="' + drops[i][0] + '" cy="' + drops[i][1] + '" r="' + (2.4 + (i % 3) * 2.4) +
        '" fill="#fffdf5" fill-opacity="' + (0.09 + (i % 4) * 0.035).toFixed(3) + '"/>';
    }
    return '<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + g + '</svg>';
  })();

  window.EXPERIMENTS.push({
    id: 'todo', name: 'Strike to Complete', source: 'Fruit Ninja',
    hint: 'Swipe a line through a task to finish it.',
    mount(stage) {
      const R = window.REDUCED;
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      const timers = new Set();
      const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };

      const root = document.createElement('div');
      root.className = 'x-todo';
      const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

      let confetti = '';
      for (let i = 0; i < 20; i++) {
        const r = (a, b) => (a + Math.random() * (b - a)).toFixed(2);
        confetti += '<i style="--x:' + r(2, 96) + '%;--c:' + CONFETTI[i % CONFETTI.length] +
          ';--dur:' + r(1.5, 2.6) + 's;--delay:' + r(0, .7) + 's;--fall:' + r(320, 500) + 'px;--spin:' + r(240, 900) + 'deg"></i>';
      }

      root.innerHTML =
        '<div class="td-head"><h2>My Tasks</h2><p>' + esc(today) + '</p></div>' +
        '<ul class="td-list">' + TASKS.map(t =>
          '<li class="td-row">' +
            '<button class="td-box" type="button" aria-pressed="false" aria-label="Complete ' + esc(t.name) + '">' + CHECK + '</button>' +
            '<div class="td-main">' +
              '<span class="td-name">' + esc(t.name) + '<i class="td-strike"></i></span>' +
              (t.time ? '<p class="td-meta">' + CLOCK + esc(t.time) + '</p>' : '') +
            '</div>' +
          '</li>').join('') +
        '</ul>' +
        '<canvas class="td-blade"></canvas>' +
        '<div class="td-win"><div class="td-confetti" aria-hidden="true">' + confetti + '</div>' +
          '<div class="td-card" style="--win:' + (WIN.col || '#ff5470') + '">' +
            '<div class="td-slashes" aria-hidden="true">' + SLASHES + '</div>' +
            '<div class="td-stars" aria-hidden="true"><b style="--i:0">' + STAR + '</b><b style="--i:1">' + STAR + '</b><b style="--i:2">' + STAR + '</b></div>' +
            '<strong>' + esc(WIN.title) + '</strong><span class="td-aura">' + esc(WIN.line) + '</span>' +
          '</div>' +
        '</div>';
      stage.appendChild(root);

      const rows = [].slice.call(root.querySelectorAll('.td-row')).map((el, i) => ({
        el, done: false, rect: null, lo: 0, hi: 0, live: false, p1: null, p2: null
      }));
      const win = root.querySelector('.td-win');
      const canvas = root.querySelector('.td-blade');
      const ctx = canvas.getContext('2d');

      let W = 0, HH = 0, dpr = 1;
      function sizeCanvas() {
        W = stage.clientWidth || 360; HH = stage.clientHeight || 520;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(HH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      sizeCanvas();

      /* the clip that plays once the list is clear */
      let clip = null;
      function stopClip() {
        if (!clip) return;
        const a = clip; clip = null;
        const fade = setInterval(() => { try { a.volume = Math.max(0, a.volume - 0.1); } catch (e) {} }, 40);
        setTimeout(() => { clearInterval(fade); a.pause(); }, 400);
      }
      function playClip() {
        if (!CLEAR || !(window.LAB_SFX && LAB_SFX.isOn && LAB_SFX.isOn())) return;
        try {
          const a = new Audio(CLEAR.src);
          a.volume = 0.75; a.currentTime = CLEAR.start || 0;
          a.play().then(() => {
            clip = a;
            later(stopClip, (CLEAR.seconds || 5) * 1000);
          }).catch(() => {});
        } catch (e) {}
      }

      /* striking a task */
      function setDone(r, on, quiet) {
        if (r.done === on) return;
        r.done = on;
        r.el.classList.toggle('td-done', on);
        r.el.querySelector('.td-box').setAttribute('aria-pressed', on ? 'true' : 'false');
        if (!quiet) sfx(on ? 'slice' : 'tick');
        if (on && rows.every(k => k.done)) {
          playClip();
          later(() => { win.classList.add('td-show'); }, R ? 0 : 420);
        } else {
          win.classList.remove('td-show');
          if (!on) stopClip();
        }
      }

      /* the swipe: a stroke that crosses most of a row's width strikes it out */
      const trail = [];
      const TRAIL_MS = 150;
      let down = false, pid = null, raf = 0, moved = 0, startPt = null, ghost = null, idle = 0, touched = false;

      function refreshRects() {
        const sr = stage.getBoundingClientRect();
        for (const r of rows) {
          const b = r.el.getBoundingClientRect();
          r.rect = { x: b.left - sr.left, y: b.top - sr.top, w: b.width, h: b.height };
          r.live = false;
        }
        return sr;
      }
      function mark(r, p) {
        if (!r.live) { r.live = true; r.lo = p.x; r.hi = p.x; r.p1 = p; r.p2 = p; return; }
        if (p.x < r.lo) r.lo = p.x;
        if (p.x > r.hi) r.hi = p.x;
        r.p2 = p;
      }
      function testRows(p) {
        for (const r of rows) {
          if (r.done || !r.rect) continue;
          const inside = p.x >= r.rect.x - 6 && p.x <= r.rect.x + r.rect.w + 6 && p.y >= r.rect.y && p.y <= r.rect.y + r.rect.h;
          if (!inside) { r.live = false; continue; }
          mark(r, p);
          if (r.hi - r.lo >= r.rect.w * 0.58) setDone(r, true);
        }
      }

      function localPt(e, sr) { return { x: e.clientX - sr.left, y: e.clientY - sr.top, t: performance.now() }; }
      let sr = null;

      function onDown(e) {
        touched = true; ghost = null;
        if (e.target.closest && e.target.closest('.td-box')) return;   // the checkbox is a plain button
        if (e.button > 0) return;
        down = true; pid = e.pointerId; moved = 0;
        try { stage.setPointerCapture(pid); } catch (err) {}
        sr = refreshRects();
        startPt = localPt(e, sr);
        trail.length = 0; trail.push(startPt);
        testRows(startPt);
        kick();
      }
      function onMove(e) {
        if (!down || (pid !== null && e.pointerId !== pid)) return;
        if (!sr) sr = refreshRects();
        const pts = (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]);
        for (const ev of (pts.length ? pts : [e])) {
          const p = localPt(ev, sr);
          const last = trail[trail.length - 1];
          if (last) moved += Math.hypot(p.x - last.x, p.y - last.y);
          trail.push(p);
          testRows(p);
        }
        if (trail.length > 90) trail.splice(0, trail.length - 90);
        kick();
      }
      function onUp(e) {
        if (!down) return;
        down = false;
        try { stage.releasePointerCapture(pid); } catch (err) {}
        pid = null;
        for (const r of rows) r.live = false;
      }

      // the checkbox stays a checkbox: click or keyboard, and it can be undone
      root.addEventListener('click', (e) => {
        const b = e.target.closest && e.target.closest('.td-box');
        if (!b) return;
        const r = rows.find(k => k.el.contains(b));
        if (!r) return;
        setDone(r, !r.done);
      });

      /* trail, and the ghost stroke that shows the gesture until the first swipe */
      function drawTrail(now) {
        ctx.clearRect(0, 0, W, HH);
        const pts = [];
        for (const p of trail) if (now - p.t <= TRAIL_MS) pts.push(p);
        if (pts.length > 1) {
          for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1], b = pts[i];
            const age = (now - b.t) / TRAIL_MS;
            const k = Math.max(0, 1 - age);
            ctx.strokeStyle = 'rgba(20,20,23,' + (0.3 * k).toFixed(3) + ')';
            ctx.lineWidth = 1 + 3.4 * k;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (ghost) {
          const k = (now - ghost.t0) / ghost.dur;
          if (k >= 1) { ghost = null; }
          else {
            const head = ghost.x1 + (ghost.x2 - ghost.x1) * Math.min(1, k * 1.25);
            const tail = ghost.x1 + (ghost.x2 - ghost.x1) * Math.max(0, (k - 0.3) * 1.6);
            const fade = k < 0.75 ? 1 : (1 - (k - 0.75) / 0.25);
            const g = ctx.createLinearGradient(tail, 0, head, 0);
            g.addColorStop(0, 'rgba(20,20,23,0)');
            g.addColorStop(1, 'rgba(20,20,23,' + (0.22 * fade).toFixed(3) + ')');
            ctx.strokeStyle = g; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(tail, ghost.y); ctx.lineTo(head, ghost.y); ctx.stroke();
          }
        }
        return pts.length > 1 || !!ghost || down;
      }
      function frame(now) {
        raf = 0;
        if (drawTrail(now)) raf = requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, W, HH);
      }
      function kick() { if (!raf) raf = requestAnimationFrame(frame); }

      if (!R) {
        idle = setInterval(() => {
          if (touched || down || ghost) return;
          const r = rows.find(k => !k.done);
          if (!r) return;
          refreshRects();
          ghost = { t0: performance.now(), dur: 900, y: r.rect.y + r.rect.h / 2, x1: r.rect.x - 4, x2: r.rect.x + r.rect.w + 4 };
          kick();
        }, 3600);
      }

      stage.addEventListener('pointerdown', onDown);
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerup', onUp);
      stage.addEventListener('pointercancel', onUp);

      let ro = null;
      if (window.ResizeObserver) {
        ro = new ResizeObserver(() => { sizeCanvas(); sr = null; });
        ro.observe(stage);
      }

      return {
        destroy() {
          if (raf) cancelAnimationFrame(raf); raf = 0;
          clearInterval(idle);
          timers.forEach(clearTimeout); timers.clear();
          stopClip();
          if (ro) ro.disconnect();
          stage.removeEventListener('pointerdown', onDown);
          stage.removeEventListener('pointermove', onMove);
          stage.removeEventListener('pointerup', onUp);
          stage.removeEventListener('pointercancel', onUp);
        }
      };
    }
  });
})();
