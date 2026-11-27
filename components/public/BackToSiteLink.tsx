"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** not-found.tsx no recibe params; el slug del sitio sale de la URL. */
export function BackToSiteLink() {
  const params = useParams<{ slug?: string }>();
  return (
    <Link
      href={params?.slug ? `/${params.slug}` : "/"}
      className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
    >
      <ArrowLeft size={17} />
      Volver al sitio
    </Link>
  );
}
