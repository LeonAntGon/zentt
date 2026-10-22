import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOSTS = new Set([
  "zentt.agency",
  "www.zentt.agency",
  "localhost",
  "127.0.0.1",
]);

function hostnameWithoutPort(request: NextRequest) {
  return (request.headers.get("host") || request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();
}

export async function middleware(request: NextRequest) {
  const hostname = hostnameWithoutPort(request);
  const pathname = request.nextUrl.pathname;

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

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!apiUrl) return NextResponse.next();

  try {
    const response = await fetch(
      `${apiUrl}/public/domain/resolve/?host=${encodeURIComponent(hostname)}`,
      { cache: "no-store" }
    );
    if (!response.ok) return NextResponse.next();

    const data = (await response.json()) as { slug?: string };
    if (!data.slug) return NextResponse.next();

    // Keep canonical public paths usable on a custom domain as well, while
    // mapping the root and nested paths to the owner's slug internally.
    if (pathname === `/${data.slug}` || pathname.startsWith(`/${data.slug}/`)) {
      return NextResponse.next();
    }
    const rewritten = request.nextUrl.clone();
    rewritten.pathname = `/${data.slug}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewritten);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
