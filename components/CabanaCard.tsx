"use client";

import React, { useState } from "react";
import { Cabana } from "@/types/cabin";
import { getMediaUrl } from "@/lib/media";
import { Edit2, Users, Mail, Trash2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

interface Props {
  cabana: Cabana;
  onEdit: (slug: string) => void;
  onDelete: (slug: string) => void;
}

export const CabanaCard: React.FC<Props> = ({ cabana, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const portadaUrl = getMediaUrl(cabana.imagen_portada);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative h-48 w-full border-b border-slate-100 bg-white">
          {portadaUrl ? (
            <img
              src={portadaUrl}
              alt={cabana.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white text-sm font-medium text-slate-400">
              Sin imagen de portada
            </div>
          )}

          <div className="absolute right-3 top-3">
            {cabana.metodo_contacto === "WA" ? (
              <div
                title="Contacto por WhatsApp"
                className="rounded-full bg-[#25D366] p-1.5 text-white shadow-lg"
              >
                <WhatsAppIcon className="text-[20px]" />
              </div>
            ) : (
              <div
                title="Contacto por Email"
                className="rounded-full bg-primary p-1.5 text-white shadow-lg"
              >
                <Mail size={16} />
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-start justify-between">
            <h3 className="text-lg font-bold leading-tight text-slate-800">
              {cabana.nombre}
            </h3>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
                title="Eliminar alojamiento"
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => onEdit(cabana.slug)}
                className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10"
                title="Editar alojamiento"
              >
                <Edit2 size={18} />
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{cabana.capacidad}</span>
            </div>
            <span className="font-bold text-primary">
              ${cabana.precio} / noche
            </span>
          </div>

          <button
            type="button"
            onClick={() => onEdit(cabana.slug)}
            className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Editar alojamiento
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              Eliminar alojamiento
            </h3>
            <p className="mb-6 text-slate-500">
              ¿Estás seguro de eliminar el alojamiento{" "}
              <span className="font-bold text-slate-800">
                &quot;{cabana.nombre}&quot;
              </span>
              ? Se borrarán todas sus fotos y datos. Esta acción no se puede
              deshacer.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  onDelete(cabana.slug);
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-red-200 transition-colors hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
