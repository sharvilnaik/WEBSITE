// Russian Roulette: six chambers, one of them loaded, dealt before anyone touches it.
// Press play and say who is at the table: one of you, two passing it back and forth, or up to six.
// Seats you leave empty stay empty — the bullet can land in a chair with nobody in it, and then nobody takes it.
// The pictures are read straight off the device into memory: nothing is uploaded, nothing is stored,
// and every one of them is thrown away when the table is changed or the tile is left.
(function () {
  const css = `
/* The table, as a western poster: a sun behind everything, earth under it,
   a screen in a brass frame that goes green when the hammer falls on nothing. */
.x-roulette{
  --west:"Rye","Ultra","Bookman Old Style",Georgia,serif;
  --sand:#F2E3C4;--ochre:#D9A441;--sun:#F5C518;--bark:#8A5A2B;--rust:#B23A1E;--red:#C8102E;--moss:#7FA34A;
  font-family:var(--body);color:var(--sand);
  background:radial-gradient(130% 92% at 50% 118%,#57311A 0%,#31190A 54%,#170C04 100%)}
/* the sun the way the poster has it: wedges from behind the screen, fading out before the edges */
.x-roulette::before{content:"";position:absolute;inset:-30%;z-index:0;pointer-events:none;
  background:repeating-conic-gradient(from 8deg at 68% 20%,rgba(245,197,24,.20) 0deg 3.2deg,rgba(245,197,24,0) 3.2deg 15deg);
  -webkit-mask-image:radial-gradient(62% 58% at 68% 20%,#000 18%,transparent 80%);
  mask-image:radial-gradient(62% 58% at 68% 20%,#000 18%,transparent 80%)}
.x-roulette .rr-wrap, .x-roulette .rr-wrap *{box-sizing:border-box}
.x-roulette .rr-wrap{position:absolute;inset:0;z-index:2}

/* one screen at a time */
.x-roulette .rr-scr{position:absolute;inset:0;display:none;flex-direction:column;gap:10px;padding:14px 16px}
.x-roulette.scr-title .rr-title,.x-roulette.scr-mode .rr-modes,.x-roulette.scr-setup .rr-setup,.x-roulette.scr-play .rr-game{display:flex}

/* ---------- the poster ---------- */
.x-roulette .rr-title{align-items:center;justify-content:center;text-align:center;gap:0}
.x-roulette .rr-cylmark{width:74px;height:74px;margin-bottom:10px;color:var(--ochre)}
.x-roulette .rr-cylmark svg{width:100%;height:100%;display:block;animation:rr-turn 18s linear infinite}
@keyframes rr-turn{to{transform:rotate(360deg)}}
.x-roulette .rr-title h3{margin:0;font:400 27px/1.05 var(--west);color:var(--sand);text-shadow:0 3px 0 rgba(0,0,0,.55)}
.x-roulette .rr-play{position:relative}
.x-roulette .rr-title p{margin:8px 0 16px;font-size:12.5px;line-height:17px;color:#C8A87A}

/* ---------- how many at the table ---------- */
.x-roulette .rr-modes{justify-content:center}
.x-roulette .rr-modes h4{margin:0 0 2px;font:400 17px/1.2 var(--west);color:var(--sand);text-align:center}
.x-roulette .rr-mlist{display:grid;gap:7px}
.x-roulette .rr-mode{display:flex;align-items:baseline;gap:8px;width:100%;padding:9px 12px;text-align:left;cursor:pointer;
  border:1.5px solid var(--bark);border-radius:9px;background:rgba(0,0,0,.28);color:var(--sand);
  transition:border-color .2s ease,background-color .2s ease,transform .1s ease}
.x-roulette .rr-mode b{font:400 15px/1.1 var(--west);font-weight:400}
.x-roulette .rr-mode span{margin-left:auto;font-size:11px;line-height:15px;color:#C8A87A;text-align:right}
.x-roulette .rr-mode:hover{border-color:var(--ochre);background:rgba(217,164,65,.12)}
.x-roulette .rr-mode:active{transform:translateY(1px)}
.x-roulette .rr-mode:focus-visible{outline:2px solid var(--ochre);outline-offset:2px}

/* ---------- who is at the table ---------- */
.x-roulette .rr-setup{overflow:auto;gap:7px}
.x-roulette .rr-head{display:flex;align-items:baseline;gap:8px}
.x-roulette .rr-head h4{margin:0;font:400 15px/19px var(--west);color:var(--sand)}
.x-roulette .rr-head span{margin-left:auto;font-size:11px;line-height:15px;color:#A98859;text-align:right}
.x-roulette .rr-seats{display:grid;gap:6px}
.x-roulette .rr-seat{display:flex;align-items:center;gap:8px}
.x-roulette .rr-seat.off{display:none}
.x-roulette .rr-pick{position:relative;flex:none;width:32px;height:32px;border-radius:9px;border:1px dashed var(--bark);background:rgba(0,0,0,.3);
  display:grid;place-items:center;color:#A98859;cursor:pointer;overflow:hidden;padding:0}
.x-roulette .rr-pick img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.x-roulette .rr-pick svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.x-roulette .rr-pick:hover{border-color:var(--ochre);color:var(--sand)}
.x-roulette .rr-pick:focus-within{outline:2px solid var(--ochre);outline-offset:2px}
.x-roulette .rr-pick input{position:absolute;inset:0;opacity:0;cursor:pointer}
.x-roulette .rr-seat input[type=text]{flex:1;min-width:0;height:32px;padding:0 10px;border-radius:8px;border:1px solid var(--bark);background:rgba(0,0,0,.3);
  font:300 13px/1 var(--body);color:var(--sand);outline:none}
.x-roulette .rr-seat input[type=text]:focus{border-color:var(--ochre)}

/* the split: how many of the six each of the two takes */
.x-roulette .rr-splitwrap{display:none;gap:6px;flex-direction:column}
.x-roulette.mode-two .rr-splitwrap{display:flex}
.x-roulette .rr-splitlab{font-size:11px;line-height:15px;color:#A98859}
.x-roulette .rr-split{display:flex;gap:5px}
.x-roulette .rr-split button{flex:1;height:26px;border:1px solid var(--bark);border-radius:7px;background:rgba(0,0,0,.3);
  color:#C8A87A;font:400 12px/1 var(--body);cursor:pointer;transition:background-color .2s ease,color .2s ease,border-color .2s ease}
.x-roulette .rr-split button[aria-pressed=true]{background:var(--ochre);border-color:var(--ochre);color:#2A1608}
.x-roulette .rr-split button:focus-visible{outline:2px solid var(--ochre);outline-offset:2px}
.x-roulette .rr-table{display:flex;gap:4px}
.x-roulette .rr-table i{flex:1;height:18px;border-radius:5px;display:grid;place-items:center;font:400 10px/1 var(--body);font-style:normal;
  background:rgba(0,0,0,.35);border:1px solid var(--bark);color:#C8A87A}
.x-roulette .rr-table i.p0{background:rgba(217,164,65,.85);border-color:var(--ochre);color:#2A1608}
.x-roulette .rr-table i.p1{background:rgba(178,58,30,.85);border-color:var(--rust);color:#FFE9D6}

.x-roulette .rr-note{margin:0;font-size:11px;line-height:14px;color:#A98859}
.x-roulette .rr-row{display:flex;gap:8px;padding-top:2px;margin-top:auto}
.x-roulette .rr-row button{height:32px;padding:0 16px;border-radius:999px;font:400 13px/1 var(--body);cursor:pointer}
.x-roulette .rr-save{flex:1;border:0;background:var(--ochre);color:#2A1608}
.x-roulette .rr-back{border:1px solid var(--bark);background:transparent;color:var(--sand)}
.x-roulette .rr-row button:focus-visible{outline:2px solid var(--ochre);outline-offset:2px}

/* ---------- the round: the screen is the whole tile ---------- */
.x-roulette .rr-game{padding:0}
.x-roulette .rr-stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;
  background:transparent;transition:background-color .25s ease}
.x-roulette .rr-stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
/* so the overlays read over any photograph */
.x-roulette .rr-game::before{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;
  background:linear-gradient(180deg,rgba(10,6,2,.72),rgba(10,6,2,0) 24%,rgba(10,6,2,0) 44%,rgba(10,6,2,.85))}
.x-roulette .rr-idle{position:relative;z-index:3;padding:0 26px;margin-bottom:56px;font-size:13.5px;line-height:20px;color:#E6D2AC}
.x-roulette .rr-name{position:absolute;z-index:3;left:14px;right:14px;bottom:102px;text-align:center;
  font:400 21px/1.15 var(--west);color:var(--sand);text-shadow:0 2px 0 rgba(0,0,0,.7);word-break:break-word}
.x-roulette .rr-verdict{display:block;margin-top:5px;font:400 12px/16px var(--body);color:#E6D2AC;text-shadow:0 1px 2px rgba(0,0,0,.8)}

/* walked away from it: the screen goes green */
.x-roulette .rr-stage.safe{background:linear-gradient(180deg,rgba(57,104,44,.92),rgba(24,48,20,.96))}
.x-roulette .rr-stage.safe.has-img{background:rgba(45,92,36,.5)}
.x-roulette .rr-stage.safe.has-img::after{content:"";position:absolute;inset:0;background:rgba(57,104,44,.45);mix-blend-mode:multiply}
.x-roulette .rr-game.safe .rr-verdict{color:#DCF2BE}
/* an empty chair took it: nobody walks away, nobody doesn't */
.x-roulette .rr-stage.nobody{background:linear-gradient(180deg,rgba(74,52,18,.92),rgba(30,20,7,.96))}
.x-roulette .rr-stage.hit{background:rgba(40,4,4,.35)}

/* top left, the way out; top right, what is left in the cylinder */
.x-roulette .rr-walk{position:absolute;z-index:4;left:12px;top:12px;display:flex;align-items:center;gap:5px;height:30px;padding:0 12px 0 9px;
  border:1px solid rgba(242,227,196,.34);border-radius:999px;background:rgba(10,6,2,.42);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);
  color:var(--sand);font:400 12px/1 var(--body);cursor:pointer;transition:border-color .2s ease,background-color .2s ease}
.x-roulette .rr-walk svg{width:13px;height:13px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.x-roulette .rr-walk:hover{border-color:var(--sand);background:rgba(10,6,2,.7)}
.x-roulette .rr-walk:focus-visible{outline:2px solid var(--ochre);outline-offset:2px}
.x-roulette .rr-bullets{position:absolute;z-index:4;right:12px;top:12px;display:grid;justify-items:end;gap:5px;pointer-events:none}
.x-roulette .rr-cyl{display:flex;gap:6px}
.x-roulette .rr-pip{width:10px;height:10px;border-radius:50%;border:1.5px solid rgba(242,227,196,.55);box-sizing:border-box;
  background:rgba(217,164,65,.3);transition:background-color .2s ease,border-color .2s ease,transform .2s ease}
.x-roulette .rr-pip.spent{border-color:rgba(242,227,196,.3);background:rgba(10,6,2,.55)}
.x-roulette .rr-pip.shot{border-color:var(--red);background:var(--red);transform:scale(1.3)}
.x-roulette .rr-pip.empty{border-color:var(--moss);background:rgba(127,163,74,.6)}
.x-roulette .rr-left{font:400 11px/14px var(--body);color:#E6D2AC;font-variant-numeric:tabular-nums;text-shadow:0 1px 2px rgba(0,0,0,.7)}

/* the trigger, on the screen itself */
.x-roulette .rr-red{width:72px;height:72px;border-radius:50%;border:3px solid var(--sand);
  background:radial-gradient(circle at 36% 30%,#E2452F,#C8102E 56%,#8B0A1C);
  color:#FFF3DC;font:400 13px/1 var(--west);letter-spacing:.02em;cursor:pointer;outline:none;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
  box-shadow:0 5px 0 #6B0A18,0 10px 18px rgba(0,0,0,.55);
  transition:transform .08s ease,box-shadow .08s ease,background-color .2s ease}
.x-roulette .rr-red:hover{background:radial-gradient(circle at 36% 30%,#F0543B,#D81433 56%,#8B0A1C)}
.x-roulette .rr-red:active{transform:translateY(4px);box-shadow:0 1px 0 #6B0A18,0 4px 10px rgba(0,0,0,.5)}
.x-roulette .rr-red:focus-visible{box-shadow:0 5px 0 #6B0A18,0 0 0 3px #170C04,0 0 0 6px var(--ochre)}
.x-roulette .rr-shoot{position:absolute;z-index:4;left:50%;bottom:14px;margin-left:-36px}
.x-roulette .rr-shoot.done{background:radial-gradient(circle at 36% 30%,#E9D9B4,#D9A441 60%,#9C6C1F);color:#2A1608;border-color:var(--sand)}

/* the one that was loaded: the tile takes it the way the gun barrel does, and then it runs down */
.x-roulette .rr-blood{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;transition:opacity .12s linear}
.x-roulette .rr-blood.on{opacity:1}
.x-roulette .rr-blood .rr-wash{position:absolute;inset:0;background:radial-gradient(90% 70% at 50% 34%,rgba(190,12,12,.45),rgba(120,0,0,.8) 62%,rgba(60,0,0,.93));
  opacity:0;transition:opacity .5s ease}
.x-roulette .rr-blood.on .rr-wash{opacity:1}
.x-roulette .rr-blood .rr-run{position:absolute;top:0;left:var(--x);width:var(--w);height:100%;transform-origin:50% 0;transform:scaleY(0);
  background:linear-gradient(180deg,#8e0606,#c21111 70%,rgba(194,17,17,0));border-radius:0 0 40% 40%;
  transition:transform 1.1s cubic-bezier(.3,.7,.3,1)}
.x-roulette .rr-blood.on .rr-run{transform:scaleY(1)}
.x-roulette .rr-blood .rr-drop{position:absolute;left:var(--x);top:0;width:var(--w);height:var(--w);border-radius:50%;background:#c21111;
  transform:translateY(-20px);opacity:0;transition:transform 1.3s cubic-bezier(.4,.1,.7,1),opacity .3s ease}
.x-roulette .rr-blood.on .rr-drop{transform:translateY(var(--fall));opacity:.92}
@media (prefers-reduced-motion: reduce){
  .x-roulette .rr-blood .rr-run{transition:none;transform:scaleY(1)}
  .x-roulette .rr-blood .rr-drop{transition:none}
  .x-roulette .rr-cylmark svg{animation:none}
}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const SEATS = 6;
  const PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9"/></svg>';
  // the cylinder on the poster
  let CYL = '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="9"/>';
  for (let i = 0; i < SEATS; i++) {
    const a = (i * 60 - 90) * Math.PI / 180;
    CYL += '<circle cx="' + (50 + Math.cos(a) * 27).toFixed(1) + '" cy="' + (50 + Math.sin(a) * 27).toFixed(1) + '" r="9"' + (i === 4 ? ' fill="currentColor"' : '') + '/>';
  }
  CYL += '</svg>';

  const MODES = {
    single: { seats: 1, head: 'Who is holding it', sub: 'Every chamber is yours' },
    two: { seats: 2, head: 'The two of you', sub: 'Six chambers between you' },
    multi: { seats: 6, head: 'Who is at the table', sub: 'Leave a chair empty and it stays empty' }
  };

  window.EXPERIMENTS.push({
    id: 'roulette',
    name: 'Russian Roulette',
    source: 'The Deer Hunter',
    hint: 'Press play, say how many are at the table, then pull. Empty chairs count.',
    mount(stage) {
      const sfx = window.LAB_SFX;

      let pipsHtml = '', seatsHtml = '', splitHtml = '', tableHtml = '';
      for (let i = 0; i < SEATS; i++) {
        pipsHtml += '<i class="rr-pip"></i>';
        seatsHtml +=
          '<div class="rr-seat">' +
            '<label class="rr-pick" data-seat="' + i + '">' + PLUS +
              '<input type="file" accept="image/*" aria-label="Picture for seat ' + (i + 1) + '"></label>' +
            '<input type="text" class="rr-nm" data-seat="' + i + '" maxlength="18" autocomplete="off" placeholder="Seat ' + (i + 1) + '">' +
          '</div>';
        tableHtml += '<i></i>';
      }
      for (let n = 1; n <= 5; n++) splitHtml += '<button type="button" data-n="' + n + '" aria-pressed="false">' + n + ' / ' + (SEATS - n) + '</button>';

      stage.innerHTML = `
        <div class="rr-wrap">
          <section class="rr-scr rr-title">
            <div class="rr-cylmark" aria-hidden="true">${CYL}</div>
            <h3>Russian Roulette</h3>
            <p>Six chambers. One of them is loaded.</p>
            <button type="button" class="rr-red rr-play">Play</button>
          </section>

          <section class="rr-scr rr-modes">
            <h4>How many at the table</h4>
            <div class="rr-mlist">
              <button type="button" class="rr-mode" data-mode="single"><b>Single</b><span>You and the odds</span></button>
              <button type="button" class="rr-mode" data-mode="two"><b>Two</b><span>Pass it back and forth</span></button>
              <button type="button" class="rr-mode" data-mode="multi"><b>Multiplayer</b><span>Up to six, empty chairs count</span></button>
            </div>
            <div class="rr-row"><button type="button" class="rr-back" data-to="title">Back</button></div>
          </section>

          <form class="rr-scr rr-setup">
            <div class="rr-head"><h4 class="rr-sh">Who is at the table</h4><span class="rr-sub"></span></div>
            <div class="rr-seats">${seatsHtml}</div>
            <div class="rr-splitwrap">
              <span class="rr-splitlab">Chambers each</span>
              <div class="rr-split" role="group" aria-label="Chambers each">${splitHtml}</div>
              <div class="rr-table" aria-hidden="true">${tableHtml}</div>
            </div>
            <p class="rr-note">Pictures stay on this device and go when you change the table. Nothing is uploaded.</p>
            <div class="rr-row">
              <button type="submit" class="rr-save">Load the gun</button>
              <button type="button" class="rr-back" data-to="mode">Back</button>
            </div>
          </form>

          <section class="rr-scr rr-game">
            <div class="rr-stage no-img" role="status"><p class="rr-idle"></p></div>
            <button type="button" class="rr-walk">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg><span>Walk away</span>
            </button>
            <div class="rr-bullets" aria-hidden="true">
              <span class="rr-cyl">${pipsHtml}</span>
              <span class="rr-left"></span>
            </div>
            <button type="button" class="rr-red rr-shoot">Shoot</button>
          </section>
        </div>
        <div class="rr-blood" aria-hidden="true"><span class="rr-wash"></span></div>`;

      const q = s => stage.querySelector(s);
      const cyl = [...stage.querySelectorAll('.rr-pip')];
      const left = q('.rr-left'), shootBtn = q('.rr-shoot'), walkBtn = q('.rr-walk'), walkLab = walkBtn.querySelector('span');
      const board = q('.rr-stage'), blood = q('.rr-blood'), setup = q('.rr-setup'), game = q('.rr-game');
      const playBtn = q('.rr-play'), modeBtns = [...stage.querySelectorAll('.rr-mode')], backBtns = [...stage.querySelectorAll('.rr-back')];
      const seatRows = [...stage.querySelectorAll('.rr-seat')];
      const picks = [...stage.querySelectorAll('.rr-pick')];
      const nameInputs = [...stage.querySelectorAll('.rr-nm')];
      const splitBtns = [...stage.querySelectorAll('.rr-split button')];
      const tableChips = [...stage.querySelectorAll('.rr-table i')];
      const headEl = q('.rr-sh'), subEl = q('.rr-sub'), idleEl = () => q('.rr-idle');

      // a seat is a person; a chamber is a place at the table. order says who is in each chamber,
      // and a chamber with nobody in it holds null.
      const seats = Array.from({ length: SEATS }, (_, i) => ({ name: '', url: null, label: 'Seat ' + (i + 1) }));
      let mode = 'multi', split = 3, order = [0, 1, 2, 3, 4, 5];
      let bullet = 0, at = 0, over = false, clicks = 0;

      // ---------- sound: the hammer, and the one that goes off ----------
      let A = null;
      function audio() {
        if (A) return A;
        const a = sfx && sfx.audio && sfx.audio();
        if (!a) return null;
        const bus = a.ctx.createGain(); bus.gain.value = 0.9; bus.connect(a.out);
        A = { ctx: a.ctx, bus, noise: a.noise };
        return A;
      }
      function dropAudio() { if (!A) return; const a = A; A = null; try { a.bus.disconnect(); } catch (e) {} }
      function burst(t, dur, type, f0, f1, qv, vol) {
        const { ctx, bus, noise } = A;
        const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true;
        const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = qv;
        f.frequency.setValueAtTime(f0, t);
        f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(bus);
        s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.03);
      }
      function drop(t, f0, f1, dur, vol, type) {
        const { ctx, bus } = A;
        const o = ctx.createOscillator(); o.type = type || 'sine';
        o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.03);
      }
      // a blank: the cylinder turns, the hammer falls on nothing
      function clickSfx() {
        if (!audio()) return;
        const t = A.ctx.currentTime;
        burst(t, 0.05, 'bandpass', 2600, 1400, 6, 0.22);
        drop(t + 0.004, 320, 140, 0.05, 0.12, 'square');
        burst(t + 0.08, 0.06, 'bandpass', 1800, 900, 5, 0.12);
      }
      // the one that was loaded
      function shotSfx() {
        if (!audio()) return;
        const t = A.ctx.currentTime;
        burst(t, 0.28, 'lowpass', 7000, 260, 0.8, 0.85);
        burst(t + 0.005, 0.12, 'highpass', 3200, 1800, 0.7, 0.45);
        drop(t, 180, 40, 0.34, 0.6, 'sine');
        drop(t + 0.01, 90, 30, 0.5, 0.35, 'triangle');
        burst(t + 0.16, 0.9, 'lowpass', 1400, 200, 0.6, 0.12);    // the room after it
      }

      // ---------- the faces ----------
      function dropShot(i) {
        if (!seats[i].url) return;
        URL.revokeObjectURL(seats[i].url);
        seats[i].url = null;
      }
      function setShot(i, file) {
        dropShot(i);
        if (file) seats[i].url = URL.createObjectURL(file);
        const pick = picks[i], old = pick.querySelector('img');
        if (old) old.remove();
        if (seats[i].url) {
          const img = document.createElement('img');
          img.alt = ''; img.src = seats[i].url;
          pick.appendChild(img);
        }
      }
      const nameOf = i => seats[i].name || seats[i].label;
      const has = i => !!(seats[i].name || seats[i].url);

      // ---------- screens ----------
      function screen(name) {
        stage.classList.remove('scr-title', 'scr-mode', 'scr-setup', 'scr-play');
        stage.classList.add('scr-' + name);
      }
      function setMode(m) {
        mode = m;
        stage.classList.remove('mode-single', 'mode-two', 'mode-multi');
        stage.classList.add('mode-' + m);
        const cfg = MODES[m];
        headEl.textContent = cfg.head; subEl.textContent = cfg.sub;
        seatRows.forEach((row, i) => row.classList.toggle('off', i >= cfg.seats));
        nameInputs.forEach((el, i) => { el.value = seats[i].name; el.placeholder = m === 'single' ? 'Your name' : 'Seat ' + (i + 1); });
        paintSplit();
        screen('setup');
      }

      // the two of them, spread as evenly round the six as the split allows
      function shareOut(n) {
        const out = [];
        for (let c = 0; c < SEATS; c++) out.push(((c * n) % SEATS) < n ? 0 : 1);   // the first name takes the first chamber
        return out;
      }
      function paintSplit() {
        splitBtns.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.n === split)));
        const s = shareOut(split);
        tableChips.forEach((chip, c) => {
          if (mode !== 'two') { chip.className = ''; chip.textContent = ''; return; }
          chip.className = 'p' + s[c];
          const nm = seats[s[c]].name;
          chip.textContent = nm ? nm.slice(0, 1).toUpperCase() : (s[c] ? 'B' : 'A');
        });
      }

      // ---------- dealing ----------
      function deal() {
        if (mode === 'single') order = Array.from({ length: SEATS }, () => 0);
        else if (mode === 'two') order = shareOut(split);
        else order = Array.from({ length: SEATS }, (_, i) => (has(i) ? i : null));   // an empty chair stays empty
        bullet = Math.floor(Math.random() * SEATS);                                   // one live round, somewhere in the six
      }
      const emptyChairs = () => order.filter(o => o === null).length;
      function idleLine() {
        if (mode === 'single') return 'One of the six is loaded. Pull, or walk away.';
        if (mode === 'two') return 'Six chambers between the two of you. The gun comes back round.';
        const n = SEATS - emptyChairs();
        if (!n) return 'Nobody at the table. The gun does not care.';
        if (n === SEATS) return 'Six at the table, one of the six loaded.';
        return n + ' at the table, ' + emptyChairs() + ' chair' + (emptyChairs() === 1 ? '' : 's') + ' empty. It can land on nobody.';
      }
      function odds() {
        const leftN = SEATS - at;
        return leftN > 0 ? '1 in ' + leftN : 'Round over';
      }

      function load() {
        at = 0; over = false; clicks = 0;
        deal();
        cyl.forEach(p => { p.className = 'rr-pip'; });
        blood.classList.remove('on');
        blood.querySelectorAll('.rr-run, .rr-drop').forEach(el => el.remove());
        board.className = 'rr-stage no-img';
        board.innerHTML = '<p class="rr-idle">' + idleLine() + '</p>';
        shootBtn.textContent = 'Shoot';
        shootBtn.classList.remove('done');
        game.classList.remove('safe');
        paintExit();
        left.textContent = odds();
        sfx && sfx.play('clunk');
      }

      function show(i, verdict, kind) {
        const url = i == null ? null : seats[i].url;
        board.className = 'rr-stage' + (url ? ' has-img' : ' no-img') + (kind ? ' ' + kind : '');
        game.classList.toggle('safe', kind === 'safe');
        board.innerHTML = '';
        if (url) { const img = document.createElement('img'); img.alt = ''; img.src = url; board.appendChild(img); }
        const b = document.createElement('p'); b.className = 'rr-name';
        b.textContent = i == null ? 'An empty chair' : nameOf(i);
        const v = document.createElement('span'); v.className = 'rr-verdict'; v.textContent = verdict;
        b.appendChild(v);
        board.appendChild(b);
      }

      // the barrel bleeds: a wash, a few runs down the glass and the drops that follow them
      function bleed() {
        const runs = window.REDUCED ? 3 : 7;
        for (let i = 0; i < runs; i++) {
          const r = document.createElement('span');
          r.className = 'rr-run';
          r.style.setProperty('--x', (4 + Math.random() * 90) + '%');
          r.style.setProperty('--w', (5 + Math.random() * 16) + 'px');
          r.style.transitionDelay = (Math.random() * 0.35).toFixed(2) + 's';
          r.style.transitionDuration = (0.8 + Math.random() * 0.9).toFixed(2) + 's';
          blood.appendChild(r);
        }
        if (!window.REDUCED) {
          for (let i = 0; i < 5; i++) {
            const d = document.createElement('span');
            d.className = 'rr-drop';
            d.style.setProperty('--x', (6 + Math.random() * 86) + '%');
            d.style.setProperty('--w', (6 + Math.random() * 9) + 'px');
            d.style.setProperty('--fall', (120 + Math.random() * 180) + 'px');
            d.style.transitionDelay = (0.2 + Math.random() * 0.5).toFixed(2) + 's';
            blood.appendChild(d);
          }
        }
        void blood.offsetWidth;
        blood.classList.add('on');
      }

      // the top left leaves the round: in single, mid-round, that is walking away from it
      function paintExit() {
        const walking = mode === 'single' && !over;
        walkLab.textContent = walking ? 'Walk away' : 'Table';
        walkBtn.dataset.act = walking ? 'walk' : 'table';
      }
      function endRound(word) {
        over = true;
        left.textContent = word;
        shootBtn.textContent = 'Again';
        shootBtn.classList.add('done');
        paintExit();
      }

      function shoot() {
        if (over) { load(); return; }
        const c = at++, i = order[c];          // the chamber, and whoever it comes round to
        if (c === bullet) {
          cyl[c].className = i == null ? 'rr-pip empty' : 'rr-pip shot';
          if (i == null) {
            // the bullet was in a chair with nobody in it
            clickSfx(); sfx && sfx.play('ok', 120);
            show(null, 'The loaded one came round to nobody.', 'nobody');
            endRound('Nobody takes it');
          } else {
            shotSfx();
            show(i, 'That one was loaded.', 'hit');
            bleed();
            endRound('Round over');
            if (!window.REDUCED) stage.animate([
              { transform: 'translate(0,0)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(5px,-3px)' },
              { transform: 'translate(-3px,1px)' }, { transform: 'translate(0,0)' }
            ], { duration: 320, easing: 'ease-out' });
          }
          return;
        }
        clicks++;
        cyl[c].className = 'rr-pip spent';
        clickSfx();
        if (i == null) show(null, 'Nobody in it. The gun turns.', 'safe');
        else show(i, order.indexOf(i) < c ? 'Click. Hands it back.' : 'Click. Walks away.', 'safe');
        left.textContent = odds();
      }

      function walkAway() {
        if (over) return;
        sfx && sfx.play('ok');
        show(0, clicks === 1 ? 'Walked away after one click.' : 'Walked away after ' + clicks + ' clicks.', 'safe');
        endRound('Walked away');
      }

      // ---------- wiring ----------
      const onPick = e => {
        setShot(+e.currentTarget.closest('.rr-pick').dataset.seat, e.currentTarget.files && e.currentTarget.files[0]);
        paintSplit();
      };
      const onName = () => { nameInputs.forEach((el, i) => { seats[i].name = el.value.trim().slice(0, 18); }); paintSplit(); };
      const onPlay = () => { sfx && sfx.play('click'); screen('mode'); };
      const onMode = e => { sfx && sfx.play('click'); setMode(e.currentTarget.dataset.mode); };
      const onBack = e => { sfx && sfx.play('click'); screen(e.currentTarget.dataset.to); };
      const onSplit = e => { split = +e.currentTarget.dataset.n; paintSplit(); sfx && sfx.play('tick'); };
      const onExit = () => {
        if (walkBtn.dataset.act === 'walk') { walkAway(); return; }
        sfx && sfx.play('click');
        screen('setup');
      };
      const onSubmit = e => {
        e.preventDefault();
        onName();
        screen('play');
        load();
      };
      const onShoot = () => shoot();

      picks.forEach(p => p.querySelector('input').addEventListener('change', onPick));
      nameInputs.forEach(el => el.addEventListener('input', onName));
      playBtn.addEventListener('click', onPlay);
      modeBtns.forEach(b => b.addEventListener('click', onMode));
      backBtns.forEach(b => b.addEventListener('click', onBack));
      splitBtns.forEach(b => b.addEventListener('click', onSplit));
      shootBtn.addEventListener('click', onShoot);
      walkBtn.addEventListener('click', onExit);
      setup.addEventListener('submit', onSubmit);

      stage.classList.add('mode-multi');
      screen('title');
      idleEl().textContent = idleLine();

      return {
        destroy() {
          picks.forEach(p => p.querySelector('input').removeEventListener('change', onPick));
          nameInputs.forEach(el => el.removeEventListener('input', onName));
          playBtn.removeEventListener('click', onPlay);
          modeBtns.forEach(b => b.removeEventListener('click', onMode));
          backBtns.forEach(b => b.removeEventListener('click', onBack));
          splitBtns.forEach(b => b.removeEventListener('click', onSplit));
          shootBtn.removeEventListener('click', onShoot);
          walkBtn.removeEventListener('click', onExit);
          setup.removeEventListener('submit', onSubmit);
          dropAudio();
          for (let i = 0; i < SEATS; i++) dropShot(i);   // the faces do not outlive the tile
        }
      };
    }
  });
})();
