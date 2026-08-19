"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UpgradeProButtonProps = {
  children: ReactNode;
  loading?: boolean;
  showPulse?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function UpgradeProButton({
  children,
  loading = false,
  showPulse = false,
  className = "",
  disabled,
  type = "button",
  ...props
}: UpgradeProButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#184E77] to-[#1f6296] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#184E77] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      {...props}
    >
      {showPulse && !disabled && !loading ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full border border-white bg-sky-500" />
        </span>
      ) : null}
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      <span className="drop-shadow-sm">{children}</span>
    </button>
  );
}

type PlanQuotaChipProps = {
  children: ReactNode;
  emphasized?: boolean;
  className?: string;
};

export function PlanQuotaChip({
  children,
  emphasized = false,
  className = "",
}: PlanQuotaChipProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2 text-center text-sm font-semibold",
        emphasized
          ? "border-[#184E77]/20 bg-gradient-to-r from-[#184E77]/10 to-[#1f6296]/10 text-[#184E77]"
          : "border-slate-200 bg-slate-100 text-slate-700",
        className
      )}
    >
      {children}
    </div>
  );
}
