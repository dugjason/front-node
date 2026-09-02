import { describe, expect, test } from "bun:test";

import { createMockClient, createTestSetup } from "../helpers/setup";

describe("conversations", () => {
  test("ID-first conversation API updates nested resources without fetching first", async () => {
    const { front, requests } = createMockClient(() => new Response(null, { status: 204 }));

    await front.conversations.addTag("cnv_1", { tag_ids: ["tag_1"] });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/conversations/cnv_1/tags");
  });

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
