import { describe, expect, test } from "bun:test";

import { FrontComment } from "../../src/index";
import { createMockClient, jsonResponse, NOT_SUPPORTED } from "../helpers/setup";

const commentAuthor = {
  _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
  custom_fields: {},
  email: "a@b.com",
  first_name: "A",
  id: "tea_1",
  is_admin: false,
  is_available: true,
  is_blocked: false,
  last_name: "B",
  type: "user" as const,
  username: "ab",
};

describe("comments", () => {
  test("comments.get returns FrontComment", async () => {
    const { front, requests } = createMockClient((req) => {
      if (req.method === "GET" && req.url.endsWith("/comments/com_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/comments/com_1" },
          attachments: [],
          author: commentAuthor,
          body: "Hello",
          id: "com_1",
          is_pinned: false,
        });
      }
      return jsonResponse({});
    });
    const c = await front.comments.get("com_1");
    expect(c).toBeInstanceOf(FrontComment);
    expect(c.id).toBe("com_1");
    expect(c.body).toBe("Hello");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/comments/com_1");
  });

  test("FrontComment.update PATCHes slash-terminated path", async () => {
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/comments/com_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/comments/com_1" },
          attachments: [],
          author: commentAuthor,
          body: "Old",
          id: "com_1",
          is_pinned: false,
        });
      }
      if (req.method === "PATCH" && url.endsWith("/comments/com_1/")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/comments/com_1" },
          attachments: [],
          author: commentAuthor,
          body: "New",
          id: "com_1",
          is_pinned: true,
        });
      }
      return jsonResponse({});
    });
    const c = await front.comments.get("com_1");
    await c.update({ body: "New", is_pinned: true });
    expect(c.body).toBe("New");
    expect(c.isPinned).toBe(true);
    const patch = requests.find((r) => r.method === "PATCH");
    expect(patch?.url).toBe("https://api2.frontapp.com/comments/com_1/");
  });

  test("FrontComment.listMentions and addReply hit expected paths", async () => {
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/comments/com_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/comments/com_1" },
          attachments: [],
          author: commentAuthor,
          body: "Root",
          id: "com_1",
          is_pinned: false,
        });
      }
      if (req.method === "GET" && url.includes("/comments/com_1/mentions")) {
        return jsonResponse({ _results: [] });
      }
      if (req.method === "POST" && url.endsWith("/comments/com_1/replies")) {
        return jsonResponse(
          {
            _links: { self: "https://api2.frontapp.com/comments/com_2" },
            attachments: [],
            author: commentAuthor,
            body: "Reply",
            id: "com_2",
            is_pinned: false,
          },
          { status: 201 },
        );
      }
      return jsonResponse({});
    });
    const c = await front.comments.get("com_1");
    await c.listMentions();
    const reply = await c.addReply({ body: "Reply" });
    expect(reply.id).toBe("com_2");
    expect(
      requests.some(
        (r) => r.method === "GET" && r.url === "https://api2.frontapp.com/comments/com_1/mentions",
      ),
    ).toBe(true);
    expect(
      requests.some(
        (r) => r.method === "POST" && r.url === "https://api2.frontapp.com/comments/com_1/replies",
      ),
    ).toBe(true);
  });

  test("FrontComment.downloadAttachment returns Response body", async () => {
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/comments/com_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/comments/com_1" },
          attachments: [],
          author: commentAuthor,
          body: "Hi",
          id: "com_1",
          is_pinned: false,
        });
      }
      if (req.method === "GET" && url.includes("/comments/com_1/download/att_1")) {
        return new Response(new Uint8Array([1, 2, 3]), {
          headers: { "Content-Type": "application/octet-stream" },
          status: 200,
        });
      }
      return jsonResponse({});
    });
    const c = await front.comments.get("com_1");
    const res = await c.downloadAttachment("att_1");
    expect(res.ok).toBe(true);
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(
      requests.some((r) =>
        r.url.startsWith("https://api2.frontapp.com/comments/com_1/download/att_1"),
      ),
    ).toBe(true);
  });

  test("FrontComment.delete throws", async () => {
    const { front } = createMockClient(() =>
      jsonResponse({
        _links: { self: "https://api2.frontapp.com/comments/com_1" },
        attachments: [],
        author: commentAuthor,
        body: "Hi",
        id: "com_1",
        is_pinned: false,
      }),
    );
    const c = await front.comments.get("com_1");
    await expect(c.delete()).rejects.toThrow(NOT_SUPPORTED);
  });
});
