import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BlogListing } from "@/components/blog/BlogListing";
import {
  decodeBlogParam,
  getPublishedBlogsByTag,
  getTagLabel,
} from "@/lib/blog";

type Params = { params: Promise<{ tag: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const slug = decodeBlogParam(tag);
  const label = getTagLabel(slug);
  return {
    title: `${label} | Blog de Zentt`,
    description: `Artículos etiquetados con ${label} en el blog de Zentt.`,
    alternates: { canonical: `/blog/etiqueta/${encodeURIComponent(slug)}` },
  };
}

export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const slug = decodeBlogParam(tag);
  const label = getTagLabel(slug);
  const posts = await getPublishedBlogsByTag(slug);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <BlogListing
        posts={posts}
        eyebrow={`Etiqueta: ${label}`}
        title={`Artículos sobre ${label}`}
        description="Ideas y recursos para gestionar mejor tu presencia digital y tus reservas."
      />
      <Footer />
    </div>
  );
}
