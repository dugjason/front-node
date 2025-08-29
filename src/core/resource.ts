import {
  buildPageFromListResponse,
  makePagedResult,
  type PagePair,
} from "./paginator"

/**
 * Base class for all resource namespaces.
 *
 * This class encapsulates shared behavior and utilities used by resource
 * wrappers. It is generic over two types:
 *
 * - TItem: The concrete domain instance type exposed by the resource
 *   (e.g., FrontTag, FrontAccount).
 * - TRaw: The raw DTO shape returned by the generated client for the item
 *   (e.g., TagResponse, AccountResponse).
 *
 * Subclasses must implement {@link makeItem} to define how a raw DTO is
 * transformed into a domain instance. By centralizing this transformation,
 * higher-level helpers such as {@link listPaginated} can construct items
 * without duplicated mapping code in each list method.
 */
export abstract class APIResource<TItem = unknown, TRaw = unknown> {
  /**
   * Convert a raw DTO returned by the generated client into the domain
   * instance exposed by the resource.
   *
   * Subclasses should implement the minimal logic necessary to wrap the raw
   * data (typically `return new FrontX(raw)`), keeping domain
   * classes thin and delegating network operations back to the generated SDK.
   *
   * @param raw - The raw DTO for a single resource item
   * @returns The resource-specific domain instance
   */
  protected abstract makeItem(raw: TRaw): TItem

  /**
   * Helper for list endpoints that use Front's standard pagination shape.
   *
   * This function wires the first page and an async iterator over subsequent
   * pages, while preserving the underlying `Response` object for each request.
   * It expects the list response body to contain an `_results` array and a
   * `_pagination.next` link that encodes the next `page_token`.
   *
   * Usage pattern in a resource wrapper:
   *
   * ```ts
   * async list(query?: ListXData["query"]) {
   *   return this.listPaginated<ListXResponse, { query?: ListXData["query"]}>({
   *     initialOptions: { query },
   *     listCall: (options) => listX({ ...options }),
   *   })
   * }
   * ```
   *
   * Notes
   * - The method automatically appends `page_token` to the provided
   *   `initialOptions.query` on subsequent page fetches.
   * - Item mapping is handled via {@link makeItem}, avoiding per-call
   *   mapping boilerplate.
   *
   * @typeParam TListResponse - The concrete list response type with `_results`
   * @typeParam TOptions - The options accepted by the generated list function,
   *   which must include an optional `query.page_token` string
   * @param opts.initialOptions - Initial options passed to the generated list function
   * @param opts.listCall - The generated list function to execute
   * @returns The first page pair and an async iterable over subsequent page pairs
   */
  protected async listPaginated<
    TListResponse extends { _results?: Array<TRaw> },
    TOptions extends { query?: { page_token?: string } },
  >(opts: {
    initialOptions: TOptions
    listCall: (options: TOptions) => Promise<{
      response: Response
      data?: TListResponse
    }>
  }): Promise<PagePair<TItem> & AsyncIterable<PagePair<TItem>>> {
    const { initialOptions, listCall } = opts

    const result = await listCall(initialOptions)

    if (!result.data) throw new Error("No results")

    const page = buildPageFromListResponse<TItem, TListResponse>({
      data: result.data,
      mapItems: (d) =>
        ((d._results ?? []) as TRaw[]).map((raw) => this.makeItem(raw)),
      fetchNext: async (pageToken) => {
        const nextOptions = {
          ...initialOptions,
          query: { ...(initialOptions.query ?? {}), page_token: pageToken },
        } as TOptions
        const res2 = await listCall(nextOptions)
        return {
          response: res2.response,
          data: (res2.data as TListResponse | undefined) ?? undefined,
        }
      },
    })

    return makePagedResult({ response: result.response, page })
  }

  /**
   * Helper for list endpoints that return a single, non-paginated array of results.
   *
   * Maps the `_results` array into domain items using {@link makeItem} and returns
   * a simple `{ response, data }` pair.
   */
  protected async listWithoutPagination<
    TListResponse extends { _results?: Array<TRaw> },
  >(opts: {
    listCall: () => Promise<{ response: Response; data?: TListResponse }>
  }): Promise<{ response: Response; data: TItem[] }> {
    const result = await opts.listCall()
    const items = ((result.data?._results ?? []) as TRaw[]).map((raw) =>
      this.makeItem(raw),
    )
    return { response: result.response, data: items }
  }

  /**
   * Helper for singular GET endpoints that return one entity.
   *
   * Provide a GET call closure that performs the request using the
   * generated SDK. The response body type must be assignable to `TRaw`.
   */
  protected async getOne<TGet extends TRaw>(opts: {
    getCall: () => Promise<{ response: Response; data?: TGet }>
  }): Promise<{ item: TItem; response: Response }> {
    const result = await opts.getCall()
    if (!result.data) throw new Error("Missing data")

    return { item: this.makeItem(result.data), response: result.response }
  }

  /**
   * Helper for singular CREATE endpoints that return one entity.
   *
   * Provide a CREATE call closure that performs the request using the
   * generated SDK. The response body type must be assignable to `TRaw`.
   */
  protected async createOne<TCreate extends TRaw>(opts: {
    createCall: () => Promise<{ response: Response; data?: TCreate }>
  }): Promise<{ item: TItem; response: Response }> {
    const result = await opts.createCall()
    if (!result.data) throw new Error("Missing data")
    return { item: this.makeItem(result.data), response: result.response }
  }
}

/**
 * Base class for domain instances (e.g., `FrontTag`, `FrontAccount`).
 *
 * Provides a shared shape for thin wrappers around raw API DTOs, exposing a
 * `toJSON()` method that returns the underlying raw data for serialization or
 * persistence. Subclasses can add getters for commonly accessed fields and
 * instance methods that delegate mutations back to the generated SDK.
 */
export abstract class ResourceInstance<T> {
  protected constructor(protected _data: T) {}
  /**
   * Return the underlying raw DTO for this domain instance.
   *
   * Prefer using the typed getters on subclasses for read access and methods
   * that call the generated SDK for mutations.
   */
  toJSON(): T {
    return this._data
  }
}
