import type {
  Front,
  AccountResponse,
  CreateAccountParams,
  UpdateMessageTemplateParams,
  UpdateSignatureParams,
} from "../../src/index";

/** Compiled by bun run check; never executes requests. */
export const checkResourceContracts = (front: Front): void => {
  const account: Promise<AccountResponse> = front.accounts.get("acc_123");
  const params: CreateAccountParams = { domains: ["example.com"], name: "Acme" };
  void account;
  void front.accounts.create(params);
  void front.accounts.list({ limit: 20, nextPageUrl: "https://api2.frontapp.com/accounts" });
  void front.knowledgeBaseArticles.getContentLocale("kba_123", "en");
  void front.drafts.delete("msg_123");
  void front.drafts.delete("msg_123", { version: "1" });
  // @ts-expect-error Creating an account requires explicit request parameters.
  void front.accounts.create();
  // @ts-expect-error Rules have no query parameters.
  void front.rules.list({ limit: 10 });
  // @ts-expect-error Template lists support sorting but have no page_token parameter.
  void front.messageTemplates.list({ nextPageUrl: "https://api2.frontapp.com/message_templates" });
  // @ts-expect-error Scoped channel lists have no query parameters.
  void front.teams.listChannels("tim_123", { limit: 10 });
  // @ts-expect-error Signature updates require the documented default flag.
  const invalidSignature: UpdateSignatureParams = { name: "Support" };
  void invalidSignature;
  const template: UpdateMessageTemplateParams = { body: "Updated" };
  void front.messageTemplates.update("rsp_123", template);
  // @ts-expect-error Template updates require explicit parameters.
  void front.messageTemplates.update("rsp_123");
  void front.requestOperationRaw("download-attachment", {
    path: { attachment_link_id: "att_123" },
    // @ts-expect-error Raw downloads cannot drop supplied query parameters.
    query: { limit: 2 },
  });
};
