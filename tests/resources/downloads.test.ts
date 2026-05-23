import { describe, expect, test } from "bun:test";

import { createMockClient } from "../helpers/setup";

describe("downloads", () => {
  test("downloads.download sends GET without JSON parsing", async () => {
    const { front, requests } = createMockClient(
      () => new Response(new Uint8Array([9, 9]), { status: 200 }),
    );
    const res = await front.downloads.download("att_lnk_1");
    expect(res.ok).toBe(true);
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([9, 9]));
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/download/att_lnk_1");
  });
});
