import { describe, expect, test } from "bun:test";

import { FrontTeammate } from "../../src/index";
import { createMockClient, createTestSetup, jsonResponse } from "../helpers/setup";

describe("teammates", () => {
  test("teammates.list sends GET /teammates", async () => {
    const { front, requests } = createTestSetup();
    await front.teammates.list();
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/teammates");
  });

  test("teammates.get returns FrontTeammate", async () => {
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
    expect(tm).toBeInstanceOf(FrontTeammate);
    expect(tm.id).toBe("tea_1");
    expect(tm.email).toBe("a@example.com");
    expect(tm.firstName).toBe("Ali");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/teammates/tea_1");
  });

  test("FrontTeammate.update merges on 204 response", async () => {
    const { front } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/teammates/tea_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
          custom_fields: {},
          email: "a@example.com",
          first_name: "Old",
          id: "tea_1",
          is_admin: false,
          is_available: true,
          is_blocked: false,
          last_name: "Smith",
          type: "user",
          username: "alice",
        });
      }
      if (req.method === "PATCH" && url.endsWith("/teammates/tea_1")) {
        return new Response(null, { status: 204 });
      }
      return jsonResponse({});
    });
    const tm = await front.teammates.get("tea_1");
    await tm.update({ first_name: "New" });
    expect(tm.firstName).toBe("New");
    expect(tm.email).toBe("a@example.com");
  });

  test("FrontTeammate.listAssignedConversations sends GET with query", async () => {
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
    const tm = await front.teammates.get("tea_1");
    await tm.listAssignedConversations({ limit: 5 });
    const convReq = requests.find((r) => r.url.includes("/conversations"));
    expect(convReq?.method).toBe("GET");
    expect(convReq?.url).toBe("https://api2.frontapp.com/teammates/tea_1/conversations?limit=5");
  });
});
