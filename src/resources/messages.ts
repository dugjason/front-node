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
export class FrontMessage {
  private readonly base: FrontBase;
  private readonly messageId: string;
  private snapshot: MessageResponse | undefined;

  constructor(base: FrontBase, messageId: string, snapshot?: MessageResponse) {
    this.base = base;
    this.messageId = messageId;
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
  async fetchRaw(init?: { headers?: Record<string, string | undefined> }): Promise<Response> {
    const path = FrontBase.expandPath("/messages/{message_id}", {
      message_id: this.messageId,
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
  async downloadAttachment(attachmentLinkId: string): Promise<Response> {
    const path = FrontBase.expandPath("/messages/{message_id}/download/{attachment_link_id}", {
      attachment_link_id: attachmentLinkId,
      message_id: this.messageId,
    });
    return await this.base.requestWithoutParsingBody("GET", path);
  }

  /**
   * `GET /messages/{message_id}/seen`.
   *
   * **Required scope:** `messages:read`
   */
  async getSeen(): Promise<WithNormalizedPagination<ListMessageSeenResponse>> {
    const path = FrontBase.expandPath("/messages/{message_id}/seen", {
      message_id: this.messageId,
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
  async markSeen(): Promise<void> {
    const path = FrontBase.expandPath("/messages/{message_id}/seen", {
      message_id: this.messageId,
    });
    await this.base.requestJson<undefined>("POST", path, {
      body: emptySeenBody,
    });
  }
}

/**
 * Messages (`/messages/{message_id}`).
 *
 * @see https://dev.frontapp.com/reference/messages
 */
export class FrontMessages {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * `GET /messages/{message_id}` — returns a {@link FrontMessage} with the response loaded.
   *
   * **Required scope:** `messages:read`
   */
  async get(messageId: string): Promise<FrontMessage> {
    const path = FrontBase.expandPath("/messages/{message_id}", {
      message_id: messageId,
    });
    const data = await this.base.requestJson<MessageResponse>("GET", path);
    return new FrontMessage(this.base, messageId, data);
  }

  /** Target a message by id without calling the API first. */
  withId(messageId: string): FrontMessage {
    return new FrontMessage(this.base, messageId);
  }
}
