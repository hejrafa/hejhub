<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>hejrafa.com</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,300;0,7..72,400;1,7..72,300;1,7..72,400&family=Montserrat:wght@400;500;600&family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= url('assets/css/rafa.css') ?>">
</head>
<body>

  <header class="site-header">
    <a href="https://hejrafa.com" class="header-link" target="_blank" rel="noopener">
      <img src="<?= url('assets/icons/hej-logo.svg') ?>" alt="" class="header-logo" aria-hidden="true">
      <span class="header-name">hejrafa.com</span>
      <img src="<?= url('assets/icons/arrow.svg') ?>" alt="" class="header-arrow" aria-hidden="true">
    </a>
  </header>

  <section class="hero">
    <h1 class="hero-title">Every Second<br>Counts</h1>
  </section>

  <main class="bento">

    <!-- Tall YouTube card — col 1, all rows -->
    <a href="https://www.youtube.com/@hejrafa" class="card card-youtube-tall" target="_blank" rel="noopener" aria-label="YouTube channel">
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/youtube.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

    <!-- Letterboxd — col 2–3, row 1 -->
    <a href="https://letterboxd.com/hejrafa/" class="card card-letterboxd" target="_blank" rel="noopener" aria-label="Letterboxd recently watched">
      <div class="card-top">
        <span class="card-label">Recently Watched</span>
        <img src="<?= url('assets/icons/letterboxd.svg') ?>" alt="" class="card-icon-sm">
      </div>
      <div class="card-films" id="letterboxd-films">
        <div class="film-placeholder"></div>
        <div class="film-placeholder"></div>
        <div class="film-placeholder"></div>
        <div class="film-placeholder"></div>
      </div>
    </a>

    <!-- YouTube subscriber counter — col 4–5, row 1 -->
    <a href="https://www.youtube.com/@hejrafa" class="card card-sub-counter" target="_blank" rel="noopener" aria-label="YouTube subscribers">
      <div class="sub-inner">
        <span class="sub-number" id="sub-count">—</span>
        <span class="sub-label">subscribers</span>
      </div>
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/youtube.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

    <!-- Bluesky — col 2, row 2 -->
    <a href="https://bsky.app/profile/hejrafa.com" class="card card-bsky" target="_blank" rel="noopener" aria-label="Bluesky">
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/bluesky.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

    <!-- ChatGPT — col 3, row 2 -->
    <a href="https://chatgpt.com" class="card card-chat" target="_blank" rel="noopener" aria-label="ChatGPT">
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/chatgpt.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

    <!-- Pinterest — col 4, row 2 -->
    <a href="https://pinterest.com/hejrafa" class="card card-pinterest" target="_blank" rel="noopener" aria-label="Pinterest">
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/pinterest.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

    <!-- Epidemic Sound — col 5, row 2 -->
    <a href="https://www.epidemicsound.com/music/featured/" class="card card-epidemic" target="_blank" rel="noopener" aria-label="Epidemic Sound">
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/epidemic.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

    <!-- Twitch — col 2, row 3 -->
    <a href="https://twitch.tv" class="card card-twitch" target="_blank" rel="noopener" aria-label="Twitch">
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/twitch.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

    <!-- Umami — col 3, row 3 -->
    <a href="https://cloud.umami.is/analytics/eu/websites" class="card card-umami" target="_blank" rel="noopener" aria-label="Umami Analytics">
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/umami.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

    <!-- Reddit — col 4, row 3 -->
    <a href="https://www.reddit.com" class="card card-reddit" target="_blank" rel="noopener" aria-label="Reddit">
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/reddit.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

    <!-- Figma — col 5, row 3 -->
    <a href="https://www.figma.com/@hejrafa" class="card card-figma" target="_blank" rel="noopener" aria-label="Figma">
      <div class="card-icon-wrap">
        <img src="<?= url('assets/icons/figma.svg') ?>" alt="" class="card-icon">
      </div>
    </a>

  </main>

  <footer class="site-footer">
    <a href="mailto:contact@hejrafa.com" class="footer-link">
      contact@hejrafa.com
      <img src="<?= url('assets/icons/arrow.svg') ?>" alt="" class="footer-arrow" aria-hidden="true">
    </a>
  </footer>

  <script src="<?= url('assets/js/rafa.js') ?>"></script>
</body>
</html>
