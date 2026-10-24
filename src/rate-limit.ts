/** Front uses seconds for Retry-After and UNIX seconds for X-RateLimit-Reset. */
export const rateLimitDelay = (headers: Headers, now = Date.now()): number => {
  const retryAfter = headers.get("Retry-After");
  const seconds =
    retryAfter === null
      ? Number(headers.get("X-RateLimit-Reset") ?? Number.NaN) - now / 1000
      : Number(retryAfter.trim() || Number.NaN);
  return Math.ceil((seconds >= 0 && seconds <= 60 ? seconds : 60) * 1000);
};
