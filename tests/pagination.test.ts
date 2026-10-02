import { expect, test } from "bun:test";

import { FrontBase } from "../src/base";
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
