import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type ContactResponse = components["schemas"]["ContactResponse"];

export type ListContactsParams = OperationListParams<"list-contacts">;
export type CreateContactParams = NonNullable<OperationParams<"create-contact">["body"]>;
export type UpdateContactParams = NonNullable<OperationParams<"update-a-contact">["body"]>;
export type MergeContactParams = NonNullable<OperationParams<"merge-contacts">["body"]>;
export type ListContactConversationsParams = OperationListParams<"list-contact-conversations">;
export type AddContactHandleParams = NonNullable<OperationParams<"add-contact-handle">["body"]>;
export type DeleteContactHandleParams = NonNullable<
  OperationParams<"delete-contact-handle">["body"]
>;
export type AddContactNoteParams = NonNullable<OperationParams<"add-note">["body"]>;

/** Collection operations returning Front response data. */
export class FrontContacts {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /contacts
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/list-contacts
   */
  async list(params?: ListContactsParams): Promise<OperationResponse<"list-contacts">> {
    return await this.base.requestOperation("list-contacts", {
      nextPageUrl: params?.nextPageUrl,
      query: params,
    });
  }

  /** POST /contacts
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/create-contact
   */
  async create(body: CreateContactParams): Promise<OperationResponse<"create-contact">> {
    return await this.base.requestOperation("create-contact", { body });
  }

  /** GET /contacts/{contact_id}
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/get-contact
   */
  async get(contactId: string): Promise<OperationResponse<"get-contact">> {
    return await this.base.requestOperation("get-contact", { path: { contact_id: contactId } });
  }

  /** PATCH /contacts/{contact_id}
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/update-a-contact
   */
  async update(
    contactId: string,
    body: UpdateContactParams,
  ): Promise<OperationResponse<"update-a-contact">> {
    return await this.base.requestOperation("update-a-contact", {
      body,
      path: { contact_id: contactId },
    });
  }

  /** DELETE /contacts/{contact_id}
   * Required scope: `contacts:delete`
   * @see https://dev.frontapp.com/reference/delete-a-contact
   */
  async delete(contactId: string): Promise<OperationResponse<"delete-a-contact">> {
    return await this.base.requestOperation("delete-a-contact", {
      path: { contact_id: contactId },
    });
  }

  /** GET /contacts/custom_fields
   * Required scope: `custom_fields:read`
   * @see https://dev.frontapp.com/reference/list-contact-custom-fields
   */
  async listCustomFields(): Promise<OperationResponse<"list-contact-custom-fields">> {
    return await this.base.requestOperation("list-contact-custom-fields");
  }

  /** POST /contacts/merge
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/merge-contacts
   */
  async merge(body: MergeContactParams): Promise<OperationResponse<"merge-contacts">> {
    return await this.base.requestOperation("merge-contacts", { body });
  }

  /** GET /contacts/{contact_id}/conversations
   * Required scope: `conversations:read`
   * @see https://dev.frontapp.com/reference/list-contact-conversations
   */
  async listConversations(
    contactId: string,
    params?: ListContactConversationsParams,
  ): Promise<OperationResponse<"list-contact-conversations">> {
    return await this.base.requestOperation("list-contact-conversations", {
      nextPageUrl: params?.nextPageUrl,
      path: { contact_id: contactId },
      query: params,
    });
  }

  /** POST /contacts/{contact_id}/handles
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/add-contact-handle
   */
  async addHandle(
    contactId: string,
    body: AddContactHandleParams,
  ): Promise<OperationResponse<"add-contact-handle">> {
    return await this.base.requestOperation("add-contact-handle", {
      body,
      path: { contact_id: contactId },
    });
  }

  /** DELETE /contacts/{contact_id}/handles
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/delete-contact-handle
   */
  async deleteHandle(
    contactId: string,
    body?: DeleteContactHandleParams,
  ): Promise<OperationResponse<"delete-contact-handle">> {
    return await this.base.requestOperation("delete-contact-handle", {
      body,
      path: { contact_id: contactId },
    });
  }

  /** GET /contacts/{contact_id}/notes
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/list-notes
   */
  async listNotes(contactId: string): Promise<OperationResponse<"list-notes">> {
    return await this.base.requestOperation("list-notes", { path: { contact_id: contactId } });
  }

  /** POST /contacts/{contact_id}/notes
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/add-note
   */
  async addNote(
    contactId: string,
    body: AddContactNoteParams,
  ): Promise<OperationResponse<"add-note">> {
    return await this.base.requestOperation("add-note", { body, path: { contact_id: contactId } });
  }
}
