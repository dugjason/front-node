/** Thrown when the Front API returns a non-success HTTP status. */
export class FrontApiError extends Error {
  /** HTTP status code from the failed response. */
  readonly status: number;
  /** Response headers from the failed request. */
  readonly headers: Headers;
  /** The underlying `fetch` {@link Response}. */
  readonly response: Response;
  /** Parsed error body when JSON; otherwise the raw response text or other parse result. */
  readonly body: unknown;

  /**
   * @param response Failed HTTP response.
   * @param body Parsed error payload (see {@link FrontApiError.body}).
   */
  constructor(response: Response, body: unknown) {
    super(`Front API error: ${response.status} ${response.statusText}`);
    this.name = "FrontApiError";
    this.status = response.status;
    this.headers = response.headers;
    this.response = response;
    this.body = body;
  }
}

/** Parse an HTTP error payload, preserving plain-text responses. */
export const parseErrorBody = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return text;
    }
    throw error;
  }
};
