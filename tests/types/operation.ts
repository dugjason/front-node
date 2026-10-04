import type { FrontBase } from "../../src/base";
import type { ChannelResponse } from "../../src/resources/channels";

/** Compiled by bun run check; never makes requests. */
export const checkOperationContracts = (base: FrontBase): void => {
  const channel: Promise<ChannelResponse> = base.requestOperation("get-channel", {
    path: { channel_id: "cha_123" },
  });
  const updated: Promise<void> = base.requestOperation("update-channel", {
    body: { name: "Support" },
    path: { channel_id: "cha_123" },
  });
  void channel;
  void updated;
  // @ts-expect-error Channels declare no query parameters.
  void base.requestOperation("list-channels", { query: { limit: 10 } });
  void base.requestOperation("list-channels", {
    // @ts-expect-error Channels declare no page_token capability.
    nextPageUrl: "https://api2.frontapp.com/channels",
  });
  // @ts-expect-error Required path parameters cannot be omitted.
  void base.requestOperation("get-channel");
  // @ts-expect-error Operation path parameters use schema field names.
  void base.requestOperation("get-channel", { path: { tag_id: "tag_123" } });
  // @ts-expect-error Create tag requires a request body.
  void base.requestOperation("create-tag");
  void base.requestOperation("create-a-channel", {
    // @ts-expect-error Create channel requires a channel type.
    body: { name: "Support" },
    path: { inbox_id: "inb_123" },
  });
  // @ts-expect-error GET operations do not accept bodies.
  void base.requestOperation("list-tags", { body: { name: "Priority" } });
  // @ts-expect-error Unknown query fields are rejected.
  void base.requestOperation("list-tags", { query: { starting_after: "tag_123" } });
  // @ts-expect-error Response types come from the schema, not the caller.
  const wrong: Promise<string> = base.requestOperation("get-channel", {
    path: { channel_id: "cha_123" },
  });
  void wrong;
  void base.requestOperation("list-tags", {
    nextPageUrl: "https://api2.frontapp.com/tags",
    query: { limit: 10 },
  });
  void base.requestOperation("update-a-tag", {
    body: { parent_tag_id: null },
    path: { tag_id: "tag_123" },
  });
};
