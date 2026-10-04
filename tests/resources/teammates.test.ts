import { describe, expect, test } from "bun:test";

import { createMockClient, createTestSetup, jsonResponse } from "../helpers/setup";

describe("teammates", () => {
  test("teammates.list sends GET /teammates", async () => {
    const { front, requests } = createTestSetup();
    await front.teammates.list();
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/teammates");
  });

  test("teammates.get returns a teammate response data", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({
        _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
        custom_fields: {},
        email: "a@example.com",
        first_name: "Ali",
        id: "tea_1",
        is_admin: false,
        is_available: true,
        is_blocked: false,
        last_name: "Smith",
        type: "user",
        username: "alice",
      }),
    );
    const tm = await front.teammates.get("tea_1");
    expect(tm.id).toBe("tea_1");
    expect(tm.email).toBe("a@example.com");
    expect(tm.first_name).toBe("Ali");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/teammates/tea_1");
  });

  test("teammates.update returns void for a 204 response", async () => {
    const { front, requests } = createMockClient(() => new Response(null, { status: 204 }));
    expect(await front.teammates.update("tea_1", { first_name: "New" })).toBeUndefined();
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("PATCH");
    expect(await requests[0]?.json()).toEqual({ first_name: "New" });
  });

  test("a teammate lists assigned conversations with a query", async () => {
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (
        req.method === "GET" &&
        url.includes("/teammates/tea_1") &&
        !url.includes("/conversations")
      ) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
          custom_fields: {},
          email: "a@example.com",
          first_name: "A",
          id: "tea_1",
          is_admin: false,
          is_available: true,
          is_blocked: false,
          last_name: "B",
          type: "user",
          username: "alice",
        });
      }
      if (req.method === "GET" && url.includes("/teammates/tea_1/conversations")) {
        return jsonResponse({ _results: [] });
      }
      return jsonResponse({});
    });
    await front.teammates.listAssignedConversations("tea_1", { limit: 5 });
    const convReq = requests.find((r) => r.url.includes("/conversations"));
    expect(convReq?.method).toBe("GET");
    expect(convReq?.url).toBe("https://api2.frontapp.com/teammates/tea_1/conversations?limit=5");
  });
});
