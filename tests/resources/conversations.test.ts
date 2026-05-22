import { describe, expect, test } from "bun:test";

import { createTestSetup } from "../helpers/setup";

describe("conversations", () => {
  test("conversations.search encodes the query path segment", async () => {
    const { front, requests } = createTestSetup();
    await front.conversations.search("open priority");
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/conversations/search/open%20priority");
  });

  test("conversations.listMessages sends GET /conversations/{id}/messages", async () => {
    const { front, requests } = createTestSetup();
    await front.conversations.listMessages("cnv_abc", {
      limit: 25,
      sort_by: "created_at",
      sort_order: "desc",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    const url = new URL(requests[0]?.url ?? "");
    expect(url.pathname).toBe("/conversations/cnv_abc/messages");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      limit: "25",
      sort_by: "created_at",
      sort_order: "desc",
    });
  });
});
