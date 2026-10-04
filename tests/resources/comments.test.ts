import { describe, expect, test } from "bun:test";

import { createMockClient, jsonResponse } from "../helpers/setup";

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

const commentSnapshot = (id: string, body: string) => ({
  _links: { self: `https://api2.frontapp.com/comments/${id}` },
  attachments: [],
  author: commentAuthor,
  body,
  id,
  is_pinned: false,
});

describe("comments", () => {
  test("comments.get returns a comment response data", async () => {
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
    expect(c.id).toBe("com_1");
    expect(c.body).toBe("Hello");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/comments/com_1");
  });

  test("comments.addReply targets a comment without fetching", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse(
        {
          _links: { self: "https://api2.frontapp.com/comments/com_2" },
          attachments: [],
          author: commentAuthor,
          body: "Reply",
          id: "com_2",
          is_pinned: false,
        },
        { status: 201 },
      ),
    );
    await front.comments.addReply("com_1", { body: "Reply" });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/comments/com_1/replies");
  });

  test("comments.update PATCHes /comments/{id}", async () => {
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
      if (req.method === "PATCH" && url.endsWith("/comments/com_1")) {
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
    const c = await front.comments.update("com_1", { body: "New", is_pinned: true });
    expect(c.body).toBe("New");
    expect(c.is_pinned).toBe(true);
    const patch = requests.find((r) => r.method === "PATCH");
    expect(patch?.url).toBe("https://api2.frontapp.com/comments/com_1");
  });

  test("comments.listMentions and addReply hit expected paths", async () => {
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
    await front.comments.listMentions("com_1");
    const reply = await front.comments.addReply("com_1", { body: "Reply" });
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

  test("comments.downloadAttachment returns Response body", async () => {
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
    const res = await front.comments.downloadAttachment("com_1", "att_1");
    expect(res.ok).toBe(true);
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(
      requests.some((r) =>
        r.url.startsWith("https://api2.frontapp.com/comments/com_1/download/att_1"),
      ),
    ).toBe(true);
  });

  test("comments.update PATCHes by ID and returns the updated comment", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({ ...commentSnapshot("com_1", "New"), is_pinned: true }),
    );
    const updated = await front.comments.update("com_1", { is_pinned: true });
    expect(updated.is_pinned).toBe(true);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("PATCH");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/comments/com_1");
  });
});
