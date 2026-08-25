#!/usr/bin/env ruby
# frozen_string_literal: true

require 'cgi'
require 'date'
require 'json'
require 'net/http'
require 'timeout'
require 'uri'

ROOT = File.expand_path('..', __dir__)
DATA_PATH = File.join(ROOT, 'src/data/site.json')
BOOKER_FEED_URL = 'https://thebookerprizes.substack.com/feed'
RSS2JSON_URL = 'https://api.rss2json.com/v1/api.json'
APPLE_BOOKS_SEARCH_URL = 'https://itunes.apple.com/search'
FETCH_MAX_ATTEMPTS = 4
FETCH_RETRYABLE_ERRORS = [
  EOFError,
  Net::HTTPBadResponse,
  Net::ProtocolError,
  SocketError,
  SystemCallError,
  Timeout::Error
].freeze

def retryable_http_status?(status)
  [408, 429].include?(status) || (500..599).cover?(status)
end

def fetch(uri, sleeper: Kernel.method(:sleep))
  attempt = 0

  loop do
    attempt += 1
    error = nil

    begin
      request = Net::HTTP::Get.new(uri)
      request['User-Agent'] = 'hejhub-book-refresh/1.0'

      response = Net::HTTP.start(
        uri.host,
        uri.port,
        use_ssl: uri.scheme == 'https',
        open_timeout: 10,
        read_timeout: 30
      ) { |http| http.request(request) }
      return response.body if response.is_a?(Net::HTTPSuccess)

      error = RuntimeError.new("Request failed with #{response.code}: #{uri}")
      raise error unless retryable_http_status?(response.code.to_i)
    rescue *FETCH_RETRYABLE_ERRORS => transient_error
      error = RuntimeError.new("Request failed with #{transient_error.class}: #{uri} (#{transient_error.message})")
    end

    raise error if attempt >= FETCH_MAX_ATTEMPTS

    delay = 2**(attempt - 1)
    warn "#{error.message}; retrying in #{delay}s (attempt #{attempt + 1}/#{FETCH_MAX_ATTEMPTS})"
    sleeper.call(delay)
  end
end

def text_from_html(html)
  CGI.unescapeHTML(html.to_s.gsub(/<[^>]+>/, '')).strip
end

def latest_booker_longlist
  query = URI.encode_www_form(rss_url: BOOKER_FEED_URL)
  response = JSON.parse(fetch(URI("#{RSS2JSON_URL}?#{query}")))
  raise "Booker feed proxy failed: #{response['message']}" unless response['status'] == 'ok'

  candidates = response.fetch('items', []).map do |item|
    match = item['title'].to_s.match(/\AAnnouncing the Booker Prize (\d{4}) longlist\z/i)
    next unless match

    [match[1].to_i, item]
  end.compact
  year, item = candidates.max_by(&:first)
  return [] unless item

  content = item['content'].to_s
  books = content.scan(%r{<li[^>]*>.*?<a[^>]+href="(https://thebookerprizes\.com/the-booker-library/books/[^"]+)"[^>]*>(.*?)</a>.*?\bby\s*<a[^>]+href="https://thebookerprizes\.com/the-booker-library/authors/[^"]+"[^>]*>(.*?)</a>.*?</li>}im).map do |url, title, author|
    {
      'title' => text_from_html(title),
      'author' => text_from_html(author),
      'recognition' => "Booker Prize #{year} longlist",
      'url' => URI(url).then { |uri| "#{uri.scheme}://#{uri.host}#{uri.path}" }
    }
  end.uniq { |book| book['url'] }

  raise "Expected 12 or 13 Booker books, found #{books.length}" unless (12..13).cover?(books.length)

  books
end

def normalized(value)
  value.to_s.downcase.gsub(/[^a-z0-9]+/, ' ').strip
end

def apple_cover_for(book)
  query = URI.encode_www_form(
    term: "#{book.fetch('title')} #{book.fetch('author')}",
    entity: 'ebook',
    country: 'us',
    limit: 10
  )
  results = JSON.parse(fetch(URI("#{APPLE_BOOKS_SEARCH_URL}?#{query}"))).fetch('results', [])
  expected_title = normalized(book.fetch('title'))
  expected_author = normalized(book.fetch('author'))
  match = results.find do |result|
    result_title = normalized(result['trackName']).sub(/ oprah s book club\z/, '')
    title_matches = result_title == expected_title
    author_matches = normalized(result['artistName']).include?(expected_author)
    title_matches && author_matches && result['artworkUrl100']
  end
  raise "No Apple Books cover found for #{book.fetch('title')} by #{book.fetch('author')}" unless match

  match.fetch('artworkUrl100').sub(%r{/\d+x\d+bb\.(?:jpg|png)\z}i, '/600x600bb.jpg')
end

def matching_bracket(source, start_index, opener, closer)
  depth = 0
  in_string = false
  escaped = false

  source.each_char.with_index do |character, offset|
    next if offset < start_index

    if in_string
      if escaped
        escaped = false
      elsif character == '\\'
        escaped = true
      elsif character == '"'
        in_string = false
      end
      next
    end

    if character == '"'
      in_string = true
    elsif character == opener
      depth += 1
    elsif character == closer
      depth -= 1
      return offset if depth.zero?
    end
  end

  raise "Could not find closing #{closer}"
end

def replace_featured_books(source, books)
  key_index = source.index('"featuredBooks":')
  raise 'featuredBooks key is missing' unless key_index

  start_index = source.index('[', key_index)
  end_index = matching_bracket(source, start_index, '[', ']')
  formatted = JSON.pretty_generate(books)
  indented = formatted.lines.map.with_index { |line, index| index.zero? ? line : "    #{line}" }.join
  source[0...start_index] + indented + source[(end_index + 1)..]
end

def replace_book_tile(source, book)
  class_index = source.index('"className": "tile-books"')
  raise 'Book tile is missing' unless class_index

  start_index = source.rindex('{', class_index)
  end_index = matching_bracket(source, start_index, '{', '}')
  tile = source[start_index..end_index]
  replacements = {
    'href' => book.fetch('url'),
    'ariaLabel' => "#{book.fetch('recognition')}: #{book.fetch('title')} by #{book.fetch('author')}",
    'coverSrc' => book.fetch('cover'),
    'coverAlt' => "#{book.fetch('title')} by #{book.fetch('author')}"
  }
  replacements.each do |key, value|
    tile.sub!(/("#{Regexp.escape(key)}": )"(?:\\.|[^"])*"/, "\\1#{JSON.generate(value)}")
  end

  source[0...start_index] + tile + source[(end_index + 1)..]
end

def main(args = ARGV)
  source = File.read(DATA_PATH)
  data = JSON.parse(source)
  current_books = data.dig('dynamic', 'featuredBooks') || []
  feed_books = latest_booker_longlist

  if feed_books.empty?
    puts 'No Booker Prize longlist announcement is currently present in the feed.'
    return
  end

  current_identity = current_books.map { |book| book.values_at('title', 'author', 'recognition', 'url') }
  feed_identity = feed_books.map { |book| book.values_at('title', 'author', 'recognition', 'url') }

  if args.include?('--check')
    checked_books = feed_books.map do |book|
      book.merge('cover' => apple_cover_for(book))
    end
    checked_source = replace_featured_books(source, checked_books)
    checked_source = replace_book_tile(checked_source, checked_books.first)
    JSON.parse(checked_source)
    puts "Validated #{checked_books.length} books from #{checked_books.first.fetch('recognition')} with covers."
    return
  end

  if current_identity == feed_identity
    puts "Featured books already match #{feed_books.first.fetch('recognition')}."
    return
  end

  feed_books.each { |book| book['cover'] = apple_cover_for(book) }
  source = replace_featured_books(source, feed_books)
  source = replace_book_tile(source, feed_books.first)
  source.sub!(/"assetVersion": "[^"]+"/, "\"assetVersion\": \"#{Date.today.strftime('%Y%m%d')}books\"")
  File.write(DATA_PATH, source)

  puts "Updated featured books to #{feed_books.first.fetch('recognition')}."
end

main if $PROGRAM_NAME == __FILE__
