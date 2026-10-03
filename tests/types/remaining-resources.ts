import type {
  Front,
  TimeOffResponse,
  CreateTimeOffParams,
  CreateTeammatePrivateInboxParams,
} from "../../src/index";

/** Checked by TypeScript, without making requests. */
export const checkRemainingResourceContracts = (front: Front): void => {
  const params: CreateTimeOffParams = { end_at: null, name: "Vacation", start_at: 1_700_000_000 };
  const result: Promise<TimeOffResponse> = front.teammates.createTimeOff("tea_123", params);
  const inbox: CreateTeammatePrivateInboxParams = { name: "Private inbox" };
  void result;
  void front.teammates.createPrivateInbox("tea_123", inbox);
  void front.timeOffs.update("vcr_123", { end_at: null });
  void front.conversations.listLinkedConversations("cnv_123", {
    nextPageUrl: "https://api2.frontapp.com/conversations/cnv_123/linked_conversations",
  });
  // @ts-expect-error Time off creation requires its start timestamp.
  void front.teammates.createTimeOff("tea_123", { name: "Vacation" });
  // @ts-expect-error Private inbox creation requires its name.
  void front.teammates.createPrivateInbox("tea_123", {});
  // @ts-expect-error Private inbox lists declare no query or pagination parameters.
  void front.teammates.listPrivateInboxes("tea_123", {
    nextPageUrl: "https://api2.frontapp.com/teammates/tea_123/private_inboxes",
  });
  // @ts-expect-error Linked-conversation lists do not declare sorting parameters.
  void front.conversations.listLinkedConversations("cnv_123", { sort_by: "created_at" });
};
