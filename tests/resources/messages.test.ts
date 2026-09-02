import { describe, expect, test } from "bun:test";

import { FrontMessages } from "../../src/index";
import { createMockClient, jsonResponse } from "../helpers/setup";

describe("messages", () => {
  test("messages API targets nested endpoints without fetching first", async () => {
    const { front, requests } = createMockClient(() => new Response(null, { status: 204 }));

    await front.messages.markSeen("msg_1");

    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/messages/msg_1/seen");
  });

  test("messages.get returns a hydrated FrontMessages target and loads JSON", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({ id: "msg_1", type: "email" }),
    );
    const m = await front.messages.get("msg_1");
    expect(m).toBeInstanceOf(FrontMessages);
    expect(m.data?.id).toBe("msg_1");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/messages/msg_1");
  });
});
