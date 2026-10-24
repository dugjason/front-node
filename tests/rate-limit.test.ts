import { afterEach, expect, jest, spyOn, test } from "bun:test";
import { FrontApiError, FrontRateLimitError } from "../src/index";
import { rateLimitDelay } from "../src/rate-limit";
import { createMockClient, jsonResponse } from "./helpers/setup";

afterEach(() => jest.restoreAllMocks());

test.each([false, true])("waits before retrying, raw=%s", async (raw) => {
  spyOn(Math, "random").mockReturnValue(0.01);
  const times: number[] = [];
  const { front, requests } = createMockClient(() => {
    times.push(Date.now());
    return times.length === 1
      ? jsonResponse({}, { headers: { "Retry-After": "0.02" }, status: 429 })
      : jsonResponse({ ok: true });
  });
  const response = raw
    ? await front.requestWithoutParsingBody("GET", "/tags")
    : await front.requestJson("POST", "/tags", { body: { name: "test" } });
  expect(requests).toHaveLength(2);
  const [first = 0, second = 0] = times;
  expect(second - first).toBeGreaterThanOrEqual(30);
  expect(requests[1]?.method).toBe(requests[0]?.method);
  expect(await requests[1]?.text()).toBe(await requests[0]?.text());
  expect(raw ? await (response as Response).json() : response).toEqual({ ok: true });
});

test.each([
  { delay: 2000, headers: new Headers({ "Retry-After": "2", "X-RateLimit-Reset": "9" }) },
  { delay: 4000, headers: new Headers({ "X-RateLimit-Reset": "4" }) },
])("uses the provider delay: %j", ({ headers, delay }) => {
  expect(rateLimitDelay(headers, 0)).toBe(delay);
});

test.each([false, true])(
  "throws typed error when retries are disabled or exhausted: %s",
  async (enabled) => {
    spyOn(Math, "random").mockReturnValue(0);
    let final: Response | undefined;
    const { front, requests } = createMockClient(
      () => {
        final = jsonResponse(
          { error: "limited" },
          { headers: { "Retry-After": "0.01" }, status: 429 },
        );
        return final;
      },
      { rateLimitRetry: enabled },
    );
    try {
      await front.tags.list();
      throw new Error("Expected rate limit error");
    } catch (error) {
      expect(error).toBeInstanceOf(FrontApiError);
      expect(error).toBeInstanceOf(FrontRateLimitError);
      expect(error).toMatchObject({
        body: { error: "limited" },
        response: final,
        retryAfterMs: 10,
        status: 429,
      });
    }
    expect(requests).toHaveLength(enabled ? 3 : 1);
  },
);

test("retries OAuth token requests too", async () => {
  spyOn(Math, "random").mockReturnValue(0);
  let attempts = 0;
  const { front, requests } = createMockClient(
    () => {
      attempts += 1;
      return attempts === 1
        ? jsonResponse({}, { headers: { "Retry-After": "0.01" }, status: 429 })
        : jsonResponse({ access_token: "new", refresh_token: "rotated" });
    },
    { accessToken: "old", refreshToken: "refresh" },
  );
  await expect(
    front.refreshOAuthToken({ clientId: "id", clientSecret: "secret" }),
  ).resolves.toEqual({ access_token: "new", refresh_token: "rotated" });
  expect(requests).toHaveLength(2);
});
