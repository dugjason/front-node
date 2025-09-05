import {
  buildPageFromListResponse,
  makePagedResult,
  type PagePair,
} from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  addInboxAccess,
  createAChannel,
  createInbox,
  getInbox,
  importInboxMessage,
  listInboxAccess,
  listInboxChannels,
  listInboxConversations,
  listInboxCustomFields,
  listInboxes,
  removesInboxAccess,
} from "../generated/sdk.gen"
import type {
  AddInboxAccessData,
  ChannelResponse,
  ConversationResponse,
  CreateAChannelData,
  CreateInbox,
  CustomFieldResponse,
  GetInboxResponse,
  ImportInboxMessageData,
  InboxResponse,
  ListInboxConversationsData,
  ListInboxConversationsResponse,
  ListInboxesResponse,
  RemovesInboxAccessData,
} from "../generated/types.gen"
import { FrontInbox } from "../resources/inboxes"
import { FrontTeammate } from "../resources/teammates"

export class Inboxes extends APIResource<FrontInbox, InboxResponse> {
  protected makeItem(raw: InboxResponse): FrontInbox {
    return new FrontInbox(raw)
  }

  /** CREATE **/
  async create(body: CreateInbox): Promise<void> {
    await createInbox({ body })
  }

  async createChannel(
    inboxId: string,
    body: CreateAChannelData["body"],
  ): Promise<void> {
    await createAChannel({ path: { inbox_id: inboxId }, body })
  }

  async importMessage(
    inboxId: string,
    body: ImportInboxMessageData["body"],
  ): Promise<{ response: Response; status?: string; messageUid?: string }> {
    const { response, data } = await importInboxMessage({
      path: { inbox_id: inboxId },
      body,
    })
    return { response, status: data?.status, messageUid: data?.message_uid }
  }

  /** READ **/
  async list(): Promise<{ response: Response; data: FrontInbox[] }> {
    return this.listWithoutPagination<ListInboxesResponse>({
      listCall: () => listInboxes(),
    })
  }

  async get(
    inboxId: string,
  ): Promise<{ inbox: FrontInbox; response: Response }> {
    const { item, response } = await this.getOne<GetInboxResponse>({
      getCall: () => getInbox({ path: { inbox_id: inboxId } }),
    })
    return { inbox: item, response }
  }

  async listCustomFields(): Promise<{
    response: Response
    data: CustomFieldResponse[]
  }> {
    const { response, data } = await listInboxCustomFields()
    return { response, data: data?._results ?? [] }
  }

  async listChannels(
    inboxId: string,
  ): Promise<{ response: Response; data: ChannelResponse[] }> {
    const { response, data } = await listInboxChannels({
      path: { inbox_id: inboxId },
    })
    return { response, data: data?._results ?? [] }
  }

  async listConversations(
    inboxId: string,
    query?: ListInboxConversationsData["query"],
  ): Promise<
    PagePair<ConversationResponse> &
      AsyncIterable<PagePair<ConversationResponse>>
  > {
    const { response, data } = await listInboxConversations({
      path: { inbox_id: inboxId },
      query,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      ConversationResponse,
      ListInboxConversationsResponse
    >({
      data,
      mapItems: (d) => d._results ?? [],
      fetchNext: async (pageToken) => {
        const next = await listInboxConversations({
          path: { inbox_id: inboxId },
          query: { ...(query ?? {}), page_token: pageToken },
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async listAccess(
    inboxId: string,
  ): Promise<{ response: Response; data: FrontTeammate[] }> {
    const { response, data } = await listInboxAccess({
      path: { inbox_id: inboxId },
    })
    return {
      response,
      data: (data?._results ?? []).map((t) => new FrontTeammate(t)),
    }
  }

  /** UPDATE **/
  async addAccess(
    inboxId: string,
    body: AddInboxAccessData["body"],
  ): Promise<void> {
    await addInboxAccess({ path: { inbox_id: inboxId }, body })
  }

  async removeAccess(
    inboxId: string,
    body: RemovesInboxAccessData["body"],
  ): Promise<void> {
    await removesInboxAccess({ path: { inbox_id: inboxId }, body })
  }
}
