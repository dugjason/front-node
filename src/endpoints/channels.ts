import { APIResource } from "../core/resource"
import {
  createDraft,
  createMessage,
  getChannel,
  listChannels,
  receiveCustomMessages,
  updateChannel,
  validateChannel,
} from "../generated/sdk.gen"
import type {
  ChannelResponse,
  CreateDraftData,
  CreateMessageData,
  GetChannelResponse,
  ListChannelsResponse,
  ReceiveCustomMessagesData,
  UpdateChannel,
} from "../generated/types.gen"
import { FrontChannel } from "../resources/channels"
import { FrontDraft } from "../resources/drafts"

export class Channels extends APIResource<FrontChannel, ChannelResponse> {
  protected makeItem(raw: ChannelResponse): FrontChannel {
    return new FrontChannel(raw)
  }

  /** READ **/
  async list(): Promise<{ response: Response; data: FrontChannel[] }> {
    return this.listWithoutPagination<ListChannelsResponse>({
      listCall: () => listChannels(),
    })
  }

  async get(
    channelId: string,
  ): Promise<{ channel: FrontChannel; response: Response }> {
    const { item, response } = await this.getOne<GetChannelResponse>({
      getCall: () => getChannel({ path: { channel_id: channelId } }),
    })
    return { channel: item, response }
  }

  /** UPDATE **/
  async update(
    channelId: string,
    body: UpdateChannel,
  ): Promise<{ channel: FrontChannel; response: Response }> {
    const { response } = await updateChannel({
      path: { channel_id: channelId },
      body,
    })
    const refreshed = await this.get(channelId)
    return { channel: refreshed.channel, response }
  }

  /** MESSAGES **/
  async createDraft(
    channelId: string,
    body: CreateDraftData["body"],
  ): Promise<{ draft: FrontDraft; response: Response }> {
    const { response, data } = await createDraft({
      path: { channel_id: channelId },
      body,
    })
    if (!data) throw new Error("Missing data")
    return { draft: new FrontDraft(data), response }
  }

  async createMessage(
    channelId: string,
    body: CreateMessageData["body"],
  ): Promise<{ response: Response; status?: string; messageUid?: string }> {
    const { response, data } = await createMessage({
      path: { channel_id: channelId },
      body,
    })
    return { response, status: data?.status, messageUid: data?.message_uid }
  }

  async receiveCustomMessage(
    channelId: string,
    body: ReceiveCustomMessagesData["body"],
  ): Promise<{ response: Response; status?: string; messageUid?: string }> {
    const { response, data } = await receiveCustomMessages({
      path: { channel_id: channelId },
      body,
    })
    return { response, status: data?.status, messageUid: data?.message_uid }
  }

  async validate(
    channelId: string,
  ): Promise<{ response: Response; status?: string }> {
    const { response, data } = await validateChannel({
      path: { channel_id: channelId },
    })
    return {
      response,
      status: data?.status,
    }
  }
}
