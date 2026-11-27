/**
 * Fetchers server-side para los sitios públicos de clientes.
 *
 * Usan el Data Cache de Next (revalidate 60 s + tag `site-<slug>`), así las
 * visitas no esperan a Render: el backend se consulta como mucho una vez por
 * minuto por URL, o cuando el backend dispara la revalidación on-demand.
 */

export const PUBLIC_REVALIDATE_SECONDS = 60;

export const siteTag = (slug: string) => `site-${slug}`;

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class PublicFetchError extends Error {}

/**
 * Devuelve los datos, `null` si el backend responde 404, o lanza
 * `PublicFetchError` ante cualquier otro fallo. Lanzar (en vez de cachear un
 * panel de error) hace que una revalidación fallida conserve la versión
 * anterior y que la primera carga caiga en `error.tsx` con reintento.
 */
export async function fetchPublic<T>(path: string, slug: string): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl()}${path}`, {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [siteTag(slug)] },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new PublicFetchError(`Fallo de red al pedir ${path}: ${String(error)}`);
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new PublicFetchError(`El backend respondió ${response.status} para ${path}`);
  }
  return (await response.json()) as T;
}
