import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CabinDetailClient } from "@/components/public/CabinDetailClient";
import { fetchPublic } from "@/lib/publicApi";
import type { Cabana } from "@/types/cabin";

/**
 * Ficha pública de cabaña. Los datos de la cabaña se traen en el servidor
 * (Data Cache 60 s + tag `site-<slug>` para revalidación on-demand) y el
 * formulario se renderiza de inmediato. Solo las fechas ocupadas se piden en
 * el cliente, con skeleton dentro del calendario.
 *
 * Nota: leer `searchParams` (embed/theme) hace que el HTML se arme por
 * request, pero el fetch al backend igual sale del Data Cache, así que Render
 * no se consulta en cada visita.
 */
export const revalidate = 60;

type Params = { slug: string; cabanaSlug: string };

const getCabana = cache((slug: string, cabanaSlug: string) =>
  fetchPublic<Cabana>(`/public/${slug}/cabana/${cabanaSlug}/`, slug)
);

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug, cabanaSlug } = await params;
  try {
    const cabana = await getCabana(slug, cabanaSlug);
    if (!cabana) return {};
    return {
      title: cabana.nombre,
      description: cabana.descripcion?.slice(0, 160) || undefined,
    };
  } catch {
    return {};
  }
}

export default async function CabinDetailPublicPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ embed?: string; theme?: string }>;
}) {
  const [{ slug, cabanaSlug }, query] = await Promise.all([params, searchParams]);
  const cabana = await getCabana(slug, cabanaSlug);
  if (!cabana) notFound();

  return (
    <CabinDetailClient
      key={`${slug}/${cabanaSlug}`}
      slug={slug}
      cabanaSlug={cabanaSlug}
      cabana={cabana}
      isEmbed={query.embed === "1"}
      themeParam={query.theme ?? null}
    />
  );
}
