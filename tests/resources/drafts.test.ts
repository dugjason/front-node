import { describe, expect, test } from "bun:test";

import type { EditDraft } from "../../src/resources/drafts";
import { createMockClient, jsonResponse } from "../helpers/setup";

describe("drafts", () => {
  test("drafts.edit PATCHes /drafts/{message_id}/ with trailing slash", async () => {
    const { front, requests } = createMockClient(() => jsonResponse({ id: "msg_1" }));
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
