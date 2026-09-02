import { expect, test } from "bun:test";

import { createMockClient, jsonResponse } from "../helpers/setup";

test("messageTemplates.update targets an id without fetching it first", async () => {
  const { front, requests } = createMockClient((request) => {
    if (request.method === "PATCH") {
      return jsonResponse({
        _links: { self: "https://api2.frontapp.com/message_templates/mt_1" },
        body: "Updated body",
        id: "mt_1",
        inbox_ids: null,
        is_available_for_all_inboxes: true,
        name: "Updated",
        subject: null,
      });
    }
    return jsonResponse({});
  });

  await front.messageTemplates.update("mt_1", { body: "Updated body" });

  expect(requests).toHaveLength(1);
  expect(requests[0]?.method).toBe("PATCH");
  expect(requests[0]?.url).toBe("https://api2.frontapp.com/message_templates/mt_1");
});
