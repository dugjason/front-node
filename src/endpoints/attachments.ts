import { downloadAttachment } from "../generated/sdk.gen"
import type { Attachment } from "../generated/types.gen"

export class Attachments {
  async download(
    attachmentLinkId: string,
  ): Promise<{ response: Response; attachment?: Attachment }> {
    const { response, data } = await downloadAttachment({
      path: { attachment_link_id: attachmentLinkId },
    })
    return { response, attachment: data }
  }
}
