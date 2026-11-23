import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BlogListing } from "@/components/blog/BlogListing";
import {
  decodeBlogParam,
  getCategoryLabel,
  getPublishedBlogsByCategory,
} from "@/lib/blog";

type Params = { params: Promise<{ category: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const slug = decodeBlogParam(category);
  const label = getCategoryLabel(slug);
  return {
    title: `${label} | Blog de Zentt`,
    description: `Artículos de Zentt sobre ${label}.`,
    alternates: { canonical: `/blog/categoria/${encodeURIComponent(slug)}` },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const slug = decodeBlogParam(category);
  const label = getCategoryLabel(slug);
  const posts = await getPublishedBlogsByCategory(slug);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <BlogListing
        posts={posts}
        eyebrow={`Categoría: ${label}`}
        title={`Artículos sobre ${label}`}
        description="Contenido seleccionado de Zentt para ayudarte a mejorar tu presencia digital."
      />
      <Footer />
    </div>
  );
}
