import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BlogListing } from "@/components/blog/BlogListing";
import {
  decodeBlogParam,
  getCategoryLabel,
  getPublishedBlogsByCategory,
  isKnownCategory,
} from "@/lib/blog";

type Params = { params: Promise<{ category: string }> };

export const revalidate = 300;

const getPosts = cache((slug: string) => getPublishedBlogsByCategory(slug));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const slug = decodeBlogParam(category);
  if (!isKnownCategory(slug)) return {};
  const label = getCategoryLabel(slug);
  const posts = await getPosts(slug);
  return {
    title: `${label} | Blog de Zentt`,
    description: `Artículos de Zentt sobre ${label}.`,
    alternates: { canonical: `/blog/categoria/${encodeURIComponent(slug)}` },
    robots: posts.length > 0 ? undefined : { index: false, follow: true },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const slug = decodeBlogParam(category);
  if (!isKnownCategory(slug)) notFound();
  const label = getCategoryLabel(slug);
  const posts = await getPosts(slug);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <BlogListing
        posts={posts}
        eyebrow={`Categoría: ${label}`}
        title={`Artículos sobre ${label}`}
        description="Contenido seleccionado de Zentt para ayudarte a mejorar tu presencia digital."
        basePath={`/blog/categoria/${encodeURIComponent(slug)}`}
      />
      <Footer />
    </div>
  );
}
