import { describe, expect, test } from "bun:test";

import { FrontMessage } from "../../src/index";
import { createMockClient, jsonResponse } from "../helpers/setup";

describe("messages", () => {
  test("messages.get returns FrontMessage and loads JSON", async () => {
    const { front, requests } = createMockClient(() =>
      jsonResponse({ id: "msg_1", type: "email" }),
    );
    const m = await front.messages.get("msg_1");
    expect(m).toBeInstanceOf(FrontMessage);
    expect(m.data?.id).toBe("msg_1");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/messages/msg_1");
  });
});
