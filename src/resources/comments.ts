import { listCommentMentions } from "../generated/sdk.gen"
import type { CommentResponse } from "../generated/types.gen"

export class FrontComment {
  constructor(private data: CommentResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get author() {
    return this.data.author
  }

  get body() {
    return this.data.body
  }

  get postedAt() {
    return this.data.posted_at
  }

  get attachments() {
    return this.data.attachments
  }

  get isPinned() {
    return this.data.is_pinned
  }

  toJSON(): CommentResponse {
    return this.data
  }

  /** SUB-COLLECTIONS & ACTIONS **/

  async mentions() {
    const { response, data } = await listCommentMentions({
      path: { comment_id: this.id },
    })
    return { response, data: data?._results ?? [] }
  }
}
