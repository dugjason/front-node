import type { FrontBase, NextPageParams } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { OperationResponse } from "../operation";

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
type ListTagsResponse = OperationResponse<"list-tags">;
type ListTagChildrenResponse = OperationResponse<"list-tag-children">;

export type ListTaggedConversationsParams = NonNullable<
  operations["list-tagged-conversations"]["parameters"]["query"]
> &
  NextPageParams;
type ListTaggedConversationsResponse = OperationResponse<"list-tagged-conversations">;

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
  async list(query?: ListTagsParams): Promise<ListTagsResponse> {
    return await this.base.requestOperation("list-tags", {
      nextPageUrl: query?.nextPageUrl,
      query,
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
    return await this.base.requestOperation("create-tag", { body });
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
    return await this.base.requestOperation("get-tag", { path: { tag_id: tagId } });
  }

  /**
   * Update a tag (`PATCH /tags/{tag_id}`). The API returns `204`.
   *
   * **Required scope:** `tags:write`
   *
   * @see https://dev.frontapp.com/reference/update-a-tag
   */
  async update(tagId: string, body: UpdateTagParams): Promise<void> {
    return await this.base.requestOperation("update-a-tag", { body, path: { tag_id: tagId } });
  }

  /**
   * Delete a tag (`DELETE /tags/{tag_id}`).
   *
   * **Required scope:** `tags:delete`
   */
  async delete(tagId: string): Promise<void> {
    return await this.base.requestOperation("delete-tag", { path: { tag_id: tagId } });
  }

  /**
   * List child tags (`GET /tags/{tag_id}/children`).
   *
   * **Required scope:** `tags:read`
   *
   * @see https://dev.frontapp.com/reference/list-tag-children
   */
  async listChildren(tagId: string): Promise<ListTagChildrenResponse> {
    return await this.base.requestOperation("list-tag-children", { path: { tag_id: tagId } });
  }

  /**
   * Create a child tag (`POST /tags/{tag_id}/children`).
   *
   * **Required scope:** `tags:write`
   *
   * @see https://dev.frontapp.com/reference/create-child-tag
   */
  async createChild(tagId: string, body: CreateChildTagParams): Promise<TagResponse> {
    return await this.base.requestOperation("create-child-tag", { body, path: { tag_id: tagId } });
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
  ): Promise<ListTaggedConversationsResponse> {
    return await this.base.requestOperation("list-tagged-conversations", {
      nextPageUrl: query?.nextPageUrl,
      path: { tag_id: tagId },
      query,
    });
  }
}
