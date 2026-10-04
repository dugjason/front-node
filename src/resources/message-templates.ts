import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type MessageTemplateResponse = components["schemas"]["MessageTemplateResponse"];

export type ListMessageTemplatesParams = OperationListParams<"list-message-templates">;
export type CreateMessageTemplateParams = NonNullable<
  OperationParams<"create-message-template">["body"]
>;

export type UpdateMessageTemplateParams = NonNullable<
  OperationParams<"update-message-template">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontMessageTemplates {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /message_templates
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/list-message-templates
   */
  async list(
    params?: ListMessageTemplatesParams,
  ): Promise<OperationResponse<"list-message-templates">> {
    return await this.base.requestOperation("list-message-templates", { query: params });
  }

  /** POST /message_templates
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/create-message-template
   */
  async create(
    body: CreateMessageTemplateParams,
  ): Promise<OperationResponse<"create-message-template">> {
    return await this.base.requestOperation("create-message-template", { body });
  }

  /** GET /message_templates/{message_template_id}
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/get-message-template
   */
  async get(messageTemplateId: string): Promise<OperationResponse<"get-message-template">> {
    return await this.base.requestOperation("get-message-template", {
      path: { message_template_id: messageTemplateId },
    });
  }

  /** PATCH /message_templates/{message_template_id}
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/update-message-template
   */
  async update(
    messageTemplateId: string,
    body: UpdateMessageTemplateParams,
  ): Promise<OperationResponse<"update-message-template">> {
    return await this.base.requestOperation("update-message-template", {
      body,
      path: { message_template_id: messageTemplateId },
    });
  }

  /** DELETE /message_templates/{message_template_id}
   * Required scope: `message_templates:delete`
   * @see https://dev.frontapp.com/reference/delete-message-template
   */
  async delete(messageTemplateId: string): Promise<OperationResponse<"delete-message-template">> {
    return await this.base.requestOperation("delete-message-template", {
      path: { message_template_id: messageTemplateId },
    });
  }

  /** GET /message_templates/{message_template_id}/download/{attachment_link_id}
   * Required scope: `attachments:read`
   * @see https://dev.frontapp.com/reference/download-attachment-for-a-message-template
   */
  async downloadAttachment(messageTemplateId: string, attachmentLinkId: string): Promise<Response> {
    return await this.base.requestOperationRaw("download-attachment-for-a-message-template", {
      path: { attachment_link_id: attachmentLinkId, message_template_id: messageTemplateId },
    });
  }
}
