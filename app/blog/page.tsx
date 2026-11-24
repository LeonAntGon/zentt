import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BlogListing } from "@/components/blog/BlogListing";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS_PER_PAGE,
  getPublishedBlogsPage,
} from "@/lib/blog";

export const revalidate = 300;

type Props = { searchParams: Promise<{ page?: string }> };

function parsePage(value?: string) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);
  return {
    title: "Blog de Zentt | Reservas directas y marketing para alojamientos",
    description:
      "Estrategias de reservas directas, marketing y presencia digital para alojamientos turísticos.",
    alternates: {
      canonical: page > 1 ? `/blog?page=${page}` : "/blog",
    },
    openGraph: {
      title: "Blog de Zentt | Reservas directas para alojamientos",
      description: "Ideas prácticas para conseguir más reservas directas.",
      type: "website",
      url: page > 1 ? `/blog?page=${page}` : "/blog",
    },
  };
}

export default async function BlogPage({ searchParams }: Props) {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);
  const posts = await getPublishedBlogsPage(page);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <BlogListing
        posts={posts}
        categories={BLOG_CATEGORIES}
        currentPage={page}
        hasNext={posts.length === BLOG_POSTS_PER_PAGE}
        basePath="/blog"
      />
      <Footer />
    </div>
  );
}
