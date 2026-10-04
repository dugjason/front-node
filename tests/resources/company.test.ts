import { describe, expect, test } from "bun:test";

import type { CreateCompanyTagParams, ListCompanyTagsParams, TagResponse } from "../../src/index";
import { PAGE_TOKEN } from "../helpers/pagination";
import { createMockClient, createTestSetup, jsonResponse } from "../helpers/setup";

const companyTag: TagResponse = {
  _links: { self: "https://api2.frontapp.com/tags/tag_new" },
  description: "",
  highlight: null,
  id: "tag_new",
  is_private: false,
  is_visible_in_conversation_lists: true,
  name: "New",
};

describe("company", () => {
  test.each(["not a URL", `https://api2.frontapp.com/tags?page_token=${PAGE_TOKEN}`])(
    "rejects invalid next-page URLs before sending a request: %s",
    async (nextPageUrl) => {
      const { front, requests } = createMockClient();
      await expect(front.company.listTags({ nextPageUrl })).rejects.toThrow();
      expect(requests).toHaveLength(0);
    },
  );

  test("company.listRules sends GET /company/rules", async () => {
    const { front, requests } = createTestSetup();
    await front.company.listRules();
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/rules");
  });

  test("company.listTags forwards parameters and returns the page", async () => {
    const nextPageUrl = `https://front.api.frontapp.com/company/tags?limit=5&page_token=${PAGE_TOKEN}`;
    const response = {
      _links: { self: "https://api2.frontapp.com/company/tags" },
      _pagination: { next: nextPageUrl },
      _results: [companyTag],
    };
    const { front, requests } = createMockClient(() => jsonResponse(response));
    const params: ListCompanyTagsParams = {
      limit: 5,
      page_token: PAGE_TOKEN,
      sort_by: "name",
      sort_order: "asc",
    };
    const page = await front.company.listTags(params);
    expect(page).toEqual({
      _links: response._links,
      _results: [companyTag],
      pagination: { next: nextPageUrl },
    });
    expect(page.pagination?.next).toBe(nextPageUrl);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe(
      `https://api2.frontapp.com/company/tags?limit=5&page_token=${PAGE_TOKEN}&sort_by=name&sort_order=asc`,
    );
  });

  test("company.listTags follows nextPageUrl and ignores conflicting parameters", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({ _pagination: { next: null }, _results: [] }),
    );
    expect(
      await front.company.listTags({
        limit: 50,
        nextPageUrl: `https://front.api.frontapp.com/company/tags?limit=5&sort_by=name&sort_order=asc&page_token=${PAGE_TOKEN}`,
        page_token: "ca5f1d906b3e47ac",
        sort_by: "updated_at",
        sort_order: "desc",
      }),
    ).toEqual({ _results: [], pagination: { next: null } });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe(
      `https://api2.frontapp.com/company/tags?limit=5&sort_by=name&sort_order=asc&page_token=${PAGE_TOKEN}`,
    );
  });

  test("company.createTag sends the payload and returns tag data", async () => {
    const { front, requests } = createMockClient(() => jsonResponse(companyTag, { status: 201 }));
    const params: CreateCompanyTagParams = {
      highlight: "grey",
      is_visible_in_conversation_lists: true,
      name: "New",
    };
    expect(await front.company.createTag(params)).toEqual(companyTag);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/tags");
    expect(await requests[0]?.json()).toEqual(params);
  });

  test("company.getTicketStatus sends GET /company/statuses/{id}", async () => {
    const { front, requests } = createMockClient((req) => {
      if (req.method === "GET" && req.url.endsWith("/company/statuses/sts_1")) {
        return jsonResponse({
          _links: {
            self: "https://api2.frontapp.com/company/statuses/sts_1",
          },
          category: "open",
          description: null,
          id: "sts_1",
          name: "Open",
        });
      }
      return jsonResponse({});
    });
    const st = await front.company.getTicketStatus("sts_1");
    expect(st.id).toBe("sts_1");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/statuses/sts_1");
  });
});
