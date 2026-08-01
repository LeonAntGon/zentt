/** Canonical username: trim → lower → spaces to '-' → collapse '--' → strip edge '-'. */
export function normalizeUsername(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Live typing: keep a trailing '-' so the user can continue the next word. */
export function normalizeUsernameLive(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "");
}
