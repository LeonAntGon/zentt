import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "zentt.agency";
const CANONICAL_HOSTS = new Set([
  CANONICAL_HOST,
  "localhost",
  "127.0.0.1",
]);

/**
 * Resolución de dominios custom -> slug, cacheada para no consultar al backend
 * en cada request (ni en navegaciones RSC / prefetch):
 *  1. Cookie `zentt_site` (`host|slug`, 5 min) en el navegador del visitante.
 *  2. Map en memoria por instancia del middleware (5 min; 1 min si no existe).
 *  3. fetch al backend con Data Cache de 5 min.
 * La cookie solo decide a qué slug se reescribe el path para ESE navegador;
 * el HTML cacheado depende del path (/slug/...), no del host.
 */
const RESOLVE_TTL_SECONDS = 300;
const NEGATIVE_TTL_MS = 60_000;
const SITE_COOKIE = "zentt_site";
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,149}$/i;

type CacheEntry = { slug: string | null; expires: number };
const domainCache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 500;

function rememberDomain(host: string, slug: string | null) {
  if (domainCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = domainCache.keys().next().value;
    if (oldest) domainCache.delete(oldest);
  }
  domainCache.set(host, {
    slug,
    expires: Date.now() + (slug ? RESOLVE_TTL_SECONDS * 1000 : NEGATIVE_TTL_MS),
  });
}

function slugFromCookie(request: NextRequest, host: string): string | null {
  const raw = request.cookies.get(SITE_COOKIE)?.value;
  if (!raw) return null;
  const [cookieHost, slug] = raw.split("|");
  return cookieHost === host && slug && SLUG_RE.test(slug) ? slug : null;
}

async function resolveCustomDomain(host: string): Promise<string | null> {
  const cached = domainCache.get(host);
  if (cached && cached.expires > Date.now()) return cached.slug;

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!apiUrl) return null;

  try {
    const response = await fetch(
      `${apiUrl}/public/domain/resolve/?host=${encodeURIComponent(host)}`,
      { next: { revalidate: RESOLVE_TTL_SECONDS } }
    );
    if (response.status === 404) {
      rememberDomain(host, null);
      return null;
    }
    if (!response.ok) return null; // error transitorio: no se cachea
    const data = (await response.json()) as { slug?: string };
    const slug = data.slug && SLUG_RE.test(data.slug) ? data.slug : null;
    rememberDomain(host, slug);
    return slug;
  } catch {
    return null;
  }
}

function hostnameWithoutPort(request: NextRequest) {
  return (request.headers.get("host") || request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();
}

export async function middleware(request: NextRequest) {
  const hostname = hostnameWithoutPort(request);
  const pathname = request.nextUrl.pathname;

  if (hostname === "www.zentt.agency") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    redirectUrl.host = CANONICAL_HOST;
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (
    CANONICAL_HOSTS.has(hostname) ||
    hostname.endsWith(".vercel.app") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const cookieSlug = slugFromCookie(request, hostname);
  const slug = cookieSlug ?? (await resolveCustomDomain(hostname));
  if (!slug) return NextResponse.next();

  // Keep canonical public paths usable on a custom domain as well, while
  // mapping the root and nested paths to the owner's slug internally.
  let response: NextResponse;
  if (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`)) {
    response = NextResponse.next();
  } else {
    const rewritten = request.nextUrl.clone();
    rewritten.pathname = `/${slug}${pathname === "/" ? "" : pathname}`;
    response = NextResponse.rewrite(rewritten);
  }

  if (!cookieSlug) {
    response.cookies.set(SITE_COOKIE, `${hostname}|${slug}`, {
      maxAge: RESOLVE_TTL_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
