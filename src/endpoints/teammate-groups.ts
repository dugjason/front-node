import { APIResource } from "../core/resource"
import {
  addCompanyTeammateGroupTeamInboxes,
  addCompanyTeammateGroupTeammates,
  addCompanyTeammateGroupTeams,
  createCompanyTeammateGroup,
  deleteCompanyTeammateGroup,
  getCompanyTeammateGroup,
  listCompanyTeammateGroups,
  listCompanyTeammateGroupTeamInboxes,
  listCompanyTeammateGroupTeammates,
  listCompanyTeammateGroupTeams,
  removeCompanyTeammateGroupTeamInboxes,
  removeCompanyTeammateGroupTeammates,
  removeCompanyTeammateGroupTeams,
  updateACompanyTeammateGroup,
} from "../generated/sdk.gen"
import type {
  AddCompanyTeammateGroupTeamInboxesData,
  AddCompanyTeammateGroupTeammatesData,
  AddCompanyTeammateGroupTeamsData,
  CreateCompanyTeammateGroupData,
  GetCompanyTeammateGroupResponse,
  InboxResponse,
  ListCompanyTeammateGroupsResponse,
  RemoveCompanyTeammateGroupTeamInboxesData,
  RemoveCompanyTeammateGroupTeammatesData,
  RemoveCompanyTeammateGroupTeamsData,
  TeammateGroupResponse,
  TeamPreviewResponse,
  UpdateACompanyTeammateGroupData,
} from "../generated/types.gen"
import { FrontTeammateGroup } from "../resources/teammate-groups"
import { FrontTeammate } from "../resources/teammates"

export class TeammateGroups extends APIResource<
  FrontTeammateGroup,
  TeammateGroupResponse
> {
  protected makeItem(raw: TeammateGroupResponse): FrontTeammateGroup {
    return new FrontTeammateGroup(raw)
  }

  /** CREATE **/
  async create(
    body: CreateCompanyTeammateGroupData["body"],
  ): Promise<{ teammateGroup: FrontTeammateGroup; response: Response }> {
    const { item, response } = await this.createOne<TeammateGroupResponse>({
      createCall: () => createCompanyTeammateGroup({ body }),
    })
    return { teammateGroup: item, response }
  }

  /** READ **/
  async list(): Promise<{ response: Response; data: FrontTeammateGroup[] }> {
    return this.listWithoutPagination<ListCompanyTeammateGroupsResponse>({
      listCall: () => listCompanyTeammateGroups(),
    })
  }

  async get(
    teammateGroupId: string,
  ): Promise<{ teammateGroup: FrontTeammateGroup; response: Response }> {
    const { item, response } =
      await this.getOne<GetCompanyTeammateGroupResponse>({
        getCall: () =>
          getCompanyTeammateGroup({
            path: { teammate_group_id: teammateGroupId },
          }),
      })
    return { teammateGroup: item, response }
  }

  async listInboxes(
    teammateGroupId: string,
  ): Promise<{ response: Response; data: InboxResponse[] }> {
    const { response, data } = await listCompanyTeammateGroupTeamInboxes({
      path: { teammate_group_id: teammateGroupId },
    })
    return { response, data: data?._results ?? [] }
  }

  async addInboxes(
    teammateGroupId: string,
    body: AddCompanyTeammateGroupTeamInboxesData["body"],
  ): Promise<void> {
    addCompanyTeammateGroupTeamInboxes({
      path: { teammate_group_id: teammateGroupId },
      body,
    })
  }

  async removeInboxes(
    teammateGroupId: string,
    body: RemoveCompanyTeammateGroupTeamInboxesData["body"],
  ): Promise<void> {
    removeCompanyTeammateGroupTeamInboxes({
      path: { teammate_group_id: teammateGroupId },
      body,
    })
  }

  async listTeammates(
    teammateGroupId: string,
  ): Promise<{ response: Response; data: FrontTeammate[] }> {
    const { response, data } = await listCompanyTeammateGroupTeammates({
      path: { teammate_group_id: teammateGroupId },
    })
    return {
      response,
      data: (data?._results ?? []).map((t) => new FrontTeammate(t)),
    }
  }

  async addTeammates(
    teammateGroupId: string,
    body: AddCompanyTeammateGroupTeammatesData["body"],
  ): Promise<void> {
    addCompanyTeammateGroupTeammates({
      path: { teammate_group_id: teammateGroupId },
      body,
    })
  }

  async removeTeammates(
    teammateGroupId: string,
    body: RemoveCompanyTeammateGroupTeammatesData["body"],
  ): Promise<void> {
    removeCompanyTeammateGroupTeammates({
      path: { teammate_group_id: teammateGroupId },
      body,
    })
  }

  async listTeams(
    teammateGroupId: string,
  ): Promise<{ response: Response; data: TeamPreviewResponse[] }> {
    const { response, data } = await listCompanyTeammateGroupTeams({
      path: { teammate_group_id: teammateGroupId },
    })
    return { response, data: data?._results ?? [] }
  }

  async addTeams(
    teammateGroupId: string,
    body: AddCompanyTeammateGroupTeamsData["body"],
  ): Promise<void> {
    addCompanyTeammateGroupTeams({
      path: { teammate_group_id: teammateGroupId },
      body,
    })
  }

  async removeTeams(
    teammateGroupId: string,
    body: RemoveCompanyTeammateGroupTeamsData["body"],
  ): Promise<void> {
    removeCompanyTeammateGroupTeams({
      path: { teammate_group_id: teammateGroupId },
      body,
    })
  }

  /** UPDATE **/
  async update(
    teammateGroupId: string,
    body: UpdateACompanyTeammateGroupData["body"],
  ): Promise<{ teammateGroup: FrontTeammateGroup; response: Response }> {
    const { response } = await updateACompanyTeammateGroup({
      path: { teammate_group_id: teammateGroupId },
      body,
    })
    const refreshed = await this.get(teammateGroupId)
    return { teammateGroup: refreshed.teammateGroup, response }
  }

  /** DELETE **/
  async delete(teammateGroupId: string): Promise<void> {
    deleteCompanyTeammateGroup({ path: { teammate_group_id: teammateGroupId } })
  }
}
