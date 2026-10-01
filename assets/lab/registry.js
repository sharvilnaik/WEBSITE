// Experiments: each experiment file pushes itself onto this list; lab.js mounts them
window.EXPERIMENTS = window.EXPERIMENTS || [];
window.REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sound for the experiments: every sound is made in the browser (no audio files). It is always on.
// Experiments call LAB_SFX.play('name'), or LAB_SFX.hum() for a tone they hold and bend while something charges.
window.LAB_SFX = (function () {
  let on = true, ctx = null, master = null, noiseBuf = null;   // on by default, and nothing remembers it off
  const listeners = new Set();

  function boot() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  const ready = () => on && boot() && ctx.state !== 'closed';

  // one note: an oscillator with a quick attack and a decay, optionally gliding to another pitch
  function tone(f, t, dur, o) {
    o = o || {};
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.glide || dur));
    const v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.out || master);
    osc.start(t); osc.stop(t + dur + 0.02);
  }
  // a burst of filtered noise: clicks, whooshes, cracks
  function noise(t, dur, o) {
    o = o || {};
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true;
    f.type = o.filter || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.f || 2000, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  }

  let wakaFlip = false;
  const SOUNDS = {
    // small interface sounds
    tick: t => noise(t, 0.03, { f: 3200, q: 4, vol: 0.35 }),
    click: t => { noise(t, 0.025, { f: 1800, q: 2, vol: 0.4 }); tone(900, t, 0.03, { type: 'square', vol: 0.05 }); },
    pop: t => tone(420, t, 0.12, { to: 880, glide: 0.06, vol: 0.25 }),
    clunk: t => { tone(140, t, 0.16, { to: 70, vol: 0.45, type: 'triangle' }); noise(t, 0.06, { f: 600, q: 1, vol: 0.25 }); },
    ok: t => { tone(784, t, 0.18, { vol: 0.2, type: 'triangle' }); tone(1175, t + 0.09, 0.3, { vol: 0.2, type: 'triangle' }); },
    bad: t => { tone(180, t, 0.14, { type: 'square', vol: 0.09 }); tone(180, t + 0.18, 0.2, { type: 'square', vol: 0.09 }); },
    swoosh: t => noise(t, 0.22, { f: 700, to: 3800, q: 1.4, vol: 0.28, attack: 0.05 }),
    slice: t => { noise(t, 0.09, { f: 5200, q: 3, vol: 0.4 }); noise(t + 0.02, 0.2, { f: 900, to: 300, q: 1, vol: 0.25 }); tone(260, t + 0.01, 0.12, { to: 120, vol: 0.2, type: 'triangle' }); },
    type: t => noise(t, 0.02, { f: 2600 + Math.random() * 900, q: 6, vol: 0.28 }),
    // Pac-Man: chomp, a rising alarm, the fall, the win
    waka: t => { wakaFlip = !wakaFlip; tone(wakaFlip ? 520 : 300, t, 0.09, { to: wakaFlip ? 300 : 520, type: 'triangle', vol: 0.16 }); },
    alarm: t => { for (let i = 0; i < 3; i++) tone(500, t + i * 0.12, 0.11, { to: 900, type: 'square', vol: 0.06 }); },
    fall: t => { for (let i = 0; i < 6; i++) tone(700 - i * 90, t + i * 0.11, 0.12, { to: 560 - i * 90, type: 'triangle', vol: 0.18 }); },
    win: t => [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.075, 0.22, { type: 'square', vol: 0.07 })),
    // Zelda chest: a rising sparkle as the lid opens
    open: t => {
      [392, 494, 587, 784, 988].forEach((f, i) => tone(f, t + i * 0.07, 0.4, { type: 'triangle', vol: 0.16 }));
      for (let i = 0; i < 8; i++) tone(2400 + Math.random() * 1800, t + 0.35 + i * 0.05, 0.12, { vol: 0.05 });
    },
    // Back to the Future: the flash and the power failing
    zap: t => { noise(t, 0.5, { f: 4000, to: 200, q: 0.6, vol: 0.5, filter: 'lowpass' }); tone(90, t, 0.7, { to: 40, type: 'sawtooth', vol: 0.25 }); tone(1800, t, 0.25, { to: 200, type: 'square', vol: 0.05 }); },
    fizzle: t => { for (let i = 0; i < 7; i++) noise(t + i * 0.06 + Math.random() * 0.04, 0.04, { f: 1200 + Math.random() * 3000, q: 5, vol: 0.3 }); tone(300, t, 0.6, { to: 60, type: 'sawtooth', vol: 0.08 }); },
    // DB Cooper: the door, the wind, the chute
    wind: t => noise(t, 1.6, { f: 400, to: 1400, q: 0.7, vol: 0.22, attack: 0.3 }),
    chute: t => noise(t, 0.25, { f: 250, q: 0.8, vol: 0.45, filter: 'lowpass' })
  };

  function play(name, delay) {
    if (!ready() || !SOUNDS[name]) return;
    if (ctx.state === 'suspended') ctx.resume();
    SOUNDS[name](ctx.currentTime + 0.005 + (delay || 0) / 1000);
  }

  // a held tone that an experiment bends with set(0..1) and ends with stop()
  function hum(o) {
    o = o || {};
    const lo = o.from || 110, hi = o.to || 660;
    if (!ready()) return { set() {}, stop() {} };
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator(), osc2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    osc.type = o.type || 'sawtooth'; osc2.type = 'sine';
    osc.frequency.value = lo; osc2.frequency.value = lo * 2.01;
    f.type = 'lowpass'; f.frequency.value = 600; f.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.08, t + 0.08);
    osc.connect(f); osc2.connect(f); f.connect(g); g.connect(master);
    osc.start(t); osc2.start(t);
    let done = false;
    return {
      set(v) {
        if (done) return;
        const n = ctx.currentTime, fr = lo * Math.pow(hi / lo, Math.max(0, Math.min(1, v)));
        osc.frequency.setTargetAtTime(fr, n, 0.03); osc2.frequency.setTargetAtTime(fr * 2.01, n, 0.03);
        f.frequency.setTargetAtTime(500 + v * 3500, n, 0.03);
      },
      stop() {
        if (done) return; done = true;
        const n = ctx.currentTime;
        g.gain.cancelScheduledValues(n); g.gain.setTargetAtTime(0.0001, n, 0.04);
        osc.stop(n + 0.3); osc2.stop(n + 0.3);
      }
    };
  }

  function set(v) {
    on = !!v;
    if (on) { boot(); if (ctx && ctx.state === 'suspended') ctx.resume(); play('pop'); }
    else if (ctx) ctx.suspend();
    listeners.forEach(fn => fn(on));
  }

  // for an experiment that builds its own instrument: the context and the output it should connect to, or null when sound is off
  function audio() {
    if (!ready()) return null;
    if (ctx.state === 'suspended') ctx.resume();
    return { ctx, out: master, noise: noiseBuf };
  }

  return { play, hum, audio, set, isOn: () => on, onChange: fn => listeners.add(fn), offChange: fn => listeners.delete(fn) };
})();
