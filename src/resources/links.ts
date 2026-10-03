import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type LinkResponse = components["schemas"]["LinkResponse"];

export type ListLinksParams = OperationListParams<"list-links">;
export type CreateLinkParams = NonNullable<OperationParams<"create-link">["body"]>;
export type UpdateLinkParams = NonNullable<OperationParams<"update-a-link">["body"]>;
export type ListLinkConversationsParams = OperationListParams<"list-link-conversations">;

/** Collection operations returning Front response data. */
export class FrontLinks {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /links
   * Required scope: `links:read`
   * @see https://dev.frontapp.com/reference/list-links
   */
  async list(params?: ListLinksParams): Promise<OperationResponse<"list-links">> {
    return await this.base.requestOperation("list-links", {
      nextPageUrl: params?.nextPageUrl,
      query: params,
    });
  }

  /** POST /links
   * Required scope: `links:write`
   * @see https://dev.frontapp.com/reference/create-link
   */
  async create(body: CreateLinkParams): Promise<OperationResponse<"create-link">> {
    return await this.base.requestOperation("create-link", { body });
  }

  /** GET /links/{link_id}
   * Required scope: `links:read`
   * @see https://dev.frontapp.com/reference/get-link
   */
  async get(linkId: string): Promise<OperationResponse<"get-link">> {
    return await this.base.requestOperation("get-link", { path: { link_id: linkId } });
  }

  /** PATCH /links/{link_id}
   * Required scope: `links:write`
   * @see https://dev.frontapp.com/reference/update-a-link
   */
  async update(
    linkId: string,
    body: UpdateLinkParams,
  ): Promise<OperationResponse<"update-a-link">> {
    return await this.base.requestOperation("update-a-link", { body, path: { link_id: linkId } });
  }

  /** GET /links/custom_fields
   * Required scope: `custom_fields:read`
   * @see https://dev.frontapp.com/reference/list-link-custom-fields
   */
  async listCustomFields(): Promise<OperationResponse<"list-link-custom-fields">> {
    return await this.base.requestOperation("list-link-custom-fields");
  }

  /** GET /links/{link_id}/conversations
   * Required scope: `conversations:read`
   * @see https://dev.frontapp.com/reference/list-link-conversations
   */
  async listConversations(
    linkId: string,
    params?: ListLinkConversationsParams,
  ): Promise<OperationResponse<"list-link-conversations">> {
    return await this.base.requestOperation("list-link-conversations", {
      nextPageUrl: params?.nextPageUrl,
      path: { link_id: linkId },
      query: params,
    });
  }
}
