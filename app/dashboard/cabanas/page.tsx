"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Cabana } from "@/types/cabin";
import { CabanaCard } from "@/components/CabanaCard";
import { UpgradePricingModal } from "@/components/dashboard/UpgradePricingModal";
import { canCreateCabana, getMaxCabanas } from "@/lib/planLimits";
import { Plus, Home, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { SkeletonCabanaCard } from "@/components/ui/skeleton";

export default function CabanasPage() {
  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const plan = user?.profile?.plan;
  const maxCabanas = getMaxCabanas(plan);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get<Cabana[]>("/cabanas/");
        setCabanas(response.data);
      } catch (err) {
        console.error("Error al cargar cabañas", err);
        toast.error("No pudimos cargar tus alojamientos");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleEdit = (slug: string) => {
    router.push(`/dashboard/cabanas/editar/${slug}`);
  };

  const handleCrearCabana = () => {
    if (!canCreateCabana(plan, cabanas.length)) {
      setPaywallOpen(true);
      return;
    }
    router.push("/dashboard/cabanas/crear");
  };

  const handleDelete = async (slug: string) => {
    try {
      await api.delete(`/cabanas/${slug}/`);
      setCabanas((prev) => prev.filter((c) => c.slug !== slug));
      toast.success("Alojamiento eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar", error);
      toast.error("Hubo un error al intentar eliminar el alojamiento");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="page-eyebrow flex items-center gap-2">
              <LayoutGrid size={14} /> Gestión de alojamientos
            </p>
            <h1 className="page-title">
              ¡Hola, {user?.first_name || "Dueño"}!
            </h1>
            <p className="page-subtitle max-w-md leading-tight">
              Estás administrando{" "}
              <span className="text-primary font-bold">
                {user?.profile?.nombre_negocio || "tu complejo"}
              </span>
              . {cabanas.length} / {maxCabanas} alojamientos en tu plan.
            </p>
          </div>

          <button
            onClick={handleCrearCabana}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-primary/10 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            <Plus size={18} /> Agregar alojamiento
          </button>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCabanaCard key={i} />
            ))}
          </div>
        ) : cabanas.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 flex flex-col items-center text-center gap-6">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Home size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                No hay alojamientos registrados
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                Empezá añadiendo tu primer alojamiento para que aparezca en tu
                sitio web.
              </p>
            </div>
            <button
              onClick={handleCrearCabana}
              className="text-primary font-bold uppercase tracking-widest text-xs hover:underline"
            >
              Crear mi primer alojamiento →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cabanas.map((c) => (
              <CabanaCard
                key={c.id}
                cabana={c}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <UpgradePricingModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        title={`Tu plan incluye ${maxCabanas} ${
          maxCabanas === 1 ? "alojamiento" : "alojamientos"
        }`}
        body="Para agregar otro alojamiento, pasate a un plan pago. Cada pago otorga 30 días de acceso. Al vencer, volvé a pagar para seguir con el plan."
      />
    </div>
  );
}
