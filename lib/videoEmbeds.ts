export type VideoProveedor = "youtube" | "instagram" | "facebook";

export type ParsedSocialVideo = {
  provider: VideoProveedor;
  embedUrl: string;
  originalUrl: string;
};

function hostOf(url: URL): string {
  let host = url.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  if (host.startsWith("m.")) host = host.slice(2);
  return host;
}

function youtubeId(url: URL): string | null {
  const host = hostOf(url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" && parts[0]) return parts[0];

  if (
    parts[0] &&
    ["embed", "shorts", "live", "v"].includes(parts[0]) &&
    parts[1]
  ) {
    return parts[1];
  }

  return url.searchParams.get("v");
}

function instagramPath(url: URL): { kind: string; code: string } | null {
  const parts = url.pathname.split("/").filter(Boolean);
  if (
    parts.length >= 2 &&
    ["p", "reel", "reels", "tv"].includes(parts[0]) &&
    parts[1]
  ) {
    const kind = parts[0] === "reels" ? "reel" : parts[0];
    return { kind, code: parts[1] };
  }
  return null;
}

/** Client-side parse for embeds. Returns null if URL is not supported. */
export function parseSocialVideoUrl(
  url: string
): ParsedSocialVideo | null {
  const originalUrl = (url || "").trim();
  if (!originalUrl) return null;

  let parsed: URL;
  try {
    parsed = new URL(originalUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  const host = hostOf(parsed);

  if (
    host === "youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com"
  ) {
    const id = youtubeId(parsed);
    if (!id) return null;
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${encodeURIComponent(id)}`,
      originalUrl,
    };
  }

  if (host === "instagram.com") {
    const ig = instagramPath(parsed);
    if (!ig) return null;
    return {
      provider: "instagram",
      embedUrl: `https://www.instagram.com/${ig.kind}/${encodeURIComponent(ig.code)}/embed`,
      originalUrl,
    };
  }

  if (
    host === "facebook.com" ||
    host === "fb.com" ||
    host === "fb.watch" ||
    host.endsWith(".facebook.com")
  ) {
    const href = encodeURIComponent(originalUrl);
    return {
      provider: "facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${href}&show_text=0`,
      originalUrl,
    };
  }

  return null;
}

/** Lightweight client check before calling the API (create form). */
export function isAllowedSocialVideoUrl(url: string): boolean {
  return parseSocialVideoUrl(url) !== null;
}
