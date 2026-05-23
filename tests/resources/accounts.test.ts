import { describe, expect, test } from "bun:test";

import { FrontAccount } from "../../src/index";
import { createMockClient, createTestSetup, jsonResponse } from "../helpers/setup";

describe("accounts", () => {
  test("accounts.list sends GET /accounts with query", async () => {
    const { front, requests } = createTestSetup();
    const rr = await front.accounts.list({ limit: 10, sort_by: "updated_at" });
    if (rr.pagination?.next) {
      await front.accounts.list({ page_token: rr.pagination.next });
    }
    const [listReq] = requests;
    expect(listReq?.method).toBe("GET");
    expect(listReq?.url).toBe("https://api2.frontapp.com/accounts?limit=10&sort_by=updated_at");
  });

  test("accounts.list normalizes pagination.next to page_token only", async () => {
    const { front } = createMockClient(() =>
      jsonResponse({
        _pagination: {
          next: "https://api2.frontapp.com/accounts?page_token=tok_list&limit=25",
        },
        _results: [],
      }),
    );
    const body = await front.accounts.list();
    expect(body.pagination?.next).toBe("tok_list");
  });

  test("accounts.get returns FrontAccount", async () => {
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/accounts/acc_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/accounts/acc_1" },
          custom_fields: {},
          description: "Paper",
          domains: ["dunder.com"],
          external_id: null,
          id: "acc_1",
          logo_url: null,
          name: "Dunder Mifflin",
        });
      }
      return jsonResponse({ _pagination: {}, _results: [] });
    });
    const account = await front.accounts.get("acc_1");
    expect(account).toBeInstanceOf(FrontAccount);
    expect(account.id).toBe("acc_1");
    expect(account.name).toBe("Dunder Mifflin");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/accounts/acc_1");
  });

  test("FrontAccount.update applies 200 response body", async () => {
    const { front } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/accounts/acc_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/accounts/acc_1" },
          custom_fields: {},
          description: "Old",
          domains: ["a.com"],
          external_id: null,
          id: "acc_1",
          logo_url: null,
          name: "Old Name",
        });
      }
      if (req.method === "PATCH" && url.endsWith("/accounts/acc_1")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/accounts/acc_1" },
          custom_fields: {},
          description: "New desc",
          domains: ["a.com", "b.com"],
          external_id: null,
          id: "acc_1",
          logo_url: null,
          name: "New Name",
        });
      }
      return jsonResponse({});
    });
    const account = await front.accounts.get("acc_1");
    await account.update({ name: "New Name" });
    expect(account.name).toBe("New Name");
    expect(account.description).toBe("New desc");
    expect(account.domains).toEqual(["a.com", "b.com"]);
  });
});
