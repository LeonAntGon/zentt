"use client";

import { RefreshCw } from "lucide-react";
import { AirbnbIcon } from "@/components/icons/AirbnbIcon";
import {
  cabanaFieldClass,
  cabanaSectionClass,
} from "@/components/dashboard/cabana-form-styles";

type AirbnbCalendarConnectProps = {
  value: string;
  onChange: (value: string) => void;
  showSyncButton?: boolean;
  onSync?: () => void;
  syncing?: boolean;
  bloqueosCount?: number;
};

export function AirbnbCalendarConnect({
  value,
  onChange,
  showSyncButton = false,
  onSync,
  syncing = false,
  bloqueosCount,
}: AirbnbCalendarConnectProps) {
  return (
    <div className={`${cabanaSectionClass} space-y-3`}>
      <h3 className="flex items-center gap-2 font-black text-slate-900">
        <AirbnbIcon className="h-[18px] w-[18px] text-[#FF385C]" />
        Conectar con calendario Airbnb
      </h3>
      <p className="text-xs text-slate-500">
        Pegá el enlace del calendario de este alojamiento en Airbnb. Al
        sincronizar, las fechas ocupadas ahí se bloquean en Zentt.
      </p>
      <input
        type="url"
        name="ical_url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cabanaFieldClass}
        placeholder="https://www.airbnb.com/calendar/...."
      />
      {showSyncButton && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={syncing}
            onClick={onSync}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {syncing ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Sincronizar calendario
          </button>
          {(bloqueosCount ?? 0) > 0 && (
            <span className="text-xs text-slate-400">
              {bloqueosCount} bloqueos importados
            </span>
          )}
        </div>
      )}
      {!showSyncButton && (
        <p className="text-[11px] text-slate-400">
          Si pegás el enlace, se sincroniza al publicar el alojamiento.
        </p>
      )}
    </div>
  );
}
