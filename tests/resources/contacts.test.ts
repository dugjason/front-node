import { describe, expect, test } from "bun:test";

import { createTestSetup } from "../helpers/setup";

describe("contacts and events", () => {
  test("contacts.list and events.list forward query params", async () => {
    const { front, requests } = createTestSetup();
    await front.contacts.list({ limit: 3, q: "jane" });
    await front.events.list({ limit: 5, sort_order: "desc" });
    const contactsUrl = new URL(requests[0]?.url ?? "");
    expect(contactsUrl.pathname).toBe("/contacts");
    expect(Object.fromEntries(contactsUrl.searchParams)).toEqual({
      limit: "3",
      q: "jane",
    });
    const eventsUrl = new URL(requests[1]?.url ?? "");
    expect(eventsUrl.pathname).toBe("/events");
    expect(Object.fromEntries(eventsUrl.searchParams)).toEqual({
      limit: "5",
      sort_order: "desc",
    });
  });
});
