import type { PagePair } from "../core/paginator"
import { buildPageFromListResponse, makePagedResult } from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  getTeammate,
  listTeammateContacts,
  listTeammateCustomFields,
  listTeammates,
  updateTeammate,
} from "../generated/sdk.gen"
import type {
  CustomFieldResponse,
  GetTeammateResponse,
  ListTeammateContactsData,
  ListTeammateContactsResponse,
  ListTeammatesResponse,
  TeammateResponse,
  UpdateTeammate,
} from "../generated/types.gen"
import { FrontContact } from "../resources/contacts"
import { FrontTeammate } from "../resources/teammates"

export class Teammates extends APIResource<FrontTeammate, TeammateResponse> {
  protected makeItem(raw: TeammateResponse): FrontTeammate {
    return new FrontTeammate(raw)
  }

  /** READ **/
  async list(): Promise<{ response: Response; data: FrontTeammate[] }> {
    return this.listWithoutPagination<ListTeammatesResponse>({
      listCall: () => listTeammates(),
    })
  }

  async get(
    teammateId: string,
  ): Promise<{ teammate: FrontTeammate; response: Response }> {
    const { item, response } = await this.getOne<GetTeammateResponse>({
      getCall: () => getTeammate({ path: { teammate_id: teammateId } }),
    })
    return { teammate: item, response }
  }

  async listCustomFields(): Promise<{
    response: Response
    data: CustomFieldResponse[]
  }> {
    const result = await listTeammateCustomFields()
    return { response: result.response, data: result.data?._results ?? [] }
  }

  async listContacts(
    teammateId: string,
    query?: ListTeammateContactsData["query"],
  ): Promise<PagePair<FrontContact> & AsyncIterable<PagePair<FrontContact>>> {
    const { data, response } = await listTeammateContacts({
      path: { teammate_id: teammateId },
      query,
    })

    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontContact,
      ListTeammateContactsResponse
    >({
      data,
      mapItems: (d) => (d._results ?? []).map((raw) => new FrontContact(raw)),
      fetchNext: async (pageToken) => {
        const next = await listTeammateContacts({
          path: { teammate_id: teammateId },
          query: { ...(query ?? {}), page_token: pageToken },
        })
        return {
          response: next.response,
          data: next.data,
        }
      },
    })

    return makePagedResult({ response, page })
  }

  /** UPDATE **/
  async update(
    teammateId: string,
    body: UpdateTeammate,
  ): Promise<{ teammate: FrontTeammate; response: Response }> {
    const { response } = await updateTeammate({
      path: { teammate_id: teammateId },
      body,
    })
    const { teammate } = await this.get(teammateId)
    return { teammate, response }
  }
}
