import type { MetadataRoute } from "next";
import { getBlogSiteUrl, getPublishedBlogs } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getBlogSiteUrl();
  const posts = await getPublishedBlogs();
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
