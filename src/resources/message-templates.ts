import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type MessageTemplateResponse = components["schemas"]["MessageTemplateResponse"];
export type CreateSharedMessageTemplate = components["schemas"]["CreateSharedMessageTemplate"];
export type UpdateMessageTemplate = components["schemas"]["UpdateMessageTemplate"];

type ListMessageTemplatesQuery = NonNullable<
  operations["list-message-templates"]["parameters"]["query"]
>;
type ListMessageTemplatesResponse =
  components["responses"]["listOfCannedAnswers"]["content"]["application/json"];

const queryFromListMessageTemplates = (
  q?: ListMessageTemplatesQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.sort_by !== undefined) {
    out.sort_by = String(q.sort_by);
  }
  if (q.sort_order !== undefined) {
    out.sort_order = String(q.sort_order);
  }
  return out;
};

const templateResponseToUpdateBody = (state: MessageTemplateResponse): UpdateMessageTemplate => {
  const out: UpdateMessageTemplate = {
    body: state.body,
    name: state.name,
    subject: state.subject === null ? undefined : state.subject,
  };
  if (state.inbox_ids !== null) {
    out.inbox_ids = state.inbox_ids;
  }
  return out;
};

/**
 * One message template (`/message_templates/{message_template_id}`).
 *
 * @see https://dev.frontapp.com/reference/message-templates
 */
export class FrontMessageTemplates extends FrontResource<
  MessageTemplateResponse,
  UpdateMessageTemplate
> {
  private folderIdForUpdate: string | null | undefined;

  constructor(base: FrontBase, snapshot?: MessageTemplateResponse, messageTemplateId?: string) {
    super(base, snapshot, messageTemplateId);
    this.folderIdForUpdate = undefined;
  }

  protected override onAfterRefresh(): void {
    this.folderIdForUpdate = undefined;
  }

  protected selfPath(): string {
    return FrontBase.expandPath("/message_templates/{message_template_id}", {
      message_template_id: this.id,
    });
  }

  get name(): string {
    return this.pick("name");
  }

  set name(value: string) {
    this.assign("name", value);
  }

  get subject(): string | null {
    return this.pick("subject");
  }

  set subject(value: string | null) {
    this.assign("subject", value);
  }

  get body(): string {
    return this.pick("body");
  }

  set body(value: string) {
    this.assign("body", value);
  }

  get isAvailableForAllInboxes(): boolean {
    return this.pick("is_available_for_all_inboxes");
  }

  get inboxIds(): string[] | null {
    return this.pick("inbox_ids");
  }

  set inboxIds(value: string[] | null) {
    this.assign("inbox_ids", value);
  }

  /**
   * Parent folder id for `PATCH` only (not returned as an id field on `GET`).
   */
  get folderId(): string | null | undefined {
    return this.folderIdForUpdate;
  }

  set folderId(value: string | null | undefined) {
    this.folderIdForUpdate = value;
  }

  toUpdateBody(): UpdateMessageTemplate {
    const body = templateResponseToUpdateBody(this.state);
    if (this.folderIdForUpdate !== undefined) {
      body.folder_id = this.folderIdForUpdate ?? undefined;
    }
    return body;
  }

  async update(body: UpdateMessageTemplate | Partial<UpdateMessageTemplate>): Promise<void>;
  async update(
    messageTemplateId: string,
    body: UpdateMessageTemplate | Partial<UpdateMessageTemplate>,
  ): Promise<void>;
  async update(
    bodyOrMessageTemplateId: UpdateMessageTemplate | Partial<UpdateMessageTemplate> | string,
    directBody?: UpdateMessageTemplate | Partial<UpdateMessageTemplate>,
  ): Promise<void> {
    if (typeof bodyOrMessageTemplateId === "string") {
      await this.target(bodyOrMessageTemplateId).update(directBody ?? {});
      return;
    }
    await this.patchReplaceFromResponse(bodyOrMessageTemplateId);
    if ("folder_id" in bodyOrMessageTemplateId) {
      this.folderIdForUpdate =
        bodyOrMessageTemplateId.folder_id === null ||
        bodyOrMessageTemplateId.folder_id === undefined
          ? undefined
          : bodyOrMessageTemplateId.folder_id;
    }
  }

  override async delete(messageTemplateId?: string): Promise<void> {
    if (messageTemplateId === undefined) {
      await super.delete();
      return;
    }
    await this.target(messageTemplateId).delete();
  }

  /**
   * Download an attachment (`GET /message_templates/{message_template_id}/download/{attachment_link_id}`).
   *
   * **Required scope:** `attachments:read`
   */
  async downloadAttachment(
    attachmentLinkIdOrMessageTemplateId: string,
    directAttachmentLinkId?: string,
  ): Promise<Response> {
    if (directAttachmentLinkId !== undefined) {
      return await this.target(attachmentLinkIdOrMessageTemplateId).downloadAttachment(
        directAttachmentLinkId,
      );
    }
    const path = FrontBase.expandPath(
      "/message_templates/{message_template_id}/download/{attachment_link_id}",
      {
        attachment_link_id: attachmentLinkIdOrMessageTemplateId,
        message_template_id: this.id,
      },
    );
    return await this.base.requestWithoutParsingBody("GET", path);
  }
  /**
   * Message templates (`/message_templates`) collection operations.
   *
   * @see https://dev.frontapp.com/reference/message-templates
   */
  /**
   * List message templates (`GET /message_templates`).
   *
   * **Required scope:** `message_templates:read`
   */
  async list(
    query?: ListMessageTemplatesQuery,
  ): Promise<WithNormalizedPagination<ListMessageTemplatesResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListMessageTemplatesResponse>>(
      "GET",
      "/message_templates",
      {
        query: queryFromListMessageTemplates(query),
      },
    );
  }

  /**
   * Create a message template (`POST /message_templates`).
   *
   * **Required scope:** `message_templates:write`
   */
  async create(body: CreateSharedMessageTemplate): Promise<FrontMessageTemplates> {
    const data = await this.base.requestJson<MessageTemplateResponse>(
      "POST",
      "/message_templates",
      { body },
    );
    return new FrontMessageTemplates(this.base, data);
  }

  /**
   * Fetch one message template (`GET /message_templates/{message_template_id}`).
   *
   * **Required scope:** `message_templates:read`
   */
  async get(messageTemplateId: string): Promise<FrontMessageTemplates> {
    return await this.target(messageTemplateId).refresh();
  }

  /** Target a message template by id without calling the API first. */
  private target(messageTemplateId: string): FrontMessageTemplates {
    return new FrontMessageTemplates(this.base, undefined, messageTemplateId);
  }
}
