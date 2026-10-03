import { describe, expect, test } from "bun:test";

import type { ChannelResponse, CreateChannelParams, UpdateChannelParams } from "../../src/index";
import { createMockClient, jsonResponse } from "../helpers/setup";

const channel: ChannelResponse = {
  _links: { self: "https://api2.frontapp.com/channels/cha_123" },
  address: "support@example.com",
  id: "cha_123",
  is_private: false,
  is_valid: true,
  name: "Support",
  send_as: "support@example.com",
  settings: { undo_send_time: 15 },
  type: "smtp",
};

describe("channels", () => {
  test("get requests the channel ID and returns response fields", async () => {
    const { front, requests } = createMockClient(() => jsonResponse(channel));
    expect(await front.channels.get("cha_123")).toEqual(channel);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels/cha_123");
  });

  test("create sends inbox ID and parameters and returns void", async () => {
    const { front, requests } = createMockClient(() => new Response(null, { status: 204 }));
    const params: CreateChannelParams = {
      name: "Support",
      send_as: "support@example.com",
      type: "smtp",
    };
    expect(await front.channels.create("inb_123", params)).toBeUndefined();
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/inboxes/inb_123/channels");
    expect(await requests[0]?.json()).toEqual(params);
  });

  test("update sends only supplied fields and returns void", async () => {
    const { front, requests } = createMockClient(() => new Response(null, { status: 204 }));
    const params: UpdateChannelParams = { inbox_id: "inb_456", settings: { undo_send_time: 10 } };
    expect(await front.channels.update("cha_123", params)).toBeUndefined();
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("PATCH");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels/cha_123");
    expect(await requests[0]?.json()).toEqual(params);
  });

  test("createDraft returns the endpoint's message response", async () => {
    const response = {
      _links: { self: "https://api2.frontapp.com/messages/msg_123" },
      id: "msg_123",
      type: "email" as const,
    };
    const { front, requests } = createMockClient(() => jsonResponse(response));
    const params = { body: "Hello", mode: "private" as const };
    expect(await front.channels.createDraft("cha_123", params)).toEqual(response);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels/cha_123/drafts");
    expect(await requests[0]?.json()).toEqual(params);
  });

  test("createMessage returns the accepted message response", async () => {
    const response = { message_uid: "uid_123", status: "accepted" };
    const { front, requests } = createMockClient(() => jsonResponse(response, { status: 202 }));
    const params = { body: "Hello", options: { archive: true }, to: ["customer@example.com"] };
    expect(await front.channels.createMessage("cha_123", params)).toEqual(response);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels/cha_123/messages");
    expect(await requests[0]?.json()).toEqual(params);
  });

  test("receiveCustomMessage returns the accepted message response", async () => {
    const response = { message_uid: "uid_123", status: "accepted" };
    const { front, requests } = createMockClient(() => jsonResponse(response, { status: 202 }));
    const params = {
      body: "Hello",
      body_format: "markdown" as const,
      sender: { handle: "+15551234567" },
    };
    expect(await front.channels.receiveCustomMessage("cha_123", params)).toEqual(response);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels/cha_123/incoming_messages");
    expect(await requests[0]?.json()).toEqual(params);
  });

  test("validate returns the accepted response", async () => {
    const response = { status: "accepted" };
    const { front, requests } = createMockClient(() => jsonResponse(response, { status: 202 }));
    expect(await front.channels.validate("cha_123")).toEqual(response);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/channels/cha_123/validate");
    expect(await requests[0]?.text()).toBe("");
  });

  test.each(["company", "inbox", "team", "teammate"] as const)(
    "lists %s channels and returns the response envelope",
    async (scope) => {
      const response = {
        _links: { self: "https://api2.frontapp.com/channels" },
        _results: [channel],
      };
      const { front, requests } = createMockClient(() => jsonResponse(response));
      const paths = {
        company: "/channels",
        inbox: "/inboxes/inb_123/channels",
        team: "/teams/tim_123/channels",
        teammate: "/teammates/tea_123/channels",
      };
      const list = () => {
        switch (scope) {
          case "inbox": {
            return front.inboxes.listChannels("inb_123");
          }
          case "team": {
            return front.teams.listChannels("tim_123");
          }
          case "teammate": {
            return front.teammates.listChannels("tea_123");
          }
          default: {
            return front.channels.list();
          }
        }
      };
      expect(await list()).toEqual(response);
      expect(requests).toHaveLength(1);
      expect(requests[0]?.method).toBe("GET");
      expect(requests[0]?.url).toBe(`https://api2.frontapp.com${paths[scope]}`);
    },
  );
});
