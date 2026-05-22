import { describe, expect, test } from "bun:test";

import { FrontSignature } from "../../src/index";
import { createMockClient, createTestSetup, jsonResponse } from "../helpers/setup";

describe("signatures", () => {
  test("signatures.get returns FrontSignature and sends GET /signatures/{id}", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({
        _links: { self: "https://api2.frontapp.com/signatures/sig_abc" },
        body: "<p>Hi</p>",
        channel_ids: null,
        id: "sig_abc",
        is_default: true,
        is_private: true,
        is_visible_for_all_teammate_channels: false,
        name: "Default",
        sender_info: null,
      }),
    );

    const sig = await front.signatures.get("sig_abc");

    expect(sig).toBeInstanceOf(FrontSignature);
    expect(sig.id).toBe("sig_abc");
    expect(sig.name).toBe("Default");
    expect(sig.body).toBe("<p>Hi</p>");
    expect(sig.isPrivate).toBe(true);
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/signatures/sig_abc");
  });

  test("FrontSignature.save sends PATCH and applies 200 response body", async () => {
    const { front, requests } = createMockClient((req) => {
      const { url } = req;
      if (req.method === "GET" && url.endsWith("/signatures/sig_abc")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/signatures/sig_abc" },
          body: "<p>old</p>",
          channel_ids: ["cha_1"],
          id: "sig_abc",
          is_default: false,
          is_private: false,
          is_visible_for_all_teammate_channels: true,
          name: "Old",
          sender_info: "Acme",
        });
      }
      if (req.method === "PATCH" && url.endsWith("/signatures/sig_abc")) {
        return jsonResponse({
          _links: { self: "https://api2.frontapp.com/signatures/sig_abc" },
          body: "<p>new</p>",
          channel_ids: ["cha_1"],
          id: "sig_abc",
          is_default: false,
          is_private: false,
          is_visible_for_all_teammate_channels: true,
          name: "New",
          sender_info: "Acme",
        });
      }
      return jsonResponse({});
    });

    const sig = await front.signatures.get("sig_abc");
    sig.name = "New";
    await sig.save();

    const patch = requests.find((r) => r.method === "PATCH");
    expect(patch?.url).toBe("https://api2.frontapp.com/signatures/sig_abc");
    expect(sig.name).toBe("New");
    expect(sig.body).toBe("<p>new</p>");
  });

  test("signatures.listTeammate sends GET /teammates/{id}/signatures", async () => {
    const { front, requests } = createTestSetup();
    await front.signatures.listTeammate("tea_1");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/teammates/tea_1/signatures");
  });
});
