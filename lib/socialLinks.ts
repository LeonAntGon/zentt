export type SocialNetwork = "instagram" | "tiktok" | "youtube" | "facebook";

const NETWORK_HOSTS: Record<SocialNetwork, string[]> = {
  instagram: ["instagram.com", "www.instagram.com", "instagr.am"],
  tiktok: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  facebook: [
    "facebook.com",
    "www.facebook.com",
    "m.facebook.com",
    "fb.com",
    "www.fb.com",
    "fb.me",
  ],
};

const TRACKING_PARAM_PREFIXES = ["utm_", "igsh"];
const TRACKING_PARAMS = new Set([
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "igshid",
]);

function looksLikeUrl(raw: string): boolean {
  const v = raw.trim();
  if (!v) return false;
  if (/^https?:\/\//i.test(v) || /^www\./i.test(v)) return true;
  const lower = v.toLowerCase();
  const hosts = Object.values(NETWORK_HOSTS).flat();
  return hosts.some(
    (host) =>
      lower === host ||
      lower.startsWith(`${host}/`) ||
      lower.startsWith(`${host}?`)
  );
}

function ensureHttps(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function stripTrackingParams(url: string): string {
  try {
    const parsed = new URL(ensureHttps(url));
    for (const key of [...parsed.searchParams.keys()]) {
      const lower = key.toLowerCase();
      if (
        TRACKING_PARAMS.has(lower) ||
        TRACKING_PARAM_PREFIXES.some((prefix) => lower.startsWith(prefix))
      ) {
        parsed.searchParams.delete(key);
      }
    }
    return parsed.toString().replace(/\?$/, "");
  } catch {
    return url.trim();
  }
}

/** Valor a persistir: handle sin @, o URL con https y sin tracking. */
export function normalizeSocialValue(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (looksLikeUrl(value)) {
    return stripTrackingParams(ensureHttps(value));
  }
  return value.replace(/^@+/, "");
}

/** Href público: URL pegada tal cual (normalizada) o perfil de la red. */
export function socialHref(
  raw: string | null | undefined,
  network: SocialNetwork
): string | null {
  const normalized = normalizeSocialValue(raw || "");
  if (!normalized) return null;
  if (looksLikeUrl(normalized) || /^https?:\/\//i.test(normalized)) {
    return ensureHttps(normalized);
  }
  switch (network) {
    case "instagram":
      return `https://www.instagram.com/${normalized}/`;
    case "tiktok":
      return `https://www.tiktok.com/@${normalized}`;
    case "youtube":
      return `https://www.youtube.com/@${normalized}`;
    case "facebook":
      return `https://www.facebook.com/${normalized}`;
  }
}
