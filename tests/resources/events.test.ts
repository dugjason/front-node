import { expect, test } from "bun:test";

import { createMockClient, jsonResponse } from "../helpers/setup";

test("event lists fill omitted message authors and preserve other targets", async () => {
  const status = { id: "sts_1", name: "Open" };
  const { front } = createMockClient(() =>
    jsonResponse({
      _results: [
        { target: { _meta: { type: "message" }, data: { id: "msg_1" } } },
        { target: { data: { id: "msg_2" } }, type: "inbound" },
        { target: { data: status }, type: "ticket_status_update" },
      ],
    }),
  );

  const events = await front.events.list();

  expect(events._results?.map((event) => event.target?.data)).toEqual([
    { author: null, id: "msg_1" },
    { author: null, id: "msg_2" },
    status,
  ]);
});
