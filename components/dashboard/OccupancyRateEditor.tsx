"use client";

import { Plus, Trash2, Users } from "lucide-react";
import type { TarifaOcupacion } from "@/types/cabin";
import {
  cabanaFieldClass,
  cabanaLabelClass,
  cabanaSectionClass,
} from "@/components/dashboard/cabana-form-styles";

type Props = {
  value: TarifaOcupacion[];
  onChange: (next: TarifaOcupacion[]) => void;
  capacidad: number;
};

function asInput(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function asValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function OccupancyRateEditor({ value, onChange, capacidad }: Props) {
  const update = (index: number, patch: Partial<TarifaOcupacion>) => {
    onChange(
      value.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const addRow = () => {
    const lastMax = value.reduce(
      (max, item) => Math.max(max, Number(item.personas_max) || 0),
      0
    );
    const min = Math.max(1, lastMax + 1);
    onChange([
      ...value,
      {
        personas_min: min,
        personas_max: Math.max(min, capacidad || min),
        precio_noche_semana: null,
        precio_noche_finde: null,
        precio_paquete_2_noches: null,
        precio_paquete_2_noches_finde: null,
        activo: true,
        orden: value.length,
      },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const sorted = value
    .slice()
    .sort((a, b) => Number(a.personas_min) - Number(b.personas_min));
  const hasOverlap = sorted.some((item, index) => {
    if (index === 0) return false;
    return Number(item.personas_min) <= Number(sorted[index - 1].personas_max);
  });

  return (
    <section className={`${cabanaSectionClass} scroll-mt-24`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-black text-slate-900">
            <Users size={20} className="text-primary" /> Tarifas por ocupación
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
            Definí cuánto sale cada noche según la cantidad de huéspedes. Las
            noches de fin de semana son viernes y sábado. El paquete de 2
            noches se aplica solo cuando la estadía tiene exactamente 2 noches.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus size={14} /> Agregar franja
        </button>
      </div>

      {hasOverlap && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">
          Hay rangos de personas superpuestos. Revisá “desde” y “hasta” para que
          no se pisen.
        </p>
      )}

      <div className="mt-5 space-y-4">
        {value.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-slate-600">
              Todavía no cargaste tarifas por ocupación
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Si no las cargás, se usa el precio base del alojamiento.
            </p>
            <button
              type="button"
              onClick={addRow}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
            >
              <Plus size={14} /> Agregar primera franja
            </button>
          </div>
        )}

        {value.map((tarifa, index) => {
          const minId = `tarifa-min-${index}`;
          const maxId = `tarifa-max-${index}`;
          const weekId = `tarifa-semana-${index}`;
          const weekendId = `tarifa-finde-${index}`;
          const promoId = `tarifa-promo-${index}`;
          const promoWeekendId = `tarifa-promo-finde-${index}`;
          return (
            <div
              key={`${tarifa.id ?? "nuevo"}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Franja {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Eliminar franja ${index + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor={minId} className={cabanaLabelClass}>
                    Desde (personas)
                  </label>
                  <input
                    id={minId}
                    type="number"
                    min={1}
                    value={asInput(tarifa.personas_min)}
                    onChange={(event) =>
                      update(index, {
                        personas_min: Number(event.target.value) || 1,
                      })
                    }
                    className={cabanaFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor={maxId} className={cabanaLabelClass}>
                    Hasta (personas)
                  </label>
                  <input
                    id={maxId}
                    type="number"
                    min={1}
                    value={asInput(tarifa.personas_max)}
                    onChange={(event) =>
                      update(index, {
                        personas_max: Number(event.target.value) || 1,
                      })
                    }
                    className={cabanaFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor={weekId} className={cabanaLabelClass}>
                    Noche semana ($)
                  </label>
                  <input
                    id={weekId}
                    type="number"
                    min={0}
                    step="0.01"
                    value={asInput(tarifa.precio_noche_semana)}
                    onChange={(event) =>
                      update(index, {
                        precio_noche_semana: asValue(event.target.value),
                      })
                    }
                    placeholder="Ej: 80000"
                    className={cabanaFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor={weekendId} className={cabanaLabelClass}>
                    Noche finde ($)
                  </label>
                  <input
                    id={weekendId}
                    type="number"
                    min={0}
                    step="0.01"
                    value={asInput(tarifa.precio_noche_finde)}
                    onChange={(event) =>
                      update(index, {
                        precio_noche_finde: asValue(event.target.value),
                      })
                    }
                    placeholder="Ej: 150000"
                    className={cabanaFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor={promoId} className={cabanaLabelClass}>
                    Paquete 2 noches semana ($)
                  </label>
                  <input
                    id={promoId}
                    type="number"
                    min={0}
                    step="0.01"
                    value={asInput(tarifa.precio_paquete_2_noches)}
                    onChange={(event) =>
                      update(index, {
                        precio_paquete_2_noches: asValue(event.target.value),
                      })
                    }
                    placeholder="Ej: 140000"
                    className={cabanaFieldClass}
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Opcional. Solo para estadías de 2 noches entre semana.
                  </p>
                </div>
                <div>
                  <label htmlFor={promoWeekendId} className={cabanaLabelClass}>
                    Paquete 2 noches finde ($)
                  </label>
                  <input
                    id={promoWeekendId}
                    type="number"
                    min={0}
                    step="0.01"
                    value={asInput(tarifa.precio_paquete_2_noches_finde)}
                    onChange={(event) =>
                      update(index, {
                        precio_paquete_2_noches_finde: asValue(
                          event.target.value
                        ),
                      })
                    }
                    placeholder="Ej: 300000"
                    className={cabanaFieldClass}
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Opcional. Solo para viernes + sábado.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
