import { APIResource } from "../core/resource"
import {
  addCommentReply,
  downloadAttachmentForAComment,
  getComment,
  listCommentMentions,
  updateComment,
} from "../generated/sdk.gen"
import type {
  AddCommentReplyData,
  Attachment,
  CommentResponse,
  GetCommentResponse,
  TeammateResponse,
  UpdateComment,
} from "../generated/types.gen"
import { FrontComment } from "../resources/comments"

export class Comments extends APIResource<FrontComment, CommentResponse> {
  protected makeItem(raw: CommentResponse): FrontComment {
    return new FrontComment(raw)
  }

  /** READ **/
  async get(
    commentId: string,
  ): Promise<{ comment: FrontComment; response: Response }> {
    const { item, response } = await this.getOne<GetCommentResponse>({
      getCall: () => getComment({ path: { comment_id: commentId } }),
    })
    return { comment: item, response }
  }

  async listMentions(
    commentId: string,
  ): Promise<{ response: Response; data: TeammateResponse[] }> {
    const { response, data } = await listCommentMentions({
      path: { comment_id: commentId },
    })
    return { response, data: data?._results ?? [] }
  }

  async downloadAttachment(
    commentId: string,
    attachmentLinkId: string,
  ): Promise<{ response: Response; attachment?: Attachment }> {
    const { response, data } = await downloadAttachmentForAComment({
      path: { comment_id: commentId, attachment_link_id: attachmentLinkId },
    })
    return { response, attachment: data }
  }

  /** UPDATE **/
  async update(
    commentId: string,
    body: UpdateComment,
  ): Promise<{ comment: FrontComment; response: Response }> {
    const { response } = await updateComment({
      path: { comment_id: commentId },
      body,
    })
    const refreshed = await this.get(commentId)
    return { comment: refreshed.comment, response }
  }

  /** ACTIONS **/
  async reply(
    commentId: string,
    body: AddCommentReplyData["body"],
  ): Promise<{ response: Response; comment?: CommentResponse }> {
    const { response, data } = await addCommentReply({
      path: { comment_id: commentId },
      body,
    })
    return { response, comment: data }
  }
}
