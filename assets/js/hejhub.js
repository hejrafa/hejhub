const lines = [
  'touch grass.',
  'exercise.',
  'one thing.<br>at a time.',
  'cleaning.<br>as meditation.',
  'cooking.<br>as meditation.',
  'read.<br>every day.',
  'hold your<br>own joy.',
  'be thankful.',
  'respect<br>everyone.',
  'wasted happy<br>isn’t wasted.',
  'just go<br>for it.',
  'be private.<br>vibe alone.',
  'grow<br>in silence.',
  'every second<br>counts.'
];

function rotateHeadline() {
  const el = document.getElementById('dynamic-line');
  if (!el) return;

  const index = Math.floor(Math.random() * lines.length);
  el.innerHTML = lines[index];
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

function setupPhysicality() {
  const objects = Array.from(document.querySelectorAll('.tile'));
  objects.forEach(object => {
    object.addEventListener('pointermove', event => {
      const rect = object.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const px = (x - 0.5) * 2;
      const py = (y - 0.5) * 2;

      object.style.setProperty('--mx', `${Math.round(x * 100)}%`);
      object.style.setProperty('--my', `${Math.round(y * 100)}%`);
      object.style.setProperty('--rx', `${(-py * 2.4).toFixed(2)}deg`);
      object.style.setProperty('--ry', `${(px * 3.2).toFixed(2)}deg`);
    });

    object.addEventListener('pointerleave', () => {
      object.style.removeProperty('--mx');
      object.style.removeProperty('--my');
      object.style.removeProperty('--rx');
      object.style.removeProperty('--ry');
    });
  });
}

function renderGitHubDots(contributions) {
  const grid = document.getElementById('github-dots');
  if (!grid) return;

  grid.innerHTML = '';
  contributions.forEach(item => {
    const level = Math.max(0, Math.min(4, Number(item.level) || 0));
    const dot = document.createElement('span');
    dot.className = `github-dot${level ? ` is-l${level}` : ''}`;
    grid.appendChild(dot);
  });
}

async function loadGitHubDots() {
  try {
    const res = await fetch('https://github-contributions-api.jogruber.de/v4/hejrafa?y=last');
    const data = await res.json();
    const contributions = (data?.contributions || []).slice(-35);
    if (contributions.length) {
      renderGitHubDots(contributions);
    }
  } catch {}
}

function rotateYouTubeThumb() {
  const thumb = document.getElementById('youtube-thumb');
  if (!thumb) return;

  const thumbs = [
    'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
    'https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg',
    'https://i.ytimg.com/vi/hHW1oY26kxQ/hqdefault.jpg',
    'https://i.ytimg.com/vi/21X5lGlDOfg/hqdefault.jpg'
  ];

  thumb.src = thumbs[Math.floor(Math.random() * thumbs.length)];
}

async function loadYouTubeSubscriberCount() {
  const count = document.getElementById('youtube-sub-count');
  if (!count) return;

  try {
    const res = await fetch('https://api.socialcounts.org/youtube-live-subscriber-count/UCzhKeHDJiADSCY8uoZEub3Q');
    const data = await res.json();
    const value = data?.counters?.api?.subscriberCount || data?.counters?.estimation?.subscriberCount;
    if (!value) return;
    count.textContent = new Intl.NumberFormat('en', { notation: value > 9999 ? 'compact' : 'standard' }).format(value);
  } catch {}
}

function pickDifferent(items, storageKey) {
  if (!items.length) return null;
  if (items.length === 1) return items[0];

  const last = Number(localStorage.getItem(storageKey));
  let index = Math.floor(Math.random() * items.length);
  if (index === last) {
    index = (index + 1 + Math.floor(Math.random() * (items.length - 1))) % items.length;
  }
  localStorage.setItem(storageKey, String(index));
  return items[index];
}

function rotateFallbackAlbum() {
  const tile = document.querySelector('.tile-music');
  const cover = document.getElementById('album-cover');
  if (!tile || !cover) return;

  const albums = [
    {
      name: 'The Great Divide: The Last Of The Bugs',
      url: 'https://music.apple.com/us/album/the-great-divide-the-last-of-the-bugs/1894997820',
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f9/aa/69/f9aa6992-40ca-a756-85ca-b27c48f7c720/26UMGIM02802.rgb.jpg/600x600bb.jpg'
    },
    {
      name: 'Kehlani',
      url: 'https://music.apple.com/us/album/kehlani/1885055310',
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/da/ea/6c/daea6c92-0990-d691-3283-6f019c4c8529/075679584670.jpg/600x600bb.jpg'
    },
    {
      name: 'Dandelion',
      url: 'https://music.apple.com/us/album/dandelion/1895159736',
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/35/03/26350323-d656-4817-49e6-4d658af8363a/196874332917.jpg/600x600bb.jpg'
    },
    {
      name: 'OCTANE',
      url: 'https://music.apple.com/us/album/octane/1871258329',
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e8/e5/c6/e8e5c690-a958-622e-eb62-0dce6059300e/075679599360.jpg/600x600bb.jpg'
    }
  ];

  const album = pickDifferent(albums, 'hejhub:lastFallbackAlbum');
  if (!album) return;
  tile.href = album.url;
  tile.setAttribute('aria-label', `Apple Music album: ${album.name}`);
  cover.onerror = () => {
    cover.onerror = null;
    cover.src = albums[0].cover;
    cover.alt = albums[0].name;
  };
  cover.src = album.cover;
  cover.alt = album.name;
}

async function loadLetterboxd() {
  const container = document.getElementById('letterboxd-films');
  if (!container) return;
  try {
    const rss = 'https://letterboxd.com/hejrafa/rss/';
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rss)}`;
    const res = await fetch(proxyUrl);
    const json = await res.json();
    let xmlText = json.contents;
    if (xmlText && xmlText.startsWith('data:')) {
      const b64 = xmlText.split(',')[1];
      xmlText = atob(b64);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 4);
    if (!items.length) return;

    const posterClasses = ['poster-a', 'poster-b', 'poster-c', 'poster-d'];
    container.innerHTML = '';
    items.forEach((item, index) => {
      const desc = item.querySelector('description')?.textContent || '';
      const imgMatch = desc.match(/src="([^"]+)"/);
      const title = item.querySelector('title')?.textContent || '';

      const poster = document.createElement('span');
      poster.className = `poster ${posterClasses[index] || ''}`;
      if (imgMatch) {
        const img = document.createElement('img');
        img.src = imgMatch[1];
        img.alt = title;
        img.loading = 'lazy';
        poster.appendChild(img);
      }
      container.appendChild(poster);
    });
  } catch {}
}

async function loadAppleAlbum() {
  const tile = document.querySelector('.tile-music');
  const cover = document.getElementById('album-cover');
  const title = document.getElementById('album-title');
  if (!tile || !cover || !title) return;

  try {
    const res = await fetch(`https://rss.marketingtools.apple.com/api/v2/us/music/most-played/25/albums.json?t=${Date.now()}`);
    const data = await res.json();
    const albums = data?.feed?.results || [];
    const album = pickDifferent(albums.slice(0, 25), 'hejhub:lastAppleAlbum');
    if (!album) return;
    tile.href = album.url || tile.href;
    tile.setAttribute('aria-label', album.name ? `Apple Music album: ${album.name}` : 'Apple Music album');
    if (album.artworkUrl100) {
      cover.src = album.artworkUrl100.replace('100x100bb', '600x600bb');
      cover.alt = album.name || '';
    }
  } catch {}
}

async function loadBookRecommendation() {
  const tile = document.querySelector('.tile-books');
  const cover = document.getElementById('book-cover');
  const title = document.getElementById('book-title');
  if (!tile || !cover || !title) return;

  try {
    const res = await fetch('https://openlibrary.org/trending/daily.json?limit=12');
    const data = await res.json();
    const books = data?.works || [];
    const book = books[Math.floor(Math.random() * Math.min(books.length, 12))];
    if (!book) return;
    tile.setAttribute('aria-label', book.title ? `Hafenfuchs bookshop, recommended book: ${book.title}` : 'Hafenfuchs bookshop');
    const coverId = book.cover_i || book.editions?.docs?.[0]?.cover_i;
    if (coverId) {
      cover.src = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
      cover.alt = book.title || '';
    }
  } catch {}
}

rotateHeadline();
setupModeSwitch();
setupPhysicality();
loadGitHubDots();
rotateYouTubeThumb();
loadYouTubeSubscriberCount();
rotateFallbackAlbum();
loadLetterboxd();
loadAppleAlbum();
loadBookRecommendation();
