import { describe, expect, test } from "bun:test";

import {
  Front,
  FrontAccount,
  FrontAnalyticsExport,
  FrontAnalyticsReport,
  FrontApiError,
  FrontChannel,
  FrontComment,
  FrontMessage,
  FrontSignature,
  FrontTag,
  FrontTeammate,
} from "../src/index";
import type { EditDraft } from "../src/resources/drafts";

/** Shared expectation for unsupported {@link FrontResource.delete} overrides. */
const NOT_SUPPORTED = /not supported/u;

const createTestSetup = () => {
  const requests: Request[] = [];
  const mockFetch = new Proxy(fetch, {
    apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
      const req = input instanceof Request ? input : new Request(input, init);
      requests.push(req);
      return new Response(JSON.stringify({ _pagination: {}, _results: [] }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    },
  });

  const front = new Front({ apiKey: "test-token", fetch: mockFetch });
  return { front, requests };
};

describe("Front", () => {
  test("initializes with bearer auth", () => {
    const { front } = createTestSetup();
    expect(front).toBeInstanceOf(Front);
  });

  test("tags.list sends GET /tags with bearer auth", async () => {
    const { front, requests } = createTestSetup();

    await front.tags.list();

    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/tags");
    expect(requests[0]?.headers.get("Authorization")).toBe("Bearer test-token");
    expect(requests[0]?.headers.get("User-Agent")).toBe("@dugjason/front-node@0.0.1");
  });

  test("uses custom user agent when provided", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        return new Response(JSON.stringify({ _pagination: {}, _results: [] }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({
      apiKey: "test-token",
      fetch: mockFetch,
      userAgent: "acme-front-client/1.2.3",
    });

    await front.tags.list();

    expect(requests[0]?.headers.get("User-Agent")).toBe("acme-front-client/1.2.3");
  });

  test("tags.list forwards query params", async () => {
    const { front, requests } = createTestSetup();

    await front.tags.list({ limit: 10, sort_order: "asc" });

    expect(requests[0]?.url).toBe("https://api2.frontapp.com/tags?limit=10&sort_order=asc");
  });

  test("tags.get returns a FrontTag and sends GET /tags/{id}", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        return new Response(
          JSON.stringify({
            _links: { self: "https://api2.frontapp.com/tags/tag_abc123" },
            description: "",
            highlight: "red",
            id: "tag_abc123",
            is_private: false,
            is_visible_in_conversation_lists: true,
            name: "Priority",
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        );
      },
    });

    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const tag = await front.tags.get("tag_abc123");

    expect(tag).toBeInstanceOf(FrontTag);
    expect(tag.id).toBe("tag_abc123");
    expect(tag.name).toBe("Priority");
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/tags/tag_abc123");
  });

  test("FrontTag.update sends PATCH with body", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/tags/tag_abc123")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/tags/tag_abc123" },
              description: "",
              highlight: "red",
              id: "tag_abc123",
              is_private: false,
              is_visible_in_conversation_lists: true,
              name: "Old",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "PATCH" && url.endsWith("/tags/tag_abc123")) {
          return new Response(null, { status: 204 });
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });

    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
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
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/tags/tag_abc123")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/tags/tag_abc123" },
              created_at: 1_700_000_000,
              description: "",
              highlight: "red",
              id: "tag_abc123",
              is_private: false,
              is_visible_in_conversation_lists: true,
              name: "Old",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "PATCH" && url.endsWith("/tags/tag_abc123")) {
          return new Response(null, { status: 204 });
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });

    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
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

  test("signatures.get returns FrontSignature and sends GET /signatures/{id}", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        return new Response(
          JSON.stringify({
            _links: { self: "https://api2.frontapp.com/signatures/sig_abc" },
            body: "<p>Hi</p>",
            channel_ids: null,
            id: "sig_abc",
            is_default: true,
            is_private: true,
            is_visible_for_all_teammate_channels: false,
            name: "Default",
            sender_info: null,
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        );
      },
    });

    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const sig = await front.signatures.get("sig_abc");

    expect(sig).toBeInstanceOf(FrontSignature);
    expect(sig.id).toBe("sig_abc");
    expect(sig.name).toBe("Default");
    expect(sig.body).toBe("<p>Hi</p>");
    expect(sig.isPrivate).toBe(true);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/signatures/sig_abc");
  });

  test("FrontSignature.save sends PATCH and applies 200 response body", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/signatures/sig_abc")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/signatures/sig_abc" },
              body: "<p>old</p>",
              channel_ids: ["cha_1"],
              id: "sig_abc",
              is_default: false,
              is_private: false,
              is_visible_for_all_teammate_channels: true,
              name: "Old",
              sender_info: "Acme",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "PATCH" && url.endsWith("/signatures/sig_abc")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/signatures/sig_abc" },
              body: "<p>new</p>",
              channel_ids: ["cha_1"],
              id: "sig_abc",
              is_default: false,
              is_private: false,
              is_visible_for_all_teammate_channels: true,
              name: "New",
              sender_info: "Acme",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });

    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const sig = await front.signatures.get("sig_abc");
    sig.name = "New";
    await sig.save();

    const patch = requests.find((r) => r.method === "PATCH");
    expect(patch?.url).toBe("https://api2.frontapp.com/signatures/sig_abc");
    expect(sig.name).toBe("New");
    expect(sig.body).toBe("<p>new</p>");
  });

  test("signatures.listTeammate sends GET /teammates/{id}/signatures", async () => {
    const { front, requests } = createTestSetup();
    await front.signatures.listTeammate("tea_1");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/teammates/tea_1/signatures");
  });

  test("accounts.list sends GET /accounts with query", async () => {
    const { front, requests } = createTestSetup();
    const rr = await front.accounts.list({ limit: 10, sort_by: "updated_at" });
    if (rr.pagination?.next) {
      await front.accounts.list({ page_token: rr.pagination.next });
    }
    const [listReq] = requests;
    expect(listReq?.method).toBe("GET");
    expect(listReq?.url).toBe("https://api2.frontapp.com/accounts?limit=10&sort_by=updated_at");
  });

  test("accounts.list normalizes pagination.next to page_token only", async () => {
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [_input, _init]: Parameters<typeof fetch>) =>
        new Response(
          JSON.stringify({
            _pagination: {
              next: "https://api2.frontapp.com/accounts?page_token=tok_list&limit=25",
            },
            _results: [],
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        ),
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const body = await front.accounts.list();
    expect(body.pagination?.next).toBe("tok_list");
  });

  test("accounts.get returns FrontAccount", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/accounts/acc_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/accounts/acc_1" },
              custom_fields: {},
              description: "Paper",
              domains: ["dunder.com"],
              external_id: null,
              id: "acc_1",
              logo_url: null,
              name: "Dunder Mifflin",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        return new Response(JSON.stringify({ _pagination: {}, _results: [] }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const account = await front.accounts.get("acc_1");
    expect(account).toBeInstanceOf(FrontAccount);
    expect(account.id).toBe("acc_1");
    expect(account.name).toBe("Dunder Mifflin");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/accounts/acc_1");
  });

  test("FrontAccount.update applies 200 response body", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/accounts/acc_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/accounts/acc_1" },
              custom_fields: {},
              description: "Old",
              domains: ["a.com"],
              external_id: null,
              id: "acc_1",
              logo_url: null,
              name: "Old Name",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "PATCH" && url.endsWith("/accounts/acc_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/accounts/acc_1" },
              custom_fields: {},
              description: "New desc",
              domains: ["a.com", "b.com"],
              external_id: null,
              id: "acc_1",
              logo_url: null,
              name: "New Name",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const account = await front.accounts.get("acc_1");
    await account.update({ name: "New Name" });
    expect(account.name).toBe("New Name");
    expect(account.description).toBe("New desc");
    expect(account.domains).toEqual(["a.com", "b.com"]);
  });

  test("teammates.list sends GET /teammates", async () => {
    const { front, requests } = createTestSetup();
    await front.teammates.list();
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/teammates");
  });

  test("teammates.get returns FrontTeammate", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        return new Response(
          JSON.stringify({
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
          { headers: { "Content-Type": "application/json" }, status: 200 },
        );
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const tm = await front.teammates.get("tea_1");
    expect(tm).toBeInstanceOf(FrontTeammate);
    expect(tm.id).toBe("tea_1");
    expect(tm.email).toBe("a@example.com");
    expect(tm.firstName).toBe("Ali");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/teammates/tea_1");
  });

  test("FrontTeammate.update merges on 204 response", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/teammates/tea_1")) {
          return new Response(
            JSON.stringify({
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
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "PATCH" && url.endsWith("/teammates/tea_1")) {
          return new Response(null, { status: 204 });
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const tm = await front.teammates.get("tea_1");
    await tm.update({ first_name: "New" });
    expect(tm.firstName).toBe("New");
    expect(tm.email).toBe("a@example.com");
  });

  test("FrontTeammate.listAssignedConversations sends GET with query", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (
          req.method === "GET" &&
          url.includes("/teammates/tea_1") &&
          !url.includes("/conversations")
        ) {
          return new Response(
            JSON.stringify({
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
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "GET" && url.includes("/teammates/tea_1/conversations")) {
          return new Response(JSON.stringify({ _results: [] }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
          });
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const tm = await front.teammates.get("tea_1");
    await tm.listAssignedConversations({ limit: 5 });
    const convReq = requests.find((r) => r.url.includes("/conversations"));
    expect(convReq?.method).toBe("GET");
    expect(convReq?.url).toBe("https://api2.frontapp.com/teammates/tea_1/conversations?limit=5");
  });

  test("channels.list sends GET /channels", async () => {
    const { front, requests } = createTestSetup();
    await front.channels.list();
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels");
  });

  test("channels.get returns FrontChannel", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        return new Response(
          JSON.stringify({
            _links: { self: "https://api2.frontapp.com/channels/cha_1" },
            address: "sales@example.com",
            id: "cha_1",
            is_private: false,
            is_valid: true,
            name: "Sales",
            settings: { undo_send_time: 15 },
            type: "smtp",
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        );
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const ch = await front.channels.get("cha_1");
    expect(ch).toBeInstanceOf(FrontChannel);
    expect(ch.id).toBe("cha_1");
    expect(ch.name).toBe("Sales");
    expect(ch.type).toBe("smtp");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels/cha_1");
  });

  test("FrontChannel.update merges on 204 response", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/channels/cha_1" },
              id: "cha_1",
              is_private: false,
              is_valid: true,
              name: "Old",
              settings: { undo_send_time: 5 },
              type: "smtp",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "PATCH" && url.endsWith("/channels/cha_1")) {
          return new Response(null, { status: 204 });
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const ch = await front.channels.get("cha_1");
    await ch.update({ name: "New", settings: { undo_send_time: 10 } });
    expect(ch.name).toBe("New");
    expect(ch.settings.undo_send_time).toBe(10);
  });

  test("FrontChannel.createDraft posts to /drafts", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/channels/cha_1" },
              id: "cha_1",
              is_private: false,
              is_valid: true,
              name: "C",
              settings: {},
              type: "smtp",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "POST" && url.endsWith("/channels/cha_1/drafts")) {
          return new Response(
            JSON.stringify({
              _links: {
                self: "https://api2.frontapp.com/messages/msg_d1",
              },
              id: "msg_d1",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const ch = await front.channels.get("cha_1");
    const msg = await ch.createDraft({
      body: "Hello",
      mode: "private",
    });
    expect(msg.id).toBe("msg_d1");
    const post = requests.find((r) => r.method === "POST");
    expect(post?.url).toBe("https://api2.frontapp.com/channels/cha_1/drafts");
  });

  test("FrontChannel.createMessage posts to /messages and returns 202 body", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/channels/cha_1" },
              id: "cha_1",
              is_private: false,
              is_valid: true,
              name: "C",
              settings: {},
              type: "smtp",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "POST" && url.endsWith("/channels/cha_1/messages")) {
          return new Response(JSON.stringify({ message_uid: "uid_1", status: "accepted" }), {
            headers: { "Content-Type": "application/json" },
            status: 202,
          });
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const ch = await front.channels.get("cha_1");
    const out = await ch.createMessage({
      body: "Hi",
      options: { archive: true },
      to: ["x@y.com"],
    });
    expect(out.status).toBe("accepted");
    expect(out.message_uid).toBe("uid_1");
    const post = requests.find((r) => r.method === "POST");
    expect(post?.url).toBe("https://api2.frontapp.com/channels/cha_1/messages");
  });

  test("FrontChannel.receiveCustomMessage posts to /incoming_messages", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/channels/cha_1" },
              id: "cha_1",
              is_private: false,
              is_valid: true,
              name: "Custom",
              settings: {},
              type: "custom",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "POST" && url.endsWith("/channels/cha_1/incoming_messages")) {
          return new Response(JSON.stringify({ message_uid: "uid_c", status: "accepted" }), {
            headers: { "Content-Type": "application/json" },
            status: 202,
          });
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const ch = await front.channels.get("cha_1");
    await ch.receiveCustomMessage({
      body: "In",
      body_format: "markdown",
      sender: { handle: "+15551234567" },
    });
    const post = requests.find((r) => r.method === "POST");
    expect(post?.url).toBe("https://api2.frontapp.com/channels/cha_1/incoming_messages");
  });

  test("FrontChannel.validate posts to /validate", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/channels/cha_1" },
              id: "cha_1",
              is_private: false,
              is_valid: true,
              name: "C",
              settings: {},
              type: "smtp",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "POST" && url.endsWith("/channels/cha_1/validate")) {
          return new Response(JSON.stringify({ status: "accepted" }), {
            headers: { "Content-Type": "application/json" },
            status: 202,
          });
        }
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const ch = await front.channels.get("cha_1");
    const res = await ch.validate();
    expect(res.status).toBe("accepted");
    const post = requests.find((r) => r.method === "POST");
    expect(post?.url).toBe("https://api2.frontapp.com/channels/cha_1/validate");
  });

  test("analytics.createExport posts and returns FrontAnalyticsExport", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        if (req.method === "POST" && req.url === "https://api2.frontapp.com/analytics/exports") {
          return new Response(
            JSON.stringify({
              _links: {
                self: "https://api2.frontapp.com/analytics/exports/exp_1",
              },
              filters: { tag_ids: ["tag_1"] },
              id: "exp_1",
              progress: 0,
              status: "running",
            }),
            { headers: { "Content-Type": "application/json" }, status: 201 },
          );
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const exp = await front.analytics.createExport({
      columns: ["Message ID"],
      end: 100,
      start: 0,
      type: "messages",
    });
    expect(exp).toBeInstanceOf(FrontAnalyticsExport);
    expect(exp.id).toBe("exp_1");
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/analytics/exports");
  });

  test("analytics.getExport sends GET and refresh refetches", async () => {
    const requests: Request[] = [];
    let getCount = 0;
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        if (req.method === "GET" && req.url.includes("/analytics/exports/exp_1")) {
          getCount += 1;
          return new Response(
            JSON.stringify({
              _links: {
                self: "https://api2.frontapp.com/analytics/exports/exp_1",
              },
              filters: { tag_ids: ["tag_1"] },
              id: "exp_1",
              progress: getCount === 1 ? 0 : 100,
              status: getCount === 1 ? "running" : "done",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const exp = await front.analytics.getExport("exp_1");
    expect(exp.data.status).toBe("running");
    await exp.refresh();
    expect(exp.data.status).toBe("done");
    expect(requests.filter((r) => r.method === "GET")).toHaveLength(2);
  });

  test("analytics.createReport posts and returns FrontAnalyticsReport", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        if (req.method === "POST" && req.url === "https://api2.frontapp.com/analytics/reports") {
          return new Response(
            JSON.stringify({
              _links: {
                self: "https://api2.frontapp.com/analytics/reports/uid_a",
              },
              metrics: [],
              progress: 0,
              status: "running",
              uid: "uid_a",
            }),
            { headers: { "Content-Type": "application/json" }, status: 201 },
          );
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const rep = await front.analytics.createReport({
      end: 200,
      metrics: ["new_segments_count"],
      start: 0,
    });
    expect(rep).toBeInstanceOf(FrontAnalyticsReport);
    expect(rep.uid).toBe("uid_a");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/analytics/reports");
  });

  test("analytics.getReport sends GET to reports path", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        if (req.method === "GET" && req.url.includes("/analytics/reports/uid_b")) {
          return new Response(
            JSON.stringify({
              _links: {
                self: "https://api2.frontapp.com/analytics/reports/uid_b",
              },
              metrics: [{ id: "new_segments_count", type: "number", value: 3 }],
              progress: 100,
              status: "done",
              uid: "uid_b",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const rep = await front.analytics.getReport("uid_b");
    expect(rep.data.status).toBe("done");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/analytics/reports/uid_b");
  });

  test("company.listRules sends GET /company/rules", async () => {
    const { front, requests } = createTestSetup();
    await front.company.listRules();
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/rules");
  });

  test("company.listTags forwards query params", async () => {
    const { front, requests } = createTestSetup();
    await front.company.listTags({ limit: 5, sort_order: "asc" });
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/tags?limit=5&sort_order=asc");
  });

  test("company.createTag posts to /company/tags", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        if (req.method === "POST" && req.url === "https://api2.frontapp.com/company/tags") {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/tags/tag_new" },
              description: "",
              highlight: null,
              id: "tag_new",
              is_private: false,
              is_visible_in_conversation_lists: true,
              name: "New",
            }),
            { headers: { "Content-Type": "application/json" }, status: 201 },
          );
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const tag = await front.company.createTag({
      highlight: "grey",
      is_visible_in_conversation_lists: true,
      name: "New",
    });
    expect(tag.id).toBe("tag_new");
    expect(requests[0]?.method).toBe("POST");
  });

  test("company.getTicketStatus sends GET /company/statuses/{id}", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        if (req.method === "GET" && req.url.endsWith("/company/statuses/sts_1")) {
          return new Response(
            JSON.stringify({
              _links: {
                self: "https://api2.frontapp.com/company/statuses/sts_1",
              },
              category: "open",
              description: null,
              id: "sts_1",
              name: "Open",
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const st = await front.company.getTicketStatus("sts_1");
    expect(st.id).toBe("sts_1");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/statuses/sts_1");
  });

  test("applications.triggerEvent posts to /applications/{uid}/events", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
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
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    await front.applications.triggerEvent("app_1", {
      app_object: { id: "obj_1" },
      event_type: "opened",
    });
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/applications/app_1/events");
  });

  test("comments.get returns FrontComment", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        if (req.method === "GET" && req.url.endsWith("/comments/com_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/comments/com_1" },
              attachments: [],
              author: {
                _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
                custom_fields: {},
                email: "a@b.com",
                first_name: "A",
                id: "tea_1",
                is_admin: false,
                is_available: true,
                is_blocked: false,
                last_name: "B",
                type: "user",
                username: "ab",
              },
              body: "Hello",
              id: "com_1",
              is_pinned: false,
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const c = await front.comments.get("com_1");
    expect(c).toBeInstanceOf(FrontComment);
    expect(c.id).toBe("com_1");
    expect(c.body).toBe("Hello");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/comments/com_1");
  });

  test("FrontComment.update PATCHes slash-terminated path", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/comments/com_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/comments/com_1" },
              attachments: [],
              author: {
                _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
                custom_fields: {},
                email: "a@b.com",
                first_name: "A",
                id: "tea_1",
                is_admin: false,
                is_available: true,
                is_blocked: false,
                last_name: "B",
                type: "user",
                username: "ab",
              },
              body: "Old",
              id: "com_1",
              is_pinned: false,
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "PATCH" && url.endsWith("/comments/com_1/")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/comments/com_1" },
              attachments: [],
              author: {
                _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
                custom_fields: {},
                email: "a@b.com",
                first_name: "A",
                id: "tea_1",
                is_admin: false,
                is_available: true,
                is_blocked: false,
                last_name: "B",
                type: "user",
                username: "ab",
              },
              body: "New",
              id: "com_1",
              is_pinned: true,
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const c = await front.comments.get("com_1");
    await c.update({ body: "New", is_pinned: true });
    expect(c.body).toBe("New");
    expect(c.isPinned).toBe(true);
    const patch = requests.find((r) => r.method === "PATCH");
    expect(patch?.url).toBe("https://api2.frontapp.com/comments/com_1/");
  });

  test("FrontComment.listMentions and addReply hit expected paths", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/comments/com_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/comments/com_1" },
              attachments: [],
              author: {
                _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
                custom_fields: {},
                email: "a@b.com",
                first_name: "A",
                id: "tea_1",
                is_admin: false,
                is_available: true,
                is_blocked: false,
                last_name: "B",
                type: "user",
                username: "ab",
              },
              body: "Root",
              id: "com_1",
              is_pinned: false,
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "GET" && url.includes("/comments/com_1/mentions")) {
          return new Response(JSON.stringify({ _results: [] }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
          });
        }
        if (req.method === "POST" && url.endsWith("/comments/com_1/replies")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/comments/com_2" },
              attachments: [],
              author: {
                _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
                custom_fields: {},
                email: "a@b.com",
                first_name: "A",
                id: "tea_1",
                is_admin: false,
                is_available: true,
                is_blocked: false,
                last_name: "B",
                type: "user",
                username: "ab",
              },
              body: "Reply",
              id: "com_2",
              is_pinned: false,
            }),
            { headers: { "Content-Type": "application/json" }, status: 201 },
          );
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
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
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        const { url } = req;
        if (req.method === "GET" && url.endsWith("/comments/com_1")) {
          return new Response(
            JSON.stringify({
              _links: { self: "https://api2.frontapp.com/comments/com_1" },
              attachments: [],
              author: {
                _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
                custom_fields: {},
                email: "a@b.com",
                first_name: "A",
                id: "tea_1",
                is_admin: false,
                is_available: true,
                is_blocked: false,
                last_name: "B",
                type: "user",
                username: "ab",
              },
              body: "Hi",
              id: "com_1",
              is_pinned: false,
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          );
        }
        if (req.method === "GET" && url.includes("/comments/com_1/download/att_1")) {
          return new Response(new Uint8Array([1, 2, 3]), {
            headers: { "Content-Type": "application/octet-stream" },
            status: 200,
          });
        }
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
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
    const mockFetch = new Proxy(fetch, {
      apply: () =>
        new Response(
          JSON.stringify({
            _links: { self: "https://api2.frontapp.com/comments/com_1" },
            attachments: [],
            author: {
              _links: { self: "https://api2.frontapp.com/teammates/tea_1" },
              custom_fields: {},
              email: "a@b.com",
              first_name: "A",
              id: "tea_1",
              is_admin: false,
              is_available: true,
              is_blocked: false,
              last_name: "B",
              type: "user",
              username: "ab",
            },
            body: "Hi",
            id: "com_1",
            is_pinned: false,
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        ),
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const c = await front.comments.get("com_1");
    await expect(c.delete()).rejects.toThrow(NOT_SUPPORTED);
  });

  test("FrontChannel.delete throws", async () => {
    const mockFetch = new Proxy(fetch, {
      apply: () =>
        new Response(
          JSON.stringify({
            _links: { self: "https://api2.frontapp.com/channels/cha_1" },
            id: "cha_1",
            is_private: false,
            is_valid: true,
            name: "C",
            settings: {},
            type: "smtp",
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        ),
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const ch = await front.channels.get("cha_1");
    await expect(ch.delete()).rejects.toThrow(NOT_SUPPORTED);
  });

  test("error response throws FrontApiError with status and body", async () => {
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg) =>
        Response.json(
          { _error: "Too many requests" },
          {
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "30",
            },
            status: 429,
          },
        ),
    });

    const front = new Front({ apiKey: "test-token", fetch: mockFetch });

    await expect(front.tags.list()).rejects.toBeInstanceOf(FrontApiError);

    try {
      await front.tags.list();
    } catch (error) {
      expect(error).toBeInstanceOf(FrontApiError);
      if (error instanceof FrontApiError) {
        expect(error.status).toBe(429);
        expect(error.headers.get("retry-after")).toBe("30");
        expect(error.body).toEqual({ _error: "Too many requests" });
        expect(error.message).toStartWith("Front API error: 429");
      }
    }
  });
});

describe("Front namespaces (smoke)", () => {
  test("list-style namespaces send GET to expected paths", async () => {
    const { front, requests } = createTestSetup();
    await Promise.all([
      front.contactLists.list(),
      front.contacts.list(),
      front.conversations.list(),
      front.customFieldsGlobal.list(),
      front.events.list(),
      front.inboxes.list(),
      front.knowledgeBases.list(),
      front.links.list(),
      front.messageTemplateFolders.list(),
      front.messageTemplates.list(),
      front.rules.list(),
      front.shifts.list(),
      front.teammateGroups.list(),
      front.teams.listTeams(),
      front.views.list(),
    ]);

    const urls = requests.map((r) => r.url).toSorted();
    expect(requests).toHaveLength(15);
    expect(requests.every((r) => r.method === "GET")).toBe(true);
    expect(requests.every((r) => r.headers.get("Authorization") === "Bearer test-token")).toBe(
      true,
    );
    expect(urls).toEqual(
      [
        "https://api2.frontapp.com/contact_lists",
        "https://api2.frontapp.com/contacts",
        "https://api2.frontapp.com/conversations",
        "https://api2.frontapp.com/custom_fields",
        "https://api2.frontapp.com/events",
        "https://api2.frontapp.com/inboxes",
        "https://api2.frontapp.com/knowledge_bases",
        "https://api2.frontapp.com/links",
        "https://api2.frontapp.com/message_template_folders",
        "https://api2.frontapp.com/message_templates",
        "https://api2.frontapp.com/rules",
        "https://api2.frontapp.com/shifts",
        "https://api2.frontapp.com/teammate_groups",
        "https://api2.frontapp.com/teams",
        "https://api2.frontapp.com/views",
      ].toSorted(),
    );
  });

  test("conversations.search encodes the query path segment", async () => {
    const { front, requests } = createTestSetup();
    await front.conversations.search("open priority");
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/conversations/search/open%20priority");
  });

  test("contacts.list and events.list forward query params", async () => {
    const { front, requests } = createTestSetup();
    await front.contacts.list({ limit: 3, q: "jane" });
    await front.events.list({ limit: 5, sort_order: "desc" });
    const contactsUrl = new URL(requests[0]?.url ?? "");
    expect(contactsUrl.pathname).toBe("/contacts");
    expect(Object.fromEntries(contactsUrl.searchParams)).toEqual({
      limit: "3",
      q: "jane",
    });
    const eventsUrl = new URL(requests[1]?.url ?? "");
    expect(eventsUrl.pathname).toBe("/events");
    expect(Object.fromEntries(eventsUrl.searchParams)).toEqual({
      limit: "5",
      sort_order: "desc",
    });
  });

  test("me.details sends GET /me", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        return new Response(
          JSON.stringify({
            _links: { self: "https://api2.frontapp.com/me" },
            id: "cmp_1",
            name: "Acme",
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        );
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const me = await front.me.details();
    expect(me.id).toBe("cmp_1");
    expect(me.name).toBe("Acme");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/me");
  });

  test("messages.get returns FrontMessage and loads JSON", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        return new Response(JSON.stringify({ id: "msg_1", type: "email" }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const m = await front.messages.get("msg_1");
    expect(m).toBeInstanceOf(FrontMessage);
    expect(m.data?.id).toBe("msg_1");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/messages/msg_1");
  });

  test("downloads.download sends GET without JSON parsing", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        return new Response(new Uint8Array([9, 9]), { status: 200 });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const res = await front.downloads.download("att_lnk_1");
    expect(res.ok).toBe(true);
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([9, 9]));
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/download/att_lnk_1");
    expect(requests[0]?.headers.get("User-Agent")).toBe("@dugjason/front-node@0.0.1");
  });

  test("drafts.edit PATCHes /drafts/{message_id}/ with trailing slash", async () => {
    const requests: Request[] = [];
    const mockFetch = new Proxy(fetch, {
      apply: (_target, _thisArg, [input, init]: Parameters<typeof fetch>) => {
        const req = input instanceof Request ? input : new Request(input, init);
        requests.push(req);
        return new Response(JSON.stringify({ id: "msg_1" }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      },
    });
    const front = new Front({ apiKey: "test-token", fetch: mockFetch });
    const body: EditDraft = {
      body: "Updated",
      channel_id: "cha_1",
      mode: "shared",
    };
    await front.drafts.edit("msg_1", body);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("PATCH");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/drafts/msg_1/");
  });
});
