import type { FrontBase } from "../base";
import type { OperationListParams, OperationResponse } from "../operation";

export type ListEventsParams = OperationListParams<"list-events">;

/** Collection operations returning Front response data. */
export class FrontEvents {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /events
   * Required scope: `events:*:read`
   * @see https://dev.frontapp.com/reference/list-events
   */
  async list(params?: ListEventsParams): Promise<OperationResponse<"list-events">> {
    return await this.base.requestOperation("list-events", {
      nextPageUrl: params?.nextPageUrl,
      query: params,
    });
  }

  /** GET /events/{event_id}
   * Required scope: `events:*:read`
   * @see https://dev.frontapp.com/reference/get-event
   */
  async get(eventId: string): Promise<OperationResponse<"get-event">> {
    return await this.base.requestOperation("get-event", { path: { event_id: eventId } });
  }
}
