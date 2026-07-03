import { describe, expect, test } from "bun:test";

import type { ImportMessage } from "../../src/resources/inboxes";
import { createMockClient, jsonResponse } from "../helpers/setup";

describe("inboxes", () => {
  test("inboxes.importMessage POSTs /inboxes/{inbox_id}/imported_messages", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({ message_uid: "msg_uid_1", status: "accepted" }, { status: 202 }),
    );
    const body: ImportMessage = {
      body: "Hello",
      body_format: "markdown",
      created_at: 1_700_000_000,
      external_id: "ext_1",
      metadata: { is_archived: true, is_inbound: true, should_skip_rules: true },
      sender: { handle: "sender@example.com" },
      to: ["recipient@example.com"],
      type: "email",
    };
    const result = await front.inboxes.importMessage("inb_1", body);
    expect(result.status).toBe("accepted");
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/inboxes/inb_1/imported_messages");
  });

  test("inboxes.listChannels GETs /inboxes/{inbox_id}/channels", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({ _pagination: {}, _results: [] }),
    );
    await front.inboxes.listChannels("inb_1");
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/inboxes/inb_1/channels");
  });

  test("inboxes.addTeammateAccess POSTs /inboxes/{inbox_id}/teammates", async () => {
    const { front, requests } = createMockClient(() => jsonResponse(null, { status: 204 }));
    await front.inboxes.addTeammateAccess("inb_1", { teammate_ids: ["tea_1"] });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/inboxes/inb_1/teammates");
  });
});
