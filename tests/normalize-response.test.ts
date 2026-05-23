import { describe, expect, test } from "bun:test";

import { normalizeFrontResponse, pageTokenFromPaginationNextUrl } from "../src/normalize-response";

const base = "https://api2.frontapp.com";

describe("pageTokenFromPaginationNextUrl", () => {
  test("extracts page_token from absolute next URL", () => {
    expect(
      pageTokenFromPaginationNextUrl(
        "https://api2.frontapp.com/accounts?page_token=tok_1&limit=25",
      ),
    ).toBe("tok_1");
  });

  test("returns null when not a URL", () => {
    expect(pageTokenFromPaginationNextUrl("not a URL")).toBe(null);
  });

  test("handles null, undefined, and empty string", () => {
    expect(pageTokenFromPaginationNextUrl(null)).toBe(null);
    expect(pageTokenFromPaginationNextUrl()).toBe(null);
    expect(pageTokenFromPaginationNextUrl("")).toBe(null);
  });
});

describe("normalizeFrontResponse", () => {
  test("renames _pagination to pagination and strips next URL", () => {
    const raw = {
      _pagination: {
        next: `${base}/tags?page_token=xyz&limit=50`,
      },
      _results: [{ id: "tag_1" }],
    };
    const n = normalizeFrontResponse(raw);
    expect(n).toEqual({
      _results: [{ id: "tag_1" }],
      pagination: { next: "xyz" },
    });
    expect(n).not.toHaveProperty("_pagination");
  });
});
