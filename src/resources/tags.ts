import { FrontBase } from "../base";
import type { NextPageParams } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { PaginationInfo, WithNormalizedPagination } from "../normalize-response";

export type TagResponse = components["schemas"]["TagResponse"];
export type CreateTagParams =
  operations["create-tag"]["requestBody"]["content"]["application/json"];
export type CreateChildTagParams =
  operations["create-child-tag"]["requestBody"]["content"]["application/json"];

/** The schema documents `null` as the value that removes a tag's parent. */
export type UpdateTagParams = Omit<
  operations["update-a-tag"]["requestBody"]["content"]["application/json"],
  "parent_tag_id"
> & { parent_tag_id?: string | null };

export type ListTagsParams = NonNullable<operations["list-tags"]["parameters"]["query"]> &
  NextPageParams;
type ListTagsResponse = operations["list-tags"]["responses"][200]["content"]["application/json"] & {
  pagination?: PaginationInfo;
};

type ListTagChildrenResponse =
  operations["list-tag-children"]["responses"][200]["content"]["application/json"] & {
    pagination?: PaginationInfo;
  };

export type ListTaggedConversationsParams = NonNullable<
  operations["list-tagged-conversations"]["parameters"]["query"]
> &
  NextPageParams;
type ListTaggedConversationsResponse =
  operations["list-tagged-conversations"]["responses"][200]["content"]["application/json"];

const tagPath = (tagId: string): string =>
  FrontBase.expandPath("/tags/{tag_id}", { tag_id: tagId });

const queryFromListTags = (q?: ListTagsParams): Record<string, string | undefined> | undefined => {
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
  q?: ListTaggedConversationsParams,
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

/**
 * Company tag collection (`GET/POST /tags`) and by-ID operations (`/tags/{tag_id}`).
 *
 * @see https://dev.frontapp.com/reference/tags
 */
export class FrontTags {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List tags for the company accessible to the token (company, team, and teammate tags).
   * When provided, `nextPageUrl` overrides all other query parameters.
   *
   * **Required scope:** `tags:read`
   *
   * @see https://dev.frontapp.com/reference/list-tags
   */
  async list(query?: ListTagsParams): Promise<WithNormalizedPagination<ListTagsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListTagsResponse>>("GET", "/tags", {
      query:
        query?.nextPageUrl === undefined
          ? queryFromListTags(query)
          : FrontBase.queryFromNextPageUrl(query.nextPageUrl, "/tags"),
    });
  }

  /**
   * Create a tag in the oldest team (legacy `POST /tags` endpoint).
   *
   * **Required scope:** `tags:write`
   *
   * Prefer company/team/teammate tag endpoints when possible; see Front API docs.
   *
   * @see https://dev.frontapp.com/reference/create-tag
   */
  async create(body: CreateTagParams): Promise<TagResponse> {
    return await this.base.requestJson<TagResponse>("POST", "/tags", { body });
  }

  /**
   * Fetch one tag by id (`GET /tags/{tag_id}`).
   *
   * **Required scope:** `tags:read`
   *
   * @param tagId Tag id, or a supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1).
   * @see https://dev.frontapp.com/reference/get-tag
   */
  async get(tagId: string): Promise<TagResponse> {
    return await this.base.requestJson<TagResponse>("GET", tagPath(tagId));
  }

  /**
   * Update a tag (`PATCH /tags/{tag_id}`). The API returns `204`.
   *
   * **Required scope:** `tags:write`
   *
   * @see https://dev.frontapp.com/reference/update-a-tag
   */
  async update(tagId: string, body: UpdateTagParams): Promise<void> {
    await this.base.requestJson<undefined>("PATCH", tagPath(tagId), { body });
  }

  /**
   * Delete a tag (`DELETE /tags/{tag_id}`).
   *
   * **Required scope:** `tags:delete`
   */
  async delete(tagId: string): Promise<void> {
    await this.base.requestJson<undefined>("DELETE", tagPath(tagId));
  }

  /**
   * List child tags (`GET /tags/{tag_id}/children`).
   *
   * **Required scope:** `tags:read`
   *
   * @see https://dev.frontapp.com/reference/list-tag-children
   */
  async listChildren(
    tagId: string,
    params?: NextPageParams,
  ): Promise<WithNormalizedPagination<ListTagChildrenResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListTagChildrenResponse>>(
      "GET",
      `${tagPath(tagId)}/children`,
      {
        query:
          params?.nextPageUrl === undefined
            ? undefined
            : FrontBase.queryFromNextPageUrl(params.nextPageUrl, `${tagPath(tagId)}/children`),
      },
    );
  }

  /**
   * Create a child tag (`POST /tags/{tag_id}/children`).
   *
   * **Required scope:** `tags:write`
   *
   * @see https://dev.frontapp.com/reference/create-child-tag
   */
  async createChild(tagId: string, body: CreateChildTagParams): Promise<TagResponse> {
    return await this.base.requestJson<TagResponse>("POST", `${tagPath(tagId)}/children`, { body });
  }

  /**
   * List conversations that have a tag (`GET /tags/{tag_id}/conversations`).
   * When provided, `nextPageUrl` overrides all other query parameters.
   *
   * **Required scope:** `conversations:read`
   *
   * @see https://dev.frontapp.com/reference/list-tagged-conversations
   */
  async listTaggedConversations(
    tagId: string,
    query?: ListTaggedConversationsParams,
  ): Promise<WithNormalizedPagination<ListTaggedConversationsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListTaggedConversationsResponse>>(
      "GET",
      `${tagPath(tagId)}/conversations`,
      {
        query:
          query?.nextPageUrl === undefined
            ? queryFromTaggedConversations(query)
            : FrontBase.queryFromNextPageUrl(query.nextPageUrl, `${tagPath(tagId)}/conversations`),
      },
    );
  }
}
