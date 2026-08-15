"use client";

import { RefreshCw } from "lucide-react";
import { BookingIcon } from "@/components/icons/BookingIcon";
import {
  cabanaFieldClass,
  cabanaSectionClass,
} from "@/components/dashboard/cabana-form-styles";

type BookingCalendarConnectProps = {
  value: string;
  onChange: (value: string) => void;
  showSyncButton?: boolean;
  onSync?: () => void;
  syncing?: boolean;
  bloqueosCount?: number;
};

export function BookingCalendarConnect({
  value,
  onChange,
  showSyncButton = false,
  onSync,
  syncing = false,
  bloqueosCount,
}: BookingCalendarConnectProps) {
  return (
    <div className={`${cabanaSectionClass} space-y-3`}>
      <h3 className="flex items-center gap-2 font-black text-slate-900">
        <BookingIcon className="h-[18px] w-[18px] text-[#003580]" />
        Conectar con calendario Booking
      </h3>
      <p className="text-xs text-slate-500">
        Pegá el enlace del calendario iCal de Booking.com para sincronizar las
        fechas ocupadas de este alojamiento.
      </p>
      <input
        type="url"
        name="ical_url_booking"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cabanaFieldClass}
        placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?..."
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
