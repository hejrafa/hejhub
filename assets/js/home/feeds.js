(function () {
  const data = window.HejHubData || {};
  const home = window.HejHubHome || {};

  async function loadGitHubDots() {
    try {
      const response = await HejHub.fetchJsonCached(
        'https://github-contributions-api.jogruber.de/v4/hejrafa?y=last',
        {
          cacheKey: 'github-contributions-hejrafa-last-year',
          ttl: 30 * 60 * 1000
        }
      );
      const contributions = (response?.contributions || []).slice(-35);
      if (contributions.length) {
        home.renderGitHubDots(contributions);
      }
    } catch {}
  }

  async function loadYouTubeSubscriberCount() {
    const count = document.getElementById('youtube-sub-count');
    const channelId = data.youtubeSubscriberChannelId;
    if (!count || !channelId) return;

    try {
      const response = await HejHub.fetchJsonCached(
        `https://api.socialcounts.org/youtube-live-subscriber-count/${channelId}`,
        {
          cacheKey: `youtube-subscriber-count-${channelId}`,
          ttl: 10 * 60 * 1000
        }
      );
      const value = response?.counters?.api?.subscriberCount || response?.counters?.estimation?.subscriberCount;
      if (!value) return;
      count.textContent = new Intl.NumberFormat('en', { notation: value > 9999 ? 'compact' : 'standard' }).format(value);
    } catch {}
  }

  function rotateFallbackAlbum() {
    const tile = document.querySelector('.tile-music');
    const cover = document.getElementById('album-cover');
    const albums = data.fallbackAlbums || [];
    if (!tile || !cover || !albums.length) return;

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
      const response = await HejHub.fetchJsonCached(proxyUrl, {
        cacheKey: 'letterboxd-rss-hejrafa',
        ttl: 30 * 60 * 1000
      });
      const items = (response?.items || []).slice(0, 4);
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
      const response = await HejHub.fetchJsonCached(
        'https://rss.marketingtools.apple.com/api/v2/us/music/most-played/100/albums.json',
        {
          cacheKey: 'apple-music-most-played-us-albums-100',
          ttl: 6 * 60 * 60 * 1000
        }
      );
      const albums = response?.feed?.results || [];
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

  function applyBookRecommendation(book, fallbackBooks = data.roryShelfFallback || []) {
    const tile = document.querySelector('.tile-books');
    const cover = document.getElementById('book-cover');
    if (!tile || !cover || !book?.cover) return;

    const author = book.author ? ` by ${book.author}` : '';
    tile.href = data.roryShelfUrl || tile.href;
    tile.setAttribute('aria-label', `Rory's Bookshelf on Literal: ${book.title}${author}`);
    cover.onerror = () => {
      if (!fallbackBooks.length) return;
      cover.onerror = null;
      cover.src = fallbackBooks[0].cover;
      cover.alt = fallbackBooks[0].title;
    };
    cover.src = book.cover;
    cover.alt = book.title;
  }

  async function loadBookRecommendation() {
    const fallbackBooks = data.roryShelfFallback || [];
    applyBookRecommendation(HejHub.pickDifferent(fallbackBooks, 'hejhub:lastBook'));

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
      const response = await HejHub.fetchJsonCached('https://api.literal.club/graphql', {
        cacheKey: 'literal-rory-reading-list',
        ttl: 12 * 60 * 60 * 1000,
        init: {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ query, variables: { shelfSlug: 'rorys-reading-list-299lk23' } })
        }
      });
      const books = (response?.data?.shelf?.books || [])
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

  window.HejHubHome = {
    ...home,
    loadAppleAlbum,
    loadBookRecommendation,
    loadGitHubDots,
    loadLetterboxd,
    loadYouTubeSubscriberCount,
    rotateFallbackAlbum
  };
})();
