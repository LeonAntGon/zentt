/** Canonical username: trim → lower → spaces to '-' → collapse '--' → strip edge '-'. */
export function normalizeUsername(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Live typing for public URL: drop invalid chars, keep a trailing '-'. */
export function normalizeUsernameLive(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "");
}

export const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "app",
  "accounts",
  "cabanas",
  "configuracion",
  "dashboard",
  "forgot-password",
  "help",
  "login",
  "logout",
  "media",
  "perfil",
  "privacy",
  "public",
  "register",
  "reset-password",
  "static",
  "support",
  "terms",
  "www",
  "zentt",
]);

export function getUsernameError(value: string): string | null {
  const normalized = normalizeUsername(value);
  if (!normalized) return "Ingresá un nombre de usuario válido.";
  if (normalized.length < 2) return "El nombre de usuario es demasiado corto.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    return "Usá solo letras minúsculas, números y guiones.";
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    return "Este nombre no está disponible.";
  }
  return null;
}
