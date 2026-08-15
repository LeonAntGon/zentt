import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/70", className)}
      aria-hidden
      {...props}
    />
  );
}

/** Skeleton para una fila típica del buzón: avatar + 2 líneas + acción. */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

/** Skeleton de KPI card. */
export function SkeletonKpi() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="mb-2 h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/** Skeleton de card de alojamiento (mismo geometry que CabanaCard). */
export function SkeletonCabanaCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}
