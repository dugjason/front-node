import { describe, expect, test } from "bun:test";

import { createMockClient } from "../helpers/setup";

describe("applications", () => {
  test("applications.triggerEvent posts to /applications/{uid}/events", async () => {
    const { front, requests } = createMockClient((req) => {
      if (
        req.method === "POST" &&
        req.url === "https://api2.frontapp.com/applications/app_1/events"
      ) {
        return new Response(null, { status: 204 });
      }
      return new Response("{}", {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    });
    await front.applications.triggerEvent("app_1", {
      app_object: { id: "obj_1" },
      event_type: "opened",
    });
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/applications/app_1/events");
  });
});
