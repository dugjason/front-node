import { expectTypeOf, test } from "bun:test";

import type { components } from "../src/gen/schema.gen";
import type {
  ConversationResponse,
  FrontEvents,
  FrontMessages,
  MessageResponse,
  StatusResponse,
  TeammateResponse,
} from "../src/index";

test("response types preserve nullable references and the required closed flag", () => {
  expectTypeOf<MessageResponse["author"]>().toEqualTypeOf<TeammateResponse | null>();
  expectTypeOf<ConversationResponse["assignee"]>().toEqualTypeOf<TeammateResponse | null>();
  expectTypeOf<ConversationResponse["recipient"]>().toEqualTypeOf<
    components["schemas"]["RecipientResponse"] | null
  >();
  type SeenReceipt = NonNullable<Awaited<ReturnType<FrontMessages["getSeen"]>>["_results"]>[number];
  expectTypeOf<SeenReceipt["seen_by"]>().toEqualTypeOf<
    components["schemas"]["ContactHandle"] | null
  >();
  expectTypeOf<SeenReceipt["first_seen_at"]>().toEqualTypeOf<number>();
  expectTypeOf<ConversationResponse["is_closed"]>().toEqualTypeOf<boolean>();
});

test("the public event response accepts a ticket status target", () => {
  type Event = Awaited<ReturnType<FrontEvents["get"]>>;
  type Schemas = components["schemas"];
  type TargetData = NonNullable<Event["target"]>["data"];
  expectTypeOf<TargetData>().toEqualTypeOf<
    | TeammateResponse
    | Schemas["InboxResponse"]
    | Schemas["TagResponse"]
    | Schemas["CommentResponse"]
    | MessageResponse
    | Schemas["LinkResponse"]
    | StatusResponse
    | undefined
  >();
});
