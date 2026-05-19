import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";

export type InboxResponse = components["schemas"]["InboxResponse"];
export type CreateInbox = components["schemas"]["CreateInbox"];
export type CreateChannel = components["schemas"]["CreateChannel"];
export type ImportMessage = components["schemas"]["ImportMessage"];
export type TeammateIds = components["schemas"]["TeammateIds"];

type InboxSnapshot = InboxResponse & { id: string };

type ListInboxesResponse =
  operations["list-inboxes"]["responses"][200]["content"]["application/json"];

type ListInboxCustomFieldsResponse =
  operations["list-inbox-custom-fields"]["responses"][200]["content"]["application/json"];

type ListInboxChannelsResponse =
  operations["list-inbox-channels"]["responses"][200]["content"]["application/json"];

type ListInboxConversationsQuery = NonNullable<
  operations["list-inbox-conversations"]["parameters"]["query"]
>;
type ListInboxConversationsResponse =
  operations["list-inbox-conversations"]["responses"][200]["content"]["application/json"];

type ImportInboxMessageResponse =
  operations["import-inbox-message"]["responses"][202]["content"]["application/json"];

type ListInboxAccessResponse =
  operations["list-inbox-access"]["responses"][200]["content"]["application/json"];

const queryFromListInboxConversations = (
  q?: ListInboxConversationsQuery,
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

const assertInboxId = (snapshot: InboxResponse): string => {
  const { id } = snapshot;
  if (id === undefined || id === "") {
    throw new Error("Inbox response missing id");
  }
  return id;
};

/**
 * One inbox (`GET /inboxes/{inbox_id}`). There is no inbox `PATCH` in the OpenAPI spec; use {@link refresh} after changes.
 *
 * @see https://dev.frontapp.com/reference/inboxes
 */
export class FrontInbox {
  private state: InboxSnapshot;
  private readonly base: FrontBase;

  constructor(base: FrontBase, snapshot: InboxResponse) {
    this.base = base;
    const id = assertInboxId(snapshot);
    this.state = structuredClone({ ...snapshot, id });
  }

  get id(): string {
    return this.state.id;
  }

  get links(): InboxResponse["_links"] {
    return this.state._links;
  }

  /** Full inbox JSON from the last fetch or list/create response. */
  get data(): Readonly<InboxSnapshot> {
    return this.state;
  }

  private selfPath(): string {
    return FrontBase.expandPath("/inboxes/{inbox_id}", { inbox_id: this.id });
  }

  /**
   * Fetch inbox (`GET /inboxes/{inbox_id}`).
   *
   * **Required scope:** `inboxes:read`
   */
  async refresh(): Promise<this> {
    const next = await this.base.requestJson<InboxResponse>("GET", this.selfPath());
    const id = assertInboxId(next);
    this.state = structuredClone({ ...next, id });
    return this;
  }

  /**
   * List channels in this inbox (`GET /inboxes/{inbox_id}/channels`).
   *
   * **Required scope:** `channels:read`
   */
  async listChannels(): Promise<WithNormalizedPagination<ListInboxChannelsResponse>> {
    const path = FrontBase.expandPath("/inboxes/{inbox_id}/channels", {
      inbox_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListInboxChannelsResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Create a channel in this inbox (`POST /inboxes/{inbox_id}/channels`). The API returns `204`.
   *
   * **Required scope:** `channels:write`
   */
  async createChannel(body: CreateChannel): Promise<void> {
    const path = FrontBase.expandPath("/inboxes/{inbox_id}/channels", {
      inbox_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * List conversations in this inbox (`GET /inboxes/{inbox_id}/conversations`).
   *
   * **Required scope:** `conversations:read`
   */
  async listConversations(
    query?: ListInboxConversationsQuery,
  ): Promise<WithNormalizedPagination<ListInboxConversationsResponse>> {
    const path = FrontBase.expandPath("/inboxes/{inbox_id}/conversations", {
      inbox_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListInboxConversationsResponse>>(
      "GET",
      path,
      {
        query: queryFromListInboxConversations(query),
      },
    );
  }

  /**
   * Import a message into this inbox (`POST /inboxes/{inbox_id}/imported_messages`).
   *
   * **Required scope:** `messages:write`
   */
  async importMessage(body: ImportMessage): Promise<ImportInboxMessageResponse> {
    const path = FrontBase.expandPath("/inboxes/{inbox_id}/imported_messages", {
      inbox_id: this.id,
    });
    return await this.base.requestJson<ImportInboxMessageResponse>("POST", path, {
      body,
    });
  }

  /**
   * List teammates with access (`GET /inboxes/{inbox_id}/teammates`).
   *
   * **Required scope:** `teammates:read`
   */
  async listTeammateAccess(): Promise<WithNormalizedPagination<ListInboxAccessResponse>> {
    const path = FrontBase.expandPath("/inboxes/{inbox_id}/teammates", {
      inbox_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListInboxAccessResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Add teammate access (`POST /inboxes/{inbox_id}/teammates`). The API returns `204`.
   *
   * **Required scope:** `inboxes:write`
   */
  async addTeammateAccess(body: TeammateIds): Promise<void> {
    const path = FrontBase.expandPath("/inboxes/{inbox_id}/teammates", {
      inbox_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Remove teammate access (`DELETE /inboxes/{inbox_id}/teammates`). The API returns `204`.
   *
   * **Required scope:** `inboxes:write`
   */
  async removeTeammateAccess(body: TeammateIds): Promise<void> {
    const path = FrontBase.expandPath("/inboxes/{inbox_id}/teammates", {
      inbox_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }
}

/**
 * Company inbox routes (`/inboxes`, `/inboxes/custom_fields`, `/inboxes/{inbox_id}`).
 *
 * @see https://dev.frontapp.com/reference/inboxes
 */
export class FrontInboxes {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List inboxes (`GET /inboxes`).
   *
   * **Required scope:** `inboxes:read`
   */
  async list(): Promise<WithNormalizedPagination<ListInboxesResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListInboxesResponse>>(
      "GET",
      "/inboxes",
    );
  }

  /**
   * Create an inbox (`POST /inboxes`).
   *
   * **Required scope:** `inboxes:write`
   */
  async create(body: CreateInbox): Promise<FrontInbox> {
    const data = await this.base.requestJson<InboxResponse>("POST", "/inboxes", {
      body,
    });
    return new FrontInbox(this.base, data);
  }

  /**
   * List custom fields available on inboxes (`GET /inboxes/custom_fields`).
   *
   * **Required scope:** `custom_fields:read`
   */
  async listCustomFields(): Promise<WithNormalizedPagination<ListInboxCustomFieldsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListInboxCustomFieldsResponse>>(
      "GET",
      "/inboxes/custom_fields",
    );
  }

  /**
   * Fetch one inbox (`GET /inboxes/{inbox_id}`).
   *
   * **Required scope:** `inboxes:read`
   */
  async get(inboxId: string): Promise<FrontInbox> {
    const path = FrontBase.expandPath("/inboxes/{inbox_id}", {
      inbox_id: inboxId,
    });
    const data = await this.base.requestJson<InboxResponse>("GET", path);
    return new FrontInbox(this.base, data);
  }
}
