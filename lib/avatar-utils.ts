const AVATAR_COLORS = [
  "#4285F4",
  "#DB4437",
  "#F4B400",
  "#0F9D58",
  "#AB47BC",
  "#00ACC1",
  "#FF7043",
  "#5C6BC0",
] as const;

export function getAvatarColor(seed: string): string {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null
): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";

  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }

  const seed = fallback?.trim() ?? "";
  if (!seed) return "?";
  if (seed.includes("@")) return seed.charAt(0).toUpperCase();
  return seed.slice(0, 2).toUpperCase();
}

export function getBusinessInitials(nombreNegocio?: string | null): string {
  const name = nombreNegocio?.trim();
  if (!name) return "ZN";

  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
