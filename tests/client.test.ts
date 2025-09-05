import { HttpResponse, http } from "msw"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { FrontClient } from "../src/client"
import { server } from "./mocks/node.js"

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
      const client = new FrontClient({ apiKey: "test-key" })

      let attempts = 0
      server.use(
        http.get("https://api2.frontapp.com/me", () => {
          attempts += 1
          if (attempts === 1) {
            return HttpResponse.json(
              {
                _error: {
                  status: 429,
                  title: "Too Many Requests",
                  message: "Rate limit exceeded",
                },
              },
              { status: 429, headers: { "retry-after": "2" } },
            )
          }
          return HttpResponse.json({ success: true })
        }),
      )

      const requestPromise = client.get("/me")
      await vi.advanceTimersByTimeAsync(2000)

      const result = await requestPromise
      expect(result).toEqual({ success: true })
      expect(attempts).toBe(2)
    })

    it("should use exponential backoff when retry-after is not present", async () => {
      const client = new FrontClient({ apiKey: "test-key" })

      // Mock Math.random to make jitter predictable
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5) // This will result in 0 jitter

      try {
        let attempts = 0
        server.use(
          http.get("https://api2.frontapp.com/me", () => {
            attempts += 1
            if (attempts === 1) {
              return HttpResponse.json(
                {
                  _error: {
                    status: 429,
                    title: "Too Many Requests",
                    message: "Rate limit exceeded",
                  },
                },
                { status: 429 },
              )
            }
            return HttpResponse.json({ success: true })
          }),
        )

        const requestPromise = client.get("/me")

        // Should use exponential backoff (1000ms for first retry)
        await vi.advanceTimersByTimeAsync(1000)

        const result = await requestPromise
        expect(result).toEqual({ success: true })
        expect(attempts).toBe(2)
      } finally {
        Math.random = originalRandom
      }
    }, 10000)

    it("should respect retry-after header over exponential backoff", async () => {
      const client = new FrontClient({ apiKey: "test-key" })

      let attempts = 0
      server.use(
        http.get("https://api2.frontapp.com/me", () => {
          attempts += 1
          if (attempts === 1) {
            return HttpResponse.json(
              {
                _error: {
                  status: 429,
                  title: "Too Many Requests",
                  message: "Rate limit exceeded",
                },
              },
              { status: 429, headers: { "retry-after": "3" } },
            )
          }
          return HttpResponse.json({ success: true })
        }),
      )

      const requestPromise = client.get("/me")

      // Should wait for retry-after time (3000ms), not exponential backoff (1000ms)
      await vi.advanceTimersByTimeAsync(3000)

      const result = await requestPromise
      expect(result).toEqual({ success: true })
      expect(attempts).toBe(2)
    })

    it("should handle network errors with retries", async () => {
      const client = new FrontClient({ apiKey: "test-key" })

      // Mock Math.random to make jitter predictable
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      try {
        server.use(
          http.get("https://api2.frontapp.com/me", () =>
            HttpResponse.json({ success: true }),
          ),
        )

        const originalFetch = global.fetch
        let calls = 0
        // First call throws a network error, subsequent calls delegate to original fetch
        global.fetch = async (...args) => {
          calls += 1
          if (calls === 1) {
            throw new Error("Network error")
          }
          // @ts-expect-error - forwarding
          return originalFetch(...args)
        }

        const requestPromise = client.get("/me")

        // Advance time for retry (1000ms base delay)
        await vi.advanceTimersByTimeAsync(1000)

        const result = await requestPromise
        expect(result).toEqual({ success: true })
        expect(calls).toBeGreaterThanOrEqual(2)

        // restore fetch
        global.fetch = originalFetch
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
          "API key or OAuth configuration is required",
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
      server.use(
        http.get("https://api2.frontapp.com/me", () =>
          HttpResponse.json({ data: "test" }),
        ),
      )

      const result = await client.get("/me")
      expect(result).toEqual({ data: "test" })
    })

    it("should handle 204 No Content responses", async () => {
      const client = new FrontClient({ apiKey: "test-key" })

      server.use(
        http.delete(
          "https://api2.frontapp.com/tags/tag_123",
          () => new Response(null, { status: 204 }),
        ),
      )

      const result = await client.delete("/tags/tag_123")
      expect(result).toEqual({})
    })

    it("should throw error for non-2xx responses", async () => {
      const client = new FrontClient({ apiKey: "test-key" })

      server.use(
        http.get("https://api2.frontapp.com/me", () =>
          HttpResponse.json(
            { message: "Invalid request", code: "invalid_request" },
            { status: 400, statusText: "Bad Request" },
          ),
        ),
      )

      await expect(client.get("/me")).rejects.toMatchObject({
        message: "Invalid request",
        status: 400,
        code: "invalid_request",
      })
    })
  })
})
