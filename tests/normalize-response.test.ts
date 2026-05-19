import { describe, expect, test } from "bun:test";

import { normalizeFrontResponse, pageTokenFromPaginationNextUrl } from "../src/normalize-response";

const base = "https://api2.frontapp.com";

describe("pageTokenFromPaginationNextUrl", () => {
  test("extracts page_token from absolute next URL", () => {
    expect(pageTokenFromPaginationNextUrl(`${base}/accounts?page_token=tok_1&limit=25`, base)).toBe(
      "tok_1",
    );
  });

  test("extracts page_token from relative next URL", () => {
    expect(pageTokenFromPaginationNextUrl("/accounts?page_token=tok_rel", base)).toBe("tok_rel");
  });

  test("returns value unchanged when not a URL with page_token", () => {
    expect(pageTokenFromPaginationNextUrl("opaque-token", base)).toBe("opaque-token");
  });

  test("handles null, undefined, and empty string", () => {
    expect(pageTokenFromPaginationNextUrl(null, base)).toBe(null);
    expect(pageTokenFromPaginationNextUrl(undefined, base)).toBe(null);
    expect(pageTokenFromPaginationNextUrl("", base)).toBe(null);
  });
});

describe("normalizeFrontResponse", () => {
  test("renames _pagination to pagination and strips next URL", () => {
    const raw = {
      _pagination: {
        next: `${base}/tags?page_token=xyz&limit=50`,
      },
      _results: [{ id: "t1" }],
    };
    const n = normalizeFrontResponse(raw, base);
    expect(n).toEqual({
      _results: [{ id: "t1" }],
      pagination: { next: "xyz" },
    });
    expect(n).not.toHaveProperty("_pagination");
  });

  test("recurses into nested objects", () => {
    const raw = {
      outer: {
        _pagination: { next: `${base}/inbox?page_token=nested` },
        _results: [],
      },
    };
    const n = normalizeFrontResponse(raw, base);
    expect((n as { outer: { pagination: { next: string } } }).outer.pagination.next).toBe("nested");
  });
});
