import { expect, test } from "bun:test";

import { FrontApiError } from "../src/errors";

test.each([
  { body: { message: "Denied" }, text: '{"message":"Denied"}' },
  { body: "Service unavailable", text: "Service unavailable" },
])("FrontApiError exposes the response payload: $text", ({ text, body }) => {
  const response = new Response(text, { status: 403 });
  const error = new FrontApiError(response, text);
  expect(error.body).toEqual(body);
  expect(error.status).toBe(403);
  expect(error.response).toBe(response);
});
