import type { FrontBase } from "../base";
import type { OperationParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type CommentResponse = components["schemas"]["CommentResponse"];

export type UpdateCommentParams = NonNullable<OperationParams<"update-comment">["body"]>;
export type AddCommentReplyParams = NonNullable<OperationParams<"add-comment-reply">["body"]>;

/** Collection operations returning Front response data. */
export class FrontComments {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /comments/{comment_id}
   * Required scope: `comments:read`
   * @see https://dev.frontapp.com/reference/get-comment
   */
  async get(commentId: string): Promise<OperationResponse<"get-comment">> {
    return await this.base.requestOperation("get-comment", { path: { comment_id: commentId } });
  }

  /** PATCH /comments/{comment_id}
   * Required scope: `comments:write`
   * @see https://dev.frontapp.com/reference/update-comment
   */
  async update(
    commentId: string,
    body: UpdateCommentParams,
  ): Promise<OperationResponse<"update-comment">> {
    return await this.base.requestOperation("update-comment", {
      body,
      path: { comment_id: commentId },
    });
  }

  /** GET /comments/{comment_id}/mentions
   * Required scope: `teammates:read`
   * @see https://dev.frontapp.com/reference/list-comment-mentions
   */
  async listMentions(commentId: string): Promise<OperationResponse<"list-comment-mentions">> {
    return await this.base.requestOperation("list-comment-mentions", {
      path: { comment_id: commentId },
    });
  }

  /** POST /comments/{comment_id}/replies
   * Required scope: `comments:write`
   * @see https://dev.frontapp.com/reference/add-comment-reply
   */
  async addReply(
    commentId: string,
    body: AddCommentReplyParams,
  ): Promise<OperationResponse<"add-comment-reply">> {
    return await this.base.requestOperation("add-comment-reply", {
      body,
      path: { comment_id: commentId },
    });
  }

  /** GET /comments/{comment_id}/download/{attachment_link_id}
   * Required scope: `attachments:read`
   * @see https://dev.frontapp.com/reference/download-attachment-for-a-comment
   */
  async downloadAttachment(commentId: string, attachmentLinkId: string): Promise<Response> {
    return await this.base.requestOperationRaw("download-attachment-for-a-comment", {
      path: { attachment_link_id: attachmentLinkId, comment_id: commentId },
    });
  }
}
