import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";
import type { CreateComment } from "./comments";
import { FrontComment } from "./comments";

export type ConversationResponse = components["schemas"]["ConversationResponse"];
export type UpdateConversation = components["schemas"]["UpdateConversation"];
export type CreateConversation = components["schemas"]["CreateConversation"];
export type ReplyDraft = components["schemas"]["ReplyDraft"];
export type OutboundReplyMessage = components["schemas"]["OutboundReplyMessage"];
export type UpdateConversationReminders = components["schemas"]["UpdateConversationReminders"];
export type TagIds = components["schemas"]["TagIds"];

type MessageResponse = components["schemas"]["MessageResponse"];

type ListConversationsResponse =
  operations["list-conversations"]["responses"][200]["content"]["application/json"];
type ListConversationCustomFieldsResponse =
  operations["list-conversation-custom-fields"]["responses"][200]["content"]["application/json"];
type SearchConversationsResponse =
  operations["search-conversations"]["responses"][200]["content"]["application/json"];
type ListConversationCommentsResponse =
  operations["list-conversation-comments"]["responses"][200]["content"]["application/json"];
type ListConversationDraftsResponse =
  operations["list-conversation-drafts"]["responses"][200]["content"]["application/json"];
type ListConversationEventsResponse =
  operations["list-conversation-events"]["responses"][200]["content"]["application/json"];
type ListConversationFollowersResponse =
  operations["list-conversation-followers"]["responses"][200]["content"]["application/json"];
type ListConversationInboxesResponse =
  operations["list-conversation-inboxes"]["responses"][200]["content"]["application/json"];
type ListConversationMessagesResponse =
  operations["list-conversation-messages"]["responses"][200]["content"]["application/json"];

type AcceptedMessageReply =
  operations["create-message-reply"]["responses"][202]["content"]["application/json"];

type ListConversationsQuery = NonNullable<operations["list-conversations"]["parameters"]["query"]>;
type SearchConversationsQuery = NonNullable<
  operations["search-conversations"]["parameters"]["query"]
>;
type ListConversationEventsQuery = NonNullable<
  operations["list-conversation-events"]["parameters"]["query"]
>;
export type ListConversationMessagesQuery = NonNullable<
  operations["list-conversation-messages"]["parameters"]["query"]
>;

type AddConversationFollowersQuery = NonNullable<
  operations["add-conversation-followers"]["parameters"]["query"]
>;
type AddConversationFollowersBody = NonNullable<
  NonNullable<
    operations["add-conversation-followers"]["requestBody"]
  >["content"]["application/json"]
>;
type DeleteConversationFollowersBody = NonNullable<
  NonNullable<
    operations["delete-conversation-followers"]["requestBody"]
  >["content"]["application/json"]
>;
type AddConversationLinkBody = NonNullable<
  NonNullable<operations["add-conversation-link"]["requestBody"]>["content"]["application/json"]
>;
type RemoveConversationLinksBody = NonNullable<
  NonNullable<operations["remove-conversation-links"]["requestBody"]>["content"]["application/json"]
>;

const queryFromListConversations = (
  q?: ListConversationsQuery,
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

const queryFromSearchConversations = (
  q?: SearchConversationsQuery,
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

const queryFromListConversationEvents = (
  q?: ListConversationEventsQuery,
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

const queryFromListConversationMessages = (
  q?: ListConversationMessagesQuery,
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
  if (q.sort_by !== undefined) {
    out.sort_by = String(q.sort_by);
  }
  if (q.sort_order !== undefined) {
    out.sort_order = String(q.sort_order);
  }
  return out;
};

const requestListConversationMessages = (
  base: FrontBase,
  conversationId: string,
  query?: ListConversationMessagesQuery,
): Promise<WithNormalizedPagination<ListConversationMessagesResponse>> => {
  const path = FrontBase.expandPath("/conversations/{conversation_id}/messages", {
    conversation_id: conversationId,
  });
  return base.requestJson<WithNormalizedPagination<ListConversationMessagesResponse>>("GET", path, {
    query: queryFromListConversationMessages(query),
  });
};

const queryFromAddConversationFollowers = (
  q?: AddConversationFollowersQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.ignore_errors !== undefined) {
    out.ignore_errors = q.ignore_errors ? "true" : "false";
  }
  return out;
};

const updateStatusToConversationStatus = (
  status: NonNullable<UpdateConversation["status"]>,
): ConversationResponse["status"] => {
  switch (status) {
    case "archived": {
      return "archived";
    }
    case "deleted": {
      return "deleted";
    }
    case "open": {
      return "unassigned";
    }
    case "spam": {
      return "deleted";
    }
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};

const conversationStatusToUpdateStatus = (
  status: ConversationResponse["status"],
): UpdateConversation["status"] | undefined => {
  if (status === "archived") {
    return "archived";
  }
  if (status === "deleted") {
    return "deleted";
  }
  if (status === "unassigned") {
    return "open";
  }
};

const mergeConversationSnapshot = (
  current: ConversationResponse,
  patch: Partial<UpdateConversation>,
): ConversationResponse => {
  const filtered = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<UpdateConversation>;

  let next: ConversationResponse = { ...current };

  if (filtered.status !== undefined) {
    next = {
      ...next,
      status: updateStatusToConversationStatus(filtered.status),
    };
  }
  if (filtered.status_id !== undefined) {
    next = { ...next, status_id: filtered.status_id };
  }
  if (filtered.custom_fields !== undefined) {
    next = { ...next, custom_fields: filtered.custom_fields };
  }
  if (filtered.tag_ids !== undefined) {
    const idSet = new Set(filtered.tag_ids);
    next = {
      ...next,
      tags: next.tags.filter((tag) => idSet.has(tag.id)),
    };
  }

  const assigneePatch = filtered.assignee_id as string | null | undefined;
  if (assigneePatch !== undefined) {
    next = {
      ...next,
      assignee: {
        ...next.assignee,
        id: assigneePatch === null ? "" : assigneePatch,
      },
    };
  }

  return next;
};

const conversationResponseToUpdateBody = (state: ConversationResponse): UpdateConversation => {
  const status = conversationStatusToUpdateStatus(state.status);
  return {
    assignee_id: state.assignee.id === "" ? undefined : state.assignee.id,
    custom_fields: state.custom_fields,
    tag_ids: state.tags.map((t) => t.id),
    ...(status === undefined ? {} : { status }),
    ...(state.status_id === undefined ? {} : { status_id: state.status_id }),
  };
};

/**
 * One conversation (`/conversations/{conversation_id}` and nested routes).
 *
 * Writable fields for {@link save} map from {@link ConversationResponse} into {@link UpdateConversation}
 * (assignee, status, status id, tags, custom fields). `PATCH` returns `204`; {@link update} merges the
 * request into local state for supported fields — call {@link refresh} when you need an authoritative snapshot.
 *
 * @see https://dev.frontapp.com/reference/conversations
 */
export class FrontConversation extends FrontResource<ConversationResponse, UpdateConversation> {
  protected selfPath(): string {
    return FrontBase.expandPath("/conversations/{conversation_id}", {
      conversation_id: this.id,
    });
  }

  get subject(): string {
    return this.pick("subject");
  }

  get status(): ConversationResponse["status"] {
    return this.pick("status");
  }

  get statusId(): string | undefined {
    return this.pick("status_id");
  }

  get statusCategory(): ConversationResponse["status_category"] {
    return this.pick("status_category");
  }

  get ticketIds(): ConversationResponse["ticket_ids"] {
    return this.pick("ticket_ids");
  }

  get assignee(): ConversationResponse["assignee"] {
    return this.pick("assignee");
  }

  get recipient(): ConversationResponse["recipient"] {
    return this.pick("recipient");
  }

  get tags(): ConversationResponse["tags"] {
    return this.pick("tags");
  }

  /**
   * Links attached to this conversation (API field `links`). HAL `_links` for the resource is {@link FrontResource.links}.
   */
  get conversationLinks(): ConversationResponse["links"] {
    return this.pick("links");
  }

  get customFields(): ConversationResponse["custom_fields"] {
    return this.pick("custom_fields");
  }

  get createdAt(): number | undefined {
    return this.pick("created_at");
  }

  get updatedAt(): number | undefined {
    return this.pick("updated_at");
  }

  get waitingSince(): number | undefined {
    return this.pick("waiting_since");
  }

  get isPrivate(): boolean {
    return this.pick("is_private");
  }

  get scheduledReminders(): ConversationResponse["scheduled_reminders"] {
    return this.pick("scheduled_reminders");
  }

  get metadata(): ConversationResponse["metadata"] {
    return this.pick("metadata");
  }

  toUpdateBody(): UpdateConversation {
    return conversationResponseToUpdateBody(this.state);
  }

  /**
   * Update this conversation (`PATCH /conversations/{conversation_id}`). The API returns `204`; local state
   * is merged from the body for supported fields.
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/update-conversation
   */
  async update(body: UpdateConversation | Partial<UpdateConversation>): Promise<void> {
    await this.patchNoContent(body, mergeConversationSnapshot);
  }

  /**
   * Permanently delete this conversation (`DELETE /conversations/{conversation_id}`). The conversation must be in
   * the trashed state.
   *
   * **Required scope:** `conversations:delete`
   *
   * @see https://dev.frontapp.com/reference/delete-conversation
   */
  override async delete(): Promise<void> {
    await super.delete();
  }

  /**
   * Assign or unassign (`PUT /conversations/{conversation_id}/assignee`). The API returns `204`.
   * Pass `{ assignee_id: null }` to unassign (JSON `null` is accepted by the API even when the generated schema
   * types `assignee_id` as `string`).
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/update-conversation-assignee
   */
  async updateAssignee(body: { assignee_id: string | null }): Promise<void> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/assignee", {
      conversation_id: this.id,
    });
    await this.base.requestJson<undefined>("PUT", path, { body });
  }

  /**
   * List comments (`GET /conversations/{conversation_id}/comments`).
   *
   * **Required scope:** `comments:read`
   *
   * @see https://dev.frontapp.com/reference/list-conversation-comments
   */
  async listComments(): Promise<WithNormalizedPagination<ListConversationCommentsResponse>> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/comments", {
      conversation_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListConversationCommentsResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Add a comment (`POST /conversations/{conversation_id}/comments`).
   *
   * **Required scope:** `comments:write`
   *
   * @see https://dev.frontapp.com/reference/add-comment
   */
  async addComment(body: CreateComment): Promise<FrontComment> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/comments", {
      conversation_id: this.id,
    });
    const data = await this.base.requestJson<components["schemas"]["CommentResponse"]>(
      "POST",
      path,
      { body },
    );
    return new FrontComment(this.base, data);
  }

  /**
   * List drafts (`GET /conversations/{conversation_id}/drafts`).
   *
   * **Required scope:** `drafts:read`
   *
   * @see https://dev.frontapp.com/reference/list-conversation-drafts
   */
  async listDrafts(): Promise<WithNormalizedPagination<ListConversationDraftsResponse>> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/drafts", {
      conversation_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListConversationDraftsResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Create a draft reply to the last message (`POST /conversations/{conversation_id}/drafts`).
   *
   * **Required scope:** `drafts:write`
   *
   * @see https://dev.frontapp.com/reference/create-draft-reply
   */
  async createDraftReply(body: ReplyDraft): Promise<MessageResponse> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/drafts", {
      conversation_id: this.id,
    });
    return await this.base.requestJson<MessageResponse>("POST", path, { body });
  }

  /**
   * List events (`GET /conversations/{conversation_id}/events`).
   *
   * **Required scope:** `events:read`
   *
   * @see https://dev.frontapp.com/reference/list-conversation-events
   */
  async listEvents(
    query?: ListConversationEventsQuery,
  ): Promise<WithNormalizedPagination<ListConversationEventsResponse>> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/events", {
      conversation_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListConversationEventsResponse>>(
      "GET",
      path,
      { query: queryFromListConversationEvents(query) },
    );
  }

  /**
   * List followers (`GET /conversations/{conversation_id}/followers`).
   *
   * **Required scope:** `conversations:read`
   *
   * @see https://dev.frontapp.com/reference/list-conversation-followers
   */
  async listFollowers(): Promise<WithNormalizedPagination<ListConversationFollowersResponse>> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/followers", {
      conversation_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListConversationFollowersResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Add followers (`POST /conversations/{conversation_id}/followers`). The API returns `204`.
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/add-conversation-followers
   */
  async addFollowers(
    body: AddConversationFollowersBody,
    query?: AddConversationFollowersQuery,
  ): Promise<void> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/followers", {
      conversation_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, {
      body,
      query: queryFromAddConversationFollowers(query),
    });
  }

  /**
   * Remove followers (`DELETE /conversations/{conversation_id}/followers`). The API returns `204`.
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/delete-conversation-followers
   */
  async deleteFollowers(body: DeleteConversationFollowersBody): Promise<void> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/followers", {
      conversation_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }

  /**
   * List inboxes (`GET /conversations/{conversation_id}/inboxes`).
   *
   * **Required scope:** `inboxes:read`
   *
   * @see https://dev.frontapp.com/reference/list-conversation-inboxes
   */
  async listInboxes(): Promise<WithNormalizedPagination<ListConversationInboxesResponse>> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/inboxes", {
      conversation_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListConversationInboxesResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Add links (`POST /conversations/{conversation_id}/links`). The API returns `204`.
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/add-conversation-link
   */
  async addLink(body: AddConversationLinkBody): Promise<void> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/links", {
      conversation_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Remove links (`DELETE /conversations/{conversation_id}/links`). The API returns `204`.
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/remove-conversation-links
   */
  async removeLinks(body: RemoveConversationLinksBody): Promise<void> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/links", {
      conversation_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }

  /**
   * List messages (`GET /conversations/{conversation_id}/messages`).
   *
   * **Required scope:** `messages:read`
   *
   * @see https://dev.frontapp.com/reference/list-conversation-messages
   */
  async listMessages(
    query?: ListConversationMessagesQuery,
  ): Promise<WithNormalizedPagination<ListConversationMessagesResponse>> {
    return await requestListConversationMessages(this.base, this.id, query);
  }

  /**
   * Reply with a new message (`POST /conversations/{conversation_id}/messages`). Returns `202` with status metadata.
   *
   * **Required scope:** `messages:send`
   *
   * @see https://dev.frontapp.com/reference/create-message-reply
   */
  async createMessageReply(body: OutboundReplyMessage): Promise<AcceptedMessageReply> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/messages", {
      conversation_id: this.id,
    });
    return await this.base.requestJson<AcceptedMessageReply>("POST", path, {
      body,
    });
  }

  /**
   * Update reminders (`PATCH /conversations/{conversation_id}/reminders`). The API returns `204`.
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/update-conversation-reminders
   */
  async updateReminders(body: UpdateConversationReminders): Promise<void> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/reminders", {
      conversation_id: this.id,
    });
    await this.base.requestJson<undefined>("PATCH", path, { body });
  }

  /**
   * Add tags (`POST /conversations/{conversation_id}/tags`). The API returns `204`.
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/add-conversation-tag
   */
  async addTag(body: TagIds): Promise<void> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/tags", {
      conversation_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Remove tags (`DELETE /conversations/{conversation_id}/tags`). The API returns `204`.
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/remove-conversation-tag
   */
  async removeTag(body: TagIds): Promise<void> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}/tags", {
      conversation_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }
}

/**
 * Company conversations (`/conversations`, `/conversations/custom_fields`, `/conversations/search/{query}`, …).
 *
 * @see https://dev.frontapp.com/reference/conversations
 */
export class FrontConversations {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List conversations (`GET /conversations`).
   *
   * **Required scope:** `conversations:read`
   *
   * @see https://dev.frontapp.com/reference/list-conversations
   */
  async list(
    query?: ListConversationsQuery,
  ): Promise<WithNormalizedPagination<ListConversationsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListConversationsResponse>>(
      "GET",
      "/conversations",
      { query: queryFromListConversations(query) },
    );
  }

  /**
   * Create a discussion conversation (`POST /conversations`).
   *
   * **Required scope:** `conversations:write`
   *
   * @see https://dev.frontapp.com/reference/create-conversation
   */
  async create(body: CreateConversation): Promise<FrontConversation> {
    const data = await this.base.requestJson<ConversationResponse>("POST", "/conversations", {
      body,
    });
    return new FrontConversation(this.base, data);
  }

  /**
   * List custom fields that can be attached to a conversation (`GET /conversations/custom_fields`).
   *
   * **Required scope:** `conversations:read`
   *
   * @see https://dev.frontapp.com/reference/list-conversation-custom-fields
   */
  async listCustomFields(): Promise<
    WithNormalizedPagination<ListConversationCustomFieldsResponse>
  > {
    return await this.base.requestJson<
      WithNormalizedPagination<ListConversationCustomFieldsResponse>
    >("GET", "/conversations/custom_fields");
  }

  /**
   * Search conversations (`GET /conversations/search/{query}`). The `{query}` segment is URL-encoded.
   *
   * **Required scope:** `conversations:read`
   *
   * @param query Search string (path segment).
   * @see https://dev.frontapp.com/reference/search-conversations
   */
  async search(
    query: string,
    params?: SearchConversationsQuery,
  ): Promise<WithNormalizedPagination<SearchConversationsResponse>> {
    const path = FrontBase.expandPath("/conversations/search/{query}", {
      query,
    });
    return await this.base.requestJson<WithNormalizedPagination<SearchConversationsResponse>>(
      "GET",
      path,
      { query: queryFromSearchConversations(params) },
    );
  }

  /**
   * List messages in a conversation (`GET /conversations/{conversation_id}/messages`).
   *
   * **Required scope:** `messages:read`
   *
   * @param conversationId Conversation id or supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1).
   * @see https://dev.frontapp.com/reference/list-conversation-messages
   */
  async listMessages(
    conversationId: string,
    query?: ListConversationMessagesQuery,
  ): Promise<WithNormalizedPagination<ListConversationMessagesResponse>> {
    return await requestListConversationMessages(this.base, conversationId, query);
  }

  /**
   * Fetch one conversation (`GET /conversations/{conversation_id}`).
   *
   * **Required scope:** `conversations:read`
   *
   * @param conversationId Conversation id or supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1).
   * @see https://dev.frontapp.com/reference/get-conversation-by-id
   */
  async get(conversationId: string): Promise<FrontConversation> {
    const path = FrontBase.expandPath("/conversations/{conversation_id}", {
      conversation_id: conversationId,
    });
    const data = await this.base.requestJson<ConversationResponse>("GET", path);
    return new FrontConversation(this.base, data);
  }
}
