import { afterEach, describe, expect, test } from "bun:test";

import { Front, FrontApiError } from "../src/index";
import { resolveFrontAuth } from "../src/front";
import { createMockClient, jsonResponse } from "./helpers/setup";

const OAUTH_TOKEN_URL = "https://app.frontapp.com/oauth/token";
const DOCS_BASIC_CLIENT_ID = "123abc";
const DOCS_BASIC_CLIENT_SECRET = "456def";
const DOCS_BASIC_HEADER = "Basic MTIzYWJjOjQ1NmRlZg==";

const restoreFrontApiToken = (previous: string | undefined): void => {
  if (previous === undefined) {
    delete process.env.FRONT_API_TOKEN;
    return;
  }
  process.env.FRONT_API_TOKEN = previous;
};

describe("Front OAuth credentials", () => {
  const previousApiToken = process.env.FRONT_API_TOKEN;

  afterEach(() => {
    restoreFrontApiToken(previousApiToken);
  });

  test("initializes with accessToken and refreshToken as bearer auth", async () => {
    const { front, requests } = createMockClient(undefined, {
      accessToken: "oauth-access",
      refreshToken: "oauth-refresh",
    });

    await front.tags.list();

    expect(front).toBeInstanceOf(Front);
    expect(requests[0]?.headers.get("Authorization")).toBe("Bearer oauth-access");
  });

  test("does not fall back to FRONT_API_TOKEN when OAuth tokens are provided", async () => {
    process.env.FRONT_API_TOKEN = "env-api-key";
    const { front, requests } = createMockClient(undefined, {
      accessToken: "oauth-access",
      refreshToken: "oauth-refresh",
    });

    await front.tags.list();

    expect(requests[0]?.headers.get("Authorization")).toBe("Bearer oauth-access");
  });

  test("rejects mixing apiKey with OAuth tokens", () => {
    expect(() =>
      resolveFrontAuth({
        accessToken: "oauth-access",
        apiKey: "api-key",
        refreshToken: "oauth-refresh",
      }),
    ).toThrow(/either an API key or OAuth tokens, not both/u);
  });

  test("rejects accessToken without refreshToken", () => {
    expect(() => resolveFrontAuth({ accessToken: "oauth-access" })).toThrow(
      /require both accessToken and refreshToken/u,
    );
  });

  test("rejects refreshToken without accessToken", () => {
    expect(() => resolveFrontAuth({ refreshToken: "oauth-refresh" })).toThrow(
      /require both accessToken and refreshToken/u,
    );
  });

  test("throws when no credentials are provided", () => {
    delete process.env.FRONT_API_TOKEN;
    expect(() => new Front()).toThrow(/Front credentials are required/u);
  });
});

describe("Front.refreshOAuthToken", () => {
  test("awaits token persistence before adopting credentials and returning", async () => {
    const persistence = Promise.withResolvers<undefined>();
    const callbackStarted = Promise.withResolvers<undefined>();
    let persistedTokens: unknown;
    const { front, requests } = createMockClient(
      (req) =>
        req.url === OAUTH_TOKEN_URL
          ? jsonResponse({ access_token: "new-access", refresh_token: "new-refresh" })
          : jsonResponse({ _results: [] }),
      {
        accessToken: "old-access",
        onTokenRefresh: async (tokens) => {
          persistedTokens = tokens;
          callbackStarted.resolve();
          await persistence.promise;
        },
        refreshToken: "old-refresh",
      },
    );
    let completed = false;
    const refresh = async () => {
      const tokens = await front.refreshOAuthToken({
        clientId: DOCS_BASIC_CLIENT_ID,
        clientSecret: DOCS_BASIC_CLIENT_SECRET,
      });
      completed = true;
      return tokens;
    };
    const pendingRefresh = refresh();
    await callbackStarted.promise;
    expect(persistedTokens).toEqual({ access_token: "new-access", refresh_token: "new-refresh" });
    expect(completed).toBe(false);
    await front.tags.list();
    expect(requests.at(-1)?.headers.get("Authorization")).toBe("Bearer old-access");
    persistence.resolve();
    await expect(pendingRefresh).resolves.toEqual({
      access_token: "new-access",
      refresh_token: "new-refresh",
    });
    await front.tags.list();
    expect(requests.at(-1)?.headers.get("Authorization")).toBe("Bearer new-access");
  });

  test.each([false, true])(
    "preserves credentials when persistence fails, async=%s",
    async (asyncFailure) => {
      const persistenceError = new Error("Database unavailable");
      const { front, requests } = createMockClient(
        (req) =>
          req.url === OAUTH_TOKEN_URL
            ? jsonResponse({ access_token: "new-access", refresh_token: "new-refresh" })
            : jsonResponse({ _results: [] }),
        {
          accessToken: "old-access",
          onTokenRefresh: () => {
            if (asyncFailure) {
              return Promise.reject(persistenceError);
            }
            throw persistenceError;
          },
          refreshToken: "old-refresh",
        },
      );
      const params = { clientId: DOCS_BASIC_CLIENT_ID, clientSecret: DOCS_BASIC_CLIENT_SECRET };
      await expect(front.refreshOAuthToken(params)).rejects.toBe(persistenceError);
      await front.tags.list();
      expect(requests.at(-1)?.headers.get("Authorization")).toBe("Bearer old-access");
      await expect(front.refreshOAuthToken(params)).rejects.toBe(persistenceError);
      expect(await requests.at(-1)?.clone().json()).toEqual({
        grant_type: "refresh_token",
        refresh_token: "old-refresh",
      });
    },
  );

  test.each([
    { body: { error: "invalid_grant" }, status: 400 },
    { body: { access_token: "new-access" }, status: 200 },
  ])("does not notify on an unsuccessful token exchange: %j", async ({ body, status }) => {
    let callbackCalls = 0;
    const { front } = createMockClient(() => jsonResponse(body, { status }), {
      accessToken: "old-access",
      onTokenRefresh: () => {
        callbackCalls += 1;
      },
      refreshToken: "old-refresh",
    });
    await expect(
      front.refreshOAuthToken({
        clientId: DOCS_BASIC_CLIENT_ID,
        clientSecret: DOCS_BASIC_CLIENT_SECRET,
      }),
    ).rejects.toThrow();
    expect(callbackCalls).toBe(0);
  });

  test("supports synchronous callbacks without letting mutations change credentials", async () => {
    const { front, requests } = createMockClient(
      (req) =>
        req.url === OAUTH_TOKEN_URL
          ? jsonResponse({ access_token: "new-access", refresh_token: "new-refresh" })
          : jsonResponse({ _results: [] }),
      {
        accessToken: "old-access",
        onTokenRefresh: (tokens) => {
          tokens.access_token = "mutated";
          tokens.refresh_token = "mutated";
        },
        refreshToken: "old-refresh",
      },
    );
    const params = { clientId: DOCS_BASIC_CLIENT_ID, clientSecret: DOCS_BASIC_CLIENT_SECRET };
    await expect(front.refreshOAuthToken(params)).resolves.toEqual({
      access_token: "new-access",
      refresh_token: "new-refresh",
    });
    await front.tags.list();
    expect(requests.at(-1)?.headers.get("Authorization")).toBe("Bearer new-access");
    await front.refreshOAuthToken(params);
    expect(await requests.at(-1)?.clone().json()).toEqual({
      grant_type: "refresh_token",
      refresh_token: "new-refresh",
    });
  });

  test("posts to the OAuth token endpoint with Basic auth and updates bearer token", async () => {
    const { front, requests } = createMockClient(
      (req) => {
        if (req.url === OAUTH_TOKEN_URL) {
          return jsonResponse({
            access_token: "new-access",
            expires_at: "2026-09-23T16:00:00.000Z",
            refresh_token: "new-refresh",
            token_type: "Bearer",
          });
        }
        return jsonResponse({ _pagination: {}, _results: [] });
      },
      { accessToken: "old-access", refreshToken: "old-refresh" },
    );

    const tokens = await front.refreshOAuthToken({
      clientId: DOCS_BASIC_CLIENT_ID,
      clientSecret: DOCS_BASIC_CLIENT_SECRET,
    });

    expect(tokens).toEqual({
      access_token: "new-access",
      refresh_token: "new-refresh",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe(OAUTH_TOKEN_URL);
    expect(requests[0]?.headers.get("Authorization")).toBe(DOCS_BASIC_HEADER);
    expect(requests[0]?.headers.get("Content-Type")).toBe("application/json");
    expect(await requests[0]?.clone().json()).toEqual({
      grant_type: "refresh_token",
      refresh_token: "old-refresh",
    });

    await front.tags.list();

    expect(requests).toHaveLength(2);
    expect(requests[1]?.url).toBe("https://api2.frontapp.com/tags");
    expect(requests[1]?.headers.get("Authorization")).toBe("Bearer new-access");
  });

  test("sends the rotated refresh token on a second refresh", async () => {
    let refreshCount = 0;
    const { front, requests } = createMockClient(
      (req) => {
        if (req.url === OAUTH_TOKEN_URL) {
          refreshCount += 1;
          return jsonResponse({
            access_token: `access-${refreshCount}`,
            refresh_token: `refresh-${refreshCount}`,
            token_type: "Bearer",
          });
        }
        return jsonResponse({ _pagination: {}, _results: [] });
      },
      { accessToken: "old-access", refreshToken: "old-refresh" },
    );

    await front.refreshOAuthToken({
      clientId: DOCS_BASIC_CLIENT_ID,
      clientSecret: DOCS_BASIC_CLIENT_SECRET,
    });
    await front.refreshOAuthToken({
      clientId: DOCS_BASIC_CLIENT_ID,
      clientSecret: DOCS_BASIC_CLIENT_SECRET,
    });

    expect(await requests[1]?.clone().json()).toEqual({
      grant_type: "refresh_token",
      refresh_token: "refresh-1",
    });
  });

  test("throws when the client was constructed with an API key", async () => {
    const { front, requests } = createMockClient();

    await expect(
      front.refreshOAuthToken({
        clientId: DOCS_BASIC_CLIENT_ID,
        clientSecret: DOCS_BASIC_CLIENT_SECRET,
      }),
    ).rejects.toThrow(/constructed with accessToken and refreshToken/u);
    expect(requests).toHaveLength(0);
  });

  test("throws when the token response is missing access_token or refresh_token", async () => {
    const { front } = createMockClient(() => jsonResponse({ token_type: "Bearer" }), {
      accessToken: "old-access",
      refreshToken: "old-refresh",
    });

    await expect(
      front.refreshOAuthToken({
        clientId: DOCS_BASIC_CLIENT_ID,
        clientSecret: DOCS_BASIC_CLIENT_SECRET,
      }),
    ).rejects.toThrow(/missing access_token or refresh_token/u);
  });

  test("throws FrontApiError when the token endpoint fails", async () => {
    const { front } = createMockClient(
      () =>
        jsonResponse(
          { error: "invalid_grant", error_description: "Refresh token expired" },
          { status: 400 },
        ),
      { accessToken: "old-access", refreshToken: "old-refresh" },
    );

    try {
      await front.refreshOAuthToken({
        clientId: DOCS_BASIC_CLIENT_ID,
        clientSecret: DOCS_BASIC_CLIENT_SECRET,
      });
      throw new Error("expected refreshOAuthToken to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(FrontApiError);
      if (error instanceof FrontApiError) {
        expect(error.status).toBe(400);
        expect(error.body).toEqual({
          error: "invalid_grant",
          error_description: "Refresh token expired",
        });
      }
    }
  });

  test("does not call the token endpoint automatically on API 401", async () => {
    const { front, requests } = createMockClient(
      () => jsonResponse({ _error: { message: "Unauthenticated" } }, { status: 401 }),
      { accessToken: "expired-access", refreshToken: "oauth-refresh" },
    );

    await expect(front.tags.list()).rejects.toBeInstanceOf(FrontApiError);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/tags");
  });
});
