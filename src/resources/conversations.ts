import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type ConversationResponse = components["schemas"]["ConversationResponse"];

export type ListConversationsParams = OperationListParams<"list-conversations">;
export type CreateConversationParams = NonNullable<OperationParams<"create-conversation">["body"]>;
export type UpdateConversationParams = NonNullable<OperationParams<"update-conversation">["body"]>;
export type SearchConversationParams = OperationListParams<"search-conversations">;
export type UpdateConversationAssigneeParams = NonNullable<
  OperationParams<"update-conversation-assignee">["body"]
>;
export type AddConversationCommentParams = NonNullable<OperationParams<"add-comment">["body"]>;
export type CreateConversationDraftReplyParams = NonNullable<
  OperationParams<"create-draft-reply">["body"]
>;
export type ListConversationEventsParams = OperationListParams<"list-conversation-events">;
export type AddConversationFollowersParams = NonNullable<
  OperationParams<"add-conversation-followers">["body"]
>;
export type AddConversationFollowersQueryParams = OperationListParams<"add-conversation-followers">;
export type DeleteConversationFollowersParams = NonNullable<
  OperationParams<"delete-conversation-followers">["body"]
>;
export type AddConversationLinkParams = NonNullable<
  OperationParams<"add-conversation-link">["body"]
>;
export type RemoveConversationLinksParams = NonNullable<
  OperationParams<"remove-conversation-links">["body"]
>;
export type ListConversationMessagesParams = OperationListParams<"list-conversation-messages">;
export type CreateConversationMessageReplyParams = NonNullable<
  OperationParams<"create-message-reply">["body"]
>;
export type UpdateConversationRemindersParams = NonNullable<
  OperationParams<"update-conversation-reminders">["body"]
>;
export type AddConversationTagParams = NonNullable<OperationParams<"add-conversation-tag">["body"]>;
export type RemoveConversationTagParams = NonNullable<
  OperationParams<"remove-conversation-tag">["body"]
>;

export type ListLinkedConversationsParams = OperationListParams<"list-linked-conversations">;
export type CreateLinkedConversationsParams = NonNullable<
  OperationParams<"create-linked-conversations">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontConversations {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /conversations
   * Required scope: `conversations:read`
   * @see https://dev.frontapp.com/reference/list-conversations
   */
  async list(params?: ListConversationsParams): Promise<OperationResponse<"list-conversations">> {
    return await this.base.requestOperation("list-conversations", {
      nextPageUrl: params?.nextPageUrl,
      query: params,
    });
  }

  /** POST /conversations
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/create-conversation
   */
  async create(body: CreateConversationParams): Promise<OperationResponse<"create-conversation">> {
    return await this.base.requestOperation("create-conversation", { body });
  }

  /** GET /conversations/{conversation_id}
   * Required scope: `conversations:read`
   * @see https://dev.frontapp.com/reference/get-conversation-by-id
   */
  async get(conversationId: string): Promise<OperationResponse<"get-conversation-by-id">> {
    return await this.base.requestOperation("get-conversation-by-id", {
      path: { conversation_id: conversationId },
    });
  }

  /** PATCH /conversations/{conversation_id}
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/update-conversation
   */
  async update(
    conversationId: string,
    body: UpdateConversationParams,
  ): Promise<OperationResponse<"update-conversation">> {
    return await this.base.requestOperation("update-conversation", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** DELETE /conversations/{conversation_id}
   * Required scope: `conversations:delete`
   * @see https://dev.frontapp.com/reference/delete-conversation
   */
  async delete(conversationId: string): Promise<OperationResponse<"delete-conversation">> {
    return await this.base.requestOperation("delete-conversation", {
      path: { conversation_id: conversationId },
    });
  }

  /** GET /conversations/custom_fields
   * Required scope: `custom_fields:read`
   * @see https://dev.frontapp.com/reference/list-conversation-custom-fields
   */
  async listCustomFields(): Promise<OperationResponse<"list-conversation-custom-fields">> {
    return await this.base.requestOperation("list-conversation-custom-fields");
  }

  /** GET /conversations/search/{query}
   * Required scope: `conversations:read`
   * @see https://dev.frontapp.com/reference/search-conversations
   */
  async search(
    query: string,
    params?: SearchConversationParams,
  ): Promise<OperationResponse<"search-conversations">> {
    return await this.base.requestOperation("search-conversations", {
      nextPageUrl: params?.nextPageUrl,
      path: { query },
      query: params,
    });
  }

  /** PUT /conversations/{conversation_id}/assignee
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/update-conversation-assignee
   */
  async updateAssignee(
    conversationId: string,
    body: UpdateConversationAssigneeParams,
  ): Promise<OperationResponse<"update-conversation-assignee">> {
    return await this.base.requestOperation("update-conversation-assignee", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** GET /conversations/{conversation_id}/comments
   * Required scope: `comments:read`
   * @see https://dev.frontapp.com/reference/list-conversation-comments
   */
  async listComments(
    conversationId: string,
  ): Promise<OperationResponse<"list-conversation-comments">> {
    return await this.base.requestOperation("list-conversation-comments", {
      path: { conversation_id: conversationId },
    });
  }

  /** POST /conversations/{conversation_id}/comments
   * Required scope: `comments:write`
   * @see https://dev.frontapp.com/reference/add-comment
   */
  async addComment(
    conversationId: string,
    body: AddConversationCommentParams,
  ): Promise<OperationResponse<"add-comment">> {
    return await this.base.requestOperation("add-comment", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** GET /conversations/{conversation_id}/drafts
   * Required scope: `drafts:read`
   * @see https://dev.frontapp.com/reference/list-conversation-drafts
   */
  async listDrafts(conversationId: string): Promise<OperationResponse<"list-conversation-drafts">> {
    return await this.base.requestOperation("list-conversation-drafts", {
      path: { conversation_id: conversationId },
    });
  }

  /** POST /conversations/{conversation_id}/drafts
   * Required scope: `drafts:write`
   * @see https://dev.frontapp.com/reference/create-draft-reply
   */
  async createDraftReply(
    conversationId: string,
    body: CreateConversationDraftReplyParams,
  ): Promise<OperationResponse<"create-draft-reply">> {
    return await this.base.requestOperation("create-draft-reply", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** GET /conversations/{conversation_id}/events
   * Required scope: `events:*:read`
   * @see https://dev.frontapp.com/reference/list-conversation-events
   */
  async listEvents(
    conversationId: string,
    params?: ListConversationEventsParams,
  ): Promise<OperationResponse<"list-conversation-events">> {
    return await this.base.requestOperation("list-conversation-events", {
      nextPageUrl: params?.nextPageUrl,
      path: { conversation_id: conversationId },
      query: params,
    });
  }

  /** GET /conversations/{conversation_id}/followers
   * Required scope: `teammates:read`
   * @see https://dev.frontapp.com/reference/list-conversation-followers
   */
  async listFollowers(
    conversationId: string,
  ): Promise<OperationResponse<"list-conversation-followers">> {
    return await this.base.requestOperation("list-conversation-followers", {
      path: { conversation_id: conversationId },
    });
  }

  /** POST /conversations/{conversation_id}/followers
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/add-conversation-followers
   */
  async addFollowers(
    conversationId: string,
    body: AddConversationFollowersParams,
    params?: AddConversationFollowersQueryParams,
  ): Promise<OperationResponse<"add-conversation-followers">> {
    return await this.base.requestOperation("add-conversation-followers", {
      body,
      path: { conversation_id: conversationId },
      query: params,
    });
  }

  /** DELETE /conversations/{conversation_id}/followers
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/delete-conversation-followers
   */
  async deleteFollowers(
    conversationId: string,
    body?: DeleteConversationFollowersParams,
  ): Promise<OperationResponse<"delete-conversation-followers">> {
    return await this.base.requestOperation("delete-conversation-followers", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** GET /conversations/{conversation_id}/inboxes
   * Required scope: `inboxes:read`
   * @see https://dev.frontapp.com/reference/list-conversation-inboxes
   */
  async listInboxes(
    conversationId: string,
  ): Promise<OperationResponse<"list-conversation-inboxes">> {
    return await this.base.requestOperation("list-conversation-inboxes", {
      path: { conversation_id: conversationId },
    });
  }

  /** POST /conversations/{conversation_id}/links
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/add-conversation-link
   */
  async addLink(
    conversationId: string,
    body: AddConversationLinkParams,
  ): Promise<OperationResponse<"add-conversation-link">> {
    return await this.base.requestOperation("add-conversation-link", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** DELETE /conversations/{conversation_id}/links
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/remove-conversation-links
   */
  async removeLinks(
    conversationId: string,
    body?: RemoveConversationLinksParams,
  ): Promise<OperationResponse<"remove-conversation-links">> {
    return await this.base.requestOperation("remove-conversation-links", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** GET /conversations/{conversation_id}/messages
   * Required scope: `messages:read`
   * @see https://dev.frontapp.com/reference/list-conversation-messages
   */
  async listMessages(
    conversationId: string,
    params?: ListConversationMessagesParams,
  ): Promise<OperationResponse<"list-conversation-messages">> {
    return await this.base.requestOperation("list-conversation-messages", {
      nextPageUrl: params?.nextPageUrl,
      path: { conversation_id: conversationId },
      query: params,
    });
  }

  /** POST /conversations/{conversation_id}/messages
   * Required scope: `messages:send`
   * @see https://dev.frontapp.com/reference/create-message-reply
   */
  async createMessageReply(
    conversationId: string,
    body: CreateConversationMessageReplyParams,
  ): Promise<OperationResponse<"create-message-reply">> {
    return await this.base.requestOperation("create-message-reply", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** PATCH /conversations/{conversation_id}/reminders
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/update-conversation-reminders
   */
  async updateReminders(
    conversationId: string,
    body: UpdateConversationRemindersParams,
  ): Promise<OperationResponse<"update-conversation-reminders">> {
    return await this.base.requestOperation("update-conversation-reminders", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** POST /conversations/{conversation_id}/tags
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/add-conversation-tag
   */
  async addTag(
    conversationId: string,
    body: AddConversationTagParams,
  ): Promise<OperationResponse<"add-conversation-tag">> {
    return await this.base.requestOperation("add-conversation-tag", {
      body,
      path: { conversation_id: conversationId },
    });
  }

  /** DELETE /conversations/{conversation_id}/tags
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/remove-conversation-tag
   */
  async removeTag(
    conversationId: string,
    body?: RemoveConversationTagParams,
  ): Promise<OperationResponse<"remove-conversation-tag">> {
    return await this.base.requestOperation("remove-conversation-tag", {
      body,
      path: { conversation_id: conversationId },
    });
  }
  /** GET /conversations/{conversation_id}/linked_conversations
   * Required scope: `conversations:read`
   * @see https://dev.frontapp.com/reference/list-linked-conversations
   */
  async listLinkedConversations(
    conversationId: string,
    params?: ListLinkedConversationsParams,
  ): Promise<OperationResponse<"list-linked-conversations">> {
    return await this.base.requestOperation("list-linked-conversations", {
      nextPageUrl: params?.nextPageUrl,
      path: { conversation_id: conversationId },
      query: params,
    });
  }

  /** POST /conversations/{conversation_id}/linked_conversations
   * Required scope: `conversations:write`
   * @see https://dev.frontapp.com/reference/create-linked-conversations
   */
  async createLinkedConversations(
    conversationId: string,
    body?: CreateLinkedConversationsParams,
  ): Promise<OperationResponse<"create-linked-conversations">> {
    return await this.base.requestOperation("create-linked-conversations", {
      body,
      path: { conversation_id: conversationId },
    });
  }
}
