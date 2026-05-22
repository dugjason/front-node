import { Front } from "../../src/index";

/** Shared expectation for unsupported {@link FrontResource.delete} overrides. */
export const NOT_SUPPORTED = /not supported/u;

export const TEST_API_KEY = "test-token";

export const jsonResponse = (body: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...init.headers },
    status: init.status ?? 200,
  });

export type MockFetchHandler = (req: Request) => Response | Promise<Response>;

export const createMockClient = (
  handler: MockFetchHandler = () => jsonResponse({ _pagination: {}, _results: [] }),
  options: { apiKey?: string; userAgent?: string } = {},
) => {
  const requests: Request[] = [];
  const mockFetch = new Proxy(fetch, {
    apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
      const req = input instanceof Request ? input : new Request(input, init);
      requests.push(req);
      return handler(req);
    },
  });

  const front = new Front({
    apiKey: options.apiKey ?? TEST_API_KEY,
    fetch: mockFetch,
    ...(options.userAgent === undefined ? {} : { userAgent: options.userAgent }),
  });

  return { front, requests };
};

/** Default empty list response setup for simple GET list tests. */
export const createTestSetup = () => createMockClient();
