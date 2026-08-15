(function () {
  const data = window.HejHubData || {};
  const home = window.HejHubHome || {};

  function rotateHeadline() {
    HejHub.pickLine('dynamic-line', data.headlines || [], { storageKey: 'hejhub:lastHeadline' });
  }

  function setupModeSwitch() {
    const switcher = document.querySelector('.mode-switch');
    const buttons = Array.from(document.querySelectorAll('.mode-button'));
    const panels = Array.from(document.querySelectorAll('[data-panel]'));
    if (!switcher || !buttons.length || !panels.length) return;

    document.body.dataset.mode = switcher.dataset.mode || 'consume';

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const mode = button.dataset.mode;
        switcher.dataset.mode = mode;
        document.body.dataset.mode = mode;

        buttons.forEach(item => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        panels.forEach(panel => {
          const active = panel.dataset.panel === mode;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
          if (active) {
            panel.querySelectorAll('.tile').forEach(tile => {
              tile.style.animation = 'none';
              tile.offsetHeight;
              tile.style.animation = '';
            });
          }
        });
      });
    });
  }

  function renderGitHubDots(contributions) {
    const grid = document.getElementById('github-dots');
    if (!grid) return;

    const fragment = document.createDocumentFragment();
    contributions.forEach(item => {
      const level = Math.max(0, Math.min(4, Number(item.level) || 0));
      const dot = document.createElement('span');
      dot.className = `github-dot${level ? ` is-l${level}` : ''}`;
      fragment.appendChild(dot);
    });
    grid.replaceChildren(fragment);
  }

  function rotateYouTubeThumb() {
    const tile = document.querySelector('.tile-youtube');
    const thumb = document.getElementById('youtube-thumb');
    if (!tile || !thumb) return;

    const creator = HejHub.pickDifferent(data.youtubeCreators || [], 'hejhub:lastYouTubeCreator');
    if (!creator) return;

    tile.setAttribute('aria-label', `YouTube home; featured creator: ${creator.name}`);
    thumb.src = creator.image;
    thumb.alt = creator.name;
  }

  window.HejHubHome = {
    ...home,
    renderGitHubDots,
    rotateHeadline,
    rotateYouTubeThumb,
    setupModeSwitch
  };
})();
