import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";

export type CreateContactListParams = NonNullable<OperationParams<"create-contact-list">["body"]>;
export type ListContactListContactsParams = OperationListParams<"list-contacts-in-contact-list">;
export type AddContactListContactsParams = NonNullable<
  OperationParams<"add-contacts-to-contact-list">["body"]
>;
export type RemoveContactListContactsParams = NonNullable<
  OperationParams<"remove-contacts-from-contact-list">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontContactLists {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /contact_lists
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/list-contact-lists
   */
  async list(): Promise<OperationResponse<"list-contact-lists">> {
    return await this.base.requestOperation("list-contact-lists");
  }

  /** POST /contact_lists
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/create-contact-list
   */
  async create(body: CreateContactListParams): Promise<OperationResponse<"create-contact-list">> {
    return await this.base.requestOperation("create-contact-list", { body });
  }

  /** DELETE /contact_lists/{contact_list_id}
   * Required scope: `contacts:delete`
   * @see https://dev.frontapp.com/reference/delete-contact-list
   */
  async delete(contactListId: string): Promise<OperationResponse<"delete-contact-list">> {
    return await this.base.requestOperation("delete-contact-list", {
      path: { contact_list_id: contactListId },
    });
  }

  /** GET /contact_lists/{contact_list_id}/contacts
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/list-contacts-in-contact-list
   */
  async listContacts(
    contactListId: string,
    params?: ListContactListContactsParams,
  ): Promise<OperationResponse<"list-contacts-in-contact-list">> {
    return await this.base.requestOperation("list-contacts-in-contact-list", {
      nextPageUrl: params?.nextPageUrl,
      path: { contact_list_id: contactListId },
      query: params,
    });
  }

  /** POST /contact_lists/{contact_list_id}/contacts
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/add-contacts-to-contact-list
   */
  async addContacts(
    contactListId: string,
    body: AddContactListContactsParams,
  ): Promise<OperationResponse<"add-contacts-to-contact-list">> {
    return await this.base.requestOperation("add-contacts-to-contact-list", {
      body,
      path: { contact_list_id: contactListId },
    });
  }

  /** DELETE /contact_lists/{contact_list_id}/contacts
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/remove-contacts-from-contact-list
   */
  async removeContacts(
    contactListId: string,
    body?: RemoveContactListContactsParams,
  ): Promise<OperationResponse<"remove-contacts-from-contact-list">> {
    return await this.base.requestOperation("remove-contacts-from-contact-list", {
      body,
      path: { contact_list_id: contactListId },
    });
  }
}
