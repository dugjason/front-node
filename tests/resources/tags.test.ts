import { describe, expect, test } from "bun:test";

import type { CreateTagParams, TagResponse, UpdateTagParams } from "../../src/index";
import { PAGE_TOKEN } from "../helpers/pagination";
import { createMockClient, jsonResponse } from "../helpers/setup";

const tagResponse = (id: string, name: string): TagResponse => ({
  _links: { self: `https://api2.frontapp.com/tags/${id}` },
  created_at: 1_700_000_000,
  description: "",
  highlight: "red",
  id,
  is_private: false,
  is_visible_in_conversation_lists: true,
  name,
});

const createParams: CreateTagParams = {
  is_visible_in_conversation_lists: true,
  name: "Priority",
};

describe("tags", () => {
  test("get and create return plain API responses", async () => {
    const response = tagResponse("tag_123", "Priority");
    const { front, requests } = createMockClient(() => jsonResponse(response));
    const fetched = await front.tags.get("tag_123");
    const created = await front.tags.create(createParams);
    expect(fetched).toEqual(response);
    expect(created).toEqual(response);
    expect(requests.map((req) => [req.method, req.url])).toEqual([
      ["GET", "https://api2.frontapp.com/tags/tag_123"],
      ["POST", "https://api2.frontapp.com/tags"],
    ]);
    expect(await requests[1]?.json()).toEqual(createParams);
  });

  test("update and delete issue one request each and return void", async () => {
    const { front, requests } = createMockClient(() => new Response(null, { status: 204 }));
    const params: UpdateTagParams = { name: "Renamed", parent_tag_id: null };
    expect(await front.tags.update("tag_123", params)).toBeUndefined();
    expect(await front.tags.update("tag_123", { description: "" })).toBeUndefined();
    expect(await front.tags.delete("tag_123")).toBeUndefined();
    expect(requests.map((req) => [req.method, req.url])).toEqual([
      ["PATCH", "https://api2.frontapp.com/tags/tag_123"],
      ["PATCH", "https://api2.frontapp.com/tags/tag_123"],
      ["DELETE", "https://api2.frontapp.com/tags/tag_123"],
    ]);
    expect(await requests[0]?.json()).toEqual(params);
    expect(await requests[1]?.json()).toEqual({ description: "" });
  });

  test("list and listChildren preserve envelopes and plain tag items", async () => {
    const response = {
      _links: { self: "https://api2.frontapp.com/tags" },
      _pagination: { next: `https://api2.frontapp.com/tags?limit=1&page_token=${PAGE_TOKEN}` },
      _results: [tagResponse("tag_child", "Child")],
    };
    const { front, requests } = createMockClient(() => jsonResponse(response));
    const tags = await front.tags.list({
      limit: 10,
      page_token: PAGE_TOKEN,
      sort_by: "name",
      sort_order: "asc",
    });
    const children = await front.tags.listChildren("tag_123");
    const expected = {
      _links: response._links,
      _results: response._results,
      pagination: { next: response._pagination.next },
    };
    for (const result of [tags, children]) {
      expect(result).toEqual(expected);
    }
    expect(requests[0]?.url).toBe(
      `https://api2.frontapp.com/tags?limit=10&page_token=${PAGE_TOKEN}&sort_by=name&sort_order=asc`,
    );
    expect(requests[1]?.url).toBe("https://api2.frontapp.com/tags/tag_123/children");
    expect(requests.every((req) => req.method === "GET")).toBe(true);
  });

  test("list follows nextPageUrl query parameters and ignores conflicting options", async () => {
    const nextPageUrl = `https://front.api.frontapp.com/tags?limit=1&sort_by=name&sort_order=asc&page_token=${PAGE_TOKEN}`;
    const { front, requests } = createMockClient(
      () =>
        jsonResponse({
          _pagination: { next: nextPageUrl },
          _results: [],
        }),
      { apiKey: "pagination-test-token" },
    );
    const firstPage = await front.tags.list({ limit: 1 });
    expect(firstPage.pagination?.next).toBe(nextPageUrl);
    expect(requests).toHaveLength(1);
    await front.tags.list({
      limit: 50,
      nextPageUrl: firstPage.pagination?.next ?? undefined,
      page_token: "ca5f1d906b3e47ac",
      sort_by: "updated_at",
      sort_order: "desc",
    });
    expect(requests).toHaveLength(2);
    expect(requests[1]?.url).toBe(
      `https://api2.frontapp.com/tags?limit=1&sort_by=name&sort_order=asc&page_token=${PAGE_TOKEN}`,
    );
    expect(requests[1]?.headers.get("Authorization")).toBe("Bearer pagination-test-token");
  });

  test.each([
    "not a URL",
    "https://front.api.frontapp.com/conversations?page_token=ca5f1d906b3e47ac",
    "file:///tags",
  ])("rejects invalid next-page URLs before making a request: %s", async (nextPageUrl) => {
    const { front, requests } = createMockClient();
    await expect(front.tags.list({ nextPageUrl })).rejects.toThrow();
    expect(requests).toHaveLength(0);
  });

  test("tagged conversation lists accept next-page URLs", async () => {
    const { front, requests } = createMockClient(() => jsonResponse({ _results: [] }));
    await front.tags.listTaggedConversations("tag_123", {
      limit: 50,
      nextPageUrl: `https://front.api.frontapp.com/tags/tag_123/conversations?limit=5&page_token=${PAGE_TOKEN}`,
      q: "statuses=archived",
    });
    expect(requests.map((req) => req.url)).toEqual([
      `https://api2.frontapp.com/tags/tag_123/conversations?limit=5&page_token=${PAGE_TOKEN}`,
    ]);
  });

  test("createChild returns data without fetching its parent", async () => {
    const response = tagResponse("tag_child", "Priority");
    const { front, requests } = createMockClient(() => jsonResponse(response, { status: 201 }));
    expect(await front.tags.createChild("tag_123", createParams)).toEqual(response);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/tags/tag_123/children");
    expect(await requests[0]?.json()).toEqual(createParams);
  });

  test("listTaggedConversations forwards query and preserves its envelope", async () => {
    const response = { _pagination: { next: null }, _results: [] };
    const { front, requests } = createMockClient(() => jsonResponse(response));
    expect(
      await front.tags.listTaggedConversations("tag_123", {
        limit: 5,
        page_token: PAGE_TOKEN,
        q: "statuses=archived",
      }),
    ).toEqual({ _results: [], pagination: { next: null } });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    const url = new URL(requests[0]?.url ?? "");
    expect(url.pathname).toBe("/tags/tag_123/conversations");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      limit: "5",
      page_token: PAGE_TOKEN,
      q: "statuses=archived",
    });
  });

  test("company tag creation returns plain data", async () => {
    const response = tagResponse("tag_123", "Priority");
    const { front, requests } = createMockClient(() => jsonResponse(response, { status: 201 }));
    expect(await front.company.createTag(createParams)).toEqual(response);
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/tags");
  });
});
