import {
  getBlogExcerpt,
  getBlogSiteUrl,
  getBlogUrl,
  getPublishedBlogs,
  type BlogPost,
} from "@/lib/blog";

export const revalidate = 300;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getBlogSiteUrl();

  let posts: BlogPost[] = [];
  try {
    posts = await getPublishedBlogs();
  } catch {
    posts = [];
  }

  const items = posts
    .map((post) => {
      const url = `${siteUrl}${getBlogUrl(post.slug)}`;
      const published = new Date(post.createdAt);
      const description = post.seoDescription?.trim() || getBlogExcerpt(post, 300);
      const categories = (post.blogcategory || [])
        .map((category) => `      <category>${escapeXml(category)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        Number.isNaN(published.getTime())
          ? ""
          : `      <pubDate>${published.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(description)}</description>`,
        categories,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog de Zentt</title>
    <link>${escapeXml(`${siteUrl}/blog`)}</link>
    <description>Reservas directas, marketing y gestión para alojamientos turísticos.</description>
    <language>es-AR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
