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
export class FrontContact extends FrontResource<ContactSnapshot, Contact> {
  protected selfPath(): string {
    return FrontBase.expandPath("/contacts/{contact_id}", {
      contact_id: this.id,
    });
  }

  constructor(base: FrontBase, snapshot: ContactResponse) {
    super(base, toContactSnapshot(snapshot));
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
  async update(body: Contact | Partial<Contact>): Promise<void> {
    await this.patchNoContent(body, mergeContactSnapshot);
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
  ): Promise<WithNormalizedPagination<ListContactConversationsResponse>> {
    const path = FrontBase.expandPath("/contacts/{contact_id}/conversations", {
      contact_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListContactConversationsResponse>>(
      "GET",
      path,
      {
        query: queryFromListContactConversations(query),
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
  async addHandle(body: ContactHandle): Promise<void> {
    const path = FrontBase.expandPath("/contacts/{contact_id}/handles", {
      contact_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
    const existing = this.pick("handles") ?? [];
    this.assign("handles", [...existing, body]);
  }

  /**
   * Remove a handle (`DELETE /contacts/{contact_id}/handles`). The API expects a JSON body (including `force`), not query parameters.
   *
   * **Required scope:** `contacts:write`
   *
   * @see https://dev.frontapp.com/reference/delete-contact-handle
   */
  async deleteHandle(body: DeleteContactHandle): Promise<void> {
    const path = FrontBase.expandPath("/contacts/{contact_id}/handles", {
      contact_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
    const existing = this.pick("handles") ?? [];
    this.assign(
      "handles",
      existing.filter((h) => !(h.handle === body.handle && h.source === body.source)),
    );
  }

  /**
   * List notes on this contact (`GET /contacts/{contact_id}/notes`). The API returns `202`.
   *
   * **Required scope:** `contacts:read`
   *
   * @see https://dev.frontapp.com/reference/list-notes
   */
  async listNotes(): Promise<WithNormalizedPagination<ListNotesResponse>> {
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
  async addNote(body: CreateContactNote): Promise<ContactNoteResponse> {
    const path = FrontBase.expandPath("/contacts/{contact_id}/notes", {
      contact_id: this.id,
    });
    return await this.base.requestJson<ContactNoteResponse>("POST", path, {
      body,
    });
  }
}

/**
 * Company contacts (`GET/POST /contacts`, custom fields, merge) and single-contact helpers.
 *
 * @see https://dev.frontapp.com/reference/contacts
 */
export class FrontContacts {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
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
  async create(body: CreateContact): Promise<FrontContact> {
    const data = await this.base.requestJson<ContactResponse>("POST", "/contacts", { body });
    return new FrontContact(this.base, data);
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
  async merge(body: MergeContacts): Promise<FrontContact> {
    const data = await this.base.requestJson<ContactResponse>("POST", "/contacts/merge", { body });
    return new FrontContact(this.base, data);
  }

  /**
   * Fetch one contact (`GET /contacts/{contact_id}`).
   *
   * **Required scope:** `contacts:read`
   *
   * @param contactId Contact id or supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1).
   * @see https://dev.frontapp.com/reference/get-contact
   */
  async get(contactId: string): Promise<FrontContact> {
    const path = FrontBase.expandPath("/contacts/{contact_id}", {
      contact_id: contactId,
    });
    const data = await this.base.requestJson<ContactResponse>("GET", path);
    return new FrontContact(this.base, data);
  }
}
