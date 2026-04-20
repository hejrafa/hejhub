const YT_API_KEY = 'AIzaSyDqnIX-K62SyNQp7Ei6spaTa03iRCZgJtY';
const YT_CHANNEL_ID = 'UCzhKeHDJiADSCY8uoZEub3Q';

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

async function loadSubscriberCount() {
  const el = document.getElementById('sub-count');
  if (!el) return;
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const count = data?.items?.[0]?.statistics?.subscriberCount;
    if (count) el.textContent = formatCount(parseInt(count, 10));
  } catch {}
}

async function loadLetterboxd() {
  const container = document.getElementById('letterboxd-films');
  if (!container) return;
  try {
    const rss = `https://letterboxd.com/hejrafa/rss/`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rss)}`;
    const res = await fetch(proxyUrl);
    const json = await res.json();
    let xmlText = json.contents;
    // allorigins sometimes returns a base64 data URI
    if (xmlText && xmlText.startsWith('data:')) {
      const b64 = xmlText.split(',')[1];
      xmlText = atob(b64);
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 4);

    if (!items.length) return;

    container.innerHTML = '';
    items.forEach(item => {
      const desc = item.querySelector('description')?.textContent || '';
      const imgMatch = desc.match(/src="([^"]+)"/);
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';

      const div = document.createElement('div');
      div.className = 'film-poster';
      if (imgMatch) {
        const img = document.createElement('img');
        img.src = imgMatch[1];
        img.alt = title;
        img.loading = 'lazy';
        div.appendChild(img);
      }
      container.appendChild(div);
    });
  } catch {}
}

loadSubscriberCount();
loadLetterboxd();
