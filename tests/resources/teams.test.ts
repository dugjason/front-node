import { describe, expect, test } from "bun:test";

import type { CreateTeamTagParams, TagResponse } from "../../src/index";
import { PAGE_TOKEN } from "../helpers/pagination";
import { createMockClient, jsonResponse } from "../helpers/setup";

const tag: TagResponse = {
  _links: { self: "https://api2.frontapp.com/tags/tag_123" },
  description: "",
  highlight: "red",
  id: "tag_123",
  is_private: false,
  is_visible_in_conversation_lists: true,
  name: "Priority",
};

describe("team tags", () => {
  test.each([
    "not a URL",
    `https://api2.frontapp.com/teams/tim_other/tags?page_token=${PAGE_TOKEN}`,
  ])("rejects invalid next-page URLs before sending a request: %s", async (nextPageUrl) => {
    const { front, requests } = createMockClient();
    await expect(front.teams.listTags("tim_123", { nextPageUrl })).rejects.toThrow();
    expect(requests).toHaveLength(0);
  });

  test("listTags sends team ID and query parameters and returns the page", async () => {
    const nextPageUrl = `https://api2.frontapp.com/teams/tim_123/tags?limit=2&page_token=${PAGE_TOKEN}`;
    const { front, requests } = createMockClient(() =>
      jsonResponse({
        _pagination: { next: nextPageUrl },
        _results: [tag],
      }),
    );
    expect(
      await front.teams.listTags("tim_123", {
        limit: 2,
        page_token: PAGE_TOKEN,
        sort_by: "name",
        sort_order: "asc",
      }),
    ).toEqual({ _results: [tag], pagination: { next: nextPageUrl } });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe(
      `https://api2.frontapp.com/teams/tim_123/tags?limit=2&page_token=${PAGE_TOKEN}&sort_by=name&sort_order=asc`,
    );
  });

  test("listTags uses nextPageUrl parameters over conflicting options", async () => {
    const { front, requests } = createMockClient(() => jsonResponse({ _results: [] }));
    await front.teams.listTags("tim_123", {
      limit: 50,
      nextPageUrl: `https://front.api.frontapp.com/teams/tim_123/tags?limit=2&sort_by=name&sort_order=asc&page_token=${PAGE_TOKEN}`,
      page_token: "ca5f1d906b3e47ac",
      sort_by: "updated_at",
      sort_order: "desc",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe(
      `https://api2.frontapp.com/teams/tim_123/tags?limit=2&sort_by=name&sort_order=asc&page_token=${PAGE_TOKEN}`,
    );
  });

  test("createTag posts request parameters to the encoded team path and returns tag data", async () => {
    const { front, requests } = createMockClient(() => jsonResponse(tag, { status: 201 }));
    const params: CreateTeamTagParams = {
      is_visible_in_conversation_lists: true,
      name: "Priority",
    };
    expect(await front.teams.createTag("tim/123", params)).toEqual(tag);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/teams/tim%2F123/tags");
    expect(await requests[0]?.json()).toEqual(params);
  });
});
