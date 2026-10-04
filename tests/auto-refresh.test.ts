import { expect, test } from "bun:test";
import { Front } from "../src/index";
import type { FrontOptions } from "../src/index";
import { jsonResponse } from "./helpers/setup";
import type { MockFetchHandler } from "./helpers/setup";

const TOKEN_URL = "https://app.frontapp.com/oauth/token";
const tokens = { access_token: "new", refresh_token: "rotated" };
const oauth = {
  accessToken: "old",
  autoRefresh: true,
  clientId: "id",
  clientSecret: "secret",
  refreshToken: "refresh",
} as const;
const reply = (status = 200) => jsonResponse({ error: "invalid_grant" }, { status });
const setup = (handler: MockFetchHandler, options: FrontOptions = oauth) => {
  const requests: Request[] = [];
  const mockFetch = new Proxy(fetch, {
    apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
      const source = input instanceof URL ? input.href : input;
      const req = source instanceof Request ? source : new Request(source, init);
      requests.push(req);
      return handler(req);
    },
  });
  return { front: new Front({ ...options, fetch: mockFetch }), requests };
};

test("shares refresh and awaits saving for JSON and raw requests", async () => {
  const saving = Promise.withResolvers<undefined>();
  const started = Promise.withResolvers<undefined>();
  const { front, requests } = setup(
    (req) => {
      if (req.url === TOKEN_URL) {
        return jsonResponse(tokens);
      }
      return reply(req.headers.get("Authorization") === "Bearer old" ? 401 : 200);
    },
    {
      ...oauth,
      onTokenRefresh: async () => {
        started.resolve();
        await saving.promise;
      },
    },
  );
  const pending = Promise.all([
    front.requestJson("GET", "/tags"),
    front.downloads.download("file"),
  ]);
  await started.promise;
  expect(requests).toHaveLength(3);
  saving.resolve();
  const [, raw] = await pending;
  expect(await raw.json()).toEqual({ error: "invalid_grant" });
  expect(requests).toHaveLength(5);
  expect(requests.filter((req) => req.url === TOKEN_URL)).toHaveLength(1);
});

for (const raw of [false, true]) {
  const request = (front: Front) =>
    raw ? front.downloads.download("file") : front.requestJson("GET", "/tags");
  test.each([200, 400, 503])(`retry or exchange failure, raw=${raw}: %s`, async (status) => {
    const { front, requests } = setup((req) => {
      if (req.url === TOKEN_URL) {
        return status === 200 ? jsonResponse(tokens) : reply(status);
      }
      return reply(401);
    });
    await expect(request(front)).rejects.toMatchObject({
      body: { error: "invalid_grant" },
      status: status === 200 ? 401 : status,
    });
    expect(requests).toHaveLength(status === 200 ? 3 : 2);
  });
  test(`save failure propagates without retry, raw=${raw}`, async () => {
    const failure = new Error("Save failed");
    const { front, requests } = setup(
      (req) => (req.url === TOKEN_URL ? jsonResponse(tokens) : reply(401)),
      { ...oauth, onTokenRefresh: () => Promise.reject(failure) },
    );
    await expect(request(front)).rejects.toBe(failure);
    expect(requests).toHaveLength(2);
  });
  test.each([
    { options: { ...oauth, autoRefresh: false as const }, status: 401 },
    { options: { accessToken: "old", refreshToken: "refresh" }, status: 401 },
    { options: { apiKey: "key" }, status: 401 },
    { options: oauth, status: 403 },
    { options: oauth, status: 500 },
  ])(`no refresh, raw=${raw}: %j`, async ({ options, status }) => {
    const { front, requests } = setup(() => reply(status), options);
    await expect(request(front)).rejects.toMatchObject({ status });
    expect(requests).toHaveLength(1);
  });
}

test("a delayed 401 retries with the current token without refreshing again", async () => {
  const delayed = Promise.withResolvers<Response>();
  const { front, requests } = setup((req) => {
    if (req.url === TOKEN_URL) {
      return jsonResponse(tokens);
    }
    if (req.url.endsWith("/late") && req.headers.get("Authorization") === "Bearer old") {
      return delayed.promise;
    }
    return reply(req.headers.get("Authorization") === "Bearer old" ? 401 : 200);
  });
  const pending = front.requestJson("GET", "/late");
  await front.downloads.download("file");
  delayed.resolve(reply(401));
  await pending;
  expect(requests.filter((req) => req.url === TOKEN_URL)).toHaveLength(1);
  expect(requests.at(-1)?.headers.get("Authorization")).toBe("Bearer new");
});
