import {
  buildPageFromListResponse,
  makePagedResult,
  type PagePair,
} from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  addConversationFollowers,
  addConversationLink,
  addConversationTag,
  createConversation,
  createDraftReply,
  createMessageReply,
  deleteConversationFollowers,
  getConversationById,
  listConversationComments,
  listConversationCustomFields,
  listConversationDrafts,
  listConversationEvents,
  listConversationFollowers,
  listConversationInboxes,
  listConversationMessages,
  listConversations,
  removeConversationLinks,
  removeConversationTag,
  addComment as sdkAddConversationComment,
  searchConversations,
  updateConversation,
  updateConversationAssignee,
  updateConversationReminders,
} from "../generated/sdk.gen"
import type {
  AddCommentData,
  AddConversationFollowersData,
  AddConversationLinkData,
  AddConversationTagData,
  CommentResponse,
  ConversationResponse,
  CreateConversation,
  CreateDraftReplyData,
  CreateMessageReplyData,
  CustomFieldResponse,
  EventResponse,
  GetConversationByIdResponse,
  ListConversationEventsData,
  ListConversationEventsResponse,
  ListConversationMessagesData,
  ListConversationMessagesResponse,
  ListConversationsData,
  ListConversationsResponse,
  MessageResponse,
  RemoveConversationLinksData,
  RemoveConversationTagData,
  SearchConversationsData,
  SearchConversationsResponse,
  UpdateConversation,
  UpdateConversationAssigneeData,
  UpdateConversationRemindersData,
} from "../generated/types.gen"
import { FrontConversation } from "../resources/conversations"
import { FrontInbox } from "../resources/inboxes"
import { FrontMessage } from "../resources/messages"
import { FrontTeammate } from "../resources/teammates"

class ConversationComments {
  async list(
    conversationId: string,
  ): Promise<{ response: Response; data: CommentResponse[] }> {
    const { response, data } = await listConversationComments({
      path: { conversation_id: conversationId },
    })
    return { response, data: data?._results ?? [] }
  }

  async add(
    conversationId: string,
    body: AddCommentData["body"],
  ): Promise<{ response: Response; comment?: CommentResponse }> {
    const { response, data } = await sdkAddConversationComment({
      path: { conversation_id: conversationId },
      body,
    })
    return { response, comment: data }
  }
}

export class Conversations extends APIResource<
  FrontConversation,
  ConversationResponse
> {
  protected makeItem(raw: ConversationResponse): FrontConversation {
    return new FrontConversation(raw)
  }

  /** CREATE **/
  async create(
    body: CreateConversation,
  ): Promise<{ conversation: FrontConversation; response: Response }> {
    const { item, response } = await this.createOne<ConversationResponse>({
      createCall: () => createConversation({ body }),
    })
    return { conversation: item, response }
  }

  /** READ **/
  async get(
    conversationId: string,
  ): Promise<{ conversation: FrontConversation; response: Response }> {
    const { item, response } = await this.getOne<GetConversationByIdResponse>({
      getCall: () =>
        getConversationById({
          path: { conversation_id: conversationId },
        }),
    })
    return { conversation: item, response }
  }

  async list(
    query?: ListConversationsData["query"],
  ): Promise<
    PagePair<FrontConversation> & AsyncIterable<PagePair<FrontConversation>>
  > {
    return this.listPaginated<
      ListConversationsResponse,
      { query?: ListConversationsData["query"] }
    >({
      initialOptions: { query },
      listCall: (options) => listConversations({ ...options }),
    })
  }

  async search(
    query: SearchConversationsData["path"]["query"],
    opts?: SearchConversationsData["query"],
  ): Promise<
    PagePair<FrontConversation> & AsyncIterable<PagePair<FrontConversation>>
  > {
    const { response, data } = await searchConversations({
      path: { query },
      query: opts,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontConversation,
      SearchConversationsResponse
    >({
      data,
      mapItems: (d) => (d._results ?? []).map((r) => new FrontConversation(r)),
      fetchNext: async (pageToken) => {
        const next = await searchConversations({
          path: { query },
          query: { ...(opts ?? {}), page_token: pageToken },
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async listCustomFields(): Promise<{
    response: Response
    data: CustomFieldResponse[]
  }> {
    const { response, data } = await listConversationCustomFields()
    return {
      response,
      data: data?._results ?? [],
    }
  }

  /** UPDATE **/
  async update(
    conversationId: string,
    body: UpdateConversation,
  ): Promise<{ conversation: FrontConversation; response: Response }> {
    const { response } = await updateConversation({
      path: { conversation_id: conversationId },
      body,
    })
    const { conversation } = await this.get(conversationId)
    return { conversation, response }
  }

  async updateAssignee(
    conversationId: string,
    body: UpdateConversationAssigneeData["body"],
  ): Promise<void> {
    await updateConversationAssignee({
      path: { conversation_id: conversationId },
      body,
    })
  }

  async updateReminders(
    conversationId: string,
    body: UpdateConversationRemindersData["body"],
  ): Promise<void> {
    await updateConversationReminders({
      path: { conversation_id: conversationId },
      body,
    })
  }

  /** SUB-COLLECTIONS & ACTIONS **/

  private _comments?: ConversationComments
  get comments(): ConversationComments {
    return (this._comments ??= new ConversationComments())
  }

  async listDrafts(
    conversationId: string,
  ): Promise<{ response: Response; data: FrontMessage[] }> {
    const { response, data } = await listConversationDrafts({
      path: { conversation_id: conversationId },
    })
    return {
      response,
      data: data?._results?.map((m) => new FrontMessage(m)) ?? [],
    }
  }

  async listEvents(
    conversationId: string,
    query?: ListConversationEventsData["query"],
  ): Promise<PagePair<EventResponse> & AsyncIterable<PagePair<EventResponse>>> {
    // Events don't have a domain wrapper yet; return raw EventResponse items
    const { response, data } = await listConversationEvents({
      path: { conversation_id: conversationId },
      query,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      EventResponse,
      ListConversationEventsResponse
    >({
      data,
      mapItems: (d) => d._results ?? [],
      fetchNext: async (pageToken) => {
        const next = await listConversationEvents({
          path: { conversation_id: conversationId },
          query: { ...(query ?? {}), page_token: pageToken },
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async listFollowers(
    conversationId: string,
  ): Promise<{ response: Response; data: FrontTeammate[] }> {
    const { response, data } = await listConversationFollowers({
      path: { conversation_id: conversationId },
    })
    return {
      response,
      data: (data?._results ?? []).map((t) => new FrontTeammate(t)),
    }
  }

  async addFollowers(
    conversationId: string,
    body: AddConversationFollowersData["body"],
  ): Promise<void> {
    await addConversationFollowers({
      path: { conversation_id: conversationId },
      body,
    })
  }

  async removeFollowers(
    conversationId: string,
    teammateIds: string[],
  ): Promise<void> {
    await deleteConversationFollowers({
      path: { conversation_id: conversationId },
      body: { teammate_ids: teammateIds },
    })
  }

  async listInboxes(
    conversationId: string,
  ): Promise<{ response: Response; data: FrontInbox[] }> {
    const { response, data } = await listConversationInboxes({
      path: { conversation_id: conversationId },
    })
    return {
      response,
      data: (data?._results ?? []).map((i) => new FrontInbox(i)),
    }
  }

  async addLinks(
    conversationId: string,
    body: AddConversationLinkData["body"],
  ): Promise<void> {
    await addConversationLink({
      path: { conversation_id: conversationId },
      body,
    })
  }

  async removeLinks(
    conversationId: string,
    body: RemoveConversationLinksData["body"],
  ): Promise<void> {
    await removeConversationLinks({
      path: { conversation_id: conversationId },
      body,
    })
  }

  async listMessages(
    conversationId: string,
    query?: ListConversationMessagesData["query"],
  ): Promise<PagePair<FrontMessage> & AsyncIterable<PagePair<FrontMessage>>> {
    const { response, data } = await listConversationMessages({
      path: { conversation_id: conversationId },
      query,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontMessage,
      ListConversationMessagesResponse
    >({
      data,
      mapItems: (d) => (d._results ?? []).map((m) => new FrontMessage(m)),
      fetchNext: async (pageToken) => {
        const next = await listConversationMessages({
          path: { conversation_id: conversationId },
          query: { ...(query ?? {}), page_token: pageToken },
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async reply(
    conversationId: string,
    body: CreateMessageReplyData["body"],
  ): Promise<{ response: Response; status?: string; messageUid?: string }> {
    const { response, data } = await createMessageReply({
      path: { conversation_id: conversationId },
      body,
    })
    return { response, status: data?.status, messageUid: data?.message_uid }
  }

  async addDraft(
    conversationId: string,
    body: CreateDraftReplyData["body"],
  ): Promise<{ response: Response; message?: MessageResponse }> {
    const { response, data } = await createDraftReply({
      path: { conversation_id: conversationId },
      body,
    })
    return { response, message: data }
  }

  async addTags(
    conversationId: string,
    body: AddConversationTagData["body"],
  ): Promise<void> {
    await addConversationTag({
      path: { conversation_id: conversationId },
      body,
    })
  }

  async removeTags(
    conversationId: string,
    body: RemoveConversationTagData["body"],
  ): Promise<void> {
    await removeConversationTag({
      path: { conversation_id: conversationId },
      body,
    })
  }
}
