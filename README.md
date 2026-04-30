# hejhub

A personal link hub for `hejhub.com`: fast, tactile, and a little playful. The site is a static root page with two modes:

- `consume` for watching, reading, listening, and browsing.
- `create` for publishing, designing, analytics, code, and tools.

It is intentionally lightweight: plain HTML, CSS, and JavaScript. No build step, no framework, no package install.

## Local Preview

Run a local static server from the repo root:

```sh
python3 -m http.server 8080
```

Then open:

```txt
http://127.0.0.1:8080/
```

The included Claude launch config also points at this repo for local PHP serving on port `8765`.

## Structure

```txt
index.html              Root page markup
CNAME                   GitHub Pages custom domain
assets/css/hejhub.css   Layout, tile system, typography, animations
assets/js/hejhub.js     Mode switching, dynamic headlines, dynamic tile data
assets/icons/           Local service/logo assets
assets/images/          Image assets
```

## Design Notes

- Display type uses **Redaction**.
- The page uses a bento tile layout with physical hover movement.
- The headline changes once on reload, not constantly.
- The mode toggle switches between consume/create sections and also changes the page color mood.
- The `hej` logo is used as the page logo and favicon.

## Dynamic Tiles

Some tiles enhance themselves with public data when available:

- Letterboxd: pulls recent watched posters from `https://letterboxd.com/hejrafa/rss/` through AllOrigins.
- YouTube consume: rotates a small set of thumbnail images and links to subscriptions.
- YouTube create: pulls public subscriber count for channel `UCzhKeHDJiADSCY8uoZEub3Q`.
- Apple Music: pulls album artwork from Apple Marketing Tools RSS, with local fallbacks.
- Books: pulls trending cover art from Open Library and links to Hafenfuchs.
- GitHub: pulls recent contribution levels and renders the last 35 days as dots.

If an API fails, the page keeps its fallback content.

## Deployment

This repo is ready for GitHub Pages. The custom domain is set via:

```txt
CNAME -> hejhub.com
```

For GitHub Pages, serve from the repository root on the `main` branch.

## Editing

After changing CSS or JS, bump the cache query in `index.html`:

```html
/assets/css/hejhub.css?v=...
/assets/js/hejhub.js?v=...
```

That keeps browsers from holding onto stale versions during quick visual iteration.
