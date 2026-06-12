#!/usr/bin/env ruby
# frozen_string_literal: true

require 'cgi'
require 'fileutils'
require 'json'
require 'pathname'

ROOT = Pathname.new(__dir__).parent
DATA_PATH = ROOT.join('src/data/site.json')

DATA = JSON.parse(DATA_PATH.read)

def h(value)
  CGI.escapeHTML(value.to_s)
end

def html_attr(value)
  h(value)
end

def relative_prefix(output_path)
  dir = File.dirname(output_path)
  return '' if dir == '.'

  '../' * dir.split('/').length
end

def asset_path(path, prefix)
  return path if path.start_with?('http://', 'https://', '/')

  "#{prefix}#{path}"
end

def versioned_asset(path, prefix)
  "#{asset_path(path, prefix)}?v=#{DATA.fetch('assetVersion')}"
end

def title_html(lines)
  Array(lines).map { |line| h(line) }.join('<br>')
end

def write_file(path, content)
  absolute = ROOT.join(path)
  FileUtils.mkdir_p(absolute.dirname)
  absolute.write(content)
end

def person_schema
  person = DATA.fetch('person')
  {
    '@type' => 'Person',
    '@id' => person.fetch('id'),
    'name' => person.fetch('name'),
    'alternateName' => person.fetch('alternateName'),
    'url' => person.fetch('url'),
    'image' => person.fetch('image'),
    'email' => person.fetch('email'),
    'jobTitle' => person.fetch('jobTitle'),
    'description' => person.fetch('description'),
    'address' => {
      '@type' => 'PostalAddress',
      'addressLocality' => person.fetch('address').fetch('locality'),
      'addressCountry' => person.fetch('address').fetch('country')
    },
    'worksFor' => {
      '@type' => 'Organization',
      'name' => person.fetch('worksFor').fetch('name'),
      'url' => person.fetch('worksFor').fetch('url')
    },
    'sameAs' => person.fetch('sameAs')
  }
end

def json_ld(page)
  site = DATA.fetch('site')
  graph = [
    person_schema,
    {
      '@type' => 'WebSite',
      '@id' => "#{site.fetch('url')}#website",
      'name' => site.fetch('name'),
      'url' => site.fetch('url'),
      'description' => site.fetch('description'),
      'publisher' => {
        '@id' => DATA.fetch('person').fetch('id')
      }
    },
    {
      '@type' => 'WebPage',
      '@id' => "#{page.fetch('canonical')}#webpage",
      'name' => page.fetch('title'),
      'url' => page.fetch('canonical'),
      'description' => page.fetch('description'),
      'inLanguage' => 'en',
      'dateModified' => page.fetch('dateModified'),
      'isPartOf' => {
        '@id' => "#{site.fetch('url')}#website"
      },
      'author' => {
        '@id' => DATA.fetch('person').fetch('id')
      },
      'primaryImageOfPage' => {
        '@type' => 'ImageObject',
        'url' => site.fetch('image')
      }
    }
  ]

  JSON.pretty_generate('@context' => 'https://schema.org', '@graph' => graph)
end

def render_head(page, prefix:, structured_data: true)
  site = DATA.fetch('site')
  favicon_version = DATA.fetch('faviconVersion')
  lines = []
  lines << '<head>'
  lines << '  <meta charset="utf-8">'
  lines << '  <meta name="viewport" content="width=device-width, initial-scale=1">'
  lines << '  <meta name="color-scheme" content="light">'
  lines << "  <title>#{h(page.fetch('title'))}</title>"
  lines << "  <meta name=\"description\" content=\"#{html_attr(page.fetch('description'))}\">"
  lines << "  <meta name=\"author\" content=\"#{html_attr(DATA.fetch('person').fetch('name'))}\">"
  lines << "  <meta name=\"robots\" content=\"#{html_attr(page.fetch('robots'))}\">"
  lines << "  <link rel=\"canonical\" href=\"#{html_attr(page.fetch('canonical'))}\">"

  unless page.fetch('robots').start_with?('noindex')
    lines << '  <meta property="og:type" content="website">'
    lines << "  <meta property=\"og:site_name\" content=\"#{html_attr(site.fetch('name'))}\">"
    lines << "  <meta property=\"og:title\" content=\"#{html_attr(page.fetch('title'))}\">"
    lines << "  <meta property=\"og:description\" content=\"#{html_attr(page.fetch('description'))}\">"
    lines << "  <meta property=\"og:url\" content=\"#{html_attr(page.fetch('canonical'))}\">"
    lines << "  <meta property=\"og:image\" content=\"#{html_attr(site.fetch('image'))}\">"
    lines << "  <meta property=\"og:image:alt\" content=\"#{html_attr(site.fetch('imageAlt'))}\">"
    lines << '  <meta name="twitter:card" content="summary_large_image">'
    lines << "  <meta name=\"twitter:title\" content=\"#{html_attr(page.fetch('title'))}\">"
    lines << "  <meta name=\"twitter:description\" content=\"#{html_attr(page.fetch('description'))}\">"
    lines << "  <meta name=\"twitter:image\" content=\"#{html_attr(site.fetch('image'))}\">"
  end

  lines << "  <link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"/apple-touch-icon.png?v=#{favicon_version}\">"
  lines << "  <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"/favicon-32x32.png?v=#{favicon_version}\">"
  lines << "  <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicon-16x16.png?v=#{favicon_version}\">"
  lines << "  <link rel=\"icon\" href=\"/favicon.ico?v=#{favicon_version}\" sizes=\"any\">"
  lines << "  <link rel=\"shortcut icon\" href=\"/favicon.ico?v=#{favicon_version}\">"
  lines << "  <link rel=\"icon\" href=\"/favicon.svg?v=#{favicon_version}\" type=\"image/svg+xml\">"
  lines << '  <link rel="preconnect" href="https://fonts.googleapis.com">'
  lines << '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  lines << '  <link rel="preconnect" href="https://cdn.jsdelivr.net">'
  lines << '  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@500;600;800;900&display=swap" rel="stylesheet">'

  Array(page['stylesheetPaths']).each do |path|
    lines << "  <link rel=\"stylesheet\" href=\"#{html_attr(versioned_asset(path, prefix))}\">"
  end

  if structured_data
    lines << '  <script type="application/ld+json">'
    json_ld(page).each_line do |line|
      lines << "  #{line.chomp}"
    end
    lines << '  </script>'
  end

  lines << '</head>'
  lines.join("\n")
end

def render_tile(tile, prefix:)
  lines = []
  lines << "          <a class=\"tile #{html_attr(tile.fetch('className'))}\" href=\"#{html_attr(tile.fetch('href'))}\" target=\"_blank\" rel=\"noopener\" aria-label=\"#{html_attr(tile.fetch('ariaLabel'))}\">"
  lines << "            <span class=\"tile-kicker\">#{h(tile.fetch('kicker'))}</span>"

  case tile['kind']
  when 'posterStack'
    lines << "            <div class=\"poster-stack\" id=\"#{html_attr(tile.fetch('id'))}\">"
    tile.fetch('posters').each do |poster|
      lines << "              <span class=\"poster #{html_attr(poster.fetch('className'))}\"><img src=\"#{html_attr(poster.fetch('src'))}\" alt=\"#{html_attr(poster.fetch('alt'))}\"></span>"
    end
    lines << '            </div>'
  when 'youtubeThumb'
    lines << "            <img class=\"youtube-thumb\" id=\"#{html_attr(tile.fetch('thumbId'))}\" src=\"#{html_attr(tile.fetch('thumbSrc'))}\" alt=\"#{html_attr(tile.fetch('thumbAlt'))}\">"
  when 'album'
    lines << "            <img class=\"album-cover\" id=\"#{html_attr(tile.fetch('coverId'))}\" src=\"#{html_attr(tile.fetch('coverSrc'))}\" alt=\"#{html_attr(tile.fetch('coverAlt'))}\">"
  when 'book'
    lines << "            <img class=\"book-cover\" id=\"#{html_attr(tile.fetch('coverId'))}\" src=\"#{html_attr(tile.fetch('coverSrc'))}\" alt=\"#{html_attr(tile.fetch('coverAlt'))}\">"
  end

  if tile['countId']
    lines << "            <span class=\"create-count\" id=\"#{html_attr(tile.fetch('countId'))}\">#{h(tile.fetch('countFallback'))}</span>"
  end

  title_attrs = []
  title_attrs << "id=\"#{html_attr(tile.fetch('titleId'))}\"" if tile['titleId']
  title_attr_text = title_attrs.empty? ? '' : " #{title_attrs.join(' ')}"
  lines << "            <span class=\"tile-title\"#{title_attr_text}>#{title_html(tile.fetch('titleLines'))}</span>"

  if tile['icon']
    lines << "            <img src=\"#{html_attr(asset_path(tile.fetch('icon'), prefix))}\" alt=\"\" class=\"tile-icon\">"
  end

  lines << "            #{tile.fetch('extraHtml')}" if tile['extraHtml']
  lines << '          </a>'
  lines.join("\n")
end

def render_work_tile(tile, prefix:)
  icon_class = ['work-logo', tile['iconClassName']].compact.join(' ')
  <<~HTML.chomp
        <a class="tile work-tile #{html_attr(tile.fetch('className'))}" href="#{html_attr(tile.fetch('href'))}" target="_blank" rel="noopener" aria-label="#{html_attr(tile.fetch('ariaLabel'))}">
          <span class="tile-kicker">#{h(tile.fetch('kicker'))}</span>
          <img class="#{html_attr(icon_class)}" src="#{html_attr(asset_path(tile.fetch('icon'), prefix))}" alt="">
          <span class="tile-title">#{title_html(tile.fetch('titleLines'))}</span>
        </a>
  HTML
end

def render_scripts(page, prefix)
  Array(page['scriptPaths']).map do |path|
    "  <script src=\"#{html_attr(versioned_asset(path, prefix))}\"></script>"
  end.join("\n")
end

def render_home
  page = DATA.fetch('pages').fetch('home')
  prefix = relative_prefix(page.fetch('output'))
  consume_tiles = DATA.fetch('home').fetch('consumeTiles').map { |tile| render_tile(tile, prefix: prefix) }.join("\n\n")
  create_tiles = DATA.fetch('home').fetch('createTiles').map { |tile| render_tile(tile, prefix: prefix) }.join("\n\n")

  <<~HTML
    <!DOCTYPE html>
    <html lang="en">
    #{render_head(page, prefix: prefix)}
    <body>
      <div class="page-shell">
        <header class="site-header">
          <section class="hero">
            <h1><span id="dynamic-line">#{h(DATA.fetch('home').fetch('headlineFallback'))}</span></h1>
          </section>

          <a class="brand" href="./" aria-label="hejhub home">
            <img src="assets/icons/hej-logo.svg" alt="">
          </a>
        </header>

        <main>
          <nav class="mode-row" aria-label="Hub mode">
            <div class="mode-switch">
              <button class="mode-button is-active" type="button" data-mode="consume" aria-pressed="true">consume</button>
              <button class="mode-button" type="button" data-mode="create" aria-pressed="false">create</button>
              <span class="mode-thumb" aria-hidden="true"></span>
            </div>
          </nav>

          <section class="panel is-active" id="consume-panel" data-panel="consume" aria-label="Consume links">
            <div class="bento">
    #{consume_tiles}
            </div>
          </section>

          <section class="panel" id="create-panel" data-panel="create" aria-label="Create links" hidden>
            <div class="bento create-bento">
    #{create_tiles}
            </div>
          </section>
        </main>

        <footer class="site-footer">
          <a class="email-link" href="mailto:#{h(DATA.fetch('site').fetch('contactEmail'))}">#{h(DATA.fetch('site').fetch('contactEmail'))}</a>
        </footer>
      </div>

    #{render_scripts(page, prefix)}
    </body>
    </html>
  HTML
end

def render_phrase
  page = DATA.fetch('pages').fetch('phrase')
  prefix = relative_prefix(page.fetch('output'))
  tiles = DATA.fetch('phrase').fetch('tiles').map { |tile| render_work_tile(tile, prefix: prefix) }.join("\n\n")
  contact_email = page.fetch('contactEmail')

  <<~HTML
    <!DOCTYPE html>
    <html lang="en">
    #{render_head(page, prefix: prefix)}
    <body class="work-page">
      <div class="page-shell work-shell">
        <header class="site-header work-header">
          <section class="hero work-hero">
            <h1><span id="work-dynamic-line">#{h(DATA.fetch('phrase').fetch('headlineFallback'))}</span></h1>
          </section>

          <a class="brand" href="../" aria-label="hejhub home">
            <img src="../assets/icons/hej-logo.svg" alt="">
          </a>
        </header>

        <div class="work-mode-spacer" aria-hidden="true"></div>

        <main>
          <section class="work-bento" aria-label="Phrase work links">
    #{tiles}
          </section>
        </main>

        <footer class="site-footer">
          <a class="email-link" href="mailto:#{h(contact_email)}">#{h(contact_email)}</a>
        </footer>
      </div>
    #{render_scripts(page, prefix)}
    </body>
    </html>
  HTML
end

def render_not_found
  page = DATA.fetch('pages').fetch('notFound')
  prefix = relative_prefix(page.fetch('output'))

  <<~HTML
    <!DOCTYPE html>
    <html lang="en">
    #{render_head(page, prefix: prefix, structured_data: false)}
    <body class="error-page">
      <div class="page-shell error-shell">
        <header class="site-header error-header">
          <section class="hero error-hero">
            <h1 aria-hidden="true">&nbsp;</h1>
          </section>

          <a class="brand" href="./" aria-label="hejhub home">
            <img src="assets/icons/hej-logo.svg" alt="">
          </a>
        </header>

        <nav class="mode-row error-link-row" aria-label="404 navigation">
          <a class="mode-switch error-switch" href="./" aria-label="Back to hejhub">
            <span class="mode-button is-active">back to hejhub</span>
            <span class="mode-thumb" aria-hidden="true"></span>
          </a>
        </nav>

        <main class="error-main">
          <section class="error-panel" aria-labelledby="error-title">
            <p class="error-code">404</p>
            <h2 id="error-title">wrong door.</h2>
          </section>
        </main>

        <footer class="site-footer">
          <a class="email-link" href="mailto:#{h(DATA.fetch('site').fetch('contactEmail'))}">#{h(DATA.fetch('site').fetch('contactEmail'))}</a>
        </footer>
      </div>
    </body>
    </html>
  HTML
end

def render_home_data_js
  data = {
    'headlines' => DATA.fetch('home').fetch('headlines'),
    'youtubeSubscriberChannelId' => DATA.fetch('dynamic').fetch('youtubeSubscriberChannelId'),
    'youtubeCreators' => DATA.fetch('dynamic').fetch('youtubeCreators'),
    'fallbackAlbums' => DATA.fetch('dynamic').fetch('fallbackAlbums'),
    'roryShelfUrl' => DATA.fetch('dynamic').fetch('roryShelfUrl'),
    'roryShelfFallback' => DATA.fetch('dynamic').fetch('roryShelfFallback')
  }
  "window.HejHubData = #{JSON.pretty_generate(data)};\n"
end

def render_home_css_manifest
  version = DATA.fetch('assetVersion')
  <<~CSS
    /* Homepage CSS manifest. Generated imports keep the homepage styles split by responsibility. */

    @import url("home/layout.css?v=#{version}");
    @import url("home/consume.css?v=#{version}");
    @import url("home/create.css?v=#{version}");
    @import url("home/responsive.css?v=#{version}");
  CSS
end

def render_sitemap
  lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  DATA.fetch('sitemap').each do |entry|
    lines << '  <url>'
    lines << "    <loc>#{h(entry.fetch('loc'))}</loc>"
    lines << "    <lastmod>#{h(entry.fetch('lastmod'))}</lastmod>"
    lines << "    <changefreq>#{h(entry.fetch('changefreq'))}</changefreq>"
    lines << "    <priority>#{h(entry.fetch('priority'))}</priority>"
    lines << '  </url>'
  end
  lines << '</urlset>'
  "#{lines.join("\n")}\n"
end

write_file(DATA.fetch('pages').fetch('home').fetch('output'), render_home)
write_file(DATA.fetch('pages').fetch('phrase').fetch('output'), render_phrase)
write_file(DATA.fetch('pages').fetch('notFound').fetch('output'), render_not_found)
write_file('assets/js/home-data.js', render_home_data_js)
write_file('assets/css/home.css', render_home_css_manifest)
write_file('robots.txt', "User-agent: *\nAllow: /\n\nSitemap: #{DATA.fetch('site').fetch('url')}sitemap.xml\n")
write_file('sitemap.xml', render_sitemap)

puts 'Built hejhub static files.'
