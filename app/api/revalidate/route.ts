import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Webhook de revalidación on-demand (mismo secret BLOG_REVALIDATE_SECRET).
 *
 * - Blog (CMS): body `{ slug?: string }` -> revalida rutas del blog.
 * - Sitios públicos (backend Django): body `{ sites: string[] }` o
 *   `{ site: string }` -> revalidateTag(`site-<slug>`) para la página del
 *   cliente y las fichas de sus cabañas. No toca el blog.
 */
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,149}$/i;
export async function POST(request: NextRequest) {
  const expected = process.env.BLOG_REVALIDATE_SECRET;
  const secret = request.nextUrl.searchParams.get("secret");

  if (!expected || secret !== expected) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  let body: { slug?: unknown; site?: unknown; sites?: unknown } = {};
  try {
    body = (await request.json()) ?? {};
  } catch {
    body = {};
  }

  const sites = [
    ...(Array.isArray(body.sites) ? body.sites : []),
    ...(body.site !== undefined ? [body.site] : []),
  ].filter((value): value is string => typeof value === "string" && SLUG_RE.test(value));

  if (sites.length > 0) {
    for (const site of sites) revalidateTag(`site-${site}`);
    return NextResponse.json({ revalidated: true, sites });
  }

  const slug = typeof body.slug === "string" ? body.slug : undefined;

  revalidatePath("/blog");
  revalidatePath("/(main)/blog/categoria/[category]", "page");
  revalidatePath("/(main)/blog/etiqueta/[tag]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  if (slug) revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ revalidated: true, slug: slug || null });
}
