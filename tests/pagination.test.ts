import { expect, test } from "bun:test";

import { FrontBase } from "../src/base";
import { createMockClient, jsonResponse } from "./helpers/setup";
import { PAGE_TOKEN } from "./helpers/pagination";

test("next-page query preserves pagination, sorting, and filters", () => {
  expect(
    FrontBase.queryFromNextPageUrl(
      `https://front.api.frontapp.com/tags?limit=5&page_token=${PAGE_TOKEN}&sort_by=name&sort_order=asc&q=priority`,
      "/tags",
    ),
  ).toEqual({
    limit: "5",
    page_token: PAGE_TOKEN,
    q: "priority",
    sort_by: "name",
    sort_order: "asc",
  });
});

test.each(["not a URL", "file:///tags", "https://api2.frontapp.com/conversations"])(
  "next-page query rejects invalid URLs: %s",
  (url) => {
    expect(() => FrontBase.queryFromNextPageUrl(url, "/tags")).toThrow();
  },
);

test("requestJson uses next-page query instead of explicit query on the configured origin", async () => {
  const { front, requests } = createMockClient(() => jsonResponse({ _results: [] }));
  await front.requestJson("GET", "/tags", {
    nextPageUrl: `https://front.api.frontapp.com/tags?limit=5&sort_by=name&sort_order=asc&page_token=${PAGE_TOKEN}`,
    query: {
      limit: "50",
      page_token: "ca5f1d906b3e47ac",
      q: "ignored",
      sort_by: "updated_at",
      sort_order: "desc",
    },
  });
  expect(requests).toHaveLength(1);
  expect(requests[0]?.url).toBe(
    `https://api2.frontapp.com/tags?limit=5&sort_by=name&sort_order=asc&page_token=${PAGE_TOKEN}`,
  );
  expect(requests[0]?.headers.get("Authorization")).toBe("Bearer test-token");
});

test("requestJson rejects nextPageUrl on mutation requests before sending", async () => {
  const { front, requests } = createMockClient();
  await expect(
    front.requestJson("POST", "/tags", {
      nextPageUrl: `https://api2.frontapp.com/tags?page_token=${PAGE_TOKEN}`,
    }),
  ).rejects.toThrow("nextPageUrl is only supported for GET requests.");
  expect(requests).toHaveLength(0);
});
