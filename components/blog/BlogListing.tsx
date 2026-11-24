import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import type { BlogPost } from "@/lib/blog";

type CategoryLink = { slug: string; label: string };

function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function BlogListing({
  posts,
  eyebrow = "Recursos para crecer",
  title = "Ideas para potenciar tu alojamiento",
  description = "Consejos prácticos de marketing, reservas directas y presencia digital para anfitriones.",
  categories,
  currentPage = 1,
  hasNext = false,
  basePath = "/blog",
}: {
  posts: BlogPost[];
  eyebrow?: string;
  title?: string;
  description?: string;
  categories?: readonly CategoryLink[];
  currentPage?: number;
  hasNext?: boolean;
  basePath?: string;
}) {
  const showPagination = currentPage > 1 || hasNext;

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

        {categories && categories.length > 0 && (
          <nav
            aria-label="Categorías del blog"
            className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-2"
          >
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog/categoria/${encodeURIComponent(category.slug)}`}
                className="rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800 transition-colors hover:border-sky-400 hover:bg-sky-50"
              >
                {category.label}
              </Link>
            ))}
          </nav>
        )}

        {posts.length > 0 ? (
          <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <BlogCard key={post._id} post={post} />)}
          </div>
        ) : (
          <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-dashed border-border bg-white p-12 text-center">
            <h2 className="text-xl font-bold text-primary">
              {currentPage > 1 ? "No hay más artículos" : "Próximamente"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {currentPage > 1
                ? "Volvé a la primera página para ver todo el contenido publicado."
                : "Estamos preparando nuevos contenidos para ayudarte a vender más directo."}
            </p>
            <Link
              href={currentPage > 1 ? basePath : "/"}
              className="mt-6 inline-flex items-center gap-2 font-semibold text-sky-700 hover:text-primary"
            >
              {currentPage > 1 ? "Ver desde el inicio" : "Conocé Zentt"}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        )}

        {showPagination && (
          <nav
            aria-label="Paginación del blog"
            className="mx-auto mt-12 flex max-w-6xl items-center justify-between gap-4"
          >
            {currentPage > 1 ? (
              <Link
                href={pageHref(basePath, currentPage - 1)}
                rel="prev"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-sky-300 hover:text-sky-700"
              >
                <ArrowLeft size={16} aria-hidden />
                Anteriores
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-muted-foreground">Página {currentPage}</span>
            {hasNext ? (
              <Link
                href={pageHref(basePath, currentPage + 1)}
                rel="next"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-sky-300 hover:text-sky-700"
              >
                Siguientes
                <ArrowRight size={16} aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
