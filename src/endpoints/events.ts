import type { PagePair } from "../core/paginator"
import { APIResource } from "../core/resource"
import { getEvent, listEvents } from "../generated/sdk.gen"
import type {
  EventResponse,
  GetEventResponse,
  ListEventsData,
  ListEventsResponse,
} from "../generated/types.gen"
import { FrontEvent } from "../resources/events"

export class Events extends APIResource<FrontEvent, EventResponse> {
  protected makeItem(raw: EventResponse): FrontEvent {
    return new FrontEvent(raw)
  }

  async list(
    query?: ListEventsData["query"],
  ): Promise<PagePair<FrontEvent> & AsyncIterable<PagePair<FrontEvent>>> {
    return this.listPaginated<
      ListEventsResponse,
      {
        query?: ListEventsData["query"]
      }
    >({
      initialOptions: { query },
      listCall: (options) => listEvents({ ...options }),
    })
  }

  async get(
    eventId: string,
  ): Promise<{ event: FrontEvent; response: Response }> {
    const { item, response } = await this.getOne<GetEventResponse>({
      getCall: () => getEvent({ path: { event_id: eventId } }),
    })
    return { event: item, response }
  }
}
