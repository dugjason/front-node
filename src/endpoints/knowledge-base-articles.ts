import { downloadAttachmentFromAnArticle } from "../generated/sdk.gen"
import type { Attachment } from "../generated/types.gen"

export class KnowledgeBaseArticles {
  async downloadAttachment(
    articleId: string,
    attachmentId: string,
  ): Promise<{ response: Response; attachment?: Attachment }> {
    const { response, data } = await downloadAttachmentFromAnArticle({
      path: { article_id: articleId, attachment_id: attachmentId },
    })
    return { response, attachment: data }
  }
}
