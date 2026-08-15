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
    const albums = data.fallbackAlbums || [];
    if (!albums.length) return;

    const album = HejHub.pickDifferent(albums, 'hejhub:lastFallbackAlbum');
    applyAlbum(album, albums);
  }

  function applyAlbum(album, fallbackAlbums = data.fallbackAlbums || []) {
    const tile = document.querySelector('.tile-music');
    const cover = document.getElementById('album-cover');
    if (!tile || !cover || !album?.name || !album?.cover) return;

    const artist = album.artist ? ` by ${album.artist}` : '';
    tile.href = album.url || tile.href;
    tile.setAttribute('aria-label', `Apple Music album: ${album.name}${artist}`);
    cover.onerror = () => {
      const fallback = fallbackAlbums[0];
      cover.onerror = null;
      if (!fallback?.cover) return;
      cover.src = fallback.cover;
      cover.alt = fallback.name || '';
    };
    cover.src = album.cover;
    cover.alt = album.name;
  }

  function appleArtworkUrl(url) {
    return String(url || '').replace(/\/\d+x\d+bb\.(?:jpg|png)$/i, '/600x600bb.jpg');
  }

  function recentAppleAlbums(entries) {
    const albums = Array.from(entries || []).map(entry => ({
      artist: entry?.['im:artist']?.label,
      cover: appleArtworkUrl(entry?.['im:image']?.at(-1)?.label),
      name: entry?.['im:name']?.label,
      releaseDate: entry?.['im:releaseDate']?.label,
      url: entry?.link?.attributes?.href
    })).filter(album => album.name && album.cover && album.url);

    const newestAllowedAge = 90 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - newestAllowedAge;
    const recent = albums.filter(album => {
      const releasedAt = Date.parse(album.releaseDate || '');
      return Number.isFinite(releasedAt) && releasedAt >= cutoff;
    });

    return recent.length >= 8 ? recent : albums;
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
    if (!document.querySelector('.tile-music')) return;

    try {
      const response = await HejHub.fetchJsonCached(
        'https://itunes.apple.com/us/rss/topalbums/limit=100/json',
        {
          cacheKey: 'apple-music-recent-top-albums-us-100-v2',
          ttl: 6 * 60 * 60 * 1000
        }
      );
      const albums = recentAppleAlbums(response?.feed?.entry);
      const album = HejHub.pickDifferent(albums, 'hejhub:lastRecentAppleAlbum');
      applyAlbum(album);
    } catch {}
  }

  function applyBookRecommendation(book, fallbackBooks = data.featuredBooks || []) {
    const tile = document.querySelector('.tile-books');
    const cover = document.getElementById('book-cover');
    if (!tile || !cover || !book?.title || !book?.cover) return;

    const author = book.author ? ` by ${book.author}` : '';
    const recognition = book.recognition ? `${book.recognition}: ` : 'Fresh book: ';
    tile.href = book.url || tile.href;
    tile.setAttribute('aria-label', `${recognition}${book.title}${author}`);
    cover.onerror = () => {
      const fallback = fallbackBooks.find(candidate => candidate?.cover && candidate.cover !== book.cover);
      cover.onerror = null;
      if (!fallback) return;
      cover.src = fallback.cover;
      cover.alt = `${fallback.title}${fallback.author ? ` by ${fallback.author}` : ''}`;
    };
    cover.src = book.cover;
    cover.alt = `${book.title}${author}`;
  }

  function appleBookArtworkUrl(url) {
    return String(url || '').replace(/\/\d+x\d+bb\.(?:jpg|png)$/i, '/600x600bb.jpg');
  }

  async function loadBookRecommendation() {
    const featuredBooks = data.featuredBooks || [];
    const selectedBook = HejHub.pickDifferent(featuredBooks, 'hejhub:lastFeaturedBook');
    if (!selectedBook) return;

    applyBookRecommendation(selectedBook, featuredBooks);

    try {
      const term = encodeURIComponent(`${selectedBook.title} ${selectedBook.author || ''}`.trim());
      const response = await HejHub.fetchJsonCached(
        `https://itunes.apple.com/search?term=${term}&entity=ebook&country=us&limit=10`,
        {
          cacheKey: `apple-books-${selectedBook.title}-${selectedBook.author || ''}`,
          ttl: 7 * 24 * 60 * 60 * 1000
        }
      );
      const expectedTitle = selectedBook.title.toLocaleLowerCase('en');
      const expectedAuthor = String(selectedBook.author || '').toLocaleLowerCase('en');
      const results = Array.from(response?.results || []);
      const exactMatch = results.find(result => {
        const resultTitle = String(result?.trackName || '').toLocaleLowerCase('en');
        const titleMatches = resultTitle === expectedTitle || resultTitle.startsWith(`${expectedTitle} (`);
        const authorMatches = !expectedAuthor || String(result?.artistName || '').toLocaleLowerCase('en').includes(expectedAuthor);
        return titleMatches && authorMatches;
      });
      if (!exactMatch?.artworkUrl100 || !exactMatch?.trackViewUrl) return;

      applyBookRecommendation({
        ...selectedBook,
        author: exactMatch.artistName || selectedBook.author,
        cover: appleBookArtworkUrl(exactMatch.artworkUrl100),
        title: exactMatch.trackName || selectedBook.title,
        url: exactMatch.trackViewUrl
      }, featuredBooks);
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
