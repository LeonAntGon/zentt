"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import { useAuth } from "@/contexts/AuthContext";
import { Cabana } from "@/types/cabin";
import { AmenityPicker } from "@/components/dashboard/AmenityPicker";
import {
  cabanaFieldClass,
  cabanaLabelClass,
  cabanaPreviewTileClass,
  cabanaPriceInputClass,
  cabanaSectionClass,
  cabanaTextareaClass,
  cabanaUploadButtonClass,
} from "@/components/dashboard/cabana-form-styles";
import { normalizeAmenities } from "@/lib/amenities";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { CabinAvailabilityCalendar } from "@/components/dashboard/CabinAvailabilityCalendar";
import { AirbnbCalendarConnect } from "@/components/dashboard/AirbnbCalendarConnect";
import {
  CabinContactMethodToggle,
  type ContactMethod,
} from "@/components/dashboard/CabinContactMethodToggle";
import { ContactConfigRequiredModal } from "@/components/dashboard/ContactConfigRequiredModal";
import { ConfirmActionModal } from "@/components/dashboard/ConfirmActionModal";
import { CabinVideoLinks } from "@/components/dashboard/CabinVideoLinks";
import type { PrecioPorFecha } from "@/types/cabin";
import { toast } from "sonner";

type ImageConfirmState = {
  title: string;
  body: string;
  confirmLabel: string;
  variant: "danger" | "primary";
  onConfirm: () => void;
} | null;

export default function EditCabanaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { user } = useAuth();

  const [cabana, setCabana] = useState<Cabana | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    capacidad: 0,
    ical_url: "",
    amenities: [] as string[],
  });
  const [metodoContacto, setMetodoContacto] = useState<ContactMethod>("WA");
  const [syncingIcal, setSyncingIcal] = useState(false);
  const [contactModal, setContactModal] = useState<{
    open: boolean;
    method: ContactMethod;
  }>({ open: false, method: "WA" });
  const [imageConfirm, setImageConfirm] = useState<ImageConfirmState>(null);
  const [saving, setSaving] = useState(false);

  const hasPhone = Boolean(user?.profile?.telefono?.trim());
  const hasEmail = Boolean(
    (user?.email || user?.profile?.email_contacto || "").trim()
  );

  const openContactModal = (method: ContactMethod) => {
    setContactModal({ open: true, method });
  };

  const [preciosEspeciales, setPreciosEspeciales] = useState<
    { dia_semana: number; precio: string }[]
  >([]);
  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  useEffect(() => {
    const fetchCabana = async () => {
      try {
        const response = await api.get<Cabana>(`/cabanas/${slug}/`);
        setCabana(response.data);

        setFormData({
          nombre: response.data.nombre,
          descripcion: response.data.descripcion || "",
          precio: response.data.precio.toString(),
          capacidad: response.data.capacidad,
          ical_url: response.data.ical_url || "",
          amenities: normalizeAmenities(response.data.amenities),
        });
        setMetodoContacto(
          (response.data.metodo_contacto === "MAIL" ? "MAIL" : "WA") as ContactMethod
        );

        const preciosIniciales = [0, 1, 2, 3, 4, 5, 6].map((dia) => {
          const precioExistente = response.data.precios_especiales?.find(
            (p) => p.dia_semana === dia
          );
          return {
            dia_semana: dia,
            precio: precioExistente ? precioExistente.precio.toString() : "",
          };
        });
        setPreciosEspeciales(preciosIniciales);
      } catch (error) {
        console.error("Error cargando la cabaña", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchCabana();
  }, [slug]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    setSaving(true);
    try {
      // Teléfono/email se heredan de Configuración; el canal es por alojamiento.
      await api.patch(`/cabanas/${slug}/`, {
        ...formData,
        nombre: formData.nombre.trim(),
        metodo_contacto: metodoContacto,
        telefono_whatsapp: null,
        email_contacto: null,
        ical_url: formData.ical_url.trim() || null,
      });
      toast.success("Datos guardados con éxito");
      router.replace("/dashboard/cabanas");
    } catch (error) {
      console.error("Error guardando", error);
      if (axios.isAxiosError(error) && error.response?.data?.nombre) {
        const msg = Array.isArray(error.response.data.nombre)
          ? error.response.data.nombre[0]
          : String(error.response.data.nombre);
        toast.error(msg);
      } else {
        toast.error("Hubo un error al guardar los cambios.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSyncIcal = async () => {
    if (!slug) return;
    const url = formData.ical_url.trim();
    if (!url) {
      toast.error("Pegá primero el enlace del calendario de Airbnb.");
      return;
    }
    setSyncingIcal(true);
    try {
      const { data } = await api.post<{
        total: number;
        created: number;
        updated: number;
        deleted: number;
        ical_url?: string;
      }>(`/cabanas/${slug}/sincronizar_ical/`, { ical_url: url });
      const refreshed = await api.get<Cabana>(`/cabanas/${slug}/`);
      setCabana(refreshed.data);
      toast.success(
        `Calendario sincronizado: ${data.total} bloqueos (${data.created} nuevos).`
      );
    } catch (err: unknown) {
      const detail =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail;
      toast.error(
        typeof detail === "string"
          ? detail
          : "No se pudo sincronizar el calendario de Airbnb."
      );
    } finally {
      setSyncingIcal(false);
    }
  };

  const handleSubirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cabana) return;

    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes (JPG, PNG, WebP…).");
      e.target.value = "";
      return;
    }

    const imgData = new FormData();
    imgData.append("imagen", file);

    try {
      await api.post(`/cabanas/${slug}/subir_imagen/`, imgData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const response = await api.get<Cabana>(`/cabanas/${slug}/`);
      setCabana(response.data);
      toast.success("Imagen subida con éxito");
    } catch (error) {
      console.error("Error subiendo imagen", error);
      toast.error("No se pudo subir la imagen. Verificá el formato.");
    } finally {
      e.target.value = "";
    }
  };

  const handleAgregarVideo = async (url: string) => {
    try {
      await api.post(`/cabanas/${slug}/agregar_video/`, { url });
      const response = await api.get<Cabana>(`/cabanas/${slug}/`);
      setCabana(response.data);
      toast.success("Video agregado");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error;
      toast.error(
        typeof msg === "string" ? msg : "No se pudo agregar el video."
      );
      throw err;
    }
  };

  const handleEliminarVideo = async (videoId: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este video?")) return;
    try {
      await api.delete(`/cabanas/${slug}/eliminar_video/`, {
        params: { video_id: videoId },
      });
      const response = await api.get<Cabana>(`/cabanas/${slug}/`);
      setCabana(response.data);
      toast.success("Video eliminado");
    } catch {
      toast.error("Error al eliminar el video.");
    }
  };

  const marcarPortada = async (imagenId: number) => {
    try {
      await api.post(`/cabanas/${slug}/marcar_portada/`, {
        imagen_id: imagenId,
      });
      const response = await api.get<Cabana>(`/cabanas/${slug}/`);
      setCabana(response.data);
      toast.success("Portada actualizada");
    } catch {
      toast.error("Error al marcar portada.");
    }
  };

  const eliminarImagen = async (imagenId: number) => {
    try {
      await api.delete(`/cabanas/${slug}/eliminar_imagen/`, {
        params: { imagen_id: imagenId },
      });
      const response = await api.get<Cabana>(`/cabanas/${slug}/`);
      setCabana(response.data);
      toast.success("Imagen eliminada");
    } catch {
      toast.error("Error al eliminar la imagen.");
    }
  };

  const askMarcarPortada = (imagenId: number) => {
    setImageConfirm({
      title: "Usar como portada",
      body: "Esta imagen pasará a ser la portada principal del alojamiento. ¿Confirmás el cambio?",
      confirmLabel: "Hacer portada",
      variant: "primary",
      onConfirm: () => void marcarPortada(imagenId),
    });
  };

  const askEliminarImagen = (imagenId: number) => {
    setImageConfirm({
      title: "Eliminar imagen",
      body: "Esta foto se eliminará del alojamiento. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: () => void eliminarImagen(imagenId),
    });
  };

  const handlePrecioChange = (dia_semana: number, nuevoPrecio: string) => {
    setPreciosEspeciales((prev) =>
      prev.map((p) =>
        p.dia_semana === dia_semana ? { ...p, precio: nuevoPrecio } : p
      )
    );
  };

  const handleGuardarPrecios = async () => {
    try {
      const preciosValidos = preciosEspeciales.filter(
        (p) => p.precio.trim() !== ""
      );
      await api.post(`/cabanas/${slug}/actualizar_precios/`, {
        precios: preciosValidos,
      });
      toast.success("Precios guardados correctamente.");
    } catch {
      toast.error("Error al guardar precios.");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Cargando datos...</div>;
  if (!cabana)
    return (
      <div className="p-10 text-center text-red-500">
        Alojamiento no encontrado
      </div>
    );

  const portadaActiva = cabana.imagenes?.find((img) => img.es_portada);
  const otrasFotos = cabana.imagenes?.filter((img) => !img.es_portada) || [];

  return (
    <div className="mx-auto max-w-5xl p-6 pb-28 md:p-10 md:pb-28">
      <button
        type="button"
        onClick={() => router.push("/dashboard/cabanas")}
        className="mb-6 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={20} /> Volver a Mis Alojamientos
      </button>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="page-title-sm mb-6">
          Editar: {cabana.nombre}
        </h1>

        <form
          id="editar-cabana-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={cabanaLabelClass}>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={cabanaFieldClass}
                required
                placeholder="Nombre del alojamiento"
              />
            </div>
            <div>
              <label className={cabanaLabelClass}>Precio Base ($)</label>
              <input
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
              <label className={cabanaLabelClass}>Capacidad (Personas)</label>
              <input
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
            <label className={cabanaLabelClass}>Descripción</label>
            <textarea
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
            showSyncButton
            onSync={handleSyncIcal}
            syncing={syncingIcal}
            bloqueosCount={cabana.bloqueos_externos?.length ?? 0}
          />

          {cabana && (
            <CabinAvailabilityCalendar
              mode="api"
              slug={slug}
              cabana={cabana}
              precioBase={formData.precio}
              onOverridesChange={(rows: PrecioPorFecha[]) =>
                setCabana((prev) =>
                  prev ? { ...prev, precios_por_fecha: rows } : prev
                )
              }
            />
          )}

          <AmenityPicker
            value={formData.amenities}
            onChange={(amenities) => setFormData({ ...formData, amenities })}
          />
        </form>

        <div className="mt-12 grid grid-cols-1 gap-8 border-t border-slate-100 pt-8 lg:grid-cols-2">
          <div className={cabanaSectionClass}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-black text-slate-900">
                <ImageIcon size={20} className="text-primary" /> Galería
              </h3>
              <label className={cabanaUploadButtonClass}>
                <UploadCloud size={16} /> Subir Foto
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleSubirImagen}
                />
              </label>
            </div>
            <p className="-mt-3 mb-4 text-xs text-slate-400">
              Solo imágenes (JPG, PNG, WebP…)
            </p>

            <div className="mb-6 rounded-xl border border-slate-100 bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Star size={16} className="text-yellow-500" /> Portada Principal
              </h4>
              {portadaActiva ? (
                <div className="group relative aspect-video w-full overflow-hidden rounded-lg border-2 border-primary/40">
                  <img
                    src={getMediaUrl(portadaActiva.imagen) || ""}
                    alt="Portada"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                    <Star size={12} className="fill-white" /> Portada
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => askEliminarImagen(portadaActiva.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white">
                  <span className="text-sm font-medium text-slate-400">
                    Sin portada
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {otrasFotos.map((img) => (
                <div key={img.id} className={cabanaPreviewTileClass}>
                  <img
                    src={getMediaUrl(img.imagen) || ""}
                    alt="Alojamiento"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => askMarcarPortada(img.id)}
                      title="Usar como portada"
                      aria-label="Usar como portada"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition-colors hover:bg-primary hover:text-white"
                    >
                      <Star size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => askEliminarImagen(img.id)}
                      title="Eliminar imagen"
                      aria-label="Eliminar imagen"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cabanaSectionClass} flex flex-col`}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-black text-slate-900">
                <DollarSign size={20} className="text-emerald-600" /> Precios por
                Día
              </h3>
              <button
                type="button"
                onClick={handleGuardarPrecios}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white"
              >
                <Save size={16} /> Guardar
              </button>
            </div>
            <div className="flex-1 overflow-hidden rounded-xl border border-slate-100 bg-white">
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
                            handlePrecioChange(item.dia_semana, e.target.value)
                          }
                          placeholder={`$${formData.precio}`}
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

        <div className="mt-8">
          <CabinVideoLinks
            mode="api"
            videos={cabana.videos || []}
            onAdd={handleAgregarVideo}
            onRemove={handleEliminarVideo}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-md md:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4">
          <p className="hidden text-xs text-slate-400 sm:block">
            Guardá los datos del alojamiento cuando termines de editar.
          </p>
          <button
            type="submit"
            form="editar-cabana-form"
            disabled={saving}
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <ContactConfigRequiredModal
        open={contactModal.open}
        method={contactModal.method}
        onClose={() => setContactModal((prev) => ({ ...prev, open: false }))}
      />
      <ConfirmActionModal
        open={Boolean(imageConfirm)}
        title={imageConfirm?.title || ""}
        body={imageConfirm?.body || ""}
        confirmLabel={imageConfirm?.confirmLabel}
        variant={imageConfirm?.variant}
        onConfirm={() => imageConfirm?.onConfirm()}
        onClose={() => setImageConfirm(null)}
      />
    </div>
  );
}
