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
export class FrontMessageTemplate extends FrontResource<
  MessageTemplateResponse,
  UpdateMessageTemplate
> {
  private folderIdForUpdate: string | null | undefined;

  constructor(base: FrontBase, snapshot: MessageTemplateResponse) {
    super(base, snapshot);
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

  async update(body: UpdateMessageTemplate | Partial<UpdateMessageTemplate>): Promise<void> {
    await this.patchReplaceFromResponse(body);
    if ("folder_id" in body) {
      this.folderIdForUpdate =
        body.folder_id === null || body.folder_id === undefined ? undefined : body.folder_id;
    }
  }

  /**
   * Download an attachment (`GET /message_templates/{message_template_id}/download/{attachment_link_id}`).
   *
   * **Required scope:** `attachments:read`
   */
  async downloadAttachment(attachmentLinkId: string): Promise<Response> {
    const path = FrontBase.expandPath(
      "/message_templates/{message_template_id}/download/{attachment_link_id}",
      {
        attachment_link_id: attachmentLinkId,
        message_template_id: this.id,
      },
    );
    return await this.base.requestWithoutParsingBody("GET", path);
  }
}

/**
 * Message templates (`/message_templates`).
 *
 * @see https://dev.frontapp.com/reference/message-templates
 */
export class FrontMessageTemplates {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

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
  async create(body: CreateSharedMessageTemplate): Promise<FrontMessageTemplate> {
    const data = await this.base.requestJson<MessageTemplateResponse>(
      "POST",
      "/message_templates",
      { body },
    );
    return new FrontMessageTemplate(this.base, data);
  }

  /**
   * Fetch one message template (`GET /message_templates/{message_template_id}`).
   *
   * **Required scope:** `message_templates:read`
   */
  async get(messageTemplateId: string): Promise<FrontMessageTemplate> {
    const path = FrontBase.expandPath("/message_templates/{message_template_id}", {
      message_template_id: messageTemplateId,
    });
    const data = await this.base.requestJson<MessageTemplateResponse>("GET", path);
    return new FrontMessageTemplate(this.base, data);
  }
}
