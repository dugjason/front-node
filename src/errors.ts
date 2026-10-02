/** Thrown when the Front API returns a non-success HTTP status. */
export class FrontApiError extends Error {
  /** HTTP status code from the failed response. */
  readonly status: number;
  /** Response headers from the failed request. */
  readonly headers: Headers;
  /** The underlying `fetch` {@link Response}. */
  readonly response: Response;
  /** Parsed error body when JSON; otherwise the raw response text. */
  readonly body: unknown;

  /**
   * @param response Failed HTTP response.
   * @param responseText Raw response body text, parsed as JSON when possible.
   */
  constructor(response: Response, responseText: string) {
    super(`Front API error: ${response.status} ${response.statusText}`);
    this.name = "FrontApiError";
    this.status = response.status;
    this.headers = response.headers;
    this.response = response;
    try {
      this.body = JSON.parse(responseText);
    } catch {
      this.body = responseText;
    }
  }
}
