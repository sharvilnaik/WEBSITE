// Experiments on home: build a tile per experiment, and only run one while it is on screen
(function () {
  const grid = document.getElementById('labGrid');
  if (!grid) return;

  // sound is on for every experiment; there is no switch to find

  // the one button under every tile. It resets by default, and an experiment can borrow it:
  // ctl.icon('play') to show a start arrow, ctl.press(fn) to take the click until it hands it back.
  const ICON = {
    reset: '<path d="M19.4 12a7.4 7.4 0 1 1-2.2-5.25"/><path d="M13.2 6.9 17.2 6.75 17.4 2.7"/>',
    play: '<path d="M8.6 5.6 18.2 12 8.6 18.4z" fill="currentColor"/>'
  };

  for (const x of window.EXPERIMENTS) {
    const tile = document.createElement('figure');
    tile.className = 'lab-tile';
    tile.innerHTML =
      `<div class="lab-stage x-${x.id}"></div>` +
      `<figcaption><div class="lab-cap"><b>${x.name}</b><span>(${x.source})</span></div>` +
      `<div class="lab-cap"><p>${x.hint}</p><button class="lab-reset" type="button" title="Reset" aria-label="Reset ${x.name}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON.reset}</svg></button></div></figcaption>`;
    grid.appendChild(tile);
    const stage = tile.querySelector('.lab-stage');
    const btn = tile.querySelector('.lab-reset');
    let api = null, press = null;

    const icon = kind => {
      const play = kind === 'play';
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (play ? ICON.play : ICON.reset) + '</svg>';
      btn.title = play ? 'Start' : 'Reset';
      btn.setAttribute('aria-label', (play ? 'Start ' : 'Reset ') + x.name);
      btn.classList.toggle('is-play', play);
    };
    const ctl = { icon, press(fn) { press = fn || null; } };

    const mount = () => { stage.innerHTML = ''; press = null; icon('reset'); try { api = x.mount(stage, ctl) || null; } catch (e) { console.error(x.id, e); } };
    const unmount = () => { if (api && api.destroy) api.destroy(); api = null; press = null; stage.innerHTML = ''; };
    btn.addEventListener('click', () => { if (press) { press(); return; } unmount(); mount(); });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !api) mount();
      else if (!e.isIntersecting && api) unmount();
    }, { rootMargin: '200px 0px' }).observe(stage);
  }
})();
