import {
  buildPageFromListResponse,
  makePagedResult,
  type PagePair,
} from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  createTeamContact,
  createTeamContactList,
  createTeamInbox,
  getTeam,
  listTeamChannels,
  listTeamContactLists,
  listTeamContacts,
  listTeamInboxes,
  listTeams,
} from "../generated/sdk.gen"
import type {
  ChannelResponse,
  ContactListResponses,
  CreateTeamContactData,
  CreateTeamContactListData,
  CreateTeamInboxData,
  GetTeamResponse,
  InboxResponse,
  ListTeamContactsData,
  ListTeamContactsResponse,
  ListTeamsResponse,
  TeamPreviewResponse,
  TeamResponse,
} from "../generated/types.gen"
import { FrontContact } from "../resources/contacts"
import { FrontTeam } from "../resources/teams"

export class Teams extends APIResource<
  FrontTeam,
  TeamResponse | TeamPreviewResponse
> {
  protected makeItem(raw: TeamResponse | TeamPreviewResponse): FrontTeam {
    return new FrontTeam(raw)
  }

  /** READ **/
  async list(): Promise<{ response: Response; data: FrontTeam[] }> {
    return this.listWithoutPagination<ListTeamsResponse>({
      listCall: () => listTeams(),
    })
  }

  async get(teamId: string): Promise<{ team: FrontTeam; response: Response }> {
    const { item, response } = await this.getOne<GetTeamResponse>({
      getCall: () => getTeam({ path: { team_id: teamId } }),
    })
    return { team: item, response }
  }

  async listChannels(teamId: string): Promise<{
    response: Response
    data: ChannelResponse[]
  }> {
    const { response, data } = await listTeamChannels({
      path: { team_id: teamId },
    })
    return { response, data: data?._results ?? [] }
  }

  async listContactLists(teamId: string): Promise<{
    response: Response
    data: ContactListResponses[]
  }> {
    const { response, data } = await listTeamContactLists({
      path: { team_id: teamId },
    })
    return { response, data: data?._results ?? [] }
  }

  async createContactList(
    teamId: string,
    body: CreateTeamContactListData["body"],
  ): Promise<void> {
    await createTeamContactList({ path: { team_id: teamId }, body })
  }

  async listContacts(
    teamId: string,
    query?: ListTeamContactsData["query"],
  ): Promise<PagePair<FrontContact> & AsyncIterable<PagePair<FrontContact>>> {
    const { response, data } = await listTeamContacts({
      path: { team_id: teamId },
      query,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontContact,
      ListTeamContactsResponse
    >({
      data,
      mapItems: (d) => (d._results ?? []).map((raw) => new FrontContact(raw)),
      fetchNext: async (pageToken) => {
        const next = await listTeamContacts({
          path: { team_id: teamId },
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

  async createContact(
    teamId: string,
    body: CreateTeamContactData["body"],
  ): Promise<{ contact: FrontContact; response: Response }> {
    const { response, data } = await createTeamContact({
      path: { team_id: teamId },
      body,
    })
    if (!data) throw new Error("No results")
    return { contact: new FrontContact(data), response }
  }

  async listInboxes(teamId: string): Promise<{
    response: Response
    data: InboxResponse[]
  }> {
    const { response, data } = await listTeamInboxes({
      path: { team_id: teamId },
    })
    return { response, data: data?._results ?? [] }
  }

  async createInbox(
    teamId: string,
    body: CreateTeamInboxData["body"],
  ): Promise<void> {
    await createTeamInbox({ path: { team_id: teamId }, body })
  }
}
