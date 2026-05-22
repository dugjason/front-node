import { describe, expect, test } from "bun:test";

import { createMockClient, jsonResponse } from "../helpers/setup";

describe("me", () => {
  test("me.details sends GET /me", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({
        _links: { self: "https://api2.frontapp.com/me" },
        id: "cmp_1",
        name: "Acme",
      }),
    );
    const me = await front.me.details();
    expect(me.id).toBe("cmp_1");
    expect(me.name).toBe("Acme");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/me");
  });
});
