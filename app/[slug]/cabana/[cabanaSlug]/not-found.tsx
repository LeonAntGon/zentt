import { Building2 } from "lucide-react";
import { BackToSiteLink } from "@/components/public/BackToSiteLink";

export default function CabinNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 to-white px-6 text-center">
      <div className="max-w-md">
        <Building2 size={56} className="mx-auto mb-6 text-slate-200" />
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
          Alojamiento
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          No encontramos este alojamiento
        </h1>
        <p className="mt-4 text-base text-slate-500">
          Puede que se haya movido o que la dirección no sea correcta.
        </p>
        <BackToSiteLink />
      </div>
    </div>
  );
}
