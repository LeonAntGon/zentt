export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  description: string;
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

export function getPublishedBlogBySlug(slug: string) {
  return fetchBlogApi({ public: "true", slug });
}

export function getPublishedBlogsByCategory(category: string) {
  return fetchBlogApi({ public: "true", blogcategory: category });
}

export function getPublishedBlogsByTag(tag: string) {
  return fetchBlogApi({ public: "true", tags: tag });
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

export function getBlogUrl(slug: string) {
  return `/blog/${encodeURIComponent(slug)}`;
}

export function getBlogSiteUrl() {
  return (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "https://zentt.agency").replace(/\/$/, "");
}

export const BLOG_CATEGORY_LABELS: Record<string, string> = {
  cabanas: "Cabañas",
  turismo: "Turismo",
  "consejos-para-anfitriones": "Consejos para Anfitriones",
  "noticias-zentt": "Noticias Zentt",
  guias: "Guías",
};

export const BLOG_TAG_LABELS: Record<string, string> = {
  "reservas-directas": "Reservas directas",
  marketing: "Marketing",
  whatsapp: "WhatsApp",
  temporada: "Temporada",
  "atencion-al-huesped": "Atención al huésped",
  rentabilidad: "Rentabilidad",
};

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
