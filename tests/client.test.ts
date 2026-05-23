import { describe, expect, test } from "bun:test";

import { Front, FrontApiError } from "../src/index";
import { createMockClient, createTestSetup } from "./helpers/setup";

describe("Front", () => {
  test("initializes with bearer auth", () => {
    const { front } = createTestSetup();
    expect(front).toBeInstanceOf(Front);
  });

  test("tags.list sends GET /tags with bearer auth", async () => {
    const { front, requests } = createTestSetup();

    await front.tags.list();

    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/tags");
    expect(requests[0]?.headers.get("Authorization")).toBe("Bearer test-token");
    expect(requests[0]?.headers.get("User-Agent")).toStartWith("@dugjason/front-node@");
  });

  test("uses custom user agent when provided", async () => {
    const { front, requests } = createMockClient(undefined, {
      userAgent: "acme-front-client/1.2.3",
    });

    await front.tags.list();

    expect(requests[0]?.headers.get("User-Agent")).toBe("acme-front-client/1.2.3");
  });

  test("tags.list forwards query params", async () => {
    const { front, requests } = createTestSetup();

    await front.tags.list({ limit: 10, sort_order: "asc" });

    expect(requests[0]?.url).toBe("https://api2.frontapp.com/tags?limit=10&sort_order=asc");
  });

  test("error response throws FrontApiError with status and body", async () => {
    const { front } = createMockClient(() =>
      Response.json(
        { _error: "Too many requests" },
        {
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "30",
          },
          status: 429,
        },
      ),
    );

    await expect(front.tags.list()).rejects.toBeInstanceOf(FrontApiError);

    try {
      await front.tags.list();
    } catch (error) {
      expect(error).toBeInstanceOf(FrontApiError);
      if (error instanceof FrontApiError) {
        expect(error.status).toBe(429);
        expect(error.headers.get("retry-after")).toBe("30");
        expect(error.body).toEqual({ _error: "Too many requests" });
        expect(error.message).toStartWith("Front API error: 429");
      }
    }
  });
});
