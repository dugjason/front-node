import { describe, expect, test } from "bun:test";

import { normalizeFrontResponse, pageTokenFromPaginationNextUrl } from "../src/normalize-response";

import { PAGE_TOKEN } from "./helpers/pagination";

const base = "https://api2.frontapp.com";

describe("pageTokenFromPaginationNextUrl", () => {
  test("extracts page_token from absolute next URL", () => {
    expect(
      pageTokenFromPaginationNextUrl(
        `https://api2.frontapp.com/accounts?page_token=${PAGE_TOKEN}&limit=25`,
      ),
    ).toBe(PAGE_TOKEN);
  });

  test("returns null when not a URL", () => {
    expect(pageTokenFromPaginationNextUrl("not a URL")).toBe(null);
  });

  test("handles null, undefined, and empty string", () => {
    expect(pageTokenFromPaginationNextUrl(null)).toBe(null);
    expect(pageTokenFromPaginationNextUrl()).toBe(null);
    expect(pageTokenFromPaginationNextUrl("")).toBe(null);
  });

  test.each([`${base}/tags?limit=25`, `${base}/tags?page_token=`])(
    "returns null when the next URL has no nonempty token: %s",
    (next) => {
      const token: string | null = pageTokenFromPaginationNextUrl(next);
      expect(token).toBe(null);
    },
  );
});

describe("normalizeFrontResponse", () => {
  test("renames _pagination and preserves the next URL", () => {
    const raw = {
      _pagination: {
        next: `${base}/tags?page_token=${PAGE_TOKEN}&limit=50`,
      },
      _results: [{ id: "tag_1" }],
    };
    const n = normalizeFrontResponse(raw);
    expect(n).toEqual({
      _results: [{ id: "tag_1" }],
      pagination: { next: raw._pagination.next },
    });
    expect(n).not.toHaveProperty("_pagination");
  });
});
