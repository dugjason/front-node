import { expect, test } from "bun:test";
import type { Front } from "../../src/front";
import { PAGE_TOKEN } from "../helpers/pagination";
import type { PaginationInfo } from "../../src/normalize-response";
import { createMockClient, jsonResponse } from "../helpers/setup";

const cases: {
  name: string;
  path: string;
  call: (
    front: Front,
    nextPageUrl: string,
  ) => Promise<{ _results?: object[]; pagination?: PaginationInfo }>;
}[] = [
  {
    call: (front, nextPageUrl) =>
      front.accounts.list({ limit: 25, nextPageUrl, sort_by: "created_at", sort_order: "asc" }),
    name: "accounts.list",
    path: "/accounts",
  },
  {
    call: (front, nextPageUrl) =>
      front.accounts.listContacts("acc_123", {
        limit: 25,
        nextPageUrl,
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "accounts.listContacts",
    path: "/accounts/acc_123/contacts",
  },
  {
    call: (front, nextPageUrl) =>
      front.contactLists.listContacts("ctl_123", { limit: 25, nextPageUrl }),
    name: "contactLists.listContacts",
    path: "/contact_lists/ctl_123/contacts",
  },
  {
    call: (front, nextPageUrl) =>
      front.contacts.list({
        limit: 25,
        nextPageUrl,
        q: "Example",
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "contacts.list",
    path: "/contacts",
  },
  {
    call: (front, nextPageUrl) =>
      front.contacts.listConversations("ctc_123", { limit: 25, nextPageUrl, q: "Example" }),
    name: "contacts.listConversations",
    path: "/contacts/ctc_123/conversations",
  },
  {
    call: (front, nextPageUrl) =>
      front.conversations.list({
        limit: 25,
        nextPageUrl,
        q: "Example",
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "conversations.list",
    path: "/conversations",
  },
  {
    call: (front, nextPageUrl) =>
      front.conversations.search("open priority", { limit: 25, nextPageUrl }),
    name: "conversations.search",
    path: "/conversations/search/open%20priority",
  },
  {
    call: (front, nextPageUrl) =>
      front.conversations.listEvents("cnv_123", { limit: 25, nextPageUrl }),
    name: "conversations.listEvents",
    path: "/conversations/cnv_123/events",
  },
  {
    call: (front, nextPageUrl) =>
      front.conversations.listMessages("cnv_123", {
        limit: 25,
        nextPageUrl,
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "conversations.listMessages",
    path: "/conversations/cnv_123/messages",
  },
  {
    call: (front, nextPageUrl) =>
      front.events.list({
        limit: 25,
        nextPageUrl,
        q: "Example",
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "events.list",
    path: "/events",
  },
  {
    call: (front, nextPageUrl) =>
      front.inboxes.listConversations("inb_123", { limit: 25, nextPageUrl, q: "Example" }),
    name: "inboxes.listConversations",
    path: "/inboxes/inb_123/conversations",
  },
  {
    call: (front, nextPageUrl) =>
      front.links.list({
        limit: 25,
        nextPageUrl,
        q: "Example",
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "links.list",
    path: "/links",
  },
  {
    call: (front, nextPageUrl) =>
      front.links.listConversations("lnk_123", {
        limit: 25,
        nextPageUrl,
        q: "Example",
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "links.listConversations",
    path: "/links/lnk_123/conversations",
  },
  {
    call: (front, nextPageUrl) => front.views.list({ limit: 25, nextPageUrl }),
    name: "views.list",
    path: "/views",
  },
  {
    call: (front, nextPageUrl) =>
      front.knowledgeBases.listArticles("knb_123", { limit: 25, nextPageUrl }),
    name: "knowledgeBases.listArticles",
    path: "/knowledge_bases/knb_123/articles",
  },
  {
    call: (front, nextPageUrl) =>
      front.knowledgeBases.listCategories("knb_123", { limit: 25, nextPageUrl }),
    name: "knowledgeBases.listCategories",
    path: "/knowledge_bases/knb_123/categories",
  },
  {
    call: (front, nextPageUrl) =>
      front.knowledgeBaseCategories.listArticles("kbc_123", { limit: 25, nextPageUrl }),
    name: "knowledgeBaseCategories.listArticles",
    path: "/knowledge_base_categories/kbc_123/articles",
  },
  {
    call: (front, nextPageUrl) =>
      front.teams.listContacts("tim_123", {
        limit: 25,
        nextPageUrl,
        q: "Example",
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "teams.listContacts",
    path: "/teams/tim_123/contacts",
  },
  {
    call: (front, nextPageUrl) =>
      front.teams.listTags("tim_123", {
        limit: 25,
        nextPageUrl,
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "teams.listTags",
    path: "/teams/tim_123/tags",
  },
  {
    call: (front, nextPageUrl) => front.teams.listViews("tim_123", { limit: 25, nextPageUrl }),
    name: "teams.listViews",
    path: "/teams/tim_123/views",
  },
  {
    call: (front, nextPageUrl) =>
      front.teammates.listAssignedConversations("tea_123", {
        limit: 25,
        nextPageUrl,
        q: "Example",
      }),
    name: "teammates.listAssignedConversations",
    path: "/teammates/tea_123/conversations",
  },
  {
    call: (front, nextPageUrl) =>
      front.teammates.listContacts("tea_123", {
        limit: 25,
        nextPageUrl,
        q: "Example",
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "teammates.listContacts",
    path: "/teammates/tea_123/contacts",
  },
  {
    call: (front, nextPageUrl) =>
      front.teammates.listTags("tea_123", {
        limit: 25,
        nextPageUrl,
        sort_by: "created_at",
        sort_order: "asc",
      }),
    name: "teammates.listTags",
    path: "/teammates/tea_123/tags",
  },
];

test.each(cases)("$name follows the next URL and preserves its page envelope", async (endpoint) => {
  const nextPageUrl = `https://front.api.frontapp.com${endpoint.path}?limit=2&page_token=${PAGE_TOKEN}`;
  const { front, requests } = createMockClient(() =>
    jsonResponse({ _pagination: { next: nextPageUrl }, _results: [] }),
  );
  expect(await endpoint.call(front, nextPageUrl)).toEqual({
    _results: [],
    pagination: { next: nextPageUrl },
  });
  expect(requests).toHaveLength(1);
  expect(requests[0]?.url).toBe(
    `https://api2.frontapp.com${endpoint.path}?limit=2&page_token=${PAGE_TOKEN}`,
  );
});

test.each(cases)("$name rejects a next URL for a different endpoint", async (endpoint) => {
  const { front, requests } = createMockClient();
  await expect(
    endpoint.call(front, `https://api2.frontapp.com/other?page_token=${PAGE_TOKEN}`),
  ).rejects.toThrow();
  expect(requests).toHaveLength(0);
});
