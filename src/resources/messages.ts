import type { FrontBase } from "../base";
import type { OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type MessageResponse = components["schemas"]["MessageResponse"];

/** Collection operations returning Front response data. */
export class FrontMessages {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /messages/{message_id}
   * Required scope: `messages:read`
   * @see https://dev.frontapp.com/reference/get-message
   */
  async get(messageId: string): Promise<OperationResponse<"get-message">> {
    return await this.base.requestOperation("get-message", { path: { message_id: messageId } });
  }

  /** GET /messages/{message_id}
   * Required scope: `messages:read`
   * @see https://dev.frontapp.com/reference/get-message
   */
  async fetchRaw(
    messageId: string,
    init?: { headers?: Record<string, string | undefined> },
  ): Promise<Response> {
    return await this.base.requestOperationRaw(
      "get-message",
      { path: { message_id: messageId } },
      { headers: { ...init?.headers, Accept: init?.headers?.Accept ?? "application/json" } },
    );
  }

  /** GET /messages/{message_id}/download/{attachment_link_id}
   * Required scope: `attachments:read`
   * @see https://dev.frontapp.com/reference/download-attachment-for-a-message
   */
  async downloadAttachment(messageId: string, attachmentLinkId: string): Promise<Response> {
    return await this.base.requestOperationRaw("download-attachment-for-a-message", {
      path: { attachment_link_id: attachmentLinkId, message_id: messageId },
    });
  }

  /** GET /messages/{message_id}/seen
   * Required scope: `messages:read`
   * @see https://dev.frontapp.com/reference/get-message-seen-status
   */
  async getSeen(messageId: string): Promise<OperationResponse<"get-message-seen-status">> {
    return await this.base.requestOperation("get-message-seen-status", {
      path: { message_id: messageId },
    });
  }

  /** POST /messages/{message_id}/seen
   * Required scope: `messages:write`
   * @see https://dev.frontapp.com/reference/mark-message-seen
   */
  async markSeen(messageId: string): Promise<OperationResponse<"mark-message-seen">> {
    return await this.base.requestOperation("mark-message-seen", {
      body: {},
      path: { message_id: messageId },
    });
  }
}
