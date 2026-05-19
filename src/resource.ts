import type { FrontBase } from "./base";

/**
 * Base for a Front REST entity (`id`, `_links`, …) with shared wiring for
 * {@link refresh}, {@link delete}, {@link save}, and PATCH helpers.
 *
 * Subclasses expose domain fields (often using {@link pick} / {@link assign} with API keys)
 * and implement {@link selfPath}, {@link toUpdateBody}, and {@link update}.
 *
 * @template TState OpenAPI-derived JSON shape for the resource (includes `id` and `_links`).
 * @template TUpdate PATCH payload type (or equivalent) for {@link update} / {@link save}.
 */
export abstract class FrontResource<TState extends { id: string; _links: unknown }, TUpdate> {
  protected state: TState;
  protected readonly base: FrontBase;

  /**
   * @param base Shared HTTP client.
   * @param snapshot Initial resource JSON (deep-cloned).
   */
  constructor(base: FrontBase, snapshot: TState) {
    this.base = base;
    this.state = structuredClone(snapshot);
  }

  /** Resource id from the API (`id` field). */
  get id(): string {
    return this.state.id;
  }

  /** HAL-style `_links` object from the API response. */
  get links(): TState["_links"] {
    return this.state._links;
  }

  /** Replace {@link links} on the in-memory copy (does not call the API by itself). */
  set links(value: TState["_links"]) {
    this.assign("_links", value);
  }

  /** Read-only view of the full API JSON for this resource. */
  get data(): Readonly<TState> {
    return this.state;
  }

  /** Read a field using the API / schema property name. */
  protected pick<K extends keyof TState>(key: K): TState[K] {
    return this.state[key];
  }

  /** Assign one field immutably (API / schema property name). */
  protected assign<K extends keyof TState>(key: K, value: TState[K]): void {
    this.state = { ...this.state, [key]: value };
  }

  protected replaceState(next: TState): void {
    this.state = structuredClone(next);
  }

  /** URL for this resource (GET / PATCH / DELETE on the entity). */
  protected abstract selfPath(): string;

  /** Optional hook after {@link refresh} replaces state. */
  protected onAfterRefresh(): void {
    // Subclasses may override.
  }

  /**
   * `GET` the current entity URL and replace {@link data} from the response.
   * Required OAuth scopes depend on the resource (see Front API docs for that path).
   */
  async refresh(): Promise<this> {
    const next = await this.base.requestJson<TState>("GET", this.selfPath());
    this.replaceState(next);
    this.onAfterRefresh();
    return this;
  }

  /**
   * `DELETE` the current entity URL.
   * Required OAuth scopes depend on the resource (see Front API docs for that path).
   */
  async delete(): Promise<void> {
    await this.base.requestJson<undefined>("DELETE", this.selfPath());
  }

  /** PATCH with an empty body response; merge the request into local state. */
  protected async patchNoContent<TBody>(
    body: TBody,
    merge: (current: TState, body: TBody) => TState,
  ): Promise<void> {
    await this.base.requestJson<undefined>("PATCH", this.selfPath(), { body });
    this.state = merge(this.state, body);
  }

  /** PATCH where the API returns the full updated resource. */
  protected async patchReplaceFromResponse<TBody>(body: TBody): Promise<void> {
    const next = await this.base.requestJson<TState>("PATCH", this.selfPath(), {
      body,
    });
    this.replaceState(next);
  }

  /** Build the JSON body used by {@link save} (full persist of mutable fields). */
  abstract toUpdateBody(): TUpdate;

  /**
   * `PATCH` (or equivalent) this entity with a partial or full update payload.
   * Semantics (empty body vs returned entity) are defined per subclass.
   */
  abstract update(body: TUpdate | Partial<TUpdate>): Promise<void>;

  /**
   * Persist local changes by calling {@link update} with {@link toUpdateBody}.
   * Same network and scope requirements as {@link update}.
   */
  async save(): Promise<void> {
    await this.update(this.toUpdateBody());
  }
}
