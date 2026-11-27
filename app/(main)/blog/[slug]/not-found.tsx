import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function BlogPostNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-24">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
          <BookOpen size={28} aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-primary">Artículo no encontrado</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          El artículo que buscás no existe o dejó de estar publicado. Podés explorar el resto del blog.
        </p>
        <Link
          href="/blog"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Ver todos los artículos
        </Link>
      </div>
    </main>
  );
}
