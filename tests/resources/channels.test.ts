import { describe, expect, test } from "bun:test";

import { FrontChannel } from "../../src/index";
import { createMockClient, createTestSetup, jsonResponse, NOT_SUPPORTED } from "../helpers/setup";

describe("channels", () => {
  test("channels.list sends GET /channels", async () => {
    const { front, requests } = createTestSetup();
    await front.channels.list();
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels");
  });

  test("channels.get returns FrontChannel", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({
        _links: { self: "https://api2.frontapp.com/channels/cha_1" },
        address: "sales@example.com",
        id: "cha_1",
        is_private: false,
        is_valid: true,
        name: "Sales",
        settings: { undo_send_time: 15 },
        type: "smtp",
      }),
    );
    const ch = await front.channels.get("cha_1");
    expect(ch).toBeInstanceOf(FrontChannel);
    expect(ch.id).toBe("cha_1");
    expect(ch.name).toBe("Sales");
    expect(ch.type).toBe("smtp");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels/cha_1");
  });

  test("FrontChannel.update merges on 204 response", async () => {
    const { front } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/channels/cha_1" },
          id: "cha_1",
          is_private: false,
          is_valid: true,
          name: "Old",
          settings: { undo_send_time: 5 },
          type: "smtp",
        });
      }
      if (req.method === "PATCH" && url.endsWith("/channels/cha_1")) {
        return new Response(null, { status: 204 });
      }
      return jsonResponse({});
    });
    const ch = await front.channels.get("cha_1");
    await ch.update({ name: "New", settings: { undo_send_time: 10 } });
    expect(ch.name).toBe("New");
    expect(ch.settings.undo_send_time).toBe(10);
  });

  test("FrontChannel.createDraft posts to /drafts", async () => {
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/channels/cha_1" },
          id: "cha_1",
          is_private: false,
          is_valid: true,
          name: "C",
          settings: {},
          type: "smtp",
        });
      }
      if (req.method === "POST" && url.endsWith("/channels/cha_1/drafts")) {
        return jsonResponse({
          _links: {
            self: "https://api2.frontapp.com/messages/msg_d1",
          },
          id: "msg_d1",
        });
      }
      return jsonResponse({});
    });
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
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/channels/cha_1" },
          id: "cha_1",
          is_private: false,
          is_valid: true,
          name: "C",
          settings: {},
          type: "smtp",
        });
      }
      if (req.method === "POST" && url.endsWith("/channels/cha_1/messages")) {
        return jsonResponse({ message_uid: "uid_1", status: "accepted" }, { status: 202 });
      }
      return jsonResponse({});
    });
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
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/channels/cha_1" },
          id: "cha_1",
          is_private: false,
          is_valid: true,
          name: "Custom",
          settings: {},
          type: "custom",
        });
      }
      if (req.method === "POST" && url.endsWith("/channels/cha_1/incoming_messages")) {
        return jsonResponse({ message_uid: "uid_c", status: "accepted" }, { status: 202 });
      }
      return jsonResponse({});
    });
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
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/channels/cha_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/channels/cha_1" },
          id: "cha_1",
          is_private: false,
          is_valid: true,
          name: "C",
          settings: {},
          type: "smtp",
        });
      }
      if (req.method === "POST" && url.endsWith("/channels/cha_1/validate")) {
        return jsonResponse({ status: "accepted" }, { status: 202 });
      }
      return jsonResponse({});
    });
    const ch = await front.channels.get("cha_1");
    const res = await ch.validate();
    expect(res.status).toBe("accepted");
    const post = requests.find((r) => r.method === "POST");
    expect(post?.url).toBe("https://api2.frontapp.com/channels/cha_1/validate");
  });

  test("FrontChannel.delete throws", async () => {
    const { front } = createMockClient(() =>
      jsonResponse({
        _links: { self: "https://api2.frontapp.com/channels/cha_1" },
        id: "cha_1",
        is_private: false,
        is_valid: true,
        name: "C",
        settings: {},
        type: "smtp",
      }),
    );
    const ch = await front.channels.get("cha_1");
    await expect(ch.delete()).rejects.toThrow(NOT_SUPPORTED);
  });
});
