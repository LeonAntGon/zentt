import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogMarkdown } from "@/components/blog/BlogMarkdown";
import {
  getBlogCoverImage,
  getBlogMetaDescription,
  getBlogMetaTitle,
  getBlogSiteUrl,
  getBlogUrl,
  getCategoryLabel,
  getFirstMarkdownImage,
  getPublishedBlogBySlug,
  getPublishedBlogsByCategory,
  getPublishedBlogsPage,
  getTagLabel,
  removeFirstMarkdownImage,
  type BlogPost,
} from "@/lib/blog";

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 300;

const getPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const posts = await getPublishedBlogBySlug(slug);
  return posts[0] || null;
});

const getRelatedPosts = cache(async (slug: string, category?: string): Promise<BlogPost[]> => {
  try {
    const pool = category
      ? await getPublishedBlogsByCategory(category, 1, 7)
      : await getPublishedBlogsPage(1, 7);
    return pool.filter((post) => post.slug !== slug).slice(0, 3);
  } catch {
    return [];
  }
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Artículo no encontrado | Zentt", robots: { index: false, follow: false } };
  }
  const image = getBlogCoverImage(post);
  const title = getBlogMetaTitle(post);
  const description = getBlogMetaDescription(post);
  return {
    title: `${title} | Blog de Zentt`,
    description,
    alternates: { canonical: getBlogUrl(post.slug) },
    openGraph: {
      type: "article",
      title,
      description,
      url: getBlogUrl(post.slug),
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt || post.createdAt,
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const image = getBlogCoverImage(post);
  const content = getFirstMarkdownImage(post.description)
    ? removeFirstMarkdownImage(post.description)
    : post.description;
  const category = post.blogcategory?.[0];
  const siteUrl = getBlogSiteUrl();
  const articleUrl = `${siteUrl}${getBlogUrl(post.slug)}`;
  const relatedPosts = await getRelatedPosts(post.slug, category);

  const articleJsonLd = {
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    headline: post.title,
    description: getBlogMetaDescription(post),
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    inLanguage: "es-AR",
    url: articleUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    ...(image ? { image: [{ "@type": "ImageObject", url: image }] } : {}),
    ...(category ? { articleSection: getCategoryLabel(category) } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
    author: { "@type": "Organization", name: "Zentt", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "Zentt",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/assets/logo-for-ico.png` },
    },
  };

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
    ...(category
      ? [
          {
            "@type": "ListItem",
            position: 3,
            name: getCategoryLabel(category),
            item: `${siteUrl}/blog/categoria/${encodeURIComponent(category)}`,
          },
        ]
      : []),
    {
      "@type": "ListItem",
      position: category ? 4 : 3,
      name: post.title,
      item: articleUrl,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      articleJsonLd,
      { "@type": "BreadcrumbList", itemListElement: breadcrumbItems },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-28">
        <nav
          aria-label="Ruta de navegación"
          className="container mx-auto max-w-4xl px-4 text-sm text-muted-foreground lg:px-8"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-primary">Inicio</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/blog" className="hover:text-primary">Blog</Link>
            </li>
            {category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href={`/blog/categoria/${encodeURIComponent(category)}`}
                    className="hover:text-primary"
                  >
                    {getCategoryLabel(category)}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        <article className="container mx-auto max-w-4xl px-4 pb-20 lg:px-8">
          <Link href="/blog" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-primary">
            <ArrowLeft size={16} aria-hidden /> Volver al blog
          </Link>
          <header className="mt-8 border-b border-border pb-10">
            {category && (
              <Link
                href={`/blog/categoria/${encodeURIComponent(category)}`}
                className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700 hover:text-primary"
              >
                {getCategoryLabel(category)}
              </Link>
            )}
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">{post.title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><CalendarDays size={16} aria-hidden />{new Date(post.createdAt).toLocaleDateString("es-AR", { dateStyle: "long" })}</span>
              {post.readingTime && <span className="inline-flex items-center gap-2"><Clock3 size={16} aria-hidden />{post.readingTime} min de lectura</span>}
            </div>
          </header>
          {image && (
            <img
              src={image}
              alt={post.title}
              width={1200}
              height={630}
              className="mt-10 max-h-[520px] w-full rounded-2xl object-cover"
              fetchPriority="high"
              decoding="async"
            />
          )}
          <div className="mt-10"><BlogMarkdown content={content} /></div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-border pt-8">
              <span className="text-sm font-semibold text-foreground">Etiquetas:</span>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/etiqueta/${encodeURIComponent(tag)}`}
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 transition-colors hover:border-sky-400"
                >
                  {getTagLabel(tag)}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-sky-200 bg-sky-50 p-6 sm:p-8">
            <p className="text-lg font-bold text-primary">¿Querés vender más directo?</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Te armamos la página de reservas directas de tu alojamiento, conectada a WhatsApp y lista para la temporada.
            </p>
            <Link
              href="/#precios"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Ver planes y precios
            </Link>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="border-t border-border bg-slate-50 py-16">
            <div className="container mx-auto max-w-6xl px-4 lg:px-8">
              <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Seguí leyendo</h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <BlogCard key={related._id} post={related} />
                ))}
              </div>
            </div>
          </section>
        )}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
      <Footer />
    </div>
  );
}
