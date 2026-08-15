# hejhub

A personal link hub for `hejhub.com`: fast, tactile, and a little playful. The site is a static root page with two modes:

- `consume` for watching, reading, listening, and browsing.
- `create` for publishing, designing, analytics, code, and tools.

It is intentionally lightweight: plain HTML, CSS, and JavaScript served from the repo root, with a tiny Ruby build step for shared metadata and tile data. No framework or package install.

## Local Preview

Run a local static server from the repo root:

```sh
ruby tools/build_site.rb
python3 -m http.server 8080
```

Then open:

```txt
http://127.0.0.1:8080/
```

The included Claude launch config also points at this repo for local PHP serving on port `8765`.

## Build

Shared content, SEO metadata, favicon versions, tile links, dynamic feed fallbacks, and sitemap entries live in:

```txt
src/data/site.json
```

After changing that file, rebuild the generated static files:

```sh
ruby tools/build_site.rb
```

The build writes `index.html`, `phrase/index.html`, `404.html`, `assets/js/home-data.js`, `assets/css/home.css`, `robots.txt`, and `sitemap.xml`.

## Structure

```txt
index.html              Generated root page markup
404.html                Generated 404 page
CNAME                   GitHub Pages custom domain
src/data/site.json      Shared site, page, tile, feed, SEO, and sitemap data
tools/build_site.rb     Ruby static file generator
assets/css/core.css     Shared typography, shell, controls, tile base, animations
assets/css/home.css     Generated homepage CSS import manifest
assets/css/home/        Homepage CSS split by layout, consume, create, responsive
assets/css/work.css     Phrase work page layout
assets/css/error.css    404 page layout
assets/js/shared.js     Shared cached fetch, random pick, and hover helpers
assets/js/home-data.js  Generated homepage data for the browser
assets/js/home/         Homepage UI and feed modules
assets/js/hejhub.js     Homepage initializer
assets/icons/           Local service/logo assets
assets/images/          Image assets
phrase/index.html       Generated Phrase work links page
```

## Design Notes

- Display type uses **Redaction**.
- The page uses a bento tile layout with physical hover movement.
- The headline changes once on reload, not constantly.
- The mode toggle switches between consume/create sections and also changes the page color mood.
- The `hej` logo is used as the page logo and favicon.

## Dynamic Tiles

Some tiles enhance themselves with public data when available:

- Letterboxd: pulls recent watched posters from `https://letterboxd.com/hejrafa/rss/` through rss2json.
- YouTube consume: opens the YouTube homepage while rotating through a curated set of favorite creator channel images.
- YouTube create: pulls public subscriber count for channel `UCzhKeHDJiADSCY8uoZEub3Q`.
- Apple Music: rotates recent charting releases from Apple's Top Albums RSS feed, with local fallbacks.
- Books: rotates the current English-language Booker Prize longlist, links to each official Booker book page, and refreshes cover artwork through Apple Books Search. A weekly GitHub Action checks Booker's official feed and rebuilds the site when a new longlist is announced.
- GitHub: pulls recent contribution levels and renders the last 35 days as dots.

Dynamic JSON requests are cached briefly in `localStorage` and reuse stale data if a public API is slow or unavailable. If no cached response exists, the page keeps its fallback content from `src/data/site.json`.

## Deployment

This repo is ready for GitHub Pages. The custom domain is set via:

```txt
CNAME -> hejhub.com
```

For GitHub Pages, serve from the repository root on the `main` branch.

## Editing

When changing CSS, JS, generated data, or metadata, bump `assetVersion` in `src/data/site.json` and run the build. When changing favicon files, bump `faviconVersion` in the same file. That keeps browsers from holding onto stale versions during quick visual iteration.
