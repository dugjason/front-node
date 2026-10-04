import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type InboxResponse = components["schemas"]["InboxResponse"];

export type CreateInboxParams = NonNullable<OperationParams<"create-inbox">["body"]>;
export type ListInboxConversationsParams = OperationListParams<"list-inbox-conversations">;
export type ImportInboxMessageParams = NonNullable<OperationParams<"import-inbox-message">["body"]>;
export type AddInboxTeammateAccessParams = NonNullable<OperationParams<"add-inbox-access">["body"]>;
export type RemoveInboxTeammateAccessParams = NonNullable<
  OperationParams<"removes-inbox-access">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontInboxes {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /inboxes
   * Required scope: `inboxes:read`
   * @see https://dev.frontapp.com/reference/list-inboxes
   */
  async list(): Promise<OperationResponse<"list-inboxes">> {
    return await this.base.requestOperation("list-inboxes");
  }

  /** POST /inboxes
   * Required scope: `inboxes:write`
   * @see https://dev.frontapp.com/reference/create-inbox
   */
  async create(body: CreateInboxParams): Promise<OperationResponse<"create-inbox">> {
    return await this.base.requestOperation("create-inbox", { body });
  }

  /** GET /inboxes/{inbox_id}
   * Required scope: `inboxes:read`
   * @see https://dev.frontapp.com/reference/get-inbox
   */
  async get(inboxId: string): Promise<OperationResponse<"get-inbox">> {
    return await this.base.requestOperation("get-inbox", { path: { inbox_id: inboxId } });
  }

  /** GET /inboxes/custom_fields
   * Required scope: `custom_fields:read`
   * @see https://dev.frontapp.com/reference/list-inbox-custom-fields
   */
  async listCustomFields(): Promise<OperationResponse<"list-inbox-custom-fields">> {
    return await this.base.requestOperation("list-inbox-custom-fields");
  }

  /** GET /inboxes/{inbox_id}/channels
   * Required scope: `channels:read`
   * @see https://dev.frontapp.com/reference/list-inbox-channels
   */
  async listChannels(inboxId: string): Promise<OperationResponse<"list-inbox-channels">> {
    return await this.base.requestOperation("list-inbox-channels", { path: { inbox_id: inboxId } });
  }

  /** GET /inboxes/{inbox_id}/conversations
   * Required scope: `conversations:read`
   * @see https://dev.frontapp.com/reference/list-inbox-conversations
   */
  async listConversations(
    inboxId: string,
    params?: ListInboxConversationsParams,
  ): Promise<OperationResponse<"list-inbox-conversations">> {
    return await this.base.requestOperation("list-inbox-conversations", {
      nextPageUrl: params?.nextPageUrl,
      path: { inbox_id: inboxId },
      query: params,
    });
  }

  /** POST /inboxes/{inbox_id}/imported_messages
   * Required scope: `messages:write`
   * @see https://dev.frontapp.com/reference/import-inbox-message
   */
  async importMessage(
    inboxId: string,
    body: ImportInboxMessageParams,
  ): Promise<OperationResponse<"import-inbox-message">> {
    return await this.base.requestOperation("import-inbox-message", {
      body,
      path: { inbox_id: inboxId },
    });
  }

  /** GET /inboxes/{inbox_id}/teammates
   * Required scope: `teammates:read`
   * @see https://dev.frontapp.com/reference/list-inbox-access
   */
  async listTeammateAccess(inboxId: string): Promise<OperationResponse<"list-inbox-access">> {
    return await this.base.requestOperation("list-inbox-access", { path: { inbox_id: inboxId } });
  }

  /** POST /inboxes/{inbox_id}/teammates
   * Required scope: `inboxes:write`
   * @see https://dev.frontapp.com/reference/add-inbox-access
   */
  async addTeammateAccess(
    inboxId: string,
    body: AddInboxTeammateAccessParams,
  ): Promise<OperationResponse<"add-inbox-access">> {
    return await this.base.requestOperation("add-inbox-access", {
      body,
      path: { inbox_id: inboxId },
    });
  }

  /** DELETE /inboxes/{inbox_id}/teammates
   * Required scope: `inboxes:write`
   * @see https://dev.frontapp.com/reference/removes-inbox-access
   */
  async removeTeammateAccess(
    inboxId: string,
    body?: RemoveInboxTeammateAccessParams,
  ): Promise<OperationResponse<"removes-inbox-access">> {
    return await this.base.requestOperation("removes-inbox-access", {
      body,
      path: { inbox_id: inboxId },
    });
  }
}
