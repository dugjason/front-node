import {
  buildPageFromListResponse,
  makePagedResult,
  type PagePair,
} from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  createLink,
  getLink,
  listLinkConversations,
  listLinkCustomFields,
  listLinks,
  updateALink,
} from "../generated/sdk.gen"
import type {
  CreateLink,
  CustomFieldResponse,
  GetLinkResponse,
  LinkResponse,
  ListLinkConversationsData,
  ListLinkConversationsResponse,
  ListLinksData,
  ListLinksResponse,
  UpdateLink,
} from "../generated/types.gen"
import { FrontConversation } from "../resources/conversations"
import { FrontLink } from "../resources/links"

export class Links extends APIResource<FrontLink, LinkResponse> {
  protected makeItem(raw: LinkResponse): FrontLink {
    return new FrontLink(raw)
  }

  /** CREATE **/
  async create(
    body: CreateLink,
  ): Promise<{ link: FrontLink; response: Response }> {
    const { item, response } = await this.createOne<LinkResponse>({
      createCall: () => createLink({ body }),
    })
    return { link: item, response }
  }

  /** READ **/
  async get(linkId: string): Promise<{ link: FrontLink; response: Response }> {
    const { item, response } = await this.getOne<GetLinkResponse>({
      getCall: () => getLink({ path: { link_id: linkId } }),
    })
    return { link: item, response }
  }

  async list(
    query?: ListLinksData["query"],
  ): Promise<PagePair<FrontLink> & AsyncIterable<PagePair<FrontLink>>> {
    return this.listPaginated<
      ListLinksResponse,
      { query?: ListLinksData["query"] }
    >({
      initialOptions: { query },
      listCall: (options) => listLinks({ ...options }),
    })
  }

  async listCustomFields(): Promise<{
    response: Response
    data: CustomFieldResponse[]
  }> {
    const { response, data } = await listLinkCustomFields()
    return {
      response,
      data: data?._results ?? [],
    }
  }

  async listConversations(
    linkId: string,
    query?: ListLinkConversationsData["query"],
  ): Promise<
    PagePair<FrontConversation> & AsyncIterable<PagePair<FrontConversation>>
  > {
    const { response, data } = await listLinkConversations({
      path: { link_id: linkId },
      query,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontConversation,
      ListLinkConversationsResponse
    >({
      data,
      mapItems: (d) =>
        (d._results ?? []).map((raw) => new FrontConversation(raw)),
      fetchNext: async (pageToken) => {
        const next = await listLinkConversations({
          path: { link_id: linkId },
          query: { ...(query ?? {}), page_token: pageToken },
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  /** UPDATE **/
  async update(
    linkId: string,
    body: UpdateLink,
  ): Promise<{ link: FrontLink; response: Response }> {
    const { response } = await updateALink({
      path: { link_id: linkId },
      body,
    })
    const { link } = await this.get(linkId)
    return { link, response }
  }
}
