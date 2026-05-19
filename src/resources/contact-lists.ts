import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";

export type CreateContactList = components["schemas"]["CreateContactList"];
export type AddContactsToList = components["schemas"]["AddContactsToList"];
export type RemoveContactsFromList = components["schemas"]["RemoveContactsFromList"];

type ListContactListsResponse =
  operations["list-contact-lists"]["responses"][200]["content"]["application/json"];

type ListContactsInContactListQuery = NonNullable<
  operations["list-contacts-in-contact-list"]["parameters"]["query"]
>;
type ListContactsInContactListResponse =
  operations["list-contacts-in-contact-list"]["responses"][200]["content"]["application/json"];

const queryFromListContactsInContactList = (
  q?: ListContactsInContactListQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  return out;
};

/**
 * Company contact lists (`/contact_lists` and `/contact_lists/{contact_list_id}/contacts`).
 *
 * @see https://dev.frontapp.com/reference/contact-lists
 */
export class FrontContactLists {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List contact lists (`GET /contact_lists`).
   *
   * **Required scope:** `contacts:read`
   *
   * @see https://dev.frontapp.com/reference/list-contact-lists
   */
  async list(): Promise<WithNormalizedPagination<ListContactListsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListContactListsResponse>>(
      "GET",
      "/contact_lists",
    );
  }

  /**
   * Create a contact list (`POST /contact_lists`). The API returns `204`.
   *
   * **Required scope:** `contacts:write`
   *
   * @param body List name (OpenAPI {@link CreateContactList}).
   * @see https://dev.frontapp.com/reference/create-contact-list
   */
  async create(body: CreateContactList): Promise<void> {
    await this.base.requestJson<undefined>("POST", "/contact_lists", {
      body,
    });
  }

  /**
   * Delete a contact list (`DELETE /contact_lists/{contact_list_id}`). The API returns `204`.
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/delete-contact-list
   */
  async delete(contactListId: string): Promise<void> {
    const path = FrontBase.expandPath("/contact_lists/{contact_list_id}", {
      contact_list_id: contactListId,
    });
    await this.base.requestJson<undefined>("DELETE", path);
  }

  /**
   * List contacts in a contact list (`GET /contact_lists/{contact_list_id}/contacts`).
   *
   * **Required scope:** `contacts:read`
   *
   * @param query Optional `limit` and `page_token`.
   * @see https://dev.frontapp.com/reference/list-contacts-in-contact-list
   */
  async listContacts(
    contactListId: string,
    query?: ListContactsInContactListQuery,
  ): Promise<WithNormalizedPagination<ListContactsInContactListResponse>> {
    const path = FrontBase.expandPath("/contact_lists/{contact_list_id}/contacts", {
      contact_list_id: contactListId,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListContactsInContactListResponse>>(
      "GET",
      path,
      { query: queryFromListContactsInContactList(query) },
    );
  }

  /**
   * Add contacts to a contact list (`POST /contact_lists/{contact_list_id}/contacts`). The API returns `204`.
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/add-contacts-to-contact-list
   */
  async addContacts(contactListId: string, body: AddContactsToList): Promise<void> {
    const path = FrontBase.expandPath("/contact_lists/{contact_list_id}/contacts", {
      contact_list_id: contactListId,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Remove contacts from a contact list (`DELETE /contact_lists/{contact_list_id}/contacts`). The API returns `204`.
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/remove-contacts-from-contact-list
   */
  async removeContacts(contactListId: string, body: RemoveContactsFromList): Promise<void> {
    const path = FrontBase.expandPath("/contact_lists/{contact_list_id}/contacts", {
      contact_list_id: contactListId,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }
}
