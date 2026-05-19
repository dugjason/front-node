/**
 * List JSON after {@link normalizeFrontResponse}: `_pagination` is renamed to `pagination`
 * (and `pagination.next` is the `page_token` string, not the raw API URL).
 */
export type WithNormalizedPagination<T> = [Extract<keyof T, "_pagination">] extends [never]
  ? T
  : Omit<T, "_pagination"> & {
      pagination?: T extends { _pagination?: infer P } ? P : never;
    };

/**
 * Pagination object after {@link normalizeFrontResponse}: `_pagination` from the API becomes `pagination`,
 * and `next` holds the **`page_token` query value** (not the full URL the API returns).
 */
export type PaginationInfo = Record<string, unknown> & {
  /** Pass as `page_token` on the next list request. */
  next?: string | null;
};

/**
 * Extract the `page_token` query parameter from a Front pagination `next` URL.
 * If `next` is not a URL or has no `page_token`, returns `next` unchanged.
 *
 * @param next Value of `_pagination.next` from the raw API.
 * @param baseUrl API origin (used to resolve relative `next` links).
 */
export const pageTokenFromPaginationNextUrl = (
  next: string | null | undefined,
  baseUrl: string,
): string | null | undefined => {
  if (next === undefined || next === null) {
    return null;
  }
  if (next === "") {
    return null;
  }
  try {
    const u = new URL(next, baseUrl);
    const token = u.searchParams.get("page_token");
    if (token !== null && token !== "") {
      return token;
    }
  } catch {
    // not a URL
  }
  return next;
};

/**
 * Walk JSON from the Front API: rename `_pagination` → `pagination` and replace `pagination.next`
 * full URLs with the `page_token` query value. Recurses into objects and arrays.
 *
 * @param value Parsed JSON body.
 * @param baseUrl Same origin as the client (`FrontBase` / `Front` `baseUrl`).
 */
export const normalizeFrontResponse = <T>(value: T, baseUrl: string): T => {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeFrontResponse(item, baseUrl)) as T;
  }
  const input = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(input)) {
    if (key === "_pagination") {
      if (val !== null && typeof val === "object" && !Array.isArray(val)) {
        const p = val as Record<string, unknown>;
        const nextRaw = p.next;
        const next =
          typeof nextRaw === "string" ? pageTokenFromPaginationNextUrl(nextRaw, baseUrl) : nextRaw;
        result.pagination = { ...p, next };
      }
      continue;
    }
    result[key] =
      val !== null && typeof val === "object" ? normalizeFrontResponse(val, baseUrl) : val;
  }
  return result as T;
};
