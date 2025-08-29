export class Page<T> implements AsyncIterable<T> {
  constructor(
    public readonly items: T[],
    private readonly _getNext:
      | (() => Promise<{ response: Response; page: Page<T> } | null>)
      | null,
  ) {}
  /**
   * Whether there is another page available after the current one.
   */
  get hasNextPage(): boolean {
    return !!this._getNext
  }
  /**
   * Fetch the next page of results, if available.
   *
   * @returns The next page pair (containing `Response` and `Page<T>`) or `null` if no more pages.
   */
  async nextPage(): Promise<{ response: Response; page: Page<T> } | null> {
    return this._getNext ? this._getNext() : null
  }
  /**
   * Iterate over the items in this page.
   */
  async *[Symbol.asyncIterator]() {
    for (const i of this.items) yield i
  }
}

/**
 * Parse the `page_token` query parameter from a `_pagination.next` URL.
 *
 * @param nextUrl - The `_pagination.next` absolute or relative URL
 * @returns The `page_token` value or `null` if it cannot be determined
 */
export function parsePageTokenFromNextUrl(
  nextUrl?: string | null,
): string | null {
  if (!nextUrl) return null
  try {
    const u = new URL(nextUrl, "https://api2.frontapp.com")
    const token = u.searchParams.get("page_token")
    return token
  } catch {
    return null
  }
}

/**
 * Safely read the `_pagination.next` URL from a list response body.
 *
 * @param data - The list response body
 * @returns The URL string if present, otherwise `null`
 */
export function getNextUrlFromBody(data: unknown): string | null {
  if (!data || typeof data !== "object") return null
  const body = data as { _pagination?: { next?: unknown } }
  const next = body._pagination?.next
  return typeof next === "string" ? next : null
}

/**
 * Extract the next `page_token` from a list response body.
 *
 * @param data - The list response body
 * @returns The `page_token` value or `null`
 */
export function getNextPageTokenFromBody(data: unknown): string | null {
  return parsePageTokenFromNextUrl(getNextUrlFromBody(data))
}

/**
 * Build a `Page<TItem>` from an initial list response and provide a `fetchNext` closure
 * that retrieves subsequent pages, preserving the underlying `Response` object for each.
 *
 * The caller supplies `mapItems` to transform the list response into `TItem[]` and a `fetchNext`
 * function that accepts a `pageToken` and returns `{ response, data }` for the next page.
 *
 * @typeParam TItem - The item type contained in the page
 * @typeParam TListResponse - The concrete list response body type
 * @param args.data - The first page body
 * @param args.fetchNext - A function to fetch the next page given a token
 * @param args.mapItems - A function mapping a response body to an array of items
 * @returns The constructed `Page<TItem>` for the first page
 */
export function buildPageFromListResponse<TItem, TListResponse>(args: {
  data: TListResponse
  fetchNext: (
    pageToken: string,
  ) => Promise<{ response: Response; data: TListResponse | undefined }>
  mapItems: (data: TListResponse) => TItem[]
}): Page<TItem> {
  const { data, fetchNext, mapItems } = args
  const items = mapItems(data)

  const makeGetNext = (
    nextToken: string,
  ): (() => Promise<{ response: Response; page: Page<TItem> } | null>) => {
    return async () => {
      const { response, data: nextData } = await fetchNext(nextToken)
      if (!nextData) return null
      const nextItems = mapItems(nextData)
      const token2 = getNextPageTokenFromBody(nextData)
      const nextPage = new Page(nextItems, token2 ? makeGetNext(token2) : null)
      return { response, page: nextPage }
    }
  }

  const token = getNextPageTokenFromBody(data)
  return new Page(items, token ? makeGetNext(token) : null)
}

/** A pair of the raw `Response` and a `Page<T>` of items. */
export type PagePair<T> = { response: Response; page: Page<T> }

/**
 * Create an async-iterable result from the first `PagePair<T>` that yields each
 * page pair as it is fetched via `nextPage()`. This allows
 *
 * ```ts
 * for await (const { response, page } of result) { ... }
 * ```
 *
 * while also providing direct access to the first `{ response, page }`.
 *
 * @param first - The first page pair
 * @returns An object containing the first page pair and an async iterator over subsequent pairs
 */
export function makePagedResult<T>(
  first: PagePair<T>,
): PagePair<T> & AsyncIterable<PagePair<T>> {
  return {
    ...first,
    async *[Symbol.asyncIterator]() {
      let current: PagePair<T> | null = first
      while (current) {
        yield current
        const next = await current.page.nextPage()
        if (!next) return
        current = next
      }
    },
  }
}
