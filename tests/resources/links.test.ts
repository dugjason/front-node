import { describe, expect, test } from "bun:test";

import { createMockClient, jsonResponse } from "../helpers/setup";

describe("links", () => {
  test("links.listConversations targets a link without fetching", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({ _pagination: {}, _results: [] }),
    );
    await front.links.listConversations("lnk_1", { limit: 10 });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/links/lnk_1/conversations?limit=10");
  });
});
