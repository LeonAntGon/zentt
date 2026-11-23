import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import type { BlogPost } from "@/lib/blog";

export function BlogListing({
  posts,
  eyebrow = "Recursos para crecer",
  title = "Ideas para potenciar tu alojamiento",
  description = "Consejos prácticos de marketing, reservas directas y presencia digital para anfitriones.",
}: {
  posts: BlogPost[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-28">
      <section className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
            <BookOpen size={15} aria-hidden />
            {eyebrow}
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>
        </div>

        {posts.length > 0 ? (
          <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <BlogCard key={post._id} post={post} />)}
          </div>
        ) : (
          <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-dashed border-border bg-white p-12 text-center">
            <h2 className="text-xl font-bold text-primary">Próximamente</h2>
            <p className="mt-3 text-muted-foreground">Estamos preparando nuevos contenidos para ayudarte a vender más directo.</p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 font-semibold text-sky-700 hover:text-primary">
              Conocé Zentt <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
