"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Cabana } from "@/types/cabin";
import { getMediaUrl } from "@/lib/media";
import { Edit2, Users, Mail, Trash2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { ConfirmActionModal } from "@/components/dashboard/ConfirmActionModal";

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
            <Image
              src={portadaUrl}
              alt={cabana.nombre}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
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
                className="rounded-full bg-whatsapp p-1.5 text-whatsapp-foreground shadow-lg"
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
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                title="Eliminar alojamiento"
                aria-label={`Eliminar alojamiento ${cabana.nombre}`}
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => onEdit(cabana.slug)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                title="Editar alojamiento"
                aria-label={`Editar alojamiento ${cabana.nombre}`}
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

      <ConfirmActionModal
        open={showModal}
        title="Eliminar alojamiento"
        body={`¿Estás seguro de eliminar el alojamiento "${cabana.nombre}"? Se borrarán todas sus fotos y datos. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        variant="danger"
        onConfirm={() => onDelete(cabana.slug)}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
