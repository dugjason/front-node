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
 */
export const pageTokenFromPaginationNextUrl = (next?: string | null): string | null | undefined => {
  if (!next) {
    return null;
  }
  try {
    const u = new URL(next);
    const token = u.searchParams.get("page_token");
    if (token !== null && token !== "") {
      return token;
    }
  } catch {
    // not a URL
    return null;
  }
  return null;
};

/**
 * Rename `_pagination` → `pagination` and replace `pagination.next` full URLs with the
 * `page_token` query value.
 *
 * @param value Parsed JSON body.
 */
export const normalizeFrontResponse = <T>(value: T): WithNormalizedPagination<T> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return value as WithNormalizedPagination<T>;
  }
  const input = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(input)) {
    if (key === "_pagination") {
      if (val !== null && typeof val === "object" && !Array.isArray(val)) {
        const p = val as Record<string, unknown>;
        const nextRaw = p.next;
        const next =
          typeof nextRaw === "string" ? pageTokenFromPaginationNextUrl(nextRaw) : nextRaw;
        result.pagination = { ...p, next };
      }
      continue;
    }
    result[key] = val;
  }
  return result as WithNormalizedPagination<T>;
};
