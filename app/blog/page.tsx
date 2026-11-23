import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BlogListing } from "@/components/blog/BlogListing";
import { getPublishedBlogs } from "@/lib/blog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog de Zentt | Reservas directas y marketing para alojamientos",
  description: "Estrategias de reservas directas, marketing y presencia digital para alojamientos turísticos.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog de Zentt | Reservas directas para alojamientos",
    description: "Ideas prácticas para conseguir más reservas directas.",
    type: "website",
    url: "/blog",
  },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogs();
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <BlogListing posts={posts} />
      <Footer />
    </div>
  );
}
