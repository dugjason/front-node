import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type ContactResponse = components["schemas"]["ContactResponse"];
export type Contact = components["schemas"]["Contact"];
export type CreateContact = components["schemas"]["CreateContact"];
export type ContactHandle = components["schemas"]["ContactHandle"];
export type DeleteContactHandle = components["schemas"]["DeleteContactHandle"];
export type MergeContacts = components["schemas"]["MergeContacts"];
export type CreateContactNote = components["schemas"]["CreateContactNote"];

/**
 * Contact JSON shaped for {@link FrontResource} (OpenAPI marks `id` / `_links` optional on {@link ContactResponse}).
 */
export type ContactSnapshot = ContactResponse & {
  id: string;
  _links: Record<string, unknown>;
};

type ListContactsQuery = NonNullable<operations["list-contacts"]["parameters"]["query"]>;
type ListContactsResponse =
  operations["list-contacts"]["responses"][200]["content"]["application/json"];

type ListContactCustomFieldsResponse =
  operations["list-contact-custom-fields"]["responses"][200]["content"]["application/json"];

type ListContactConversationsQuery = NonNullable<
  operations["list-contact-conversations"]["parameters"]["query"]
>;
type ListContactConversationsResponse =
  operations["list-contact-conversations"]["responses"][200]["content"]["application/json"];

type ListNotesResponse = operations["list-notes"]["responses"][202]["content"]["application/json"];

type ContactNoteResponse = operations["add-note"]["responses"][201]["content"]["application/json"];

const toContactSnapshot = (data: ContactResponse): ContactSnapshot => {
  if (data.id === undefined || data.id === "") {
    throw new Error("Contact response missing `id`.");
  }
  return {
    ...data,
    _links: data._links !== undefined && data._links !== null ? { ...data._links } : {},
    id: data.id,
  };
};

const queryFromListContacts = (
  q?: ListContactsQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.q !== undefined) {
    out.q = String(q.q);
  }
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  if (q.sort_by !== undefined) {
    out.sort_by = String(q.sort_by);
  }
  if (q.sort_order !== undefined) {
    out.sort_order = String(q.sort_order);
  }
  return out;
};

const queryFromListContactConversations = (
  q?: ListContactConversationsQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.q !== undefined) {
    out.q = String(q.q);
  }
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  return out;
};

const mergeContactSnapshot = (
  current: ContactSnapshot,
  patch: Partial<Contact>,
): ContactSnapshot => {
  let next: ContactSnapshot = { ...current };
  if (patch.name !== undefined) {
    next = { ...next, name: patch.name };
  }
  if (patch.description !== undefined) {
    next = { ...next, description: patch.description };
  }
  if (patch.links !== undefined) {
    next = { ...next, links: patch.links };
  }
  if (patch.custom_fields !== undefined) {
    next = { ...next, custom_fields: patch.custom_fields };
  }
  return next;
};

const contactSnapshotToUpdateBody = (state: ContactSnapshot): Contact => ({
  custom_fields: state.custom_fields,
  description: state.description,
  links: state.links,
  name: state.name,
});

/**
 * One contact (`/contacts/{contact_id}` and related routes).
 *
 * Writable fields aligned with OpenAPI {@link Contact}: `name`, `description`, `contactLinks` (JSON `links`), `customFields`.
 * HAL `_links` is exposed as `links` on {@link FrontResource} (not the contact URL list).
 * `PATCH` returns `204`; {@link update} and {@link save} merge the request into local state for those fields.
 *
 * @see https://dev.frontapp.com/reference/contacts
 */
export class FrontContacts extends FrontResource<ContactSnapshot, Contact> {
  constructor(base: FrontBase, snapshot?: ContactResponse, contactId?: string) {
    super(base, snapshot === undefined ? undefined : toContactSnapshot(snapshot), contactId);
  }

  protected selfPath(): string {
    return FrontBase.expandPath("/contacts/{contact_id}", {
      contact_id: this.id,
    });
  }

  get name(): string | undefined {
    return this.pick("name");
  }

  set name(value: string | undefined) {
    this.assign("name", value);
  }

  get description(): string | undefined {
    return this.pick("description");
  }

  set description(value: string | undefined) {
    this.assign("description", value);
  }

  get avatarUrl(): string | undefined {
    return this.pick("avatar_url");
  }

  /**
   * Contact “links” URLs from the API (`links` on {@link ContactResponse}).
   * Named {@link contactLinks} to avoid clashing with {@link FrontResource.links} (HAL `_links`).
   */
  get contactLinks(): string[] | undefined {
    return this.pick("links");
  }

  set contactLinks(value: string[] | undefined) {
    this.assign("links", value);
  }

  get handles(): ContactResponse["handles"] {
    return this.pick("handles");
  }

  get customFields(): ContactResponse["custom_fields"] {
    return this.pick("custom_fields");
  }

  set customFields(value: ContactResponse["custom_fields"]) {
    this.assign("custom_fields", value);
  }

  get lists(): ContactResponse["lists"] {
    return this.pick("lists");
  }

  get groups(): ContactResponse["groups"] {
    return this.pick("groups");
  }

  get isPrivate(): boolean | undefined {
    return this.pick("is_private");
  }

  /**
   * Build the `PATCH` body implied by the current mutable fields.
   * @see https://dev.frontapp.com/reference/update-a-contact
   */
  toUpdateBody(): Contact {
    return contactSnapshotToUpdateBody(this.state);
  }

  /**
   * Update this contact (`PATCH /contacts/{contact_id}`). The API returns `204`; local state is merged from the body.
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/update-a-contact
   */
  async update(body: Contact | Partial<Contact>): Promise<void>;
  async update(contactId: string, body: Contact | Partial<Contact>): Promise<void>;
  async update(
    bodyOrContactId: Contact | Partial<Contact> | string,
    directBody?: Contact | Partial<Contact>,
  ): Promise<void> {
    if (typeof bodyOrContactId === "string") {
      await this.target(bodyOrContactId).update(directBody ?? {});
      return;
    }
    await this.patchNoContent(bodyOrContactId, mergeContactSnapshot);
  }

  override async delete(contactId?: string): Promise<void> {
    if (contactId === undefined) {
      await super.delete();
      return;
    }
    await this.target(contactId).delete();
  }

  /**
   * `GET` this contact and replace local state (normalizes into {@link ContactSnapshot}).
   */
  override async refresh(): Promise<this> {
    const data = await this.base.requestJson<ContactResponse>("GET", this.selfPath());
    this.replaceState(toContactSnapshot(data));
    this.onAfterRefresh();
    return this;
  }

  /**
   * List conversations for this contact (`GET /contacts/{contact_id}/conversations`).
   *
   * **Required scope:** `conversations:read`
   *
   * @param query Optional `q`, `limit`, and `page_token`.
   * @see https://dev.frontapp.com/reference/list-contact-conversations
   */
  async listConversations(
    query?: ListContactConversationsQuery,
  ): Promise<WithNormalizedPagination<ListContactConversationsResponse>>;
  async listConversations(
    contactId: string,
    query?: ListContactConversationsQuery,
  ): Promise<WithNormalizedPagination<ListContactConversationsResponse>>;
  async listConversations(
    queryOrContactId?: ListContactConversationsQuery | string,
    directQuery?: ListContactConversationsQuery,
  ): Promise<WithNormalizedPagination<ListContactConversationsResponse>> {
    if (typeof queryOrContactId === "string") {
      return await this.target(queryOrContactId).listConversations(directQuery);
    }
    const path = FrontBase.expandPath("/contacts/{contact_id}/conversations", {
      contact_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListContactConversationsResponse>>(
      "GET",
      path,
      {
        query: queryFromListContactConversations(queryOrContactId),
      },
    );
  }

  /**
   * Add a handle (`POST /contacts/{contact_id}/handles`). The API returns `204`.
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/add-contact-handle
   */
  async addHandle(body: ContactHandle): Promise<void>;
  async addHandle(contactId: string, body: ContactHandle): Promise<void>;
  async addHandle(
    bodyOrContactId: ContactHandle | string,
    directBody?: ContactHandle,
  ): Promise<void> {
    if (typeof bodyOrContactId === "string") {
      await this.target(bodyOrContactId).addHandle(directBody ?? { handle: "", source: "custom" });
      return;
    }
    const path = FrontBase.expandPath("/contacts/{contact_id}/handles", {
      contact_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body: bodyOrContactId });
    const existing = this.pick("handles") ?? [];
    this.assign("handles", [...existing, bodyOrContactId]);
  }

  /**
   * Remove a handle (`DELETE /contacts/{contact_id}/handles`). The API expects a JSON body (including `force`), not query parameters.
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/delete-contact-handle
   */
  async deleteHandle(body: DeleteContactHandle): Promise<void>;
  async deleteHandle(contactId: string, body: DeleteContactHandle): Promise<void>;
  async deleteHandle(
    bodyOrContactId: DeleteContactHandle | string,
    directBody?: DeleteContactHandle,
  ): Promise<void> {
    if (typeof bodyOrContactId === "string") {
      await this.target(bodyOrContactId).deleteHandle(
        directBody ?? { force: false, handle: "", source: "custom" },
      );
      return;
    }
    const path = FrontBase.expandPath("/contacts/{contact_id}/handles", {
      contact_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body: bodyOrContactId });
    const existing = this.pick("handles") ?? [];
    this.assign(
      "handles",
      existing.filter(
        (h) => !(h.handle === bodyOrContactId.handle && h.source === bodyOrContactId.source),
      ),
    );
  }

  /**
   * List notes on this contact (`GET /contacts/{contact_id}/notes`). The API returns `202`.
   *
   * **Required scope:** `contacts:read`
   *
   * @see https://dev.frontapp.com/reference/list-notes
   */
  async listNotes(contactId?: string): Promise<WithNormalizedPagination<ListNotesResponse>> {
    if (contactId !== undefined) {
      return await this.target(contactId).listNotes();
    }
    const path = FrontBase.expandPath("/contacts/{contact_id}/notes", {
      contact_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListNotesResponse>>("GET", path);
  }

  /**
   * Add a note (`POST /contacts/{contact_id}/notes`). The API returns `201` with the new note.
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/add-note
   */
  async addNote(body: CreateContactNote): Promise<ContactNoteResponse>;
  async addNote(contactId: string, body: CreateContactNote): Promise<ContactNoteResponse>;
  async addNote(
    bodyOrContactId: CreateContactNote | string,
    directBody?: CreateContactNote,
  ): Promise<ContactNoteResponse> {
    if (typeof bodyOrContactId === "string") {
      return await this.target(bodyOrContactId).addNote(directBody ?? { author_id: "", body: "" });
    }
    const path = FrontBase.expandPath("/contacts/{contact_id}/notes", {
      contact_id: this.id,
    });
    return await this.base.requestJson<ContactNoteResponse>("POST", path, {
      body: bodyOrContactId,
    });
  }
  /**
   * List contacts (`GET /contacts`).
   *
   * **Required scope:** `contacts:read`
   *
   * @param query Optional `q`, pagination, and sort.
   * @see https://dev.frontapp.com/reference/list-contacts
   */
  async list(query?: ListContactsQuery): Promise<WithNormalizedPagination<ListContactsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListContactsResponse>>(
      "GET",
      "/contacts",
      { query: queryFromListContacts(query) },
    );
  }

  /**
   * Create a contact (`POST /contacts`). The API returns `201` with the new contact.
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/create-contact
   */
  async create(body: CreateContact): Promise<FrontContacts> {
    const data = await this.base.requestJson<ContactResponse>("POST", "/contacts", { body });
    return new FrontContacts(this.base, data);
  }

  /**
   * List custom fields that can be attached to contacts (`GET /contacts/custom_fields`).
   *
   * **Required scope:** `custom_fields:read`
   *
   * @see https://dev.frontapp.com/reference/list-contact-custom-fields
   */
  async listCustomFields(): Promise<WithNormalizedPagination<ListContactCustomFieldsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListContactCustomFieldsResponse>>(
      "GET",
      "/contacts/custom_fields",
    );
  }

  /**
   * Merge contacts (`POST /contacts/merge`).
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/merge-contacts
   */
  async merge(body: MergeContacts): Promise<FrontContacts> {
    const data = await this.base.requestJson<ContactResponse>("POST", "/contacts/merge", { body });
    return new FrontContacts(this.base, data);
  }

  /**
   * Fetch one contact (`GET /contacts/{contact_id}`).
   *
   * **Required scope:** `contacts:read`
   *
   * @param contactId Contact id or supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1).
   * @see https://dev.frontapp.com/reference/get-contact
   */
  async get(contactId: string): Promise<FrontContacts> {
    return await this.target(contactId).refresh();
  }

  /** Target a contact by ID without fetching it first. */
  private target(contactId: string): FrontContacts {
    return new FrontContacts(this.base, undefined, contactId);
  }
}
