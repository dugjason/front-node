import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type TagResponse = components["schemas"]["TagResponse"];
export type CreateTag = components["schemas"]["CreateTag"];
export type UpdateTag = components["schemas"]["UpdateTag"];

/** PATCH body for a tag; `parent_tag_id` may be `null` to clear the parent (API behavior). */
export type TagUpdateInput = Omit<UpdateTag, "parent_tag_id"> & {
  parent_tag_id?: string | null;
};

type ListTagsQuery = NonNullable<operations["list-tags"]["parameters"]["query"]>;
type ListTagsResponse = operations["list-tags"]["responses"][200]["content"]["application/json"];

type ListTagChildrenResponse =
  operations["list-tag-children"]["responses"][200]["content"]["application/json"];

type ListTaggedConversationsQuery = NonNullable<
  operations["list-tagged-conversations"]["parameters"]["query"]
>;
type ListTaggedConversationsResponse =
  operations["list-tagged-conversations"]["responses"][200]["content"]["application/json"];

const queryFromListTags = (q?: ListTagsQuery): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  if (q.sort_by !== undefined) {
    out.sort_by = String(q.sort_by);
  }
  if (q.sort_order !== undefined) {
    out.sort_order = String(q.sort_order);
  }
  return out;
};

const queryFromTaggedConversations = (
  q?: ListTaggedConversationsQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.q !== undefined) {
    out.q = String(q.q);
  }
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  return out;
};

const mergeTagSnapshot = (current: TagResponse, patch: Partial<TagUpdateInput>): TagResponse => {
  const { parent_tag_id: _parentTagIdOmitted, ...restPatch } = patch;
  const filtered = Object.fromEntries(
    Object.entries(restPatch).filter(([, value]) => value !== undefined),
  ) as Partial<TagResponse>;
  return { ...current, ...filtered };
};

const tagResponseToUpdateBody = (
  state: TagResponse,
  parentTagId: string | null | undefined,
): TagUpdateInput => {
  const body: TagUpdateInput = {
    description: state.description ?? undefined,
    highlight: (state.highlight ?? undefined) as UpdateTag["highlight"],
    is_visible_in_conversation_lists: state.is_visible_in_conversation_lists,
    name: state.name,
  };
  if (parentTagId !== undefined) {
    body.parent_tag_id = parentTagId;
  }
  return body;
};

/**
 * One tag (`/tags/{tag_id}` and related child/conversation routes).
 *
 * Writable camelCase: `name`, `description`, `highlight`, `isVisibleInConversationLists`, `links`, `parentTagId`
 * (PATCH-only parent id; `null` clears on save — cleared on {@link refresh}). Read-only: `id`, `isPrivate`,
 * `createdAt`, `updatedAt`. Raw JSON: {@link FrontResource.data}.
 *
 * @see https://dev.frontapp.com/reference/tags
 */
export class FrontTag extends FrontResource<TagResponse, TagUpdateInput> {
  /** PATCH-only parent id (`null` clears). Cleared by {@link refresh}. */
  private parentTagIdForUpdate: string | null | undefined;

  /**
   * @param base Shared HTTP client (in practice the `Front` instance).
   * @param snapshot Tag JSON returned by the API.
   */
  constructor(base: FrontBase, snapshot: TagResponse) {
    super(base, snapshot);
    this.parentTagIdForUpdate = undefined;
  }

  protected selfPath(): string {
    return FrontBase.expandPath("/tags/{tag_id}", { tag_id: this.id });
  }

  protected override onAfterRefresh(): void {
    this.parentTagIdForUpdate = undefined;
  }

  get name(): string {
    return this.pick("name");
  }

  set name(value: string) {
    this.assign("name", value);
  }

  get description(): string | null {
    return this.pick("description");
  }

  set description(value: string | null) {
    this.assign("description", value);
  }

  get highlight(): string | null {
    return this.pick("highlight");
  }

  set highlight(value: string | null) {
    this.assign("highlight", value);
  }

  get isPrivate(): boolean {
    return this.pick("is_private");
  }

  get isVisibleInConversationLists(): boolean {
    return this.pick("is_visible_in_conversation_lists");
  }

  set isVisibleInConversationLists(value: boolean) {
    this.assign("is_visible_in_conversation_lists", value);
  }

  get createdAt(): number | undefined {
    return this.pick("created_at");
  }

  get updatedAt(): number | undefined {
    return this.pick("updated_at");
  }

  /**
   * Parent tag id for `PATCH` updates only ([Update a tag](https://dev.frontapp.com/reference/update-a-tag)).
   * Set to `null` and call {@link save} to clear the parent on the server.
   */
  get parentTagId(): string | null | undefined {
    return this.parentTagIdForUpdate;
  }

  set parentTagId(value: string | null | undefined) {
    this.parentTagIdForUpdate = value;
  }

  /**
   * Build the `PATCH` body implied by the current property values (including {@link parentTagId} when set).
   * @see https://dev.frontapp.com/reference/update-a-tag
   */
  toUpdateBody(): TagUpdateInput {
    return tagResponseToUpdateBody(this.state, this.parentTagIdForUpdate);
  }

  /**
   * Update this tag (`PATCH /tags/{tag_id}`). The API returns `204`; local state is merged from the request body.
   *
   * **Required scope:** `tags:write`
   *
   * @param body Fields to change (OpenAPI {@link TagUpdateInput}).
   * @see https://dev.frontapp.com/reference/update-a-tag
   */
  async update(body: TagUpdateInput | Partial<TagUpdateInput>): Promise<void> {
    await this.patchNoContent(body, mergeTagSnapshot);
    if ("parent_tag_id" in body) {
      this.parentTagIdForUpdate =
        body.parent_tag_id === null || body.parent_tag_id === undefined
          ? undefined
          : body.parent_tag_id;
    }
  }

  /**
   * List child tags (`GET /tags/{tag_id}/children`).
   *
   * **Required scope:** `tags:read`
   *
   * @see https://dev.frontapp.com/reference/list-tag-children
   */
  async listChildren(): Promise<FrontTag[]> {
    const path = FrontBase.expandPath("/tags/{tag_id}/children", {
      tag_id: this.id,
    });
    const json = await this.base.requestJson<WithNormalizedPagination<ListTagChildrenResponse>>(
      "GET",
      path,
    );
    const results = json._results ?? [];
    return results.map((row) => new FrontTag(this.base, row));
  }

  /**
   * Create a child tag (`POST /tags/{tag_id}/children`).
   *
   * **Required scope:** `tags:write`
   *
   * @param body Child tag payload (OpenAPI {@link CreateTag}).
   * @see https://dev.frontapp.com/reference/create-child-tag
   */
  async createChild(body: CreateTag): Promise<FrontTag> {
    const path = FrontBase.expandPath("/tags/{tag_id}/children", {
      tag_id: this.id,
    });
    const created = await this.base.requestJson<TagResponse>("POST", path, {
      body,
    });
    return new FrontTag(this.base, created);
  }

  /**
   * List conversations that have this tag (`GET /tags/{tag_id}/conversations`).
   *
   * **Required scope:** `conversations:read`
   *
   * @param query Optional `q`, `limit`, and `page_token` (see Front pagination and query-object docs).
   * @see https://dev.frontapp.com/reference/list-tagged-conversations
   */
  async listTaggedConversations(
    query?: ListTaggedConversationsQuery,
  ): Promise<WithNormalizedPagination<ListTaggedConversationsResponse>> {
    const path = FrontBase.expandPath("/tags/{tag_id}/conversations", {
      tag_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTaggedConversationsResponse>>(
      "GET",
      path,
      {
        query: queryFromTaggedConversations(query),
      },
    );
  }
}

/**
 * Company-scoped tags (`GET/POST /tags`, `GET /tags/{tag_id}` via {@link FrontTags.get}).
 *
 * @see https://dev.frontapp.com/reference/tags
 */
export class FrontTags {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List tags for the company accessible to the token (company, team, and teammate tags).
   *
   * **Required scope:** `tags:read`
   *
   * @param query Optional pagination and sorting.
   * @see https://dev.frontapp.com/reference/list-tags
   */
  async list(query?: ListTagsQuery): Promise<WithNormalizedPagination<ListTagsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListTagsResponse>>("GET", "/tags", {
      query: queryFromListTags(query),
    });
  }

  /**
   * Create a tag in the oldest team (legacy `POST /tags` endpoint).
   *
   * **Required scope:** `tags:write`
   *
   * @param body Tag fields (OpenAPI {@link CreateTag}).
   * Prefer company/team/teammate tag endpoints when possible; see Front API docs.
   * @see https://dev.frontapp.com/reference/create-tag
   */
  async create(body: CreateTag): Promise<FrontTag> {
    const data = await this.base.requestJson<TagResponse>("POST", "/tags", {
      body,
    });
    return new FrontTag(this.base, data);
  }

  /**
   * Fetch one tag by id (`GET /tags/{tag_id}`).
   *
   * **Required scope:** `tags:read`
   *
   * @param tagId Tag id, or a supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1).
   * @see https://dev.frontapp.com/reference/get-tag
   */
  async get(tagId: string): Promise<FrontTag> {
    const path = FrontBase.expandPath("/tags/{tag_id}", { tag_id: tagId });
    const data = await this.base.requestJson<TagResponse>("GET", path);
    return new FrontTag(this.base, data);
  }
}
