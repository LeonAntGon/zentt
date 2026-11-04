const configuredPublicSiteUrl =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "https://zentt.agency";

export const PUBLIC_SITE_URL = configuredPublicSiteUrl.replace(/\/$/, "");

export function getPublicSiteUrl(
  slug?: string | null,
  customDomain?: string | null
): string {
  const domain = (customDomain || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  if (domain) return `https://${domain}`;
  return slug ? `${PUBLIC_SITE_URL}/${encodeURIComponent(slug)}` : "";
}

export function getPublicDisplayUrl(
  slug?: string | null,
  customDomain?: string | null
): string {
  const domain = (customDomain || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  if (domain) return domain;
  return slug ? `${PUBLIC_SITE_URL.replace(/^https?:\/\//i, "")}/${slug}` : "";
}
