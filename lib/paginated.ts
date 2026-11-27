import api from "@/lib/api";

/** Respuesta paginada de DRF (PageNumberPagination). */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Acepta tanto la respuesta paginada `{results}` como un array plano.
 * Permite desplegar el frontend antes que el backend sin romper nada.
 */
export function unwrapList<T>(data: Paginated<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.results ?? [];
}

/** Total de filas (count paginado o largo del array). */
export function listCount<T>(data: Paginated<T> | T[] | null | undefined): number {
  if (!data) return 0;
  return Array.isArray(data) ? data.length : data.count ?? data.results?.length ?? 0;
}

type Params = Record<string, string | number | boolean | undefined>;

/** Una página. Devuelve siempre la forma paginada (normaliza arrays planos). */
export async function fetchPage<T>(url: string, params: Params = {}): Promise<Paginated<T>> {
  const { data } = await api.get<Paginated<T> | T[]>(url, { params });
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  return data;
}

/**
 * Todas las páginas de un rango (p. ej. ?desde=&hasta=), de a 500 filas.
 * Pensado para calendario y reportes, que filtran por fechas en el servidor.
 */
export async function fetchAllPages<T>(url: string, params: Params = {}): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  // Tope defensivo: 20 páginas x 500 = 10.000 filas.
  while (page <= 20) {
    const data = await fetchPage<T>(url, { ...params, page_size: 500, page });
    all.push(...data.results);
    if (!data.next) break;
    page += 1;
  }
  return all;
}
