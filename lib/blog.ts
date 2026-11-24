export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
  blogcategory: string[];
  tags: string[];
  status: "draft" | "publish" | string;
  readingTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export class BlogUnavailableError extends Error {
  constructor(message = "El CMS del blog no está disponible.") {
    super(message);
    this.name = "BlogUnavailableError";
  }
}

const BLOG_API_URL = (
  process.env.BLOG_API_URL || process.env.NEXT_PUBLIC_BLOG_API_URL || ""
).replace(/\/$/, "");

const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

function blogApiUrl(params: Record<string, string>) {
  if (!BLOG_API_URL) return null;
  const url = new URL(`${BLOG_API_URL}/api/blogapi`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

async function fetchBlogApi(params: Record<string, string> = {}): Promise<BlogPost[]> {
  const url = blogApiUrl(params);

  if (!url) {
    if (IS_BUILD) {
      console.warn("[blog] BLOG_API_URL no está configurada durante el build; se renderiza sin posts.");
      return [];
    }
    throw new BlogUnavailableError("BLOG_API_URL no está configurada.");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
  } catch {
    if (IS_BUILD) {
      console.warn("[blog] No se pudo contactar al CMS durante el build; se renderiza sin posts.");
      return [];
    }
    throw new BlogUnavailableError("No se pudo contactar al CMS del blog.");
  }

  if (response.status === 404) return [];

  if (!response.ok) {
    if (IS_BUILD) {
      console.warn(`[blog] El CMS respondió ${response.status} durante el build; se renderiza sin posts.`);
      return [];
    }
    throw new BlogUnavailableError(`El CMS del blog respondió con estado ${response.status}.`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    if (IS_BUILD) {
      console.warn("[blog] El CMS devolvió una respuesta inválida durante el build; se renderiza sin posts.");
      return [];
    }
    throw new BlogUnavailableError("El CMS del blog devolvió una respuesta inválida.");
  }

  return (Array.isArray(data) ? data : data ? [data] : []) as BlogPost[];
}

export function getPublishedBlogs() {
  return fetchBlogApi({ public: "true" });
}

export const BLOG_POSTS_PER_PAGE = 9;

export function getPublishedBlogsPage(page = 1, limit = BLOG_POSTS_PER_PAGE) {
  return fetchBlogApi({
    public: "true",
    page: String(Math.max(1, page)),
    limit: String(limit),
  });
}

export function getPublishedBlogBySlug(slug: string) {
  return fetchBlogApi({ public: "true", slug });
}

export function getPublishedBlogsByCategory(category: string, page = 1, limit?: number) {
  const params: Record<string, string> = { public: "true", blogcategory: category };
  if (limit) {
    params.page = String(Math.max(1, page));
    params.limit = String(limit);
  }
  return fetchBlogApi(params);
}

export function getPublishedBlogsByTag(tag: string, page = 1, limit?: number) {
  const params: Record<string, string> = { public: "true", tags: tag };
  if (limit) {
    params.page = String(Math.max(1, page));
    params.limit = String(limit);
  }
  return fetchBlogApi(params);
}

export function getFirstMarkdownImage(markdown: string) {
  const match = markdown.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  return match?.[1] || null;
}

export function removeFirstMarkdownImage(markdown: string) {
  const match = markdown.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (!match) return markdown;
  return markdown
    .replace(match[0], "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[`*_>#~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getBlogExcerpt(post: BlogPost, length = 160) {
  const text = stripMarkdown(post.description || "");
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

/** Título para SEO/redes: campo dedicado o el título del post. */
export function getBlogMetaTitle(post: BlogPost) {
  return post.seoTitle?.trim() || post.title;
}

/** Meta descripción: campo dedicado o el resumen del contenido. */
export function getBlogMetaDescription(post: BlogPost, length = 160) {
  return post.seoDescription?.trim() || getBlogExcerpt(post, length);
}

/** Imagen destacada: campo dedicado o la primera imagen del markdown. */
export function getBlogCoverImage(post: BlogPost) {
  return post.coverImage?.trim() || getFirstMarkdownImage(post.description);
}

export function getBlogUrl(slug: string) {
  return `/blog/${encodeURIComponent(slug)}`;
}

export function getBlogSiteUrl() {
  return (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "https://zentt.agency").replace(/\/$/, "");
}

/** Taxonomía pública del blog (misma que ofrece el editor del CMS). */
export const BLOG_CATEGORIES = [
  { slug: "gestion-de-reservas", label: "Gestión de reservas" },
  { slug: "marketing-para-alojamientos", label: "Marketing para alojamientos" },
  { slug: "precios-y-rentabilidad", label: "Precios y rentabilidad" },
  { slug: "tecnologia-y-automatizacion", label: "Tecnología y automatización" },
  { slug: "experiencia-del-huesped", label: "Experiencia del huésped" },
  { slug: "casos-de-exito", label: "Casos de éxito" },
] as const;

export const BLOG_TAGS = [
  { slug: "reservas-online", label: "Reservas online" },
  { slug: "whatsapp-business", label: "WhatsApp Business" },
  { slug: "calendario-disponibilidad", label: "Calendario y disponibilidad" },
  { slug: "overbooking", label: "Overbooking" },
  { slug: "temporada-alta", label: "Temporada alta" },
  { slug: "temporada-baja", label: "Temporada baja" },
  { slug: "precios-dinamicos", label: "Precios dinámicos" },
  { slug: "check-in-check-out", label: "Check-in y check-out" },
  { slug: "resenas-reputacion", label: "Reseñas y reputación" },
  { slug: "redes-sociales", label: "Redes sociales" },
  { slug: "seo-alojamientos", label: "SEO para alojamientos" },
  { slug: "fidelizacion-huespedes", label: "Fidelización de huéspedes" },
  { slug: "pagos-y-senas", label: "Pagos y señas" },
  { slug: "airbnb-vs-gestion-propia", label: "Airbnb vs. gestión propia" },
  { slug: "automatizacion", label: "Automatización" },
  { slug: "turismo-rural", label: "Turismo rural" },
  { slug: "complejos-turisticos", label: "Complejos turísticos" },
  { slug: "alquiler-temporario", label: "Alquiler temporario" },
] as const;

export const BLOG_CATEGORY_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    BLOG_CATEGORIES.map((category): [string, string] => [category.slug, category.label])
  ),
  // Valores legacy de la taxonomía anterior: solo para renderizar posts viejos.
  cabanas: "Cabañas",
  turismo: "Turismo",
  "consejos-para-anfitriones": "Consejos para Anfitriones",
  "noticias-zentt": "Noticias Zentt",
  guias: "Guías",
};

export const BLOG_TAG_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    BLOG_TAGS.map((tag): [string, string] => [tag.slug, tag.label])
  ),
  // Valores legacy de la taxonomía anterior: solo para renderizar posts viejos.
  "reservas-directas": "Reservas directas",
  marketing: "Marketing",
  whatsapp: "WhatsApp",
  temporada: "Temporada",
  "atencion-al-huesped": "Atención al huésped",
  rentabilidad: "Rentabilidad",
};

export function isKnownCategory(slug: string) {
  return Object.prototype.hasOwnProperty.call(BLOG_CATEGORY_LABELS, slug);
}

export function isKnownTag(slug: string) {
  return Object.prototype.hasOwnProperty.call(BLOG_TAG_LABELS, slug);
}

export function getCategoryLabel(category: string) {
  return BLOG_CATEGORY_LABELS[category] || category;
}

export function getTagLabel(tag: string) {
  return BLOG_TAG_LABELS[tag] || tag;
}

export function decodeBlogParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
