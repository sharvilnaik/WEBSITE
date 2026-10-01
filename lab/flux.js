(function () {
  const css = `
.x-flux{font-family:var(--body);color:#ececf0}
.x-flux .fx-wrap{position:absolute;left:0;top:0;right:0;bottom:0;display:grid;grid-template-columns:156px minmax(0,1fr);grid-template-rows:1fr repeat(5,auto) 1fr;column-gap:32px;padding:0 34px;box-sizing:border-box}
.x-flux .fx-unit{grid-column:1;grid-row:1/-1;align-self:center;position:relative;width:156px;height:213px}
.x-flux .fx-unit svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;display:block}
.x-flux .fx-unit .fx-l,.x-flux .fx-unit .fx-g{opacity:0}
.x-flux .fx-soft .fx-l,.x-flux .fx-soft .fx-g{transition:opacity .7s ease}
.x-flux .fx-flash{position:absolute;left:50%;top:48%;width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:50%;pointer-events:none;opacity:0;
  background:radial-gradient(closest-side,#fff 0,rgba(255,250,235,.95) 18%,rgba(255,214,140,.45) 45%,rgba(255,170,60,0) 100%)}
.x-flux .fx-wash{position:absolute;left:0;top:0;right:0;bottom:0;background:#fff4de;opacity:0;pointer-events:none}
.x-flux .fx-title{grid-column:2;grid-row:2;font-size:17px;line-height:1.25;font-weight:500;letter-spacing:-.005em}
.x-flux .fx-status{grid-column:2;grid-row:3;margin-top:4px;display:flex;align-items:center;flex-wrap:wrap;gap:6px;min-height:20px;font-size:13px;line-height:20px;color:#8d8d97}
.x-flux .fx-status svg{width:15px;height:15px;flex:none;color:#86e0a0}
.x-flux[data-state=done] .fx-status{color:#ececf0}
.x-flux[data-state=error] .fx-status{color:#ff8a7a}
.x-flux .fx-bar{grid-column:2;grid-row:4;margin-top:20px;height:6px;border-radius:99px;background:#2b2b32;overflow:hidden}
.x-flux .fx-bar i{display:block;height:100%;border-radius:99px;transform-origin:0 50%;transform:scaleX(0);
  background:linear-gradient(90deg,#d9822b,#ffc863 70%,#fff0c8);transition:background .3s ease}
.x-flux[data-state=error] .fx-bar i{background:#6b3a36}
.x-flux[data-state=done] .fx-bar i{background:linear-gradient(90deg,#d9822b,#ffc863 60%,#fff6dc)}
.x-flux .fx-meta{grid-column:2;grid-row:5;margin-top:9px;display:flex;justify-content:space-between;gap:12px;font-size:12px;line-height:16px;color:#8d8d97;font-variant-numeric:tabular-nums;white-space:nowrap}
.x-flux .fx-power b{font-weight:500;color:#ececf0}
.x-flux[data-state=done] .fx-power b{color:#ffc863}
.x-flux .fx-actions{grid-column:2;grid-row:6;margin-top:22px;display:flex;align-items:center;gap:16px}
.x-flux .fx-btn{font:500 13px/1 var(--body);color:#ececf0;background:transparent;border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:10px 18px;cursor:pointer;
  min-width:112px;transition:border-color .2s ease,transform .15s ease,opacity .2s ease}
.x-flux .fx-btn:hover{border-color:rgba(255,255,255,.6)}
.x-flux .fx-btn:active{transform:scale(.96)}
.x-flux .fx-btn:disabled{opacity:.45;cursor:default;transform:none}
.x-flux .fx-btn.is-done,.x-flux .fx-btn.is-done:disabled{opacity:1;display:inline-flex;align-items:center;gap:7px;color:#8ce0a8;border-color:rgba(140,224,168,.45);cursor:default}
.x-flux .fx-btn.is-done svg{width:15px;height:15px;flex:none}
.x-flux .fx-link{font:400 13px/1 var(--body);color:#8d8d97;background:none;border:0;padding:4px 0;cursor:pointer;text-decoration:underline;text-decoration-color:rgba(141,141,151,.45);text-underline-offset:3px}
.x-flux .fx-link:hover{color:#ececf0}
.x-flux .fx-link[hidden]{display:inline-block;visibility:hidden}
.x-flux .fx-retry{color:#ececf0;font-weight:500}
.x-flux :is(.fx-btn,.fx-link):focus-visible{outline:2px solid #8b7dff;outline-offset:3px}
.x-flux .fx-wrap.fx-narrow{grid-template-columns:92px minmax(0,1fr);column-gap:16px;padding:0 22px}
.x-flux .fx-narrow .fx-unit{grid-row:2/4;width:92px;height:126px}
.x-flux .fx-narrow .fx-title{align-self:end;font-size:16px}
.x-flux .fx-narrow .fx-status{align-self:start}
.x-flux .fx-narrow :is(.fx-bar,.fx-meta,.fx-actions){grid-column:1/-1}
.x-flux .fx-narrow .fx-bar{margin-top:24px}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  let uid = 0;
  const TOTAL = 1284, N = 5;
  const fmt = (n) => n.toLocaleString('en-US');
  const CHECK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.6" stroke-width="1.5"/><path d="M5.2 8.3l2 2 3.7-4.3"/></svg>';

  function drawUnit(k) {
    const C = [85, 110], ENDS = [[34, 42], [136, 42], [85, 180]];
    const g = 'fxglow' + k, b = 'fxbody' + k, h = 'fxhaz' + k;
    let s = '<svg viewBox="0 0 170 232" aria-hidden="true"><defs>' +
      '<linearGradient id="' + b + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c4c55"/><stop offset="1" stop-color="#33333a"/></linearGradient>' +
      '<radialGradient id="' + g + '"><stop offset="0" stop-color="#fff6dc" stop-opacity=".95"/><stop offset=".35" stop-color="#ffc863" stop-opacity=".5"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient>' +
      '<pattern id="' + h + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#c9a13a"/><rect width="3" height="6" fill="#26262b"/></pattern>' +
      '</defs>' +
      '<rect x="2" y="2" width="166" height="228" rx="11" fill="url(#' + b + ')" stroke="#5c5c66" stroke-width="1.5"/>' +
      '<rect x="10" y="10" width="150" height="190" rx="7" fill="#26262c" stroke="#1c1c21" stroke-width="1"/>' +
      '<rect x="17" y="17" width="136" height="176" rx="4" fill="#0e0e12" stroke="#3e3e46" stroke-width="1.5"/>';
    for (const E of ENDS) {
      s += '<line x1="' + E[0] + '" y1="' + E[1] + '" x2="' + C[0] + '" y2="' + C[1] + '" stroke="#1d1d22" stroke-width="15" stroke-linecap="round"/>' +
        '<line x1="' + E[0] + '" y1="' + E[1] + '" x2="' + C[0] + '" y2="' + C[1] + '" stroke="#2f2f37" stroke-width="10" stroke-linecap="round"/>' +
        '<line x1="' + E[0] + '" y1="' + E[1] + '" x2="' + C[0] + '" y2="' + C[1] + '" stroke="#3b3b44" stroke-width="1.2" stroke-linecap="round" transform="translate(-2 -1.5)" opacity=".7"/>';
    }
    for (const E of ENDS) {
      s += '<circle cx="' + E[0] + '" cy="' + E[1] + '" r="9" fill="#5d5d67" stroke="#2a2a30" stroke-width="1.5"/><circle cx="' + E[0] + '" cy="' + E[1] + '" r="3.6" fill="#24242a"/>';
    }
    ENDS.forEach((E, a) => {
      for (let i = 0; i < N; i++) {
        const t = 0.2 + i * 0.13;
        const x = (E[0] + (C[0] - E[0]) * t).toFixed(1), y = (E[1] + (C[1] - E[1]) * t).toFixed(1);
        s += '<circle class="fx-g" data-a="' + a + '" data-i="' + i + '" cx="' + x + '" cy="' + y + '" r="11" fill="url(#' + g + ')"/>' +
          '<circle cx="' + x + '" cy="' + y + '" r="3.3" fill="#3a3027"/>' +
          '<circle class="fx-l" data-a="' + a + '" data-i="' + i + '" cx="' + x + '" cy="' + y + '" r="3.3" fill="#fff5d8"/>';
      }
    });
    s += '<circle class="fx-g" data-a="c" cx="' + C[0] + '" cy="' + C[1] + '" r="34" fill="url(#' + g + ')"/>' +
      '<circle cx="' + C[0] + '" cy="' + C[1] + '" r="13" fill="#3a3a42" stroke="#686872" stroke-width="2"/>' +
      '<circle cx="' + C[0] + '" cy="' + C[1] + '" r="7" fill="#211d18"/>' +
      '<circle class="fx-l" data-a="c" cx="' + C[0] + '" cy="' + C[1] + '" r="7" fill="#fffaf0"/>' +
      '<path d="M22 22h40L22 96z" fill="#fff" opacity=".035"/>' +
      '<rect x="48" y="207" width="74" height="12" rx="2" fill="url(#' + h + ')" stroke="#1f1f24"/>' +
      '<circle cx="22" cy="213" r="3" fill="#62626c"/><circle cx="148" cy="213" r="3" fill="#62626c"/>' +
      '<circle cx="14" cy="14" r="1.6" fill="#5a5a63"/><circle cx="156" cy="14" r="1.6" fill="#5a5a63"/>' +
      '</svg>';
    return s;
  }

  window.EXPERIMENTS.push({
    id: 'flux', name: 'Sync Progress', source: 'Back to the Future',
    hint: 'Start a backup and watch the power climb. Pause it, or break it.',
    mount(stage) {
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      let hum = null;
      const endHum = () => { if (hum) { hum.stop(); hum = null; } };
      const R = !!window.REDUCED;
      const k = ++uid;
      const timers = new Set();
      const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
      const anims = [];

      const wrap = document.createElement('div'); wrap.className = 'fx-wrap';
      wrap.innerHTML =
        '<div class="fx-unit">' + drawUnit(k) + '<div class="fx-flash"></div></div>' +
        '<div class="fx-title"></div>' +
        '<div class="fx-status" role="status" aria-live="polite"></div>' +
        '<div class="fx-bar" role="progressbar" aria-label="Backup progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
        '<div class="fx-meta"><span class="fx-items"></span><span class="fx-power"></span></div>' +
        '<div class="fx-actions"><button class="fx-btn fx-main" type="button"></button><button class="fx-link fx-err" type="button">Simulate error</button></div>';
      const wash = document.createElement('div'); wash.className = 'fx-wash';
      stage.appendChild(wrap); stage.appendChild(wash);

      const $ = (q) => wrap.querySelector(q);
      const svg = $('svg'), flash = $('.fx-flash'), title = $('.fx-title'), status = $('.fx-status'),
        bar = $('.fx-bar'), fill = $('.fx-bar i'), items = $('.fx-items'), power = $('.fx-power'),
        main = $('.fx-main'), errBtn = $('.fx-err');

      const lit = [[], [], []], glow = [[], [], []];
      svg.querySelectorAll('.fx-l').forEach((el) => { if (el.dataset.a === 'c') lit.c = el; else lit[+el.dataset.a][+el.dataset.i] = el; });
      svg.querySelectorAll('.fx-g').forEach((el) => { if (el.dataset.a === 'c') glow.c = el; else glow[+el.dataset.a][+el.dataset.i] = el; });
      function setBulb(a, i, v) { lit[a][i].style.opacity = v.toFixed(3); glow[a][i].style.opacity = (v * 0.85).toFixed(3); }
      function setCore(v) { lit.c.style.opacity = v.toFixed(3); glow.c.style.opacity = (v * 0.9).toFixed(3); }
      function allLights(v, core) { for (let a = 0; a < 3; a++) for (let i = 0; i < N; i++) setBulb(a, i, v); setCore(core == null ? v : core); }
      const soft = (on) => svg.classList.toggle('fx-soft', on);

      let state = 'idle', p = 0, phase = 0, rate = 0.15, nextRate = 0, raf = 0, lastT = 0, errAt = 0, shown = -1;

      function renderNums() {
        const n = p >= 1 ? TOTAL : Math.floor(p * TOTAL);
        const pw = p >= 1 ? '1.21' : Math.min(1.2, 1.21 * Math.pow(p, 1.35)).toFixed(2);
        items.textContent = fmt(n) + ' of ' + fmt(TOTAL) + ' items';
        power.innerHTML = 'Power <b>' + pw + '</b> gigawatts';
        fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
        const pc = Math.floor(p * 100);
        bar.setAttribute('aria-valuenow', pc);
        if (state === 'run' && pc !== shown) { shown = pc; status.textContent = 'Uploading, ' + pc + '%'; }
      }

      function renderLights() {
        if (R) { allLights(0.2 + 0.6 * p, 0.3 + 0.6 * p); return; }
        const L = N + 2, hd = phase % L, base = 0.05 + 0.12 * p;
        for (let i = 0; i < N; i++) {
          const d = hd - i;
          const v = d >= 0 ? Math.max(0, 1 - d * 0.65) : Math.max(0, 1 + d * 3);
          for (let a = 0; a < 3; a++) setBulb(a, i, Math.max(base, v));
        }
        const cv = Math.max(0, 1 - Math.abs(hd - (N + 0.35)) * 0.85);
        setCore(Math.max(0.15 + 0.35 * p, cv));
      }

      function ui() {
        stage.dataset.state = state;
        const running = state === 'run' || state === 'pause';
        title.textContent = state === 'done' ? 'All ' + fmt(TOTAL) + ' photos backed up' : state === 'idle' ? fmt(TOTAL) + ' photos waiting' : 'Backing up ' + fmt(TOTAL) + ' photos';
        main.disabled = state === 'flash' || state === 'done';
        main.classList.toggle('is-done', state === 'done');
        if (state === 'done') main.innerHTML = CHECK + '<span>Backed up</span>';
        else main.textContent = state === 'run' || state === 'flash' ? 'Pause' : state === 'pause' ? 'Resume' : state === 'error' ? 'Cancel' : 'Back up now';
        if (state === 'idle') status.textContent = 'Last backup 3 days ago';
        else if (state === 'pause') status.textContent = 'Paused at ' + Math.floor(p * 100) + '%';
        else if (state === 'done') status.innerHTML = CHECK + '<span>Backed up just now</span>';
        else if (state === 'error') {
          status.innerHTML = '<span>Connection lost</span><span aria-hidden="true">·</span><button class="fx-link fx-retry" type="button">Retry</button>';
          status.querySelector('.fx-retry').addEventListener('click', () => { start(); main.focus({ preventScroll: true }); });
        } else if (state === 'run') { shown = -1; }
        const hadErrFocus = document.activeElement === errBtn;
        errBtn.hidden = !running;
        if (hadErrFocus && !running) { const r = status.querySelector('.fx-retry'); (r || main).focus({ preventScroll: true }); }
        renderNums();
      }

      function kick() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); } }
      function frame(now) {
        raf = 0;
        const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
        if (state === 'run') {
          if (now > nextRate) {
            const r = Math.random();
            rate = r < 0.16 ? 0.004 : r < 0.42 ? 0.07 : r < 0.84 ? 0.16 : 0.34;
            nextRate = now + 280 + Math.random() * 700;
          }
          p = Math.min(1, p + rate * dt * (p < 0.04 ? 3 : 1));
          phase += dt * (2.2 + 8.5 * p);
          if (hum) hum.set(p);
          renderLights(); renderNums();
          if (p >= 1) { finish(); return; }
          raf = requestAnimationFrame(frame);
        } else if (state === 'error') {
          const q = (now - errAt) / 1100;
          if (q >= 1) { soft(true); allLights(0, 0); return; }
          for (let a = 0; a < 3; a++) for (let i = 0; i < N; i++) setBulb(a, i, Math.random() < (1 - q) * 0.55 ? (0.3 + Math.random() * 0.7) * (1 - q) : 0);
          setCore(Math.random() < (1 - q) * 0.5 ? 1 - q : 0.04);
          raf = requestAnimationFrame(frame);
        }
      }

      function start() {
        if (state === 'done' || state === 'idle' && p >= 1) p = 0;
        soft(false);
        state = 'run'; nextRate = 0; ui(); kick();
        sfx('click');
        if (!hum && window.LAB_SFX) hum = LAB_SFX.hum({ from: 70, to: 900, vol: 0.06 });
      }
      function finish() {
        state = 'flash'; p = 1; ui();
        endHum(); sfx('zap');
        allLights(1, 1);
        if (!R) {
          anims.push(flash.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)', offset: 0.22 }, { opacity: 0, transform: 'scale(1.35)' }], { duration: 950, easing: 'cubic-bezier(.2,.7,.3,1)' }));
          anims.push(wash.animate([{ opacity: 0 }, { opacity: 0.22, offset: 0.15 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' }));
        }
        later(() => { soft(true); allLights(0.3, 0.55); }, R ? 0 : 260);
        later(() => { state = 'done'; ui(); }, R ? 150 : 760);
      }
      function fail() {
        if (state !== 'run' && state !== 'pause') return;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        state = 'error'; errAt = performance.now(); soft(false); ui();
        endHum(); sfx('fizzle');
        if (R) { soft(true); allLights(0, 0); } else kick();
      }

      function onMain() {
        if (state === 'idle' || state === 'done') start();
        else if (state === 'run') { endHum(); sfx('click'); state = 'pause'; if (raf) { cancelAnimationFrame(raf); raf = 0; } ui(); }
        else if (state === 'pause') start();
        else if (state === 'error') { p = 0; state = 'idle'; soft(true); allLights(0, 0); ui(); }
      }
      main.addEventListener('click', onMain);
      errBtn.addEventListener('click', fail);

      let ro = null;
      const fit = () => wrap.classList.toggle('fx-narrow', (stage.clientWidth || 600) < 470);
      fit();
      if (window.ResizeObserver) { ro = new ResizeObserver(fit); ro.observe(stage); }

      allLights(0, 0.06);
      ui();

      // idle: the core glows in and out slowly, so the unit looks powered up and waiting
      let idleT = 0;
      if (!R) idleT = setInterval(() => {
        if (state !== 'idle' && state !== 'done') return;
        if (document.hidden) return;
        const v = 0.05 + 0.055 * (1 + Math.sin(performance.now() / 900)) / 2;
        setCore(state === 'done' ? v + 0.18 : v);
      }, 90);

      return {
        destroy() {
          if (raf) cancelAnimationFrame(raf); raf = 0;
          timers.forEach(clearTimeout); timers.clear();
          anims.forEach((a) => a.cancel());
          clearInterval(idleT);
          endHum();
          if (ro) ro.disconnect();
          main.removeEventListener('click', onMain);
          errBtn.removeEventListener('click', fail);
          delete stage.dataset.state;
        }
      };
    }
  });
})();
