import type { FrontApiKeyOptions, FrontOAuthOptions } from "../../src/front";
import { Front } from "../../src/index";

export const TEST_API_KEY = "test-token";

export const jsonResponse = (
  body: Parameters<typeof JSON.stringify>[0],
  init: ResponseInit = {},
): Response =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...init.headers },
    status: init.status ?? 200,
  });

export type MockFetchHandler = (req: Request) => Response | Promise<Response>;

const requestFromFetchInput = (input: Parameters<typeof fetch>[0], init?: RequestInit): Request => {
  if (input instanceof Request) {
    return input;
  }
  if (input instanceof URL) {
    return new Request(input.href, init);
  }
  return new Request(input, init);
};

const apiKeyClientOptions = (
  options: { apiKey?: string; userAgent?: string },
  mockFetch: typeof fetch,
): FrontApiKeyOptions => {
  const frontOptions: FrontApiKeyOptions = {
    apiKey: options.apiKey ?? TEST_API_KEY,
    fetch: mockFetch,
  };
  if (options.userAgent !== undefined) {
    frontOptions.userAgent = options.userAgent;
  }
  return frontOptions;
};

const oauthClientOptions = (
  options: {
    accessToken: string;
    refreshToken?: string;
    userAgent?: string;
    onTokenRefresh?: FrontOAuthOptions["onTokenRefresh"];
  },
  mockFetch: typeof fetch,
): FrontOAuthOptions => {
  const frontOptions: FrontOAuthOptions = {
    accessToken: options.accessToken,
    fetch: mockFetch,
    onTokenRefresh: options.onTokenRefresh,
    refreshToken: options.refreshToken ?? "test-refresh-token",
  };
  if (options.userAgent !== undefined) {
    frontOptions.userAgent = options.userAgent;
  }
  return frontOptions;
};

export const createMockClient = (
  handler: MockFetchHandler = () => jsonResponse({ _pagination: {}, _results: [] }),
  options: {
    apiKey?: string;
    accessToken?: string;
    refreshToken?: string;
    userAgent?: string;
    onTokenRefresh?: FrontOAuthOptions["onTokenRefresh"];
  } = {},
) => {
  const requests: Request[] = [];
  const mockFetch = new Proxy(fetch, {
    apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
      const req = requestFromFetchInput(input, init);
      requests.push(req);
      return handler(req);
    },
  });

  const front =
    options.accessToken === undefined
      ? new Front(apiKeyClientOptions(options, mockFetch))
      : new Front(
          oauthClientOptions(
            {
              accessToken: options.accessToken,
              onTokenRefresh: options.onTokenRefresh,
              refreshToken: options.refreshToken,
              userAgent: options.userAgent,
            },
            mockFetch,
          ),
        );

  return { front, requests };
};

/** Default empty list response setup for simple GET list tests. */
export const createTestSetup = () => createMockClient();
