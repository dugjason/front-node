import { APIResource } from "../core/resource"
import {
  downloadAttachmentForAMessage,
  getMessage,
  getMessageSeenStatus,
  markMessageSeen,
} from "../generated/sdk.gen"
import type {
  Attachment,
  GetMessageResponse,
  MessageResponse,
  SeenReceiptResponse,
} from "../generated/types.gen"
import { FrontMessage } from "../resources/messages"

export class Messages extends APIResource<FrontMessage, MessageResponse> {
  protected makeItem(raw: MessageResponse): FrontMessage {
    return new FrontMessage(raw)
  }

  /** READ */
  async get(
    messageId: string,
  ): Promise<{ message: FrontMessage; response: Response }> {
    const { item, response } = await this.getOne<GetMessageResponse>({
      getCall: () => getMessage({ path: { message_id: messageId } }),
    })
    return { message: item, response }
  }

  async downloadAttachment(
    messageId: string,
    attachmentLinkId: string,
  ): Promise<{ response: Response; attachment?: Attachment }> {
    const { response, data } = await downloadAttachmentForAMessage({
      path: { message_id: messageId, attachment_link_id: attachmentLinkId },
    })
    return { response, attachment: data }
  }

  async getSeenStatus(
    messageId: string,
  ): Promise<{ response: Response; data: SeenReceiptResponse[] }> {
    const { response, data } = await getMessageSeenStatus({
      path: { message_id: messageId },
    })

    return { response, data: data?._results ?? [] }
  }

  async markSeen(messageId: string): Promise<void> {
    await markMessageSeen({ path: { message_id: messageId }, body: {} })
  }
}
