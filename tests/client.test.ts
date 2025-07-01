import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { FrontClient } from "../src/client"

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock Headers constructor to work with our tests
class MockHeaders extends Map {
  get(name: string) {
    return super.get(name.toLowerCase())
  }

  set(name: string, value: string) {
    return super.set(name.toLowerCase(), value)
  }

  has(name: string) {
    return super.has(name.toLowerCase())
  }
}

describe("FrontClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("Rate Limiting", () => {
    it("should retry on 429 status with retry-after header", async () => {
      const client = new FrontClient({
        apiKey: "test-key",
      })

      const headers = new MockHeaders()
      headers.set("retry-after", "2")

      // First call returns 429 with retry-after
      mockFetch
        .mockResolvedValueOnce({
          status: 429,
          ok: false,
          headers,
          json: async () => ({
            _error: {
              status: 429,
              title: "Too Many Requests",
              message: "Rate limit exceeded",
            },
          }),
        })
        // Second call succeeds
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => ({ success: true }),
        })

      const requestPromise = client.get("/test")

      // Fast-forward time to trigger the retry
      await vi.advanceTimersByTimeAsync(2000)

      const result = await requestPromise
      expect(result).toEqual({ success: true })
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it("should use exponential backoff when retry-after is not present", async () => {
      const client = new FrontClient({
        apiKey: "test-key",
      })

      // Mock Math.random to make jitter predictable
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5) // This will result in 0 jitter

      try {
        // First call returns 429 without retry-after
        mockFetch
          .mockResolvedValueOnce({
            status: 429,
            ok: false,
            headers: new MockHeaders(),
            json: async () => ({
              _error: {
                status: 429,
                title: "Too Many Requests",
                message: "Rate limit exceeded",
              },
            }),
          })
          // Second call succeeds
          .mockResolvedValueOnce({
            status: 200,
            ok: true,
            json: async () => ({ success: true }),
          })

        const requestPromise = client.get("/test")

        // Should use exponential backoff (1000ms for first retry)
        await vi.advanceTimersByTimeAsync(1000)

        const result = await requestPromise
        expect(result).toEqual({ success: true })
        expect(mockFetch).toHaveBeenCalledTimes(2)
      } finally {
        Math.random = originalRandom
      }
    }, 10000)

    it("should respect retry-after header over exponential backoff", async () => {
      const client = new FrontClient({
        apiKey: "test-key",
      })

      const headers = new MockHeaders()
      headers.set("retry-after", "3")

      mockFetch
        .mockResolvedValueOnce({
          status: 429,
          ok: false,
          headers,
          json: async () => ({
            _error: {
              status: 429,
              title: "Too Many Requests",
              message: "Rate limit exceeded",
            },
          }),
        })
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => ({ success: true }),
        })

      const requestPromise = client.get("/test")

      // Should wait for retry-after time (3000ms), not exponential backoff (1000ms)
      await vi.advanceTimersByTimeAsync(3000)

      const result = await requestPromise
      expect(result).toEqual({ success: true })
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it("should handle network errors with retries", async () => {
      const client = new FrontClient({
        apiKey: "test-key",
      })

      // Mock Math.random to make jitter predictable
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      try {
        // First call fails with network error
        mockFetch
          .mockRejectedValueOnce(new Error("Network error"))
          // Second call succeeds
          .mockResolvedValueOnce({
            status: 200,
            ok: true,
            json: async () => ({ success: true }),
          })

        const requestPromise = client.get("/test")

        // Advance time for retry (1000ms base delay)
        await vi.advanceTimersByTimeAsync(1000)

        const result = await requestPromise
        expect(result).toEqual({ success: true })
        expect(mockFetch).toHaveBeenCalledTimes(2)
      } finally {
        Math.random = originalRandom
      }
    }, 10000)
  })

  describe("Basic functionality", () => {
    it("should create a client with API key", () => {
      const client = new FrontClient({ apiKey: "test-key" })
      expect(client).toBeInstanceOf(FrontClient)
    })

    it("should throw error when API key is empty and no env var", () => {
      // Store original value
      const originalEnvKey = process.env.FRONT_API_KEY
      delete process.env.FRONT_API_KEY

      try {
        expect(() => new FrontClient({ apiKey: "" })).toThrow(
          "API key is required when not using OAuth",
        )
      } finally {
        // Restore original value
        if (originalEnvKey) {
          process.env.FRONT_API_KEY = originalEnvKey
        }
      }
    })

    it("should make successful GET request", async () => {
      const client = new FrontClient({ apiKey: "test-key" })

      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ data: "test" }),
      })

      const result = await client.get("/test")
      expect(result).toEqual({ data: "test" })
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api2.frontapp.com/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-key",
            Accept: "application/json",
          }),
        }),
      )
    })

    it("should handle 204 No Content responses", async () => {
      const client = new FrontClient({ apiKey: "test-key" })

      mockFetch.mockResolvedValueOnce({
        status: 204,
        ok: true,
        json: async () => {
          throw new Error("No content")
        }, // 204 responses don't have JSON
      })

      const result = await client.delete("/test")
      expect(result).toEqual({})
    })

    it("should throw error for non-2xx responses", async () => {
      const client = new FrontClient({ apiKey: "test-key" })

      mockFetch.mockResolvedValueOnce({
        status: 400,
        ok: false,
        statusText: "Bad Request",
        json: async () => ({
          message: "Invalid request",
          code: "invalid_request",
        }),
      })

      await expect(client.get("/test")).rejects.toMatchObject({
        message: "Invalid request",
        status: 400,
        code: "invalid_request",
      })
    })
  })
})
