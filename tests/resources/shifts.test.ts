import { expect, test } from "bun:test";

import { createMockClient, jsonResponse } from "../helpers/setup";

test("shifts.update targets an id without fetching it first", async () => {
  const { front, requests } = createMockClient((request) => {
    if (request.method === "PATCH") {
      return new Response(null, { status: 204 });
    }
    return jsonResponse({});
  });

  await front.shifts.update("shift_1", { name: "Late" });

  expect(requests).toHaveLength(1);
  expect(requests[0]?.method).toBe("PATCH");
  expect(requests[0]?.url).toBe("https://api2.frontapp.com/shifts/shift_1");
});
