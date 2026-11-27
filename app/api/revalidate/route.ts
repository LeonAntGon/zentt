import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Webhook para que el CMS del blog avise cuando se publica o edita un post.
 * Requiere BLOG_REVALIDATE_SECRET en el frontend y FRONTEND_REVALIDATE_* en el CMS.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.BLOG_REVALIDATE_SECRET;
  const secret = request.nextUrl.searchParams.get("secret");

  if (!expected || secret !== expected) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  let slug: string | undefined;
  try {
    const body = (await request.json()) as { slug?: string };
    slug = typeof body?.slug === "string" ? body.slug : undefined;
  } catch {
    slug = undefined;
  }

  revalidatePath("/blog");
  revalidatePath("/(main)/blog/categoria/[category]", "page");
  revalidatePath("/(main)/blog/etiqueta/[tag]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  if (slug) revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ revalidated: true, slug: slug || null });
}
