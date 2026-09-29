#!/usr/bin/env ruby
# frozen_string_literal: true

# Counts commits per day across every branch of every repo hejrafa owns
# (forks and, with CODE_GARDEN_TOKEN, private repos included), so the code
# garden shows work GitHub's own contribution graph leaves out. Commits by
# AI coding bots count; routine automation such as github-actions[bot] does not.

ENV['TZ'] = 'Europe/Berlin'

require 'date'
require 'json'
require 'net/http'
require 'time'
require 'uri'

ROOT = File.expand_path('..', __dir__)
OUTPUT_PATH = File.join(ROOT, 'assets/data/code-garden.json')
USER = 'hejrafa'
DAYS = 91
API = 'https://api.github.com'
AUTOMATION_AUTHORS = %w[github-actions[bot] dependabot[bot] renovate[bot]].freeze
FETCH_MAX_ATTEMPTS = 4

def token
  ENV['CODE_GARDEN_TOKEN'].to_s.empty? ? ENV['GITHUB_TOKEN'].to_s : ENV['CODE_GARDEN_TOKEN']
end

def private_access?
  !ENV['CODE_GARDEN_TOKEN'].to_s.empty?
end

def get(url)
  attempt = 0

  loop do
    attempt += 1
    uri = URI(url)
    request = Net::HTTP::Get.new(uri)
    request['Accept'] = 'application/vnd.github+json'
    request['User-Agent'] = 'hejhub-code-garden/1.0'
    request['Authorization'] = "Bearer #{token}" unless token.empty?

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 10, read_timeout: 30) do |http|
      http.request(request)
    end
    return response if response.is_a?(Net::HTTPSuccess)
    # Empty repositories answer 409 on the commits endpoint.
    return nil if response.code == '409'

    status = response.code.to_i
    retryable = [408, 429].include?(status) || (500..599).cover?(status)
    raise "GitHub request failed with #{status}: #{url}" unless retryable && attempt < FETCH_MAX_ATTEMPTS

    sleep 2**(attempt - 1)
  end
end

def get_all(url)
  items = []
  while url
    response = get(url)
    break unless response

    items.concat(JSON.parse(response.body))
    url = response['link'].to_s[/<([^>]+)>;\s*rel="next"/, 1]
  end
  items
end

def repositories
  if private_access?
    get_all("#{API}/user/repos?affiliation=owner&per_page=100")
  else
    get_all("#{API}/users/#{USER}/repos?type=owner&per_page=100")
  end
end

def automation?(commit)
  names = [commit.dig('author', 'login'), commit.dig('commit', 'author', 'name')]
  names.any? { |name| AUTOMATION_AUTHORS.include?(name) }
end

def daily_counts(today)
  first_day = today - (DAYS - 1)
  since = Time.new(first_day.year, first_day.month, first_day.day).utc.iso8601
  seen = {}
  counts = Hash.new(0)

  repositories.each do |repo|
    name = repo.fetch('full_name')
    get_all("#{API}/repos/#{name}/branches?per_page=100").each do |branch|
      query = URI.encode_www_form(sha: branch.fetch('name'), since: since, per_page: 100)
      get_all("#{API}/repos/#{name}/commits?#{query}").each do |commit|
        next if seen[commit.fetch('sha')]

        seen[commit.fetch('sha')] = true
        next if automation?(commit)

        day = Time.parse(commit.dig('commit', 'author', 'date')).localtime.to_date
        counts[day.iso8601] += 1 if day.between?(first_day, today)
      end
    end
  end

  counts.sort.to_h
end

def main
  today = Date.today
  counts = daily_counts(today)
  previous = File.exist?(OUTPUT_PATH) ? JSON.parse(File.read(OUTPUT_PATH)) : {}

  if previous['days'] == counts && previous['through'] == today.iso8601
    puts 'Code garden is already current.'
    return
  end

  Dir.mkdir(File.dirname(OUTPUT_PATH)) unless Dir.exist?(File.dirname(OUTPUT_PATH))
  File.write(OUTPUT_PATH, "#{JSON.pretty_generate('through' => today.iso8601, 'days' => counts)}\n")
  puts "Code garden updated: #{counts.values.sum} commits over the last #{DAYS} days#{private_access? ? ' (including private repos)' : ''}."
end

main if $PROGRAM_NAME == __FILE__
