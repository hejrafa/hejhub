const lines = [
  'touch grass.',
  'exercise.',
  'one thing.<br>at a time.',
  'cleaning<br>is meditation.',
  'cooking<br>is meditation.',
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
  const tile = document.querySelector('.tile-youtube');
  const thumb = document.getElementById('youtube-thumb');
  if (!tile || !thumb) return;

  const creators = [
    {
      name: 'Casey Neistat',
      url: 'https://www.youtube.com/@casey',
      image: 'https://yt3.googleusercontent.com/ytc/AIdro_n4AHNRd0upuWqg3NZq4iXWP5JSbnKHh_nbzhOmgGzUc3k=s900-c-k-c0x00ffffff-no-rj'
    },
    {
      name: 'Peter McKinnon',
      url: 'https://www.youtube.com/@petermckinnon',
      image: 'https://yt3.googleusercontent.com/vFY_kQ7ck1HJksGwCaVZ7N29GPwb_RlXRPn2XxNqgw2Jbe0_gwsgw29ycWyKodpktRPSP-iA=s900-c-k-c0x00ffffff-no-rj'
    },
    {
      name: 'Trevor Noah',
      url: 'https://www.youtube.com/@trevornoah',
      image: 'https://yt3.googleusercontent.com/FsjWQR7894C-1p9vGx1uULbdjcg_oDzswdZgC0pLcaj0JHNM1-LhI7Pd3Hfz7Uq2FKd-AzLE=s900-c-k-c0x00ffffff-no-rj'
    },
    {
      name: 'James Hoffmann',
      url: 'https://www.youtube.com/@jameshoffmann',
      image: 'https://yt3.googleusercontent.com/2k3-P8cX-0sawteUmQSzaQb7pLaCOKcNtEYDEXy1y8Y5wv97Ecgzhgg50b6NYCwxm677h9bT=s900-c-k-c0x00ffffff-no-rj'
    },
    {
      name: 'Life Of Riza',
      url: 'https://www.youtube.com/@lifeofriza',
      image: 'https://yt3.googleusercontent.com/Ts7Rj0JAskdlLrY9WVVTwxik9ItY1PcbtT6rUcVLvxJTtcLOvyaB-TMQnX1b1pyJlLJQLQ5iNQ=s900-c-k-c0x00ffffff-no-rj'
    },
    {
      name: 'Marques Brownlee',
      url: 'https://www.youtube.com/@mkbhd',
      image: 'https://yt3.googleusercontent.com/qu4TmIaYUlS41-dJ9gZ7DUR3nilvmB5_11i6OKSdvNnBNiyOusZP1bMN6ICnuxtjFBb6ioKgRQ=s900-c-k-c0x00ffffff-no-rj'
    },
    {
      name: 'Simone Giertz',
      url: 'https://www.youtube.com/@simonegiertz',
      image: 'https://yt3.googleusercontent.com/ytc/AIdro_llfi-8d2Zve1U9FXZPXZsKNB9_65U5gHwKRwAoHLOUDg=s900-c-k-c0x00ffffff-no-rj'
    },
    {
      name: 'Hasan Minhaj',
      url: 'https://www.youtube.com/@hasanminhaj',
      image: 'https://yt3.googleusercontent.com/ytc/AIdro_nKqoZ48YNFUsi8MvCfiPELs8zXfCCpz1oJ4PiTO1Aol-4=s900-c-k-c0x00ffffff-no-rj'
    }
  ];

  const creator = pickDifferent(creators, 'hejhub:lastYouTubeCreator');
  if (!creator) return;

  tile.href = creator.url;
  tile.setAttribute('aria-label', `YouTube: ${creator.name}`);
  thumb.src = creator.image;
  thumb.alt = creator.name;
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
    const rss = `https://letterboxd.com/hejrafa/rss/?t=${Date.now()}`;
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    const items = (data?.items || []).slice(0, 4);
    if (!items.length) return;

    const posterClasses = ['poster-a', 'poster-b', 'poster-c', 'poster-d'];
    container.innerHTML = '';
    items.forEach((item, index) => {
      const desc = item.description || item.content || '';
      const imgMatch = desc.match(/src="([^"]+)"/);
      const title = item.title || '';

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

const roryShelfUrl = 'https://literal.club/hejrafa/shelf/rorys-reading-list-299lk23';
const roryShelfFallback = [
  { title: 'Sexus', author: 'Henry Miller', cover: 'https://assets.literal.club/4/ckr1tdamn0znc01cr2z688eqw.jpg' },
  { title: 'In Cold Blood', author: 'Truman Capote', cover: 'https://assets.literal.club/4/ckmauh7bi20171kjatnt6hlsd.jpg' },
  { title: 'The Year of Magical Thinking', author: 'Joan Didion', cover: 'https://assets.literal.club/4/ckp41n1md133091gjssislev08.jpg' },
  { title: 'Leaves of Grass', author: 'Walt Whitman', cover: 'https://assets.literal.club/cover/2/cljzzpb6q4967600ihujd7q0shl.jpg' },
  { title: 'A Heartbreaking Work of Staggering Genius', author: 'Dave Eggers', cover: 'https://assets.literal.club/4/ckpzytuzd1631691rjm6g83vsiv.jpg' },
  { title: 'A Girl from Yamhill', author: 'Beverly Cleary', cover: 'https://assets.literal.club/2/cktn9z5a31172691yz7amtmet7lu.jpg' },
  { title: 'The curious incident of the dog in the night-time', author: 'Mark Haddon', cover: 'https://assets.literal.club/4/ckmauj1au26651ijangrlpq96.jpg' },
  { title: 'Tender Is the Night', author: 'F. Scott Fitzgerald', cover: 'https://assets.literal.club/4/ckqi3rz4c131431j5zxucs46sn.jpg' },
  { title: 'The Snows of Kilimanjaro and Other Stories', author: 'Ernest Hemingway', cover: 'https://assets.literal.club/4/ckr1v8bx81k1m01crt00017cn.jpg' },
  { title: 'Northanger Abbey', author: 'Jane Austen', cover: 'https://assets.literal.club/4/ckr1sqf0i0szw01crrgui4z2x.jpg' },
  { title: 'Atonement', author: 'Ian McEwan', cover: 'https://assets.literal.club/4/ckmauj3sn29021ija7iu2it3t.jpg' },
  { title: 'In Search of Lost Time', author: 'Marcel Proust', cover: 'https://assets.literal.club/4/ckr1t6myx0xue01crf0ugu7h0.jpg' },
  { title: 'The Holy Barbarians', author: 'Lawrence Lipton', cover: 'https://assets.literal.club/2/ckt4ly9md1163929l77a5f7grup9.jpg' },
  { title: 'Europe Through the Back Door', author: 'Rick Steves', cover: 'https://assets.literal.club/cover/4/clo8nqrl04903090hgdhta84kf0.jpg' },
  { title: 'Letters to a young poet', author: 'Rainer Maria Rilke', cover: 'https://assets.literal.club/cover/5/ckr1s8wje0nw901crnl0zo02z.jpg' }
];

function applyBookRecommendation(book, fallbackBooks = roryShelfFallback) {
  const tile = document.querySelector('.tile-books');
  const cover = document.getElementById('book-cover');
  const title = document.getElementById('book-title');
  if (!tile || !cover || !title) return;
  if (!book?.cover) return;

  const author = book.author ? ` by ${book.author}` : '';
  tile.href = roryShelfUrl;
  tile.setAttribute('aria-label', `Rory's Bookshelf on Literal: ${book.title}${author}`);
  cover.onerror = () => {
    cover.onerror = null;
    cover.src = fallbackBooks[0].cover;
    cover.alt = fallbackBooks[0].title;
  };
  cover.src = book.cover;
  cover.alt = book.title;
}

async function loadBookRecommendation() {
  applyBookRecommendation(pickDifferent(roryShelfFallback, 'hejhub:lastBook'));

  try {
    const query = `query getShelfBySlug($shelfSlug: String!) {
      shelf(where: { slug: $shelfSlug }) {
        books {
          title
          cover
          authors { name }
        }
      }
    }`;
    const res = await fetch('https://api.literal.club/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { shelfSlug: 'rorys-reading-list-299lk23' } })
    });
    const data = await res.json();
    const books = (data?.data?.shelf?.books || [])
      .filter(book => book.cover)
      .map(book => ({
        title: book.title,
        author: book.authors?.map(author => author.name).join(', '),
        cover: book.cover
      }));

    if (books.length) {
      applyBookRecommendation(pickDifferent(books, 'hejhub:lastBook'), books);
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
