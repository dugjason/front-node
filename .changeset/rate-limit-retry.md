---
"@dugjason/front-node": minor
---

Retry HTTP 429 responses by default for API-key and OAuth clients, including parsed requests, raw downloads, and token exchanges. Retry up to twice, honoring provider delay headers with positive jitter and a 60-second fallback. Add `rateLimitRetry: false` to opt out and export `FrontRateLimitError`, extending `FrontApiError` with `retryAfterMs`. Existing HTTP error metadata remains available. Consumers with custom retry wrappers should remove them or disable SDK retries to avoid stacking budgets.
