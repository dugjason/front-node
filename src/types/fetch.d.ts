/**
 * Global server-side fetch type shim.
 *
 * This SDK runs on Node with native `fetch`. We avoid adding the DOM lib,
 * so we provide a minimal global `BodyInit` type to satisfy generated code.
 */
declare global {
  // Minimal alias to satisfy casts like `as BodyInit | null | undefined`.
  // Use Node/undici's RequestInit body type so we don't need DOM libs.
  type BodyInit = RequestInit["body"]

  // Augment Headers so `headers.entries()` is available without DOM.Iterable lib
  interface Headers {
    entries(): IterableIterator<[string, string]>
  }
}

export {}
