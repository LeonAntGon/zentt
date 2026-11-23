import Link from "next/link";
import { CalendarDays, Clock3 } from "lucide-react";
import {
  getBlogExcerpt,
  getBlogUrl,
  getCategoryLabel,
  getFirstMarkdownImage,
  getTagLabel,
} from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  const image = getFirstMarkdownImage(post.description);
  const category = post.blogcategory?.[0];
  const tag = post.tags?.[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link href={getBlogUrl(post.slug)} className="block overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={post.title}
            className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary to-sky-700 px-6 text-center text-2xl font-bold text-white">
            Zentt
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {category ? (
          <Link
            href={`/blog/categoria/${encodeURIComponent(category)}`}
            className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700 hover:text-primary"
          >
            {getCategoryLabel(category)}
          </Link>
        ) : tag ? (
          <Link
            href={`/blog/etiqueta/${encodeURIComponent(tag)}`}
            className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700 hover:text-primary"
          >
            {getTagLabel(tag)}
          </Link>
        ) : null}
        <h2 className="mt-3 text-xl font-bold leading-tight text-foreground">
          <Link href={getBlogUrl(post.slug)} className="hover:text-sky-700">
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {getBlogExcerpt(post)}
        </p>
        <div className="mt-auto flex items-center gap-4 border-t border-border/70 pt-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden />
            {new Date(post.createdAt).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {post.readingTime && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} aria-hidden />
              {post.readingTime} min
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
