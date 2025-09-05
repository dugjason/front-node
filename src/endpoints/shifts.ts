import { APIResource } from "../core/resource"
import {
  addTeammatesToShift,
  createShift,
  createTeamShift,
  getShift,
  listShifts,
  listShiftsTeammates,
  listTeammateShifts,
  listTeamShifts,
  removeTeammatesFromShift,
  updateShift,
} from "../generated/sdk.gen"
import type {
  AddTeammatesToShiftData,
  CreateShift,
  CreateTeamShiftData,
  GetShiftResponse,
  ListShiftsResponse,
  ListTeammateShiftsResponse,
  ListTeamShiftsResponse,
  ShiftResponse,
  TeammateResponse,
  UpdateShift,
} from "../generated/types.gen"
import { FrontShift } from "../resources/shifts"
import { FrontTeammate } from "../resources/teammates"

export class Shifts extends APIResource<FrontShift, ShiftResponse> {
  protected makeItem(raw: ShiftResponse): FrontShift {
    return new FrontShift(raw)
  }

  /** CREATE **/
  async create(
    body: CreateShift,
  ): Promise<{ shift: FrontShift; response: Response }> {
    const { item, response } = await this.createOne<ShiftResponse>({
      createCall: () => createShift({ body }),
    })
    return { shift: item, response }
  }

  async createForTeam(
    teamId: string,
    body: CreateTeamShiftData["body"],
  ): Promise<{ shift: FrontShift; response: Response }> {
    const { item, response } = await this.createOne<ShiftResponse>({
      createCall: () => createTeamShift({ path: { team_id: teamId }, body }),
    })
    return { shift: item, response }
  }

  /** READ **/
  async list(): Promise<{ response: Response; data: FrontShift[] }> {
    return this.listWithoutPagination<ListShiftsResponse>({
      listCall: () => listShifts(),
    })
  }

  async get(
    shiftId: string,
  ): Promise<{ shift: FrontShift; response: Response }> {
    const { item, response } = await this.getOne<GetShiftResponse>({
      getCall: () => getShift({ path: { shift_id: shiftId } }),
    })
    return { shift: item, response }
  }

  async listTeammates(
    shiftId: string,
  ): Promise<{ response: Response; data: FrontTeammate[] }> {
    const { response, data } = await listShiftsTeammates({
      path: { shift_id: shiftId },
    })
    return {
      response,
      data: (data?._results ?? []).map(
        (t: TeammateResponse) => new FrontTeammate(t),
      ),
    }
  }

  async listForTeammate(
    teammateId: string,
  ): Promise<{ response: Response; data: FrontShift[] }> {
    return this.listWithoutPagination<ListTeammateShiftsResponse>({
      listCall: () => listTeammateShifts({ path: { teammate_id: teammateId } }),
    })
  }

  async listForTeam(
    teamId: string,
  ): Promise<{ response: Response; data: FrontShift[] }> {
    return this.listWithoutPagination<ListTeamShiftsResponse>({
      listCall: () => listTeamShifts({ path: { team_id: teamId } }),
    })
  }

  /** UPDATE **/
  async update(
    shiftId: string,
    body: UpdateShift,
  ): Promise<{ shift: FrontShift; response: Response }> {
    const { response } = await updateShift({
      path: { shift_id: shiftId },
      body,
    })
    const { shift } = await this.get(shiftId)
    return { shift, response }
  }

  /** MEMBERSHIP **/
  async addTeammates(
    shiftId: string,
    body: AddTeammatesToShiftData["body"],
  ): Promise<void> {
    await addTeammatesToShift({ path: { shift_id: shiftId }, body })
  }

  async removeTeammates(
    shiftId: string,
    body: AddTeammatesToShiftData["body"],
  ): Promise<void> {
    await removeTeammatesFromShift({ path: { shift_id: shiftId }, body })
  }
}
