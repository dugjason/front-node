import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";

type MessageResponse = components["schemas"]["MessageResponse"];

type ListMessageSeenResponse =
  operations["get-message-seen-status"]["responses"][200]["content"]["application/json"];

const emptySeenBody: Record<string, never> = {};

/**
 * One message (`/messages/{message_id}` and related routes).
 *
 * @see https://dev.frontapp.com/reference/messages
 */
export class FrontMessages {
  private readonly base: FrontBase;
  private readonly boundMessageId: string | undefined;
  private snapshot: MessageResponse | undefined;

  constructor(base: FrontBase, messageId?: string, snapshot?: MessageResponse) {
    this.base = base;
    this.boundMessageId = messageId;
    this.snapshot = snapshot;
  }

  /** Id or alias used in request paths (from the constructor or last {@link refresh}). */
  get messageIdParam(): string {
    return this.messageId;
  }

  /** Last JSON payload from {@link FrontMessages.get} or {@link refresh}, if loaded. */
  get data(): Readonly<MessageResponse> | undefined {
    return this.snapshot;
  }

  /**
   * `GET /messages/{message_id}` (JSON). For other `Accept` values (e.g. `message/rfc822`), use {@link fetchRaw}.
   *
   * **Required scope:** `messages:read`
   */
  async refresh(): Promise<this> {
    const path = FrontBase.expandPath("/messages/{message_id}", {
      message_id: this.messageId,
    });
    this.snapshot = await this.base.requestJson<MessageResponse>("GET", path);
    return this;
  }

  /**
   * `GET /messages/{message_id}` without JSON parsing — use for non-JSON `Accept` (e.g. `message/rfc822`).
   *
   * **Required scope:** `messages:read`
   */
  async fetchRaw(init?: { headers?: Record<string, string | undefined> }): Promise<Response>;
  async fetchRaw(
    messageId: string,
    init?: { headers?: Record<string, string | undefined> },
  ): Promise<Response>;
  async fetchRaw(
    messageIdOrInit?: string | { headers?: Record<string, string | undefined> },
    optionalInit?: { headers?: Record<string, string | undefined> },
  ): Promise<Response> {
    const messageId = typeof messageIdOrInit === "string" ? messageIdOrInit : this.messageId;
    const init = typeof messageIdOrInit === "string" ? optionalInit : messageIdOrInit;
    const path = FrontBase.expandPath("/messages/{message_id}", {
      message_id: messageId,
    });
    const headers: Record<string, string | undefined> = {
      ...init?.headers,
    };
    if (headers.Accept === undefined) {
      headers.Accept = "application/json";
    }
    return await this.base.requestWithoutParsingBody("GET", path, { headers });
  }

  /**
   * `GET /messages/{message_id}/download/{attachment_link_id}` — raw {@link Response}.
   *
   * **Required scope:** `attachments:read`
   */
  async downloadAttachment(
    messageIdOrAttachmentLinkId: string,
    optionalAttachmentLinkId?: string,
  ): Promise<Response> {
    const messageId =
      optionalAttachmentLinkId === undefined ? this.messageId : messageIdOrAttachmentLinkId;
    const attachmentLinkId = optionalAttachmentLinkId ?? messageIdOrAttachmentLinkId;
    const path = FrontBase.expandPath("/messages/{message_id}/download/{attachment_link_id}", {
      attachment_link_id: attachmentLinkId,
      message_id: messageId,
    });
    return await this.base.requestWithoutParsingBody("GET", path);
  }

  /**
   * `GET /messages/{message_id}/seen`.
   *
   * **Required scope:** `messages:read`
   */
  async getSeen(
    messageId = this.messageId,
  ): Promise<WithNormalizedPagination<ListMessageSeenResponse>> {
    const path = FrontBase.expandPath("/messages/{message_id}/seen", {
      message_id: messageId,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListMessageSeenResponse>>(
      "GET",
      path,
    );
  }

  /**
   * `POST /messages/{message_id}/seen`.
   *
   * **Required scope:** `messages:write`
   */
  async markSeen(messageId = this.messageId): Promise<void> {
    const path = FrontBase.expandPath("/messages/{message_id}/seen", {
      message_id: messageId,
    });
    await this.base.requestJson<undefined>("POST", path, {
      body: emptySeenBody,
    });
  }

  private get messageId(): string {
    if (this.boundMessageId === undefined) {
      throw new Error("This message operation requires an ID.");
    }
    return this.boundMessageId;
  }

  /**
   * `GET /messages/{message_id}` — returns a hydrated resource with the response loaded.
   *
   * **Required scope:** `messages:read`
   */
  async get(messageId: string): Promise<FrontMessages> {
    const path = FrontBase.expandPath("/messages/{message_id}", {
      message_id: messageId,
    });
    const data = await this.base.requestJson<MessageResponse>("GET", path);
    return new FrontMessages(this.base, messageId, data);
  }
}
