/** Global `BodyInit` for generated client code; @types/node does not declare it globally. */
import type { BodyInit as UndiciBodyInit } from "undici-types";

declare global {
  type BodyInit = UndiciBodyInit;
}
