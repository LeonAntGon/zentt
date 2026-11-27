"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addMonths, startOfMonth, subMonths } from "date-fns";
import { fetchAllPages } from "@/lib/paginated";
import { toISODate } from "@/lib/pricing";
import type { Mensaje, Reserva } from "@/types/cabin";

/**
 * Reservas y consultas de una ventana de meses alrededor del mes visible,
 * filtradas en el servidor (?desde=&hasta=). Al navegar fuera de la ventana
 * se pide la nueva; dentro de ella cambiar de mes es instantáneo.
 */
export function useMonthWindowData(
  month: Date,
  { monthsBefore = 3, monthsAfter = 3 }: { monthsBefore?: number; monthsAfter?: number } = {}
) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const windowRef = useRef<{ desde: Date; hasta: Date } | null>(null);
  const requestRef = useRef(0);

  const load = useCallback(
    async (target: Date) => {
      const base = startOfMonth(target);
      const desde = subMonths(base, monthsBefore);
      const hasta = addMonths(base, monthsAfter + 1);
      const requestId = ++requestRef.current;
      setLoading(true);
      setError(false);
      try {
        const params = { desde: toISODate(desde), hasta: toISODate(hasta) };
        const [nextReservas, nextMensajes] = await Promise.all([
          fetchAllPages<Reserva>("/booking/gestion-reservas/", params),
          fetchAllPages<Mensaje>("/mensajes/", params),
        ]);
        if (requestId !== requestRef.current) return; // llegó una más nueva
        windowRef.current = { desde, hasta };
        setReservas(nextReservas);
        setMensajes(nextMensajes);
      } catch {
        if (requestId === requestRef.current) setError(true);
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [monthsBefore, monthsAfter]
  );

  useEffect(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = addMonths(monthStart, 1);
    const win = windowRef.current;
    if (win && monthStart >= win.desde && monthEnd <= win.hasta) return;
    void load(month);
  }, [month, load]);

  const reload = useCallback(() => load(month), [load, month]);

  return { reservas, setReservas, mensajes, setMensajes, loading, error, reload };
}
