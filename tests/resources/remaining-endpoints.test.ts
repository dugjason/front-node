import { expect, test } from "bun:test";
import type { Front, InboxResponse, PaginationInfo, TimeOffResponse } from "../../src/index";
import { FrontApiError } from "../../src/errors";
import { PAGE_TOKEN } from "../helpers/pagination";
import { createMockClient, jsonResponse } from "../helpers/setup";

const timeOff: TimeOffResponse = {
  _links: { self: "https://api2.frontapp.com/time_offs/vcr_123" },
  auto_responder: { is_enabled: false },
  end_at: null,
  id: "vcr_123",
  name: "Vacation",
  start_at: 1_700_000_000,
};
const inbox: InboxResponse = { id: "inb_123", is_private: true, name: "Private inbox" };

interface EndpointCase {
  name: string;
  call: (
    front: Front,
  ) => Promise<ReturnType<() => void> | TimeOffResponse | InboxResponse | { _results?: object[] }>;
  method: string;
  path: string;
  body?: object;
  response?: unknown;
  status: number;
}

const cases: EndpointCase[] = [
  {
    call: (front) =>
      front.conversations.listLinkedConversations("cnv_123", { limit: 20, page_token: PAGE_TOKEN }),
    method: "GET",
    name: "conversations.listLinkedConversations",
    path: `/conversations/cnv_123/linked_conversations?limit=20&page_token=${PAGE_TOKEN}`,
    response: { _results: [] },
    status: 200,
  },
  {
    body: { conversation_ids: ["cnv_456"] },
    call: (front) =>
      front.conversations.createLinkedConversations("cnv_123", { conversation_ids: ["cnv_456"] }),
    method: "POST",
    name: "conversations.createLinkedConversations",
    path: "/conversations/cnv_123/linked_conversations",
    status: 204,
  },
  {
    call: (front) =>
      front.teams.listTimeOffs("tim_123", { limit: 20, q: '{"active_from":1700000000}' }),
    method: "GET",
    name: "teams.listTimeOffs",
    path: "/teams/tim_123/time_offs?limit=20&q=%7B%22active_from%22%3A1700000000%7D",
    response: { _results: [timeOff] },
    status: 200,
  },
  {
    call: (front) => front.teammates.listTimeOffs("tea_123", { page_token: PAGE_TOKEN }),
    method: "GET",
    name: "teammates.listTimeOffs",
    path: `/teammates/tea_123/time_offs?page_token=${PAGE_TOKEN}`,
    response: { _results: [timeOff] },
    status: 200,
  },
  {
    body: { end_at: null, name: "Vacation", start_at: 1_700_000_000 },
    call: (front) =>
      front.teammates.createTimeOff("tea_123", {
        end_at: null,
        name: "Vacation",
        start_at: 1_700_000_000,
      }),
    method: "POST",
    name: "teammates.createTimeOff",
    path: "/teammates/tea_123/time_offs",
    response: timeOff,
    status: 201,
  },
  {
    call: (front) => front.timeOffs.get("vcr_123"),
    method: "GET",
    name: "timeOffs.get",
    path: "/time_offs/vcr_123",
    response: timeOff,
    status: 200,
  },
  {
    body: { end_at: null },
    call: (front) => front.timeOffs.update("vcr_123", { end_at: null }),
    method: "PATCH",
    name: "timeOffs.update",
    path: "/time_offs/vcr_123",
    status: 204,
  },
  {
    call: (front) => front.timeOffs.delete("vcr_123"),
    method: "DELETE",
    name: "timeOffs.delete",
    path: "/time_offs/vcr_123",
    status: 204,
  },
  {
    call: (front) => front.teammates.listPrivateInboxes("tea_123"),
    method: "GET",
    name: "teammates.listPrivateInboxes",
    path: "/teammates/tea_123/private_inboxes",
    response: { _results: [inbox] },
    status: 200,
  },
  {
    body: { name: "Private inbox" },
    call: (front) => front.teammates.createPrivateInbox("tea_123", { name: "Private inbox" }),
    method: "POST",
    name: "teammates.createPrivateInbox",
    path: "/teammates/tea_123/private_inboxes",
    response: inbox,
    status: 201,
  },
];

test.each(cases)("$name sends one request and returns the endpoint response", async (endpoint) => {
  const { front, requests } = createMockClient(() =>
    endpoint.status === 204
      ? new Response(null, { status: 204 })
      : jsonResponse(endpoint.response, { status: endpoint.status }),
  );
  const result = await endpoint.call(front);
  expect(requests).toHaveLength(1);
  expect(requests[0]?.method).toBe(endpoint.method);
  expect(requests[0]?.url).toBe(`https://api2.frontapp.com${endpoint.path}`);
  if (endpoint.body === undefined) {
    expect(await requests[0]?.text()).toBe("");
  } else {
    expect(await requests[0]?.json()).toEqual(endpoint.body);
  }
  expect(endpoint.response).toEqual(result);
});

interface PageCase {
  name: string;
  path: string;
  call: (
    front: Front,
    nextPageUrl: string,
  ) => Promise<{ _results?: object[]; pagination?: PaginationInfo }>;
}
const pageCases: PageCase[] = [
  {
    call: (front, nextPageUrl) =>
      front.conversations.listLinkedConversations("cnv_123", { limit: 50, nextPageUrl }),
    name: "linked conversations",
    path: "/conversations/cnv_123/linked_conversations",
  },
  {
    call: (front, nextPageUrl) =>
      front.teams.listTimeOffs("tim_123", {
        limit: 50,
        nextPageUrl,
        q: '{"active_until":1700000000}',
      }),
    name: "team time off",
    path: "/teams/tim_123/time_offs",
  },
  {
    call: (front, nextPageUrl) =>
      front.teammates.listTimeOffs("tea_123", {
        limit: 50,
        nextPageUrl,
        q: '{"active_until":1700000000}',
      }),
    name: "teammate time off",
    path: "/teammates/tea_123/time_offs",
  },
];

test.each(pageCases)(
  "$name uses next-page URL parameters and returns pagination metadata",
  async (endpoint) => {
    const nextPageUrl = `https://front.api.frontapp.com${endpoint.path}?limit=2&page_token=${PAGE_TOKEN}`;
    const { front, requests } = createMockClient(() =>
      jsonResponse({ _pagination: { next: nextPageUrl }, _results: [] }),
    );
    expect(await endpoint.call(front, nextPageUrl)).toEqual({
      _results: [],
      pagination: { next: nextPageUrl },
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe(
      `https://api2.frontapp.com${endpoint.path}?limit=2&page_token=${PAGE_TOKEN}`,
    );
  },
);

test.each(pageCases)("$name rejects a next-page URL for another endpoint", async (endpoint) => {
  const { front, requests } = createMockClient();
  await expect(
    endpoint.call(front, `https://api2.frontapp.com/tags?page_token=${PAGE_TOKEN}`),
  ).rejects.toThrow();
  expect(requests).toHaveLength(0);
});

test.each([400, 403, 404])("linked conversations preserve HTTP %s errors", async (status) => {
  const { front, requests } = createMockClient(() =>
    jsonResponse({ _error: { message: "Linked conversations unavailable" } }, { status }),
  );
  try {
    await front.conversations.listLinkedConversations("cnv_123");
    throw new Error("Expected the request to fail");
  } catch (error) {
    expect(error).toBeInstanceOf(FrontApiError);
    if (error instanceof FrontApiError) {
      expect(error.status).toBe(status);
      expect(error.body).toEqual({ _error: { message: "Linked conversations unavailable" } });
    }
  }
  expect(requests).toHaveLength(1);
});

test("company.listTicketStatuses returns the company status page", async () => {
  const { front, requests } = createMockClient(() => jsonResponse({ _results: [] }));
  expect(await front.company.listTicketStatuses()).toEqual({ _results: [] });
  expect(requests).toHaveLength(1);
  expect(requests[0]?.method).toBe("GET");
  expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/statuses");
});
