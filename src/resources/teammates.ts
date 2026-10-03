import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type TeammateResponse = components["schemas"]["TeammateResponse"];
export type CustomFieldParameter = components["schemas"]["CustomFieldParameter"];

export type UpdateTeammateParams = NonNullable<OperationParams<"update-teammate">["body"]>;
export type ListTeammateAssignedConversationsParams =
  OperationListParams<"list-assigned-conversations">;
export type CreateTeammateContactListParams = NonNullable<
  OperationParams<"create-teammate-contact-list">["body"]
>;
export type ListTeammateContactsParams = OperationListParams<"list-teammate-contacts">;
export type CreateTeammateContactParams = NonNullable<
  OperationParams<"create-teammate-contact">["body"]
>;
export type ListTeammateMessageTemplateFoldersParams = OperationListParams<"list-teammate-folders">;
export type CreateTeammateMessageTemplateFolderParams = NonNullable<
  OperationParams<"create-teammate-folder">["body"]
>;
export type ListTeammateMessageTemplatesParams =
  OperationListParams<"list-teammate-message-templates">;
export type CreateTeammateMessageTemplateParams = NonNullable<
  OperationParams<"create-teammate-message-template">["body"]
>;
export type CreateTeammateSignatureParams = NonNullable<
  OperationParams<"create-teammate-signature">["body"]
>;
export type ListTeammateTagsParams = OperationListParams<"list-teammate-tags">;
export type CreateTeammateTagParams = NonNullable<OperationParams<"create-teammate-tag">["body"]>;

export type CreateTeammatePrivateInboxParams = NonNullable<
  OperationParams<"create-teammate-private-inbox">["body"]
>;
export type ListTeammateTimeOffsParams = OperationListParams<"list-teammate-time-offs">;
export type CreateTimeOffParams = NonNullable<OperationParams<"create-time-off">["body"]>;

/** Collection operations returning Front response data. */
export class FrontTeammates {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /teammates
   * Required scope: `teammates:read`
   * @see https://dev.frontapp.com/reference/list-teammates
   */
  async list(): Promise<OperationResponse<"list-teammates">> {
    return await this.base.requestOperation("list-teammates");
  }

  /** GET /teammates/{teammate_id}
   * Required scope: `teammates:read`
   * @see https://dev.frontapp.com/reference/get-teammate
   */
  async get(teammateId: string): Promise<OperationResponse<"get-teammate">> {
    return await this.base.requestOperation("get-teammate", { path: { teammate_id: teammateId } });
  }

  /** PATCH /teammates/{teammate_id}
   * Required scope: `teammates:write`
   * @see https://dev.frontapp.com/reference/update-teammate
   */
  async update(
    teammateId: string,
    body: UpdateTeammateParams,
  ): Promise<OperationResponse<"update-teammate">> {
    return await this.base.requestOperation("update-teammate", {
      body,
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/custom_fields
   * Required scope: `custom_fields:read`
   * @see https://dev.frontapp.com/reference/list-teammate-custom-fields
   */
  async listCustomFields(): Promise<OperationResponse<"list-teammate-custom-fields">> {
    return await this.base.requestOperation("list-teammate-custom-fields");
  }

  /** GET /teammates/{teammate_id}/conversations
   * Required scope: `conversations:read`
   * @see https://dev.frontapp.com/reference/list-assigned-conversations
   */
  async listAssignedConversations(
    teammateId: string,
    params?: ListTeammateAssignedConversationsParams,
  ): Promise<OperationResponse<"list-assigned-conversations">> {
    return await this.base.requestOperation("list-assigned-conversations", {
      nextPageUrl: params?.nextPageUrl,
      path: { teammate_id: teammateId },
      query: params,
    });
  }

  /** GET /teammates/{teammate_id}/channels
   * Required scope: `channels:read`
   * @see https://dev.frontapp.com/reference/list-teammate-channels
   */
  async listChannels(teammateId: string): Promise<OperationResponse<"list-teammate-channels">> {
    return await this.base.requestOperation("list-teammate-channels", {
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/{teammate_id}/contact_lists
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/list-teammate-contact-lists
   */
  async listContactLists(
    teammateId: string,
  ): Promise<OperationResponse<"list-teammate-contact-lists">> {
    return await this.base.requestOperation("list-teammate-contact-lists", {
      path: { teammate_id: teammateId },
    });
  }

  /** POST /teammates/{teammate_id}/contact_lists
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/create-teammate-contact-list
   */
  async createContactList(
    teammateId: string,
    body: CreateTeammateContactListParams,
  ): Promise<OperationResponse<"create-teammate-contact-list">> {
    return await this.base.requestOperation("create-teammate-contact-list", {
      body,
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/{teammate_id}/contacts
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/list-teammate-contacts
   */
  async listContacts(
    teammateId: string,
    params?: ListTeammateContactsParams,
  ): Promise<OperationResponse<"list-teammate-contacts">> {
    return await this.base.requestOperation("list-teammate-contacts", {
      nextPageUrl: params?.nextPageUrl,
      path: { teammate_id: teammateId },
      query: params,
    });
  }

  /** POST /teammates/{teammate_id}/contacts
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/create-teammate-contact
   */
  async createContact(
    teammateId: string,
    body: CreateTeammateContactParams,
  ): Promise<OperationResponse<"create-teammate-contact">> {
    return await this.base.requestOperation("create-teammate-contact", {
      body,
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/{teammate_id}/message_template_folders
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/list-teammate-folders
   */
  async listMessageTemplateFolders(
    teammateId: string,
    params?: ListTeammateMessageTemplateFoldersParams,
  ): Promise<OperationResponse<"list-teammate-folders">> {
    return await this.base.requestOperation("list-teammate-folders", {
      path: { teammate_id: teammateId },
      query: params,
    });
  }

  /** POST /teammates/{teammate_id}/message_template_folders
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/create-teammate-folder
   */
  async createMessageTemplateFolder(
    teammateId: string,
    body: CreateTeammateMessageTemplateFolderParams,
  ): Promise<OperationResponse<"create-teammate-folder">> {
    return await this.base.requestOperation("create-teammate-folder", {
      body,
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/{teammate_id}/message_templates
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/list-teammate-message-templates
   */
  async listMessageTemplates(
    teammateId: string,
    params?: ListTeammateMessageTemplatesParams,
  ): Promise<OperationResponse<"list-teammate-message-templates">> {
    return await this.base.requestOperation("list-teammate-message-templates", {
      path: { teammate_id: teammateId },
      query: params,
    });
  }

  /** POST /teammates/{teammate_id}/message_templates
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/create-teammate-message-template
   */
  async createMessageTemplate(
    teammateId: string,
    body: CreateTeammateMessageTemplateParams,
  ): Promise<OperationResponse<"create-teammate-message-template">> {
    return await this.base.requestOperation("create-teammate-message-template", {
      body,
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/{teammate_id}/rules
   * Required scope: `rules:read`
   * @see https://dev.frontapp.com/reference/list-teammate-rules
   */
  async listRules(teammateId: string): Promise<OperationResponse<"list-teammate-rules">> {
    return await this.base.requestOperation("list-teammate-rules", {
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/{teammate_id}/shifts
   * Required scope: `shifts:read`
   * @see https://dev.frontapp.com/reference/list-teammate-shifts
   */
  async listShifts(teammateId: string): Promise<OperationResponse<"list-teammate-shifts">> {
    return await this.base.requestOperation("list-teammate-shifts", {
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/{teammate_id}/signatures
   * Required scope: `signatures:read`
   * @see https://dev.frontapp.com/reference/list-teammate-signatures
   */
  async listSignatures(teammateId: string): Promise<OperationResponse<"list-teammate-signatures">> {
    return await this.base.requestOperation("list-teammate-signatures", {
      path: { teammate_id: teammateId },
    });
  }

  /** POST /teammates/{teammate_id}/signatures
   * Required scope: `signatures:write`
   * @see https://dev.frontapp.com/reference/create-teammate-signature
   */
  async createSignature(
    teammateId: string,
    body: CreateTeammateSignatureParams,
  ): Promise<OperationResponse<"create-teammate-signature">> {
    return await this.base.requestOperation("create-teammate-signature", {
      body,
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/{teammate_id}/tags
   * Required scope: `tags:read`
   * @see https://dev.frontapp.com/reference/list-teammate-tags
   */
  async listTags(
    teammateId: string,
    params?: ListTeammateTagsParams,
  ): Promise<OperationResponse<"list-teammate-tags">> {
    return await this.base.requestOperation("list-teammate-tags", {
      nextPageUrl: params?.nextPageUrl,
      path: { teammate_id: teammateId },
      query: params,
    });
  }

  /** POST /teammates/{teammate_id}/tags
   * Required scope: `tags:write`
   * @see https://dev.frontapp.com/reference/create-teammate-tag
   */
  async createTag(
    teammateId: string,
    body: CreateTeammateTagParams,
  ): Promise<OperationResponse<"create-teammate-tag">> {
    return await this.base.requestOperation("create-teammate-tag", {
      body,
      path: { teammate_id: teammateId },
    });
  }
  /** GET /teammates/{teammate_id}/private_inboxes
   * Required scope: `inboxes:read`
   * @see https://dev.frontapp.com/reference/list-teammate-private-inboxes
   */
  async listPrivateInboxes(
    teammateId: string,
  ): Promise<OperationResponse<"list-teammate-private-inboxes">> {
    return await this.base.requestOperation("list-teammate-private-inboxes", {
      path: { teammate_id: teammateId },
    });
  }

  /** POST /teammates/{teammate_id}/private_inboxes
   * Required scope: `inboxes:write`
   * @see https://dev.frontapp.com/reference/create-teammate-private-inbox
   */
  async createPrivateInbox(
    teammateId: string,
    body: CreateTeammatePrivateInboxParams,
  ): Promise<OperationResponse<"create-teammate-private-inbox">> {
    return await this.base.requestOperation("create-teammate-private-inbox", {
      body,
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teammates/{teammate_id}/time_offs
   * Required scope: `time_off:read`
   * @see https://dev.frontapp.com/reference/list-teammate-time-offs
   */
  async listTimeOffs(
    teammateId: string,
    params?: ListTeammateTimeOffsParams,
  ): Promise<OperationResponse<"list-teammate-time-offs">> {
    return await this.base.requestOperation("list-teammate-time-offs", {
      nextPageUrl: params?.nextPageUrl,
      path: { teammate_id: teammateId },
      query: params,
    });
  }

  /** POST /teammates/{teammate_id}/time_offs
   * Required scope: `time_off:write`
   * @see https://dev.frontapp.com/reference/create-time-off
   */
  async createTimeOff(
    teammateId: string,
    body: CreateTimeOffParams,
  ): Promise<OperationResponse<"create-time-off">> {
    return await this.base.requestOperation("create-time-off", {
      body,
      path: { teammate_id: teammateId },
    });
  }
}
