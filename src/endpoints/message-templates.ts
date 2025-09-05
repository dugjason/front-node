import {
  buildPageFromListResponse,
  makePagedResult,
  type PagePair,
} from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  createMessageTemplate,
  deleteMessageTemplate,
  downloadAttachmentForAMessageTemplate,
  getMessageTemplate,
  listMessageTemplates,
  updateMessageTemplate,
} from "../generated/sdk.gen"
import type {
  Attachment,
  CreateMessageTemplateData,
  GetMessageTemplateResponse,
  ListMessageTemplatesData,
  ListMessageTemplatesResponse,
  MessageTemplateResponse,
  UpdateMessageTemplate,
} from "../generated/types.gen"
import { FrontMessageTemplate } from "../resources/message-templates"

export class MessageTemplates extends APIResource<
  FrontMessageTemplate,
  MessageTemplateResponse
> {
  protected makeItem(raw: MessageTemplateResponse): FrontMessageTemplate {
    return new FrontMessageTemplate(raw)
  }

  /** CREATE **/
  async create(
    body: CreateMessageTemplateData["body"],
  ): Promise<{ messageTemplate: FrontMessageTemplate; response: Response }> {
    const { item, response } = await this.createOne<MessageTemplateResponse>({
      createCall: () => createMessageTemplate({ body }),
    })
    return { messageTemplate: item, response }
  }

  /** READ **/
  async list(
    query?: ListMessageTemplatesData["query"],
  ): Promise<
    PagePair<FrontMessageTemplate> &
      AsyncIterable<PagePair<FrontMessageTemplate>>
  > {
    const { response, data } = await listMessageTemplates({ query })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontMessageTemplate,
      ListMessageTemplatesResponse
    >({
      data,
      mapItems: (d) =>
        (d._results ?? []).map((raw) => new FrontMessageTemplate(raw)),
      fetchNext: async (pageToken) => {
        const next = await listMessageTemplates({
          query: {
            ...(query ?? {}),
            page_token: pageToken,
          } as unknown as ListMessageTemplatesData["query"],
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async get(
    messageTemplateId: string,
  ): Promise<{ messageTemplate: FrontMessageTemplate; response: Response }> {
    const { item, response } = await this.getOne<GetMessageTemplateResponse>({
      getCall: () =>
        getMessageTemplate({
          path: { message_template_id: messageTemplateId },
        }),
    })
    return { messageTemplate: item, response }
  }

  async downloadAttachment(
    messageTemplateId: string,
    attachmentLinkId: string,
  ): Promise<{ response: Response; attachment?: Attachment }> {
    const { response, data } = await downloadAttachmentForAMessageTemplate({
      path: {
        message_template_id: messageTemplateId,
        attachment_link_id: attachmentLinkId,
      },
    })
    return { response, attachment: data }
  }

  /** UPDATE **/
  async update(
    messageTemplateId: string,
    body: UpdateMessageTemplate,
  ): Promise<{ messageTemplate: FrontMessageTemplate; response: Response }> {
    const { response } = await updateMessageTemplate({
      path: { message_template_id: messageTemplateId },
      body,
    })
    const refreshed = await this.get(messageTemplateId)
    return { messageTemplate: refreshed.messageTemplate, response }
  }

  /** DELETE **/
  async delete(messageTemplateId: string): Promise<void> {
    deleteMessageTemplate({
      path: { message_template_id: messageTemplateId },
    })
  }
}
