import { describe, expect, test } from "bun:test";

import { createMockClient, createTestSetup, jsonResponse } from "../helpers/setup";

describe("company", () => {
  test("company.listRules sends GET /company/rules", async () => {
    const { front, requests } = createTestSetup();
    await front.company.listRules();
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/rules");
  });

  test("company.listTags forwards query params", async () => {
    const { front, requests } = createTestSetup();
    await front.company.listTags({ limit: 5, sort_order: "asc" });
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/company/tags?limit=5&sort_order=asc");
  });

  test("company.createTag posts to /company/tags", async () => {
    const { front, requests } = createMockClient((req) => {
      if (req.method === "POST" && req.url === "https://api2.frontapp.com/company/tags") {
        return jsonResponse(
          {
            _links: { self: "https://api2.frontapp.com/tags/tag_new" },
            description: "",
            highlight: null,
            id: "tag_new",
            is_private: false,
            is_visible_in_conversation_lists: true,
            name: "New",
          },
          { status: 201 },
        );
      }
      return jsonResponse({});
    });
    const tag = await front.company.createTag({
      highlight: "grey",
      is_visible_in_conversation_lists: true,
      name: "New",
    });
    expect(tag.id).toBe("tag_new");
    expect(requests[0]?.method).toBe("POST");
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
