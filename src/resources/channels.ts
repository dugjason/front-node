import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type ChannelResponse = components["schemas"]["ChannelResponse"];
export type UpdateChannel = components["schemas"]["UpdateChannel"];
export type CreateDraft = components["schemas"]["CreateDraft"];
export type CustomMessage = components["schemas"]["CustomMessage"];
export type OutboundMessage = components["schemas"]["OutboundMessage"];
export type MessageResponse = components["schemas"]["MessageResponse"];

type ListChannelsResponse =
  operations["list-channels"]["responses"][200]["content"]["application/json"];

type AcceptedMessageBody =
  operations["create-message"]["responses"][202]["content"]["application/json"];

type AcceptedBody = operations["validate-channel"]["responses"][202]["content"]["application/json"];

const mergeChannelSnapshot = (
  current: ChannelResponse,
  patch: Partial<UpdateChannel>,
): ChannelResponse => {
  const filtered = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<UpdateChannel>;

  let next: ChannelResponse = { ...current };
  if (filtered.name !== undefined) {
    next = { ...next, name: filtered.name };
  }
  if (filtered.settings !== undefined) {
    next = {
      ...next,
      settings: { ...current.settings, ...filtered.settings },
    };
  }
  return next;
};

const channelResponseToUpdateBody = (state: ChannelResponse): UpdateChannel => ({
  name: state.name,
  settings: state.settings,
});

/**
 * One channel (`/channels/{channel_id}` and related message routes).
 *
 * Writable: `name`, `settings`. To move a channel to another inbox, call {@link update} with `{ inbox_id }` and then {@link refresh} (the GET response does not include `inbox_id`).
 * Read-only: `id`, `type`, `address`, `sendAs`, `isPrivate`, `isValid`, `links`.
 *
 * `PATCH /channels/{channel_id}` returns `204`; {@link update} and {@link save} merge the request into local state for fields that exist on {@link ChannelResponse}.
 *
 * @see https://dev.frontapp.com/reference/channels
 */
export class FrontChannel extends FrontResource<ChannelResponse, UpdateChannel> {
  protected selfPath(): string {
    return FrontBase.expandPath("/channels/{channel_id}", {
      channel_id: this.id,
    });
  }

  get name(): string | undefined {
    return this.pick("name");
  }

  set name(value: string | undefined) {
    this.assign("name", value);
  }

  get settings(): ChannelResponse["settings"] {
    return this.pick("settings");
  }

  set settings(value: ChannelResponse["settings"]) {
    this.assign("settings", value);
  }

  get type(): ChannelResponse["type"] {
    return this.pick("type");
  }

  get address(): string | undefined {
    return this.pick("address");
  }

  get sendAs(): string | undefined {
    return this.pick("send_as");
  }

  get isPrivate(): boolean {
    return this.pick("is_private");
  }

  get isValid(): boolean {
    return this.pick("is_valid");
  }

  /**
   * The Front API does not expose `DELETE /channels/{channel_id}`.
   *
   * @throws Error always — use the Front product or inbox channel management instead.
   */
  override delete(): Promise<void> {
    return Promise.reject(
      new Error(
        `Deleting channel ${this.id} is not supported by the Front REST API for this path.`,
      ),
    );
  }

  /**
   * Build the `PATCH` body implied by the current `name` and `settings`.
   *
   * @see https://dev.frontapp.com/reference/update-channel
   */
  toUpdateBody(): UpdateChannel {
    return channelResponseToUpdateBody(this.state);
  }

  /**
   * Update this channel (`PATCH /channels/{channel_id}`). The API returns `204`; local state is merged from the body.
   *
   * **Required scope:** `channels:write`
   *
   * @see https://dev.frontapp.com/reference/update-channel
   */
  async update(body: UpdateChannel | Partial<UpdateChannel>): Promise<void> {
    await this.patchNoContent(body, mergeChannelSnapshot);
  }

  /**
   * Create a draft (`POST /channels/{channel_id}/drafts`).
   *
   * **Required scope:** `drafts:write`
   *
   * @see https://dev.frontapp.com/reference/create-draft
   */
  async createDraft(body: CreateDraft): Promise<MessageResponse> {
    const path = FrontBase.expandPath("/channels/{channel_id}/drafts", {
      channel_id: this.id,
    });
    return await this.base.requestJson<MessageResponse>("POST", path, { body });
  }

  /**
   * Receive a custom message (`POST /channels/{channel_id}/incoming_messages`). Custom channels only.
   *
   * **Required scope:** `messages:write`
   *
   * @see https://dev.frontapp.com/reference/receive-custom-messages
   */
  async receiveCustomMessage(body: CustomMessage): Promise<AcceptedMessageBody> {
    const path = FrontBase.expandPath("/channels/{channel_id}/incoming_messages", {
      channel_id: this.id,
    });
    return await this.base.requestJson<AcceptedMessageBody>("POST", path, {
      body,
    });
  }

  /**
   * Send a new message from this channel (`POST /channels/{channel_id}/messages`).
   *
   * **Required scope:** `messages:send`
   *
   * @see https://dev.frontapp.com/reference/create-message
   */
  async createMessage(body: OutboundMessage): Promise<AcceptedMessageBody> {
    const path = FrontBase.expandPath("/channels/{channel_id}/messages", {
      channel_id: this.id,
    });
    return await this.base.requestJson<AcceptedMessageBody>("POST", path, {
      body,
    });
  }

  /**
   * Asynchronously validate an SMTP channel (`POST /channels/{channel_id}/validate`).
   *
   * **Required scope:** `channels:write`
   *
   * @see https://dev.frontapp.com/reference/validate-channel
   */
  async validate(): Promise<AcceptedBody> {
    const path = FrontBase.expandPath("/channels/{channel_id}/validate", {
      channel_id: this.id,
    });
    return await this.base.requestJson<AcceptedBody>("POST", path);
  }
}

/**
 * Company channels (`GET /channels`, `GET /channels/{channel_id}`).
 *
 * @see https://dev.frontapp.com/reference/channels
 */
export class FrontChannels {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
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
  async list(): Promise<WithNormalizedPagination<ListChannelsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListChannelsResponse>>(
      "GET",
      "/channels",
    );
  }

  /**
   * Fetch one channel (`GET /channels/{channel_id}`).
   *
   * **Required scope:** `channels:read`
   *
   * @param channelId Channel id or supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1) (e.g. channel address).
   * @see https://dev.frontapp.com/reference/get-channel
   */
  async get(channelId: string): Promise<FrontChannel> {
    const path = FrontBase.expandPath("/channels/{channel_id}", {
      channel_id: channelId,
    });
    const data = await this.base.requestJson<ChannelResponse>("GET", path);
    return new FrontChannel(this.base, data);
  }
}
