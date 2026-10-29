#!/usr/bin/env ruby
# frozen_string_literal: true

# Mirrors the latest films from hejrafa's Letterboxd RSS into a static JSON
# file, since the feed has no CORS headers and public RSS proxies such as
# rss2json now sit behind Cloudflare challenges the browser cannot pass.

require 'json'
require 'net/http'
require 'rexml/document'
require 'timeout'
require 'uri'

ROOT = File.expand_path('..', __dir__)
OUTPUT_PATH = File.join(ROOT, 'assets/data/letterboxd.json')
FEED_URL = 'https://letterboxd.com/hejrafa/rss/'
FILMS = 4
FETCH_MAX_ATTEMPTS = 4
FETCH_RETRYABLE_ERRORS = [
  EOFError,
  Net::HTTPBadResponse,
  Net::ProtocolError,
  SocketError,
  SystemCallError,
  Timeout::Error
].freeze

def fetch(uri)
  attempt = 0

  loop do
    attempt += 1
    error = nil

    begin
      request = Net::HTTP::Get.new(uri)
      request['User-Agent'] = 'hejhub-letterboxd/1.0'

      response = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 10, read_timeout: 30) do |http|
        http.request(request)
      end
      return response.body if response.is_a?(Net::HTTPSuccess)

      status = response.code.to_i
      error = RuntimeError.new("Letterboxd request failed with #{status}: #{uri}")
      raise error unless [408, 429].include?(status) || (500..599).cover?(status)
    rescue *FETCH_RETRYABLE_ERRORS => transient_error
      error = RuntimeError.new("Letterboxd request failed with #{transient_error.class}: #{uri} (#{transient_error.message})")
    end

    raise error if attempt >= FETCH_MAX_ATTEMPTS

    sleep 2**(attempt - 1)
  end
end

# Diary entries and reviews carry a film title; list entries do not.
def films(xml)
  document = REXML::Document.new(xml)
  document.get_elements('//channel/item').map do |item|
    title = item.elements['letterboxd:filmTitle']&.text.to_s.strip
    poster = item.elements['description']&.text.to_s[/<img[^>]+src="([^"]+)"/, 1]
    next if title.empty? || poster.nil?

    {
      'title' => title,
      'year' => item.elements['letterboxd:filmYear']&.text.to_s.strip,
      'watchedDate' => item.elements['letterboxd:watchedDate']&.text.to_s.strip,
      'url' => item.elements['link']&.text.to_s.strip,
      'poster' => poster
    }
  end.compact.first(FILMS)
end

def main
  latest = films(fetch(URI(FEED_URL)))
  raise 'Letterboxd feed has no films' if latest.empty?

  previous = File.exist?(OUTPUT_PATH) ? JSON.parse(File.read(OUTPUT_PATH)) : {}
  if previous['films'] == latest
    puts 'Letterboxd films are already current.'
    return
  end

  Dir.mkdir(File.dirname(OUTPUT_PATH)) unless Dir.exist?(File.dirname(OUTPUT_PATH))
  File.write(OUTPUT_PATH, "#{JSON.pretty_generate('films' => latest)}\n")
  puts "Letterboxd films updated: #{latest.map { |film| film['title'] }.join(', ')}."
end

main if $PROGRAM_NAME == __FILE__
