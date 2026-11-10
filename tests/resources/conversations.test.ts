import { describe, expect, test } from "bun:test";

import { createMockClient, createTestSetup, jsonResponse } from "../helpers/setup";

describe("conversations", () => {
  test("saving an unassigned conversation omits assignee_id", async () => {
    const { front, requests } = createMockClient((request) =>
      request.method === "GET"
        ? jsonResponse({ assignee: null, custom_fields: {}, id: "cnv_1", tags: [] })
        : new Response(null, { status: 204 }),
    );

    const conversation = await front.conversations.get("cnv_1");
    await conversation.save();

    expect(await requests[1]?.json()).not.toHaveProperty("assignee_id");
  });

  test.each(["update", "updateAssignee"] as const)(
    "%s assigns a teammate without rewriting or resending the fetched assignee",
    async (method) => {
      const previousAssignee = { email: "first@example.com", id: "tea_1" };
      const { front, requests } = createMockClient((request) =>
        request.method === "GET"
          ? jsonResponse({
              assignee: previousAssignee,
              custom_fields: {},
              id: "cnv_1",
              tags: [],
            })
          : new Response(null, { status: 204 }),
      );

      const conversation = await front.conversations.get("cnv_1");
      const body = { assignee_id: "tea_2" };
      await (method === "update" ? conversation.update(body) : conversation.updateAssignee(body));
      await conversation.save();

      expect(await requests[1]?.json()).toEqual(body);
      expect(conversation.assignee).toMatchObject(previousAssignee);
      expect(await requests[2]?.json()).not.toHaveProperty("assignee_id");
    },
  );

  test.each(["update", "updateAssignee"] as const)(
    "%s clears the cached assignee on unassign",
    async (method) => {
      const { front, requests } = createMockClient((request) =>
        request.method === "GET"
          ? jsonResponse({ assignee: { id: "tea_1" }, id: "cnv_1" })
          : new Response(null, { status: 204 }),
      );

      const conversation = await front.conversations.get("cnv_1");
      const body = { assignee_id: null };
      await (method === "update" ? conversation.update(body) : conversation.updateAssignee(body));

      expect(await requests[1]?.json()).toEqual({ assignee_id: null });
      expect(conversation.assignee).toBeNull();
    },
  );

  test("unassigning by ID needs no cached conversation", async () => {
    const { front, requests } = createMockClient(() => new Response(null, { status: 204 }));

    await front.conversations.updateAssignee("cnv_1", { assignee_id: null });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("PUT");
    expect(await requests[0]?.json()).toEqual({ assignee_id: null });
  });

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
    const { front, requests } = createMockClient(() =>
      jsonResponse({ _results: [{ id: "msg_1" }, { author: { id: "tea_1" }, id: "msg_2" }] }),
    );
    const messages = await front.conversations.listMessages("cnv_abc", {
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
    expect(messages._results?.[0]?.author).toBeNull();
    expect(messages._results?.[1]?.author?.id).toBe("tea_1");
  });
});
