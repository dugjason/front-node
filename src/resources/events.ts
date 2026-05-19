import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";

type ListEventsQuery = NonNullable<operations["list-events"]["parameters"]["query"]>;
type ListEventsResponse = components["responses"]["listOfEvents"]["content"]["application/json"];
type GetEventResponse = components["responses"]["event"]["content"]["application/json"];

const queryFromListEvents = (
  q?: ListEventsQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.q !== undefined) {
    out.q = String(q.q);
  }
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  if (q.sort_by !== undefined) {
    out.sort_by = String(q.sort_by);
  }
  if (q.sort_order !== undefined) {
    out.sort_order = String(q.sort_order);
  }
  return out;
};

/**
 * Company-wide activity events (`GET /events`, `GET /events/{event_id}`).
 *
 * @see https://dev.frontapp.com/reference/events
 */
export class FrontEvents {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List events (`GET /events`).
   *
   * **Required scope:** `events:*:read`
   */
  async list(query?: ListEventsQuery): Promise<WithNormalizedPagination<ListEventsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListEventsResponse>>(
      "GET",
      "/events",
      { query: queryFromListEvents(query) },
    );
  }

  /**
   * Fetch one event (`GET /events/{event_id}`).
   *
   * **Required scope:** `events:*:read`
   */
  async get(eventId: string): Promise<GetEventResponse> {
    const path = FrontBase.expandPath("/events/{event_id}", {
      event_id: eventId,
    });
    return await this.base.requestJson<GetEventResponse>("GET", path);
  }
}
