import { describe, expect, test } from "bun:test";

import { FrontTag } from "../../src/index";
import { createMockClient, jsonResponse } from "../helpers/setup";

describe("tags", () => {
  test("tags.get returns a FrontTag and sends GET /tags/{id}", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({
        _links: { self: "https://api2.frontapp.com/tags/tag_abc123" },
        description: "",
        highlight: "red",
        id: "tag_abc123",
        is_private: false,
        is_visible_in_conversation_lists: true,
        name: "Priority",
      }),
    );

    const tag = await front.tags.get("tag_abc123");

    expect(tag).toBeInstanceOf(FrontTag);
    expect(tag.id).toBe("tag_abc123");
    expect(tag.name).toBe("Priority");
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/tags/tag_abc123");
  });

  test("FrontTag.update sends PATCH with body", async () => {
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/tags/tag_abc123")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/tags/tag_abc123" },
          description: "",
          highlight: "red",
          id: "tag_abc123",
          is_private: false,
          is_visible_in_conversation_lists: true,
          name: "Old",
        });
      }
      if (req.method === "PATCH" && url.endsWith("/tags/tag_abc123")) {
        return new Response(null, { status: 204 });
      }
      return jsonResponse({});
    });

    const tag = await front.tags.get("tag_abc123");
    await tag.update({ name: "renamed" });

    const patch = requests.find((r) => r.method === "PATCH");
    expect(patch?.url).toBe("https://api2.frontapp.com/tags/tag_abc123");
    if (patch === undefined) {
      throw new Error("expected PATCH request");
    }
    expect(await patch.json()).toEqual({ name: "renamed" });
    expect(tag.name).toBe("renamed");
  });

  test("FrontTag.save persists property mutations", async () => {
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/tags/tag_abc123")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/tags/tag_abc123" },
          created_at: 1_700_000_000,
          description: "",
          highlight: "red",
          id: "tag_abc123",
          is_private: false,
          is_visible_in_conversation_lists: true,
          name: "Old",
        });
      }
      if (req.method === "PATCH" && url.endsWith("/tags/tag_abc123")) {
        return new Response(null, { status: 204 });
      }
      return jsonResponse({});
    });

    const tag = await front.tags.get("tag_abc123");
    expect(tag.createdAt).toBe(1_700_000_000);
    tag.name = "New";
    await tag.save();

    const patch = requests.find((r) => r.method === "PATCH");
    expect(patch?.url).toBe("https://api2.frontapp.com/tags/tag_abc123");
    if (patch === undefined) {
      throw new Error("expected PATCH request");
    }
    const body = await patch.json();
    expect(body).toEqual({
      description: "",
      highlight: "red",
      is_visible_in_conversation_lists: true,
      name: "New",
    });
    expect(tag.name).toBe("New");
  });
});
