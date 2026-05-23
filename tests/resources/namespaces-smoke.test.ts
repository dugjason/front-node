import { describe, expect, test } from "bun:test";

import { createTestSetup } from "../helpers/setup";

describe("Front namespaces (smoke)", () => {
  test("list-style namespaces send GET to expected paths", async () => {
    const { front, requests } = createTestSetup();
    await Promise.all([
      front.contactLists.list(),
      front.contacts.list(),
      front.conversations.list(),
      front.customFieldsGlobal.list(),
      front.events.list(),
      front.inboxes.list(),
      front.knowledgeBases.list(),
      front.links.list(),
      front.messageTemplateFolders.list(),
      front.messageTemplates.list(),
      front.rules.list(),
      front.shifts.list(),
      front.teammateGroups.list(),
      front.teams.listTeams(),
      front.views.list(),
    ]);

    const urls = requests.map((r) => r.url).toSorted();
    expect(requests).toHaveLength(15);
    expect(requests.every((r) => r.method === "GET")).toBe(true);
    expect(requests.every((r) => r.headers.get("Authorization") === "Bearer test-token")).toBe(
      true,
    );
    expect(urls).toEqual(
      [
        "https://api2.frontapp.com/contact_lists",
        "https://api2.frontapp.com/contacts",
        "https://api2.frontapp.com/conversations",
        "https://api2.frontapp.com/custom_fields",
        "https://api2.frontapp.com/events",
        "https://api2.frontapp.com/inboxes",
        "https://api2.frontapp.com/knowledge_bases",
        "https://api2.frontapp.com/links",
        "https://api2.frontapp.com/message_template_folders",
        "https://api2.frontapp.com/message_templates",
        "https://api2.frontapp.com/rules",
        "https://api2.frontapp.com/shifts",
        "https://api2.frontapp.com/teammate_groups",
        "https://api2.frontapp.com/teams",
        "https://api2.frontapp.com/views",
      ].toSorted(),
    );
  });
});
