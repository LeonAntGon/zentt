import type { MetadataRoute } from "next";
import { getBlogSiteUrl, getPublishedBlogs, type BlogPost } from "@/lib/blog";

function postDate(post: BlogPost) {
  const date = new Date(post.updatedAt || post.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function keepLatest(map: Map<string, Date>, key: string, date: Date | null) {
  if (!date) return;
  const current = map.get(key);
  if (!current || date > current) map.set(key, date);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getBlogSiteUrl();

  let posts: BlogPost[] = [];
  try {
    posts = await getPublishedBlogs();
  } catch {
    posts = [];
  }

  const latestPostDate = posts.reduce<Date | null>((latest, post) => {
    const date = postDate(post);
    if (!date) return latest;
    return !latest || date > latest ? date : latest;
  }, null);

  const categories = new Map<string, Date>();
  const tags = new Map<string, Date>();

  for (const post of posts) {
    const date = postDate(post);
    for (const category of post.blogcategory || []) keepLatest(categories, category, date);
    for (const tag of post.tags || []) keepLatest(tags, tag, date);
  }

  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: latestPostDate ?? undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: postDate(post) ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...[...categories].map(([slug, lastModified]) => ({
      url: `${siteUrl}/blog/categoria/${encodeURIComponent(slug)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...[...tags].map(([slug, lastModified]) => ({
      url: `${siteUrl}/blog/etiqueta/${encodeURIComponent(slug)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
