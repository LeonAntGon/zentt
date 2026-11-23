import type { MetadataRoute } from "next";
import { getBlogSiteUrl } from "@/lib/blog";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getBlogSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
