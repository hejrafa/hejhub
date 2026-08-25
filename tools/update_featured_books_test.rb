# frozen_string_literal: true

require 'minitest/autorun'
require_relative 'update_featured_books'

class UpdateFeaturedBooksTest < Minitest::Test
  FakeHTTP = Struct.new(:responses) do
    def request(_request)
      responses.shift
    end
  end

  def test_fetch_retries_server_errors_with_exponential_backoff
    responses = [
      response(Net::HTTPInternalServerError, '500'),
      response(Net::HTTPBadGateway, '502'),
      response(Net::HTTPOK, '200', 'feed body')
    ]
    delays = []
    calls = 0
    start = lambda do |*_args, **_options, &block|
      calls += 1
      block.call(FakeHTTP.new(responses))
    end

    result = nil
    _stdout, stderr = capture_io do
      Net::HTTP.stub(:start, start) do
        result = fetch(URI('https://example.test/feed'), sleeper: ->(delay) { delays << delay })
      end
    end

    assert_equal 'feed body', result
    assert_equal [1, 2], delays
    assert_equal 3, calls
    assert_includes stderr, 'retrying in 1s (attempt 2/4)'
    assert_includes stderr, 'retrying in 2s (attempt 3/4)'
  end

  def test_fetch_stops_after_four_transient_failures
    responses = Array.new(4) { response(Net::HTTPServiceUnavailable, '503') }
    delays = []
    calls = 0
    start = lambda do |*_args, **_options, &block|
      calls += 1
      block.call(FakeHTTP.new(responses))
    end

    error = nil
    capture_io do
      Net::HTTP.stub(:start, start) do
        error = assert_raises(RuntimeError) do
          fetch(URI('https://example.test/feed'), sleeper: ->(delay) { delays << delay })
        end
      end
    end

    assert_equal 'Request failed with 503: https://example.test/feed', error.message
    assert_equal [1, 2, 4], delays
    assert_equal 4, calls
  end

  def test_fetch_does_not_retry_permanent_client_errors
    responses = [response(Net::HTTPForbidden, '403')]
    delays = []
    calls = 0
    start = lambda do |*_args, **_options, &block|
      calls += 1
      block.call(FakeHTTP.new(responses))
    end

    error = Net::HTTP.stub(:start, start) do
      assert_raises(RuntimeError) do
        fetch(URI('https://example.test/feed'), sleeper: ->(delay) { delays << delay })
      end
    end

    assert_equal 'Request failed with 403: https://example.test/feed', error.message
    assert_empty delays
    assert_equal 1, calls
  end

  private

  def response(response_class, code, body = '')
    response = response_class.new('1.1', code, '')
    response.body = body
    response.instance_variable_set(:@read, true)
    response
  end
end
