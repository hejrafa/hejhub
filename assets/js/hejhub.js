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
  HejHub.pickLine('dynamic-line', lines, { storageKey: 'hejhub:lastHeadline' });
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

async function loadGitHubDots() {
  try {
    const data = await HejHub.fetchJsonCached(
      'https://github-contributions-api.jogruber.de/v4/hejrafa?y=last',
      {
        cacheKey: 'github-contributions-hejrafa-last-year',
        ttl: 30 * 60 * 1000
      }
    );
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

  const creator = HejHub.pickDifferent(creators, 'hejhub:lastYouTubeCreator');
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
    const data = await HejHub.fetchJsonCached(
      'https://api.socialcounts.org/youtube-live-subscriber-count/UCzhKeHDJiADSCY8uoZEub3Q',
      {
        cacheKey: 'youtube-subscriber-count-UCzhKeHDJiADSCY8uoZEub3Q',
        ttl: 10 * 60 * 1000
      }
    );
    const value = data?.counters?.api?.subscriberCount || data?.counters?.estimation?.subscriberCount;
    if (!value) return;
    count.textContent = new Intl.NumberFormat('en', { notation: value > 9999 ? 'compact' : 'standard' }).format(value);
  } catch {}
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

  const album = HejHub.pickDifferent(albums, 'hejhub:lastFallbackAlbum');
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
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;
    const data = await HejHub.fetchJsonCached(proxyUrl, {
      cacheKey: 'letterboxd-rss-hejrafa',
      ttl: 30 * 60 * 1000
    });
    const items = (data?.items || []).slice(0, 4);
    if (!items.length) return;

    const posterClasses = ['poster-a', 'poster-b', 'poster-c', 'poster-d'];
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const desc = item.description || item.content || '';
      const doc = new DOMParser().parseFromString(desc, 'text/html');
      const posterImage = doc.querySelector('img');
      const title = item.title || '';

      const poster = document.createElement('span');
      poster.className = `poster ${posterClasses[index] || ''}`;
      if (posterImage?.src) {
        const img = document.createElement('img');
        img.src = posterImage.src;
        img.alt = title;
        img.loading = 'lazy';
        poster.appendChild(img);
      }
      fragment.appendChild(poster);
    });
    container.replaceChildren(fragment);
  } catch {}
}

async function loadAppleAlbum() {
  const tile = document.querySelector('.tile-music');
  const cover = document.getElementById('album-cover');
  if (!tile || !cover) return;

  try {
    const data = await HejHub.fetchJsonCached(
      'https://rss.marketingtools.apple.com/api/v2/us/music/most-played/100/albums.json',
      {
        cacheKey: 'apple-music-most-played-us-albums-100',
        ttl: 6 * 60 * 60 * 1000
      }
    );
    const albums = data?.feed?.results || [];
    const album = HejHub.pickDifferent(albums.slice(0, 100), 'hejhub:lastAppleAlbum');
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
  if (!tile || !cover) return;
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
  applyBookRecommendation(HejHub.pickDifferent(roryShelfFallback, 'hejhub:lastBook'));

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
    const data = await HejHub.fetchJsonCached('https://api.literal.club/graphql', {
      cacheKey: 'literal-rory-reading-list',
      ttl: 12 * 60 * 60 * 1000,
      init: {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables: { shelfSlug: 'rorys-reading-list-299lk23' } })
      }
    });
    const books = (data?.data?.shelf?.books || [])
      .filter(book => book.cover)
      .map(book => ({
        title: book.title,
        author: book.authors?.map(author => author.name).join(', '),
        cover: book.cover
      }));

    if (books.length) {
      applyBookRecommendation(HejHub.pickDifferent(books, 'hejhub:lastBook'), books);
    }
  } catch {}
}

rotateHeadline();
setupModeSwitch();
HejHub.setupPhysicality('.tile');
rotateYouTubeThumb();
rotateFallbackAlbum();

Promise.allSettled([
  loadGitHubDots(),
  loadYouTubeSubscriberCount(),
  loadLetterboxd(),
  loadAppleAlbum(),
  loadBookRecommendation()
]);
