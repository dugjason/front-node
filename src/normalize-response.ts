/**
 * List JSON after {@link normalizeFrontResponse}: `_pagination` is renamed to `pagination`
 * (and `pagination.next` retains the full next-page URL).
 */
export type WithNormalizedPagination<T> = [Extract<keyof T, "_pagination">] extends [never]
  ? T
  : Omit<T, "_pagination"> & {
      pagination?: T extends { _pagination?: infer P } ? P : never;
    };

/**
 * Pagination object after {@link normalizeFrontResponse}: `_pagination` from the API becomes `pagination`,
 * and `next` holds the full next-page URL returned by Front.
 */
export interface PaginationInfo {
  /** Pass as `nextPageUrl` on the next list request. */
  next?: string | null;
}

/**
 * Extract the `page_token` query parameter from a Front pagination `next` URL.
 * If `next` is not a URL or has no nonempty `page_token`, returns `null`.
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
 * Rename `_pagination` → `pagination`, preserving its metadata and next-page URL.
 *
 * @param value Parsed JSON body.
 */
export const normalizeFrontResponse = <T>(value: T): WithNormalizedPagination<T> => {
  if (!(value instanceof Object) || Array.isArray(value)) {
    return value as WithNormalizedPagination<T>;
  }
  const entries = Object.entries(value).flatMap(([key, val]) => {
    if (key !== "_pagination") {
      return [[key, val]];
    }
    if (!(val instanceof Object) || Array.isArray(val)) {
      return [];
    }
    return [["pagination", { ...val }]];
  });
  return Object.fromEntries(entries) as WithNormalizedPagination<T>;
};
