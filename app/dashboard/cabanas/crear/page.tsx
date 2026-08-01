"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AmenityPicker } from "@/components/dashboard/AmenityPicker";
import { AirbnbCalendarConnect } from "@/components/dashboard/AirbnbCalendarConnect";
import { CabinAvailabilityCalendar } from "@/components/dashboard/CabinAvailabilityCalendar";
import {
  CabinContactMethodToggle,
  type ContactMethod,
} from "@/components/dashboard/CabinContactMethodToggle";
import { ContactConfigRequiredModal } from "@/components/dashboard/ContactConfigRequiredModal";
import { CabinVideoLinks } from "@/components/dashboard/CabinVideoLinks";
import {
  cabanaEmptyMediaClass,
  cabanaFieldClass,
  cabanaLabelClass,
  cabanaPreviewTileClass,
  cabanaPriceInputClass,
  cabanaSectionClass,
  cabanaTextareaClass,
  cabanaUploadButtonClass,
} from "@/components/dashboard/cabana-form-styles";
import type { PrecioPorFecha } from "@/types/cabin";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  Trash2,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

function isImageFile(file: File): boolean {
  return Boolean(file.type && file.type.startsWith("image/"));
}

export default function CreateCabanaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    capacidad: 2,
    amenities: [] as string[],
    ical_url: "",
  });
  const [metodoContacto, setMetodoContacto] = useState<ContactMethod>("WA");
  const [contactModal, setContactModal] = useState<{
    open: boolean;
    method: ContactMethod;
  }>({ open: false, method: "WA" });

  const [preciosPorFecha, setPreciosPorFecha] = useState<PrecioPorFecha[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const hasPhone = Boolean(user?.profile?.telefono?.trim());
  const hasEmail = Boolean(
    (user?.email || user?.profile?.email_contacto || "").trim()
  );

  const openContactModal = (method: ContactMethod) => {
    setContactModal({ open: true, method });
  };

  useEffect(() => {
    if (!user) return;
    const profileMethod = (user.profile?.metodo_contacto || "WA") as ContactMethod;
    if (profileMethod === "WA" && hasPhone) {
      setMetodoContacto("WA");
    } else if (profileMethod === "MAIL" && hasEmail) {
      setMetodoContacto("MAIL");
    } else if (hasPhone) {
      setMetodoContacto("WA");
    } else if (hasEmail) {
      setMetodoContacto("MAIL");
    }
  }, [user, hasPhone, hasEmail]);

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const [preciosEspeciales, setPreciosEspeciales] = useState<
    { dia_semana: number; precio: string }[]
  >([0, 1, 2, 3, 4, 5, 6].map((dia) => ({ dia_semana: dia, precio: "" })));

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const images = filesArray.filter(isImageFile);
    if (images.length < filesArray.length) {
      toast.error("Solo se permiten imágenes (JPG, PNG, WebP…).");
    }
    if (images.length === 0) {
      e.target.value = "";
      return;
    }
    setSelectedFiles((prev) => [...prev, ...images]);
    const newPreviews = images.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePrecioChange = (dia_semana: number, nuevoPrecio: string) => {
    setPreciosEspeciales((prev) =>
      prev.map((p) =>
        p.dia_semana === dia_semana ? { ...p, precio: nuevoPrecio } : p
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (metodoContacto === "WA" && !hasPhone) {
      openContactModal("WA");
      return;
    }
    if (metodoContacto === "MAIL" && !hasEmail) {
      openContactModal("MAIL");
      return;
    }

    setLoading(true);
    setStatusText("Creando alojamiento...");

    try {
      // Teléfono/email se heredan de Configuración; el canal se elige por alojamiento.
      const icalUrl = formData.ical_url.trim();
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        capacidad: formData.capacidad,
        amenities: formData.amenities,
        ical_url: icalUrl || null,
        metodo_contacto: metodoContacto,
        telefono_whatsapp: null,
        email_contacto: null,
      };
      const response = await api.post("/cabanas/", payload);
      const slug = response.data.slug;

      if (icalUrl) {
        setStatusText("Sincronizando calendario Airbnb...");
        try {
          await api.post(`/cabanas/${slug}/sincronizar_ical/`, {
            ical_url: icalUrl,
          });
        } catch (syncErr) {
          console.error("Error al sincronizar calendario", syncErr);
          toast.error(
            "Alojamiento creado, pero no se pudo sincronizar el calendario de Airbnb."
          );
        }
      }

      if (preciosPorFecha.length > 0) {
        setStatusText("Guardando precios por fecha...");
        for (const override of preciosPorFecha) {
          const precio = String(override.precio).trim();
          if (!precio) continue;
          await api.post(`/cabanas/${slug}/actualizar_precio_fecha/`, {
            fecha: String(override.fecha).slice(0, 10),
            precio,
          });
        }
      }

      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setStatusText(`Subiendo foto ${i + 1} de ${selectedFiles.length}...`);
          const imgData = new FormData();
          imgData.append("imagen", selectedFiles[i]);
          await api.post(`/cabanas/${slug}/subir_imagen/`, imgData);
        }
      }

      if (videoUrls.length > 0) {
        setStatusText("Guardando videos...");
        for (const url of videoUrls) {
          await api.post(`/cabanas/${slug}/agregar_video/`, { url });
        }
      }

      const preciosValidos = preciosEspeciales.filter(
        (p) => p.precio.trim() !== ""
      );
      if (preciosValidos.length > 0) {
        setStatusText("Configurando precios especiales...");
        await api.post(`/cabanas/${slug}/actualizar_precios/`, {
          precios: preciosValidos,
        });
      }

      setStatusText("¡Publicación exitosa!");
      toast.success("Alojamiento creado correctamente con fotos y precios.");
      router.push("/dashboard/cabanas");
    } catch (error) {
      console.error("Error en la creación completa", error);
      toast.error("Hubo un error al procesar la solicitud.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <button
        type="button"
        onClick={() => router.push("/dashboard/cabanas")}
        className="mb-6 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={20} /> Volver a Mis Alojamientos
      </button>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="page-title-sm mb-8">
          Publicar nuevo alojamiento
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={cabanaLabelClass} htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={cabanaFieldClass}
                required
                placeholder="Ej: Alojamiento del Bosque"
              />
            </div>
            <div>
              <label className={cabanaLabelClass} htmlFor="precio">
                Precio Base ($)
              </label>
              <input
                id="precio"
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className={cabanaFieldClass}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={cabanaLabelClass} htmlFor="capacidad">
                Capacidad (Personas)
              </label>
              <input
                id="capacidad"
                type="number"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
                className={cabanaFieldClass}
                required
                placeholder="Ej: 4"
              />
            </div>
          </div>

          <div>
            <label className={cabanaLabelClass} htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              className={cabanaTextareaClass}
              placeholder="Ubicación, ambiente y detalles del alojamiento..."
            />
          </div>

          <CabinContactMethodToggle
            value={metodoContacto}
            onChange={setMetodoContacto}
            hasPhone={hasPhone}
            hasEmail={hasEmail}
            onBlocked={openContactModal}
          />

          <AirbnbCalendarConnect
            value={formData.ical_url}
            onChange={(ical_url) => setFormData({ ...formData, ical_url })}
            showSyncButton={false}
          />

          <CabinAvailabilityCalendar
            mode="local"
            precioBase={formData.precio}
            preciosEspeciales={preciosEspeciales
              .filter((p) => p.precio.trim() !== "")
              .map((p) => ({
                id: p.dia_semana,
                dia_semana: p.dia_semana,
                nombre_dia: diasSemana[p.dia_semana],
                precio: p.precio,
              }))}
            initialOverrides={preciosPorFecha}
            onLocalChange={setPreciosPorFecha}
          />

          <AmenityPicker
            value={formData.amenities}
            onChange={(amenities) => setFormData({ ...formData, amenities })}
          />

          <div className="mt-12 grid grid-cols-1 gap-8 border-t border-slate-100 pt-8 lg:grid-cols-2">
            <div className={cabanaSectionClass}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-black text-slate-900">
                  <ImageIcon size={20} className="text-primary" /> Galería de
                  Fotos
                </h3>
                <label className={cabanaUploadButtonClass}>
                  <UploadCloud size={16} /> Seleccionar
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="-mt-3 mb-4 text-xs text-slate-400">
                Solo imágenes (JPG, PNG, WebP…)
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previews.map((url, index) => (
                  <div key={url} className={cabanaPreviewTileClass}>
                    <img
                      src={url}
                      className="h-full w-full object-cover"
                      alt={`Vista previa ${index + 1}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary py-1 text-center text-[10px] font-bold text-white">
                        SERÁ PORTADA
                      </div>
                    )}
                  </div>
                ))}
                {previews.length === 0 && (
                  <div className={cabanaEmptyMediaClass}>
                    <ImageIcon className="mb-2 text-slate-300" size={32} />
                    <p className="text-sm font-semibold text-slate-600">
                      Subí fotos de tu alojamiento
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      La primera imagen será la portada
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={cabanaSectionClass}>
              <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900">
                <DollarSign size={20} className="text-emerald-600" /> Precios por
                Día (Opcional)
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {preciosEspeciales.map((item) => (
                      <tr key={item.dia_semana} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {diasSemana[item.dia_semana]}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            value={item.precio}
                            onChange={(e) =>
                              handlePrecioChange(
                                item.dia_semana,
                                e.target.value
                              )
                            }
                            placeholder={`Base: $${formData.precio || "0"}`}
                            className={cabanaPriceInputClass}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <CabinVideoLinks
            mode="local"
            value={videoUrls}
            onChange={setVideoUrls}
          />

          <div className="flex flex-col items-center gap-4 border-t border-slate-100 pt-8">
            {loading && (
              <div className="flex animate-pulse items-center gap-2 text-sm font-bold text-primary">
                <Loader2 className="animate-spin" /> {statusText}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl shadow-primary/15 transition-all hover:bg-primary/90 ${
                loading
                  ? "cursor-not-allowed opacity-50"
                  : "active:scale-95"
              }`}
            >
              {!loading && <Save size={22} />}
              {loading ? "Publicando..." : "Publicar alojamiento"}
            </button>
          </div>
        </form>
      </div>

      <ContactConfigRequiredModal
        open={contactModal.open}
        method={contactModal.method}
        onClose={() => setContactModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
