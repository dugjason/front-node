import { expect, test } from "bun:test";
import { FrontApiError } from "../src/errors";
import { PAGE_TOKEN } from "./helpers/pagination";
import { createMockClient, jsonResponse } from "./helpers/setup";

test("operation requests serialize typed query parameters and preserve next-page metadata", async () => {
  const nextPageUrl = `https://api2.frontapp.com/tags?limit=5&page_token=${PAGE_TOKEN}`;
  const { front, requests } = createMockClient(() =>
    jsonResponse({ _pagination: { next: nextPageUrl }, _results: [] }),
  );
  expect(
    await front.requestOperation("list-tags", { query: { limit: 5, sort_order: "asc" } }),
  ).toEqual({ _results: [], pagination: { next: nextPageUrl } });
  expect(requests[0]?.url).toBe("https://api2.frontapp.com/tags?limit=5&sort_order=asc");
});

test.each([400, 401, 404, 429])("operation requests preserve HTTP %s errors", async (status) => {
  const response = jsonResponse(
    { _error: { message: "Request failed" } },
    { headers: { "Retry-After": "30" }, status },
  );
  const { front, requests } = createMockClient(() => response);
  try {
    await front.requestOperation("list-channels");
    throw new Error("Expected the request to fail");
  } catch (error) {
    expect(error).toBeInstanceOf(FrontApiError);
    if (error instanceof FrontApiError) {
      expect(error.status).toBe(status);
      expect(error.body).toEqual({ _error: { message: "Request failed" } });
      expect(error.headers.get("Retry-After")).toBe("30");
      expect(error.response).toBe(response);
    }
  }
  expect(requests).toHaveLength(1);
});

test.each([400, 401, 404, 429])(
  "raw operation requests preserve HTTP %s errors",
  async (status) => {
    const response = jsonResponse({ _error: { message: "Download failed" } }, { status });
    const { front, requests } = createMockClient(() => response);
    try {
      await front.messages.downloadAttachment("msg_123", "att_123");
      throw new Error("Expected the request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(FrontApiError);
      if (error instanceof FrontApiError) {
        expect(error.status).toBe(status);
        expect(error.body).toEqual({ _error: { message: "Download failed" } });
        expect(error.response).toBe(response);
      }
    }
    expect(requests).toHaveLength(1);
  },
);
