const configuredPublicSiteUrl =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "https://zentt.agency";

export const PUBLIC_SITE_URL = configuredPublicSiteUrl.replace(/\/$/, "");

export function getPublicSiteUrl(slug?: string | null): string {
  return slug ? `${PUBLIC_SITE_URL}/${encodeURIComponent(slug)}` : "";
}
