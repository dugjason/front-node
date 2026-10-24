import { FrontApiError } from "./front-api-error";

/** Thrown when HTTP 429 retries are disabled or exhausted. */
export class FrontRateLimitError extends FrontApiError {
  /** Provider delay, or the 60-second fallback, in milliseconds before jitter. */
  readonly retryAfterMs: number;

  constructor(response: Response, body: unknown, retryAfterMs: number) {
    super(response, body);
    this.name = "FrontRateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}
