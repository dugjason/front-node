import packageJson from "../package.json";
import { FrontApiError } from "./errors";
import { normalizeFrontResponse } from "./normalize-response";

const DEFAULT_USER_AGENT = `${packageJson.name}@${packageJson.version}`;

/** Options for {@link FrontBase}. */
export interface FrontBaseOptions {
  /** Bearer token sent as `Authorization: Bearer …`. */
  apiKey: string;
  /** API origin (default `https://api2.frontapp.com`). */
  baseUrl?: string;
  /** Override `fetch` (defaults to `globalThis.fetch`). */
  fetch?: typeof fetch;
  /** User-Agent header value sent with each request. */
  userAgent?: string;
}

const TRAILING_SLASH_AT_END = /\/$/u;

const joinUrl = (baseUrl: string, path: string): string => {
  const base = baseUrl.replace(TRAILING_SLASH_AT_END, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

const appendQuery = (url: string, query?: Record<string, string | undefined>): string => {
  if (!query) {
    return url;
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs.length > 0 ? `${url}?${qs}` : url;
};

/**
 * Shared HTTP layer for the Front API. {@link Front} extends this class and attaches resource helpers.
 */
export class FrontBase {
  protected readonly apiKey: string;
  protected readonly baseUrl: string;
  protected readonly fetchImpl: typeof fetch;
  protected readonly userAgent: string;

  /** @param options API token and optional overrides. */
  constructor(options: FrontBaseOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://api2.frontapp.com";
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  }

  protected buildUrl(path: string, query?: Record<string, string | undefined>): string {
    return appendQuery(joinUrl(this.baseUrl, path), query);
  }

  /**
   * Build a path by substituting `{param}` placeholders with URL-encoded values
   * (e.g. `"/tags/{tag_id}"` + `{ tag_id: "tag_1" }` → `"/tags/tag_1"`).
   *
   * @param template Path template containing `{name}` segments.
   * @param pathParams Map of placeholder names to raw path segment values.
   */
  static expandPath(template: string, pathParams: Record<string, string>): string {
    let out = template;
    for (const [key, value] of Object.entries(pathParams)) {
      out = out.replace(`{${key}}`, encodeURIComponent(value));
    }
    if (out.includes("{")) {
      throw new Error(`Unresolved path template: ${template} → ${out}`);
    }
    return out;
  }

  /**
   * Perform an HTTP request with JSON request/response handling.
   *
   * Sends `Authorization: Bearer` using {@link FrontBaseOptions.apiKey}. Parses JSON bodies on success;
   * returns `undefined` for status `204` or empty bodies. On failure, throws {@link FrontApiError}.
   *
   * Successful JSON is passed through {@link normalizeFrontResponse}: `_pagination` becomes `pagination`,
   * and `pagination.next` is the `page_token` string (parsed from the API’s full next-page URL when needed).
   *
   * @param method HTTP verb (`GET`, `POST`, `PATCH`, …).
   * @param path Absolute path beginning with `/` (e.g. `"/tags"`).
   * @param init Optional query string and JSON-serializable body.
   */
  async requestJson<TResult>(
    method: string,
    path: string,
    init?: { query?: Record<string, string | undefined>; body?: unknown },
  ): Promise<TResult> {
    const url = this.buildUrl(path, init?.query);
    const headers = new Headers({
      Accept: "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": this.userAgent,
    });
    if (init?.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }
    const response = await this.fetchImpl(url, {
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      headers,
      method,
    });
    if (!response.ok) {
      let parsed: unknown;
      const text = await response.text();
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = text;
      }
      throw new FrontApiError(response, parsed);
    }
    if (response.status === 204) {
      return undefined as TResult;
    }
    const text = await response.text();
    if (text.length === 0) {
      return undefined as TResult;
    }
    const parsed: unknown = JSON.parse(text);
    return normalizeFrontResponse(parsed, this.baseUrl) as TResult;
  }

  /**
   * Perform a request and return the successful {@link Response} without reading or JSON-parsing the body
   * (e.g. binary attachment downloads). On failure, reads the body for diagnostics and throws {@link FrontApiError}.
   *
   * @param method HTTP verb (`GET`, …).
   * @param path Absolute path beginning with `/`.
   * @param init Optional query string and extra headers; default `Accept` is all types.
   */
  async requestWithoutParsingBody(
    method: string,
    path: string,
    init?: {
      query?: Record<string, string | undefined>;
      headers?: Record<string, string | undefined>;
    },
  ): Promise<Response> {
    const url = this.buildUrl(path, init?.query);
    const headers = new Headers({
      Accept: "*/*",
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": this.userAgent,
    });
    if (init?.headers !== undefined) {
      for (const [key, value] of Object.entries(init.headers)) {
        if (value !== undefined) {
          headers.set(key, value);
        }
      }
    }
    const response = await this.fetchImpl(url, { headers, method });
    if (!response.ok) {
      let parsed: unknown;
      const text = await response.text();
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = text;
      }
      throw new FrontApiError(response, parsed);
    }
    return response;
  }
}
