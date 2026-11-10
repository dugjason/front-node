import type { components } from "./gen/schema.gen";

type Message = components["schemas"]["MessageResponse"];
type Event = components["schemas"]["EventResponse"];

// Front lists these message targets at https://dev.frontapp.com/reference/events
const messageTargetEvents = new Set<Event["type"]>([
  "forward",
  "inbound",
  "message_bounce_error",
  "out_reply",
  "outbound",
  "sending_error",
]);

export const normalizeMessageAuthor = (message: Message): Message =>
  message && message.author === undefined ? { ...message, author: null } : message;

export const normalizeEventMessageAuthor = (event: Event): Event => {
  const target = event?.target;
  if (!target?.data) {
    return event;
  }
  const targetType = target._meta?.type;
  const isMessage =
    targetType === "message" || (targetType === undefined && messageTargetEvents.has(event.type));
  if (!isMessage) {
    return event;
  }
  return { ...event, target: { ...target, data: normalizeMessageAuthor(target.data as Message) } };
};

export const normalizeResponseResults = <Item, Page extends { _results?: Item[] }>(
  page: Page,
  normalize: (item: Item) => Item,
): Page => (page?._results ? { ...page, _results: page._results.map(normalize) } : page);
