import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type CommentResponse = components["schemas"]["CommentResponse"];
export type CreateComment = components["schemas"]["CreateComment"];
export type UpdateComment = components["schemas"]["UpdateComment"];

type ListCommentMentionsResponse =
  operations["list-comment-mentions"]["responses"][200]["content"]["application/json"];

const commentResponseToUpdateBody = (state: CommentResponse): UpdateComment => ({
  body: state.body,
  is_pinned: state.is_pinned,
});

/**
 * One comment (`GET /comments/{comment_id}`, `PATCH /comments/{comment_id}/`, mentions, replies, attachment download).
 *
 * Writable: `body`, `isPinned`. Read-only: `id`, `author`, `postedAt`, `attachments`, `links`.
 * `PATCH` uses the slash-terminated URL from the OpenAPI spec and returns `200` with the updated comment.
 *
 * @see https://dev.frontapp.com/reference/comments
 */
export class FrontComment extends FrontResource<CommentResponse, UpdateComment> {
  protected selfPath(): string {
    return FrontBase.expandPath("/comments/{comment_id}", {
      comment_id: this.id,
    });
  }

  /** OpenAPI `PATCH` target includes a trailing slash (distinct from `GET` on this resource). */
  private patchPath(): string {
    return FrontBase.expandPath("/comments/{comment_id}/", {
      comment_id: this.id,
    });
  }

  get author(): CommentResponse["author"] {
    return this.pick("author");
  }

  get body(): string {
    return this.pick("body");
  }

  set body(value: string) {
    this.assign("body", value);
  }

  get isPinned(): boolean {
    return this.pick("is_pinned");
  }

  set isPinned(value: boolean) {
    this.assign("is_pinned", value);
  }

  get postedAt(): number | undefined {
    return this.pick("posted_at");
  }

  get attachments(): CommentResponse["attachments"] {
    return this.pick("attachments");
  }

  /**
   * The Front API does not expose `DELETE /comments/{comment_id}` on this path.
   */
  override delete(): Promise<void> {
    return Promise.reject(
      new Error(
        `Deleting comment ${this.id} is not supported by the Front REST API for this path.`,
      ),
    );
  }

  toUpdateBody(): UpdateComment {
    return commentResponseToUpdateBody(this.state);
  }

  /**
   * Update this comment (`PATCH /comments/{comment_id}/`). The API returns `200` with the updated comment.
   *
   * **Required scope:** `comments:write`
   */
  async update(body: UpdateComment | Partial<UpdateComment>): Promise<void> {
    const next = await this.base.requestJson<CommentResponse>("PATCH", this.patchPath(), { body });
    this.replaceState(next);
  }

  /**
   * Teammates mentioned in this comment (`GET /comments/{comment_id}/mentions`).
   *
   * **Required scope:** `teammates:read`
   */
  async listMentions(): Promise<WithNormalizedPagination<ListCommentMentionsResponse>> {
    const path = FrontBase.expandPath("/comments/{comment_id}/mentions", {
      comment_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListCommentMentionsResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Add a reply to this comment (`POST /comments/{comment_id}/replies`). Returns `201` with the new comment.
   *
   * **Required scope:** `comments:write`
   */
  async addReply(body: CreateComment): Promise<FrontComment> {
    const path = FrontBase.expandPath("/comments/{comment_id}/replies", {
      comment_id: this.id,
    });
    const data = await this.base.requestJson<CommentResponse>("POST", path, {
      body,
    });
    return new FrontComment(this.base, data);
  }

  /**
   * Download a comment attachment (`GET /comments/{comment_id}/download/{attachment_link_id}`).
   * Returns the raw HTTP {@link Response}; use {@link Response.blob} or {@link Response.arrayBuffer} to read bytes.
   *
   * **Required scope:** `attachments:read`
   */
  async downloadAttachment(attachmentLinkId: string): Promise<Response> {
    const path = FrontBase.expandPath("/comments/{comment_id}/download/{attachment_link_id}", {
      attachment_link_id: attachmentLinkId,
      comment_id: this.id,
    });
    return await this.base.requestWithoutParsingBody("GET", path);
  }
}

/**
 * Comments (`GET /comments/{comment_id}`).
 *
 * @see https://dev.frontapp.com/reference/comments
 */
export class FrontComments {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * Fetch one comment (`GET /comments/{comment_id}`).
   *
   * **Required scope:** `comments:read`
   *
   * @param commentId Comment id or supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1).
   */
  async get(commentId: string): Promise<FrontComment> {
    const path = FrontBase.expandPath("/comments/{comment_id}", {
      comment_id: commentId,
    });
    const data = await this.base.requestJson<CommentResponse>("GET", path);
    return new FrontComment(this.base, data);
  }
}
