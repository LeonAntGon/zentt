import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BlogMarkdown } from "@/components/blog/BlogMarkdown";
import {
  getBlogExcerpt,
  getBlogSiteUrl,
  getBlogUrl,
  getCategoryLabel,
  getFirstMarkdownImage,
  getPublishedBlogBySlug,
  removeFirstMarkdownImage,
  type BlogPost,
} from "@/lib/blog";

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 300;

const getPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const posts = await getPublishedBlogBySlug(slug);
  return posts[0] || null;
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Artículo no encontrado | Zentt" };
  const image = getFirstMarkdownImage(post.description);
  return {
    title: `${post.title} | Blog de Zentt`,
    description: getBlogExcerpt(post),
    alternates: { canonical: getBlogUrl(post.slug) },
    openGraph: {
      type: "article",
      title: post.title,
      description: getBlogExcerpt(post),
      url: getBlogUrl(post.slug),
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const image = getFirstMarkdownImage(post.description);
  const content = image ? removeFirstMarkdownImage(post.description) : post.description;
  const siteUrl = getBlogSiteUrl();
  const articleUrl = `${siteUrl}${getBlogUrl(post.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: getBlogExcerpt(post),
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    ...(image ? { image: [image] } : {}),
    author: { "@type": "Organization", name: "Zentt", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "Zentt",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/assets/logo-for-ico.png` },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-28">
        <article className="container mx-auto max-w-4xl px-4 pb-20 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-primary">
            <ArrowLeft size={16} aria-hidden /> Volver al blog
          </Link>
          <header className="mt-8 border-b border-border pb-10">
            {post.blogcategory?.[0] && <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{getCategoryLabel(post.blogcategory[0])}</p>}
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">{post.title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><CalendarDays size={16} aria-hidden />{new Date(post.createdAt).toLocaleDateString("es-AR", { dateStyle: "long" })}</span>
              {post.readingTime && <span className="inline-flex items-center gap-2"><Clock3 size={16} aria-hidden />{post.readingTime} min de lectura</span>}
            </div>
          </header>
          {image && <img src={image} alt={post.title} className="mt-10 max-h-[520px] w-full rounded-2xl object-cover" fetchPriority="high" />}
          <div className="mt-10"><BlogMarkdown content={content} /></div>
        </article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
      <Footer />
    </div>
  );
}
