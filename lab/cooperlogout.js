(function () {
  const css = `
/* Log Out, after DB Cooper — the session as a 1971 ticket stub, typed not set:
   the card is paper on a night sky, so it already belongs to the scene it falls into. */
.x-cooperlogout {
  --type: "Courier Prime", "Courier New", monospace;
  --stock: #e4d5b0;    /* ticket card */
  --ink71: #1a1a18;
  --faded: #6b5b3c;    /* the printed labels, not the typed answers */
  --stamp: #c8102e;    /* the red on the stub */
  --night: #080c14;
  background: var(--night);
  font-family: var(--body);
  color: var(--ink71);
}
.x-cooperlogout .cl-card{position:absolute;left:50%;top:50%;width:300px;box-sizing:border-box;padding:18px;border-radius:3px;z-index:3;
  background:var(--stock);border:0;border-top:5px solid var(--stamp);
  box-shadow:0 18px 40px rgba(0,0,0,.55),0 1px 0 rgba(255,255,255,.35) inset;
  transform:translate(-50%,-50%)}
.x-cooperlogout .cl-card.cl-gone{visibility:hidden}
.x-cooperlogout .cl-top{display:grid;grid-template-columns:46px minmax(0,1fr);column-gap:13px;align-items:center}
/* the stub, not an avatar */
.x-cooperlogout .cl-av{width:46px;height:46px;border-radius:2px;display:grid;place-items:center;background:var(--stamp);color:#f6ead2;font:700 15px/1 var(--type);letter-spacing:.06em}
.x-cooperlogout .cl-id{display:grid;min-width:0;line-height:1.35}
.x-cooperlogout .cl-id b{font:700 16px/1.2 var(--type);letter-spacing:.03em;text-transform:uppercase;color:var(--ink71)}
.x-cooperlogout .cl-id span{font:400 12px/1.3 var(--type);color:var(--faded);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* the perforation */
.x-cooperlogout .cl-dev{display:flex;align-items:center;gap:8px;margin:16px 0 0;padding:13px 0 0;border-top:1px dashed rgba(26,26,24,.4);font:400 10px/1.4 var(--type);letter-spacing:.11em;text-transform:uppercase;color:var(--faded)}
.x-cooperlogout .cl-dot{width:7px;height:7px;border-radius:50%;background:#1f7a4c;box-shadow:0 0 0 3px rgba(31,122,76,.16)}
.x-cooperlogout .cl-row{position:relative;height:38px;margin-top:15px}
.x-cooperlogout .cl-row > *{position:absolute;left:0;top:0;right:0;height:38px;transition:opacity .2s ease,transform .3s cubic-bezier(.2,1.2,.4,1)}
.x-cooperlogout .cl-row .cl-off{opacity:0;transform:translateY(6px);pointer-events:none;visibility:hidden}
.x-cooperlogout .cl-btn{font:700 12px/1 var(--type);letter-spacing:.09em;text-transform:uppercase;color:var(--ink71);background:transparent;border:1px solid var(--ink71);border-radius:2px;padding:0 16px;height:38px;cursor:pointer;
  transition:border-color .2s ease,background .2s ease,color .2s ease,transform .15s ease}
.x-cooperlogout .cl-btn:hover{background:var(--ink71);color:var(--stock)}
.x-cooperlogout .cl-btn:active{transform:scale(.96)}
.x-cooperlogout .cl-btn:focus-visible{outline:2px solid var(--stamp);outline-offset:3px}
.x-cooperlogout .cl-out{width:100%}
.x-cooperlogout .cl-confirm{display:flex;align-items:center;gap:8px}
.x-cooperlogout .cl-confirm span{flex:1;font:700 14px/1 var(--type);letter-spacing:.03em;padding-left:2px;color:var(--ink71)}
.x-cooperlogout .cl-yes{background:var(--stamp);color:#f6ead2;border-color:var(--stamp)}
.x-cooperlogout .cl-yes:focus-visible{outline-color:var(--ink71)}
.x-cooperlogout .cl-yes:hover{background:#a50d24;color:#f6ead2;border-color:#a50d24}
.x-cooperlogout .cl-scene{position:absolute;left:0;top:0;right:0;bottom:0;z-index:1;opacity:0;visibility:hidden;background:#0c1320}
.x-cooperlogout .cl-scene.cl-on{visibility:visible}
.x-cooperlogout .cl-scene svg,.x-cooperlogout .cl-scene canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.x-cooperlogout .cl-foot{position:absolute;left:16px;right:16px;bottom:20px;display:flex;flex-direction:column;align-items:center;gap:12px;outline:none}
/* the line types itself out over the night, on a typewriter */
.x-cooperlogout .cl-type{min-height:20px;font:400 14px/20px var(--type);color:#dfe5ee;text-align:center;letter-spacing:.02em}
.x-cooperlogout .cl-caret{display:inline-block;width:7px;height:2px;margin-left:3px;vertical-align:1px;background:#dfe5ee;animation:cl-blink 1s steps(1) infinite}
@keyframes cl-blink{50%{opacity:0}}
/* this one sits on the sky, not on the ticket */
.x-cooperlogout .cl-back{background:rgba(12,19,32,.55);color:#e4d5b0;border-color:rgba(228,213,176,.5);opacity:0;transform:translateY(6px);pointer-events:none;visibility:hidden;transition:opacity .35s ease,transform .45s cubic-bezier(.2,1.3,.4,1),border-color .2s ease,background .2s ease,color .2s ease}
.x-cooperlogout .cl-back:hover{background:#e4d5b0;color:#0c1320;border-color:#e4d5b0}
.x-cooperlogout .cl-back:focus-visible{outline:2px solid #e4d5b0;outline-offset:3px}
.x-cooperlogout .cl-back.cl-show{opacity:1;transform:none;pointer-events:auto;visibility:visible}
.x-cooperlogout .cl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const NS = 'http://www.w3.org/2000/svg';
  const LINE = 'Session ended. Whereabouts unknown.';
  let uid = 0;
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeBack = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  function ridge(W, base, amp, treeH, step, seed) {
    const r = rng(seed), ph = r() * 6;
    let d = 'M-20,' + (base + 200) + ' L-20,' + base.toFixed(1);
    let x = -20;
    while (x < W + 20) {
      const yb = base + Math.sin(x * 0.011 + ph) * amp + Math.sin(x * 0.029 + ph * 2) * amp * 0.45;
      const s = step * (0.65 + r() * 0.7), th = treeH * (0.45 + r() * 0.9);
      d += ' L' + x.toFixed(1) + ',' + yb.toFixed(1) + ' L' + (x + s * 0.5).toFixed(1) + ',' + (yb - th).toFixed(1) + ' L' + (x + s).toFixed(1) + ',' + yb.toFixed(1);
      x += s;
    }
    return d + ' L' + (W + 20) + ',' + (base + 200) + ' Z';
  }

  const JET =
    '<path d="M-4,-30 L300,-30 L300,50 L74,44 Q24,36 0,14 Z" fill="#263041"/>' +
    '<path d="M0,14 Q24,36 74,44 L300,50" fill="none" stroke="#3d4a5e" stroke-width="1.2"/>' +
    '<path d="M36,2 L-26,-10 L-20,-1 L46,13 Z" fill="#1d2634" stroke="#34404f" stroke-width=".8"/>' +
    '<rect x="100" y="2" width="78" height="22" rx="11" fill="#1d2532" stroke="#3a475a" stroke-width="1"/>' +
    '<ellipse cx="102" cy="13" rx="3.5" ry="9" fill="#0b0f16"/>' +
    '<g fill="#e3c889" opacity=".55"><rect x="200" y="26" width="5" height="4" rx="1"/><rect x="214" y="27" width="5" height="4" rx="1"/><rect x="228" y="27" width="5" height="4" rx="1"/><rect x="242" y="28" width="5" height="4" rx="1"/><rect x="256" y="28" width="5" height="4" rx="1"/><rect x="270" y="29" width="5" height="4" rx="1"/><rect x="284" y="29" width="5" height="4" rx="1"/></g>' +
    '<path d="M78,44 L106,46 L64,102 L40,100 Z" fill="#e8c77f" opacity=".1"/>' +
    '<path d="M78,44 L104,46 L62,100 L40,98 Z" fill="#171e29" stroke="#3d4a5e" stroke-width="1"/>' +
    '<g stroke="#56657b" stroke-width="1.1" stroke-linecap="round">' +
      [1, 2, 3, 4, 5, 6].map((i) => { const t = i / 7; return '<line x1="' + (78 - 38 * t).toFixed(1) + '" y1="' + (44 + 54 * t).toFixed(1) + '" x2="' + (104 - 42 * t).toFixed(1) + '" y2="' + (46 + 54 * t).toFixed(1) + '"/>'; }).join('') +
    '</g>' +
    '<path d="M80,36 L42,88" stroke="#5e6d83" stroke-width="1" fill="none"/><path d="M42,88 L40,98 M61,62 L58,72" stroke="#5e6d83" stroke-width="1"/>' +
    '<circle class="cl-beacon" cx="160" cy="47" r="2.2" fill="#ff5b4a"/>';

  const MAN =
    '<g class="cl-chute">' +
      '<path d="M-5,-22 L-20,-50 M-4,-22 L-7,-52 M4,-22 L7,-52 M5,-22 L20,-50" stroke="#cdc6b4" stroke-opacity=".55" stroke-width=".6" fill="none"/>' +
      '<path d="M-22,-50 Q-20,-70 0,-72 Q20,-70 22,-50 Q16,-47 11,-51 Q5.5,-46 0,-51 Q-5.5,-46 -11,-51 Q-16,-47 -22,-50 Z" fill="#cfc8b6"/>' +
      '<path d="M-11,-51 Q-9,-66 0,-72 M11,-51 Q9,-66 0,-72 M0,-51 L0,-72" stroke="#9e9786" stroke-width=".7" fill="none"/>' +
    '</g>' +
    '<g class="cl-body">' +
      '<path d="M-2.4,0 L-1.6,-9 M2.4,0 L1.6,-9" stroke="#070a0f" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M-4.6,-8 L-5.2,-19.5 Q0,-22.5 5.2,-19.5 L4.6,-8 Z" fill="#070a0f" stroke="#8fa0b6" stroke-width=".5" stroke-opacity=".7"/>' +
      '<path d="M-1.4,-20.6 L1.4,-20.6 L0,-15 Z" fill="#dfe4ea"/>' +
      '<path d="M-5,-19 L-7,-10 M5,-19 L7,-10" stroke="#070a0f" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="6" y="-10" width="6" height="4.5" rx=".8" fill="#4a3a2b"/>' +
      '<circle cx="0" cy="-24.5" r="3.3" fill="#070a0f" stroke="#8fa0b6" stroke-width=".5" stroke-opacity=".7"/>' +
    '</g>';

  window.EXPERIMENTS.push({
    id: 'cooperlogout', name: 'Log Out', source: 'DB Cooper',
    hint: 'Disappear like the goat when you log out.',
    mount(stage) {
      const sfx = (n, d) => window.LAB_SFX && LAB_SFX.play(n, d);
      const R = !!window.REDUCED;
      const k = ++uid;
      const timers = new Set();
      const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
      const anims = [];
      const run = (el, frames, opts) => { const a = el.animate(frames, opts); anims.push(a); return a; };

      const scene = document.createElement('div'); scene.className = 'cl-scene'; scene.setAttribute('aria-hidden', 'true');
      const svg = document.createElementNS(NS, 'svg');
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
      const foot = document.createElement('div'); foot.className = 'cl-foot'; foot.tabIndex = -1;
      foot.innerHTML = '<div class="cl-type" aria-hidden="true"></div><span class="cl-sr" role="status" aria-live="polite"></span><button class="cl-btn cl-back" type="button">Sign back in</button>';
      scene.appendChild(svg); scene.appendChild(canvas);
      const card = document.createElement('div'); card.className = 'cl-card'; card.setAttribute('role', 'group'); card.setAttribute('aria-label', 'Account');
      card.innerHTML =
        '<div class="cl-top"><span class="cl-av" aria-hidden="true">DC</span><div class="cl-id"><b>Dan Cooper</b><span>dan.cooper@example.com</span></div></div>' +
        '<div class="cl-dev"><i class="cl-dot" aria-hidden="true"></i>Signed in on this device</div>' +
        '<div class="cl-row"><button class="cl-btn cl-out" type="button">Log out</button>' +
        '<div class="cl-confirm cl-off"><span id="cl-q' + k + '">Jump?</span><button class="cl-btn cl-yes" type="button" aria-describedby="cl-q' + k + '">Yes</button><button class="cl-btn cl-stay" type="button">Stay</button></div></div>';
      stage.appendChild(scene); stage.appendChild(foot); stage.appendChild(card);
      foot.style.visibility = 'hidden'; foot.style.zIndex = 2;

      const outBtn = card.querySelector('.cl-out'), confirm = card.querySelector('.cl-confirm'),
        yesBtn = card.querySelector('.cl-yes'), stayBtn = card.querySelector('.cl-stay'),
        typeEl = foot.querySelector('.cl-type'), srEl = foot.querySelector('.cl-sr'), backBtn = foot.querySelector('.cl-back');

      let W = 600, H = 320, js = 1, jetG = null, manG = null, chuteG = null, bodyG = null, beacon = null;
      const drops = [];
      function build() {
        W = stage.clientWidth || 600; H = stage.clientHeight || 320;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        card.style.width = Math.min(300, W - 40) + 'px';
        js = W < 460 ? 0.74 : 1;
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.setAttribute('preserveAspectRatio', 'none');
        const sky = 'clsky' + k, haze = 'clhaze' + k;
        svg.innerHTML =
          '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060a12"/><stop offset=".6" stop-color="#1a2638"/><stop offset="1" stop-color="#26354a"/></linearGradient>' +
          '<radialGradient id="' + haze + '"><stop offset="0" stop-color="#8fa3c0" stop-opacity=".22"/><stop offset="1" stop-color="#8fa3c0" stop-opacity="0"/></radialGradient></defs>' +
          '<rect width="' + W + '" height="' + H + '" fill="#0d1523"/>' +
          '<rect width="' + W + '" height="' + H + '" fill="url(#' + sky + ')"/>' +
          '<ellipse cx="' + (W * 0.28) + '" cy="' + (H * 0.34) + '" rx="' + (W * 0.45) + '" ry="' + (H * 0.3) + '" fill="url(#' + haze + ')"/>' +
          '<ellipse cx="' + (W * 0.55) + '" cy="' + (H * 0.47) + '" rx="' + (W * 0.7) + '" ry="' + (H * 0.07) + '" fill="#9fb0c8" opacity=".05"/>' +
          '<path d="' + ridge(W, H * 0.56, 10, 16, 9, 11) + '" fill="#1f2b3d"/>' +
          '<g class="cl-jet">' + JET + '</g>' +
          '<g class="cl-man" style="opacity:0">' + MAN + '</g>' +
          '<path d="' + ridge(W, H * 0.66, 9, 20, 10, 23) + '" fill="#111a27"/>' +
          '<path d="' + ridge(W, H * 0.76, 7, 26, 12, 37) + '" fill="#080d15"/>' +
          '<rect y="' + (H * 0.8) + '" width="' + W + '" height="' + (H * 0.2) + '" fill="#080d15"/>';
        jetG = svg.querySelector('.cl-jet'); manG = svg.querySelector('.cl-man');
        chuteG = svg.querySelector('.cl-chute'); bodyG = svg.querySelector('.cl-body'); beacon = svg.querySelector('.cl-beacon');
        drops.length = 0;
        const r = rng(5), n = Math.round(W / 7);
        for (let i = 0; i < n; i++) drops.push({ x: r() * (W + 60), y: r() * H, l: 8 + r() * 14, v: 380 + r() * 260, a: 0.06 + r() * 0.12 });
        if (mode === 'scene') draw(performance.now(), 0);
      }

      /* simulation */
      let mode = 'card', t0 = 0, raf = 0, lastT = 0, typed = 0, typeTimer = 0;
      const man = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, chute: 0, sc: 1, phase: 'stand', hidden: false };
      function jetOffset(t) {
        if (R) return { x: 0, y: 0 };
        if (t < 900) { const e = easeOut(t / 900); return { x: 70 * (1 - e), y: -80 * (1 - e) }; }
        if (t > 3000) { const e = clamp((t - 3000) / 1600, 0, 1); return { x: 120 * e * e, y: -140 * e * e + Math.sin(t / 700) * 1.5 }; }
        return { x: 0, y: Math.sin(t / 700) * 1.5 };
      }
      function jetBase() { return { x: W - 212 * js, y: 0 }; }
      function stairFoot(off) { const b = jetBase(); return { x: b.x + off.x + 52 * js, y: b.y + off.y + 99 * js }; }

      function place(t) {
        const off = jetOffset(t), b = jetBase();
        jetG.setAttribute('transform', 'translate(' + (b.x + off.x).toFixed(1) + ' ' + (b.y + off.y).toFixed(1) + ') scale(' + js + ')');
        beacon.setAttribute('opacity', Math.floor(t / 600) % 2 ? '.25' : '1');
        manG.style.opacity = man.hidden ? 0 : 1;
        manG.setAttribute('transform', 'translate(' + man.x.toFixed(1) + ' ' + man.y.toFixed(1) + ') rotate(' + man.rot.toFixed(1) + ') scale(' + (man.sc * js).toFixed(3) + ')');
        chuteG.style.opacity = man.chute > 0.01 ? 1 : 0;
        chuteG.setAttribute('transform', 'translate(0 -22) scale(' + (0.2 + 0.8 * man.chute).toFixed(3) + ' ' + man.chute.toFixed(3) + ') translate(0 22)');
      }

      function draw(now, dt) {
        const t = now - t0;
        if (!R) {
          if (man.phase === 'stand') {
            const f = stairFoot(jetOffset(t));
            const shuffle = clamp((t - 800) / 500, 0, 1);
            man.x = f.x - 4 * js * shuffle; man.y = f.y - 1; man.rot = -6 * shuffle;
            man.hidden = t < 350;
            if (t >= 1400) { sfx('wind'); man.phase = 'fall'; man.vx = -46 * js; man.vy = -30; }
          } else if (man.phase === 'fall') {
            man.vy += 300 * js * dt; man.x += man.vx * dt; man.y += man.vy * dt;
            man.rot -= 150 * dt;
            if (t >= 1950) { sfx('chute'); man.phase = 'bloom'; man.bt = t; man.r0 = man.rot; }
          } else if (man.phase === 'bloom') {
            const q = clamp((t - man.bt) / 520, 0, 1);
            man.chute = clamp(easeBack(q), 0, 1.15);
            man.rot = man.r0 * (1 - easeOut(q)) + Math.sin(t / 420) * 4 * q;
            man.vy += (13 * js - man.vy) * Math.min(1, dt * 7); man.vx += (-16 * js - man.vx) * Math.min(1, dt * 3);
            man.x += man.vx * dt; man.y += man.vy * dt;
            if (q >= 1) man.phase = 'drift';
          } else if (man.phase === 'drift') {
            man.chute = 1;
            man.rot = Math.sin(t / 620) * 9;
            man.x += (-18 * js + Math.cos(t / 620) * 10) * dt; man.y += 13 * js * dt;
            man.sc = Math.max(0.62, man.sc - dt * 0.05);
            if (man.y > H * 0.8) { man.hidden = true; man.phase = 'gone'; }
          }
        }
        place(R ? 1500 : t);
        ctx.clearRect(0, 0, W, H);
        if (!R) {
          ctx.lineCap = 'round'; ctx.lineWidth = 1;
          for (const d of drops) {
            d.y += d.v * dt; d.x -= d.v * 0.18 * dt;
            if (d.y > H + 20) { d.y = -20; d.x = Math.random() * (W + 60); }
            if (d.x < -20) d.x += W + 40;
            ctx.strokeStyle = 'rgba(176,196,224,' + d.a.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * 0.18, d.y - d.l); ctx.stroke();
          }
        }
      }

      function frame(now) {
        raf = 0;
        const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
        draw(now, dt);
        if (mode === 'scene') raf = requestAnimationFrame(frame);
      }

      function typeNext() {
        typeTimer = 0;
        typed++;
        typeEl.innerHTML = '';
        typeEl.appendChild(document.createTextNode(LINE.slice(0, typed)));
        if (LINE[typed - 1] !== ' ') sfx('type');
        const c = document.createElement('i'); c.className = 'cl-caret'; typeEl.appendChild(c);
        if (typed < LINE.length) typeTimer = later(typeNext, LINE[typed - 1] === '.' ? 320 : 42);
        else later(showBack, 250);
      }
      function showBack() {
        backBtn.classList.add('cl-show');
        if (stage.contains(document.activeElement) || document.activeElement === document.body) backBtn.focus({ preventScroll: true });
      }

      function openConfirm() {
        outBtn.classList.add('cl-off'); confirm.classList.remove('cl-off');
        sfx('click');
        yesBtn.focus({ preventScroll: true });
      }
      function closeConfirm(focus) {
        confirm.classList.add('cl-off'); outBtn.classList.remove('cl-off');
        if (focus) outBtn.focus({ preventScroll: true });
      }
      function jump() {
        if (mode !== 'card') return;
        mode = 'scene';
        closeConfirm(false);
        scene.classList.add('cl-on'); foot.style.visibility = 'visible';
        backBtn.classList.remove('cl-show');
        foot.focus({ preventScroll: true });
        if (R) sfx('chute');
        Object.assign(man, { vx: 0, vy: 0, rot: 0, chute: 0, sc: 1, phase: 'stand', hidden: false });
        t0 = performance.now(); lastT = t0;
        if (R) {
          Object.assign(man, { x: W * 0.46, y: H * 0.46, chute: 1, rot: 4, phase: 'drift', sc: 0.9 });
          scene.style.opacity = 1; card.classList.add('cl-gone');
        } else {
          run(card, [{ opacity: 1, transform: 'translate(-50%,-50%)' }, { opacity: 0, transform: 'translate(-50%,-50%) translateY(-18px) scale(.95)' }], { duration: 320, easing: 'cubic-bezier(.4,0,.8,.4)', fill: 'forwards' });
          later(() => card.classList.add('cl-gone'), 320);
          run(scene, [{ opacity: 0 }, { opacity: 1 }], { duration: 520, delay: 120, easing: 'ease-out', fill: 'forwards' });
        }
        build();
        draw(t0, 0);
        srEl.textContent = LINE;
        typed = 0; typeEl.textContent = '';
        if (R) { typeEl.textContent = LINE; later(showBack, 60); }
        else later(typeNext, 2500);
        raf = requestAnimationFrame(frame);
      }
      function signIn() {
        if (mode !== 'scene') return;
        mode = 'card';
        timers.forEach(clearTimeout); timers.clear(); typeTimer = 0;
        anims.forEach((a) => a.cancel()); anims.length = 0;
        backBtn.classList.remove('cl-show');
        sfx('pop');
        card.classList.remove('cl-gone');
        const done = () => { scene.classList.remove('cl-on'); scene.style.opacity = 0; foot.style.visibility = 'hidden'; typeEl.textContent = ''; srEl.textContent = ''; if (raf) { cancelAnimationFrame(raf); raf = 0; } };
        if (R) { scene.style.opacity = 0; done(); }
        else {
          scene.style.opacity = 1;
          run(scene, [{ opacity: 1 }, { opacity: 0 }], { duration: 360, easing: 'ease-in', fill: 'forwards' });
          run(card, [{ opacity: 0, transform: 'translate(-50%,-50%) translateY(26px) scale(.9)' }, { opacity: 1, transform: 'translate(-50%,-50%)' }], { duration: 680, delay: 120, easing: 'cubic-bezier(.2,1.45,.35,1)', fill: 'backwards' });
          later(done, 380);
        }
        outBtn.focus({ preventScroll: true });
      }

      const onOut = () => openConfirm();
      const onStay = () => closeConfirm(true);
      const onKey = (e) => { if (e.key === 'Escape' && !confirm.classList.contains('cl-off')) { e.preventDefault(); closeConfirm(true); } };
      outBtn.addEventListener('click', onOut);
      yesBtn.addEventListener('click', jump);
      stayBtn.addEventListener('click', onStay);
      backBtn.addEventListener('click', signIn);
      card.addEventListener('keydown', onKey);

      build();
      let ro = null;
      if (window.ResizeObserver) { ro = new ResizeObserver(() => { const w = stage.clientWidth; if (w && w !== W) { build(); } }); ro.observe(stage); }

      return {
        destroy() {
          if (raf) cancelAnimationFrame(raf); raf = 0;
          timers.forEach(clearTimeout); timers.clear();
          anims.forEach((a) => a.cancel());
          if (ro) ro.disconnect();
          outBtn.removeEventListener('click', onOut);
          yesBtn.removeEventListener('click', jump);
          stayBtn.removeEventListener('click', onStay);
          backBtn.removeEventListener('click', signIn);
          card.removeEventListener('keydown', onKey);
        }
      };
    }
  });
})();
