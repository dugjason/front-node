import { APIResource } from "../core/resource"
import {
  getTicketStatusById,
  listCompanyTicketStatuses,
} from "../generated/sdk.gen"
import type {
  GetTicketStatusByIdResponse,
  ListCompanyTicketStatusesResponse,
  StatusResponse,
} from "../generated/types.gen"
import { FrontStatus } from "../resources/statuses"

export class Statuses extends APIResource<FrontStatus, StatusResponse> {
  protected makeItem(raw: StatusResponse): FrontStatus {
    return new FrontStatus(raw)
  }

  async list(): Promise<{ response: Response; data: FrontStatus[] }> {
    return this.listWithoutPagination<ListCompanyTicketStatusesResponse>({
      listCall: () => listCompanyTicketStatuses(),
    })
  }

  async get(
    statusId: string,
  ): Promise<{ status: FrontStatus; response: Response }> {
    const { item, response } = await this.getOne<GetTicketStatusByIdResponse>({
      getCall: () =>
        getTicketStatusById({
          path: { status_id: statusId },
        }),
    })
    return { status: item, response }
  }
}
