import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BlogListing } from "@/components/blog/BlogListing";
import {
  decodeBlogParam,
  getPublishedBlogsByTag,
  getTagLabel,
  isKnownTag,
} from "@/lib/blog";

type Params = { params: Promise<{ tag: string }> };

export const revalidate = 300;

const getPosts = cache((slug: string) => getPublishedBlogsByTag(slug));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const slug = decodeBlogParam(tag);
  if (!isKnownTag(slug)) return {};
  const label = getTagLabel(slug);
  const posts = await getPosts(slug);
  return {
    title: `${label} | Blog de Zentt`,
    description: `Artículos etiquetados con ${label} en el blog de Zentt.`,
    alternates: { canonical: `/blog/etiqueta/${encodeURIComponent(slug)}` },
    robots: posts.length > 0 ? undefined : { index: false, follow: true },
  };
}

export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const slug = decodeBlogParam(tag);
  if (!isKnownTag(slug)) notFound();
  const label = getTagLabel(slug);
  const posts = await getPosts(slug);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <BlogListing
        posts={posts}
        eyebrow={`Etiqueta: ${label}`}
        title={`Artículos sobre ${label}`}
        description="Ideas y recursos para gestionar mejor tu presencia digital y tus reservas."
        basePath={`/blog/etiqueta/${encodeURIComponent(slug)}`}
      />
      <Footer />
    </div>
  );
}
