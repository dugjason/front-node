import type { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { OperationResponse } from "../operation";

export type ChannelResponse = components["schemas"]["ChannelResponse"];
export type CreateChannelParams =
  operations["create-a-channel"]["requestBody"]["content"]["application/json"];
export type UpdateChannelParams =
  operations["update-channel"]["requestBody"]["content"]["application/json"];
export type CreateChannelDraftParams =
  operations["create-draft"]["requestBody"]["content"]["application/json"];
export type ReceiveCustomMessageParams =
  operations["receive-custom-messages"]["requestBody"]["content"]["application/json"];
export type CreateChannelMessageParams =
  operations["create-message"]["requestBody"]["content"]["application/json"];
export type MessageResponse = components["schemas"]["MessageResponse"];
export type ListChannelsResponse = OperationResponse<"list-channels">;
export type AcceptedMessageResponse =
  operations["create-message"]["responses"][202]["content"]["application/json"];
export type ValidateChannelResponse =
  operations["validate-channel"]["responses"][202]["content"]["application/json"];

/**
 * Channel collection (`GET /channels`) and by-ID operations (`/channels/{channel_id}`).
 * The Front API does not support deleting channels.
 *
 * @see https://dev.frontapp.com/reference/channels
 */
export class FrontChannels {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List channels (`GET /channels`).
   *
   * **Required scope:** `channels:read`
   *
   * @see https://dev.frontapp.com/reference/list-channels
   */
  async list(): Promise<ListChannelsResponse> {
    return await this.base.requestOperation("list-channels");
  }

  /**
   * Fetch one channel (`GET /channels/{channel_id}`).
   *
   * **Required scope:** `channels:read`
   *
   * @see https://dev.frontapp.com/reference/get-channel
   */
  async get(channelId: string): Promise<ChannelResponse> {
    return await this.base.requestOperation("get-channel", { path: { channel_id: channelId } });
  }

  /**
   * Create a channel in an inbox (`POST /inboxes/{inbox_id}/channels`). The API returns `204`.
   *
   * **Required scope:** `channels:write`
   *
   * @see https://dev.frontapp.com/reference/create-a-channel
   */
  async create(inboxId: string, body: CreateChannelParams): Promise<void> {
    return await this.base.requestOperation("create-a-channel", {
      body,
      path: { inbox_id: inboxId },
    });
  }

  /**
   * Update a channel (`PATCH /channels/{channel_id}`). The API returns `204`.
   *
   * **Required scope:** `channels:write`
   *
   * @see https://dev.frontapp.com/reference/update-channel
   */
  async update(channelId: string, body: UpdateChannelParams): Promise<void> {
    return await this.base.requestOperation("update-channel", {
      body,
      path: { channel_id: channelId },
    });
  }

  /**
   * Create a draft (`POST /channels/{channel_id}/drafts`).
   *
   * **Required scope:** `drafts:write`
   *
   * @see https://dev.frontapp.com/reference/create-draft
   */
  async createDraft(channelId: string, body: CreateChannelDraftParams): Promise<MessageResponse> {
    return await this.base.requestOperation("create-draft", {
      body,
      path: { channel_id: channelId },
    });
  }

  /**
   * Receive a custom message (`POST /channels/{channel_id}/incoming_messages`).
   *
   * **Required scope:** `messages:write`
   *
   * @see https://dev.frontapp.com/reference/receive-custom-messages
   */
  async receiveCustomMessage(
    channelId: string,
    body: ReceiveCustomMessageParams,
  ): Promise<AcceptedMessageResponse> {
    return await this.base.requestOperation("receive-custom-messages", {
      body,
      path: { channel_id: channelId },
    });
  }

  /**
   * Send a new message from a channel (`POST /channels/{channel_id}/messages`).
   *
   * **Required scope:** `messages:send`
   *
   * @see https://dev.frontapp.com/reference/create-message
   */
  async createMessage(
    channelId: string,
    body: CreateChannelMessageParams,
  ): Promise<AcceptedMessageResponse> {
    return await this.base.requestOperation("create-message", {
      body,
      path: { channel_id: channelId },
    });
  }

  /**
   * Asynchronously validate an SMTP channel (`POST /channels/{channel_id}/validate`).
   *
   * **Required scope:** `channels:write`
   *
   * @see https://dev.frontapp.com/reference/validate-channel
   */
  async validate(channelId: string): Promise<ValidateChannelResponse> {
    return await this.base.requestOperation("validate-channel", {
      path: { channel_id: channelId },
    });
  }
}
