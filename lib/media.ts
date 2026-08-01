const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_URL ||
  API_URL.replace(/\/api\/?$/, "");

export function getMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${MEDIA_BASE_URL}${url}`;
}
