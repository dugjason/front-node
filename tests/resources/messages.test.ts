import { describe, expect, test } from "bun:test";

import { createMockClient, jsonResponse } from "../helpers/setup";

describe("messages", () => {
  test("messages API targets nested endpoints without fetching first", async () => {
    const { front, requests } = createMockClient(() => new Response(null, { status: 204 }));

    await front.messages.markSeen("msg_1");

    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/messages/msg_1/seen");
  });

  test("messages.get returns message response data", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({ id: "msg_1", type: "email" }),
    );
    const m = await front.messages.get("msg_1");
    expect(m.id).toBe("msg_1");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/messages/msg_1");
  });
});

test.each([undefined, { Accept: undefined }, { Accept: "message/rfc822" }])(
  "messages.fetchRaw preserves the requested representation",
  async (headers) => {
    const response = new Response("raw message", { headers: { "Content-Type": "message/rfc822" } });
    const { front, requests } = createMockClient(() => response);
    expect(await front.messages.fetchRaw("msg_123", { headers })).toBe(response);
    expect(response.bodyUsed).toBe(false);
    expect(requests[0]?.headers.get("Accept")).toBe(headers?.Accept ?? "application/json");
    expect(requests[0]?.headers.get("Authorization")).toBe("Bearer test-token");
  },
);
