"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { CabinAvailabilityCalendar } from "@/components/dashboard/CabinAvailabilityCalendar";
import { AirbnbCalendarConnect } from "@/components/dashboard/AirbnbCalendarConnect";
import { BookingCalendarConnect } from "@/components/dashboard/BookingCalendarConnect";
import {
  CabinContactMethodToggle,
  type ContactMethod,
} from "@/components/dashboard/CabinContactMethodToggle";
import { ContactConfigRequiredModal } from "@/components/dashboard/ContactConfigRequiredModal";
import { ConfirmActionModal } from "@/components/dashboard/ConfirmActionModal";
import { CabinVideoLinks } from "@/components/dashboard/CabinVideoLinks";
import {
  FormSectionNav,
  type FormSection,
} from "@/components/dashboard/FormSectionNav";
import { FormStickySaveBar } from "@/components/dashboard/FormStickySaveBar";
import type { PrecioPorFecha } from "@/types/cabin";
import { toast } from "sonner";

type ImageConfirmState = {
  title: string;
  body: string;
  confirmLabel: string;
  variant: "danger" | "primary";
  onConfirm: () => void;
} | null;

type FieldErrors = Partial<Record<"nombre" | "precio" | "capacidad", string>>;

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
    ical_url_booking: "",
    amenities: [] as string[],
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [metodoContacto, setMetodoContacto] = useState<ContactMethod>("WA");
  const [syncingIcal, setSyncingIcal] = useState(false);
  const [syncingIcalBooking, setSyncingIcalBooking] = useState(false);
  const [contactModal, setContactModal] = useState<{
    open: boolean;
    method: ContactMethod;
  }>({ open: false, method: "WA" });
  const [imageConfirm, setImageConfirm] = useState<ImageConfirmState>(null);
  const [saving, setSaving] = useState(false);
  const [savingPrecios, setSavingPrecios] = useState(false);

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
          ical_url_booking: response.data.ical_url_booking || "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!formData.nombre.trim()) {
      next.nombre = "Poné un nombre para el alojamiento.";
    } else if (formData.nombre.trim().length < 3) {
      next.nombre = "Al menos 3 caracteres.";
    }
    const precioNum = Number(formData.precio);
    if (!formData.precio.toString().trim()) {
      next.precio = "Definí el precio base por noche.";
    } else if (Number.isNaN(precioNum) || precioNum <= 0) {
      next.precio = "El precio debe ser mayor a 0.";
    }
    const capNum = Number(formData.capacidad);
    if (!formData.capacidad || Number.isNaN(capNum) || capNum <= 0) {
      next.capacidad = "Ingresá una capacidad válida (personas).";
    }
    return next;
  };

  const missingCount = useMemo(() => {
    let n = 0;
    if (!formData.nombre.trim() || formData.nombre.trim().length < 3) n++;
    if (!String(formData.precio).trim() || Number(formData.precio) <= 0) n++;
    if (!formData.capacidad || Number(formData.capacidad) <= 0) n++;
    return n;
  }, [formData.nombre, formData.precio, formData.capacidad]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 96,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Revisá los campos marcados en rojo.");
      scrollToId("sec-datos");
      return;
    }

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
      await api.patch(`/cabanas/${slug}/`, {
        ...formData,
        nombre: formData.nombre.trim(),
        metodo_contacto: metodoContacto,
        telefono_whatsapp: null,
        email_contacto: null,
        ical_url: formData.ical_url.trim() || null,
        ical_url_booking: formData.ical_url_booking.trim() || null,
      });
      toast.success("Datos guardados con éxito");
      router.replace("/dashboard/cabanas");
    } catch (error) {
      console.error("Error guardando", error);
      if (axios.isAxiosError(error) && error.response?.data?.nombre) {
        const msg = Array.isArray(error.response.data.nombre)
          ? error.response.data.nombre[0]
          : String(error.response.data.nombre);
        setErrors((prev) => ({ ...prev, nombre: msg }));
        toast.error(msg);
        scrollToId("sec-datos");
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
      }>(`/cabanas/${slug}/sincronizar_ical/`, { ical_url: url, source: "airbnb" });
      const refreshed = await api.get<Cabana>(`/cabanas/${slug}/`);
      setCabana(refreshed.data);
      toast.success(
        `Calendario Airbnb sincronizado: ${data.total} bloqueos (${data.created} nuevos).`
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

  const handleSyncIcalBooking = async () => {
    if (!slug) return;
    const url = formData.ical_url_booking.trim();
    if (!url) {
      toast.error("Pegá primero el enlace del calendario de Booking.");
      return;
    }
    setSyncingIcalBooking(true);
    try {
      const { data } = await api.post<{
        total: number;
        created: number;
        updated: number;
        deleted: number;
        ical_url_booking?: string;
      }>(`/cabanas/${slug}/sincronizar_ical/`, {
        ical_url_booking: url,
        source: "booking",
      });
      const refreshed = await api.get<Cabana>(`/cabanas/${slug}/`);
      setCabana(refreshed.data);
      toast.success(
        `Calendario Booking sincronizado: ${data.total} bloqueos (${data.created} nuevos).`
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
          : "No se pudo sincronizar el calendario de Booking."
      );
    } finally {
      setSyncingIcalBooking(false);
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

  const performEliminarVideo = async (videoId: number) => {
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

  const handleEliminarVideo = async (videoId: number) => {
    setImageConfirm({
      title: "Eliminar video",
      body: "¿Seguro que querés eliminar este video? Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      variant: "danger",
      onConfirm: () => performEliminarVideo(videoId),
    });
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
    setSavingPrecios(true);
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
    } finally {
      setSavingPrecios(false);
    }
  };

  const sections: FormSection[] = useMemo(
    () => [
      {
        id: "sec-datos",
        label: "Datos básicos",
        required: true,
        hasError: Boolean(errors.nombre || errors.precio || errors.capacidad),
      },
      { id: "sec-descripcion", label: "Descripción" },
      { id: "sec-contacto", label: "Canal de contacto" },
      { id: "sec-airbnb", label: "Airbnb (iCal)" },
      { id: "sec-booking", label: "Booking (iCal)" },
      { id: "sec-precios-especiales", label: "Precios especiales" },
      { id: "sec-amenities", label: "Amenities" },
      { id: "sec-galeria", label: "Galería" },
      { id: "sec-precios-dia", label: "Precios por día" },
      { id: "sec-videos", label: "Videos" },
    ],
    [errors]
  );

  if (loading)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">
          Cargando alojamiento...
        </p>
      </div>
    );
  if (!cabana)
    return (
      <div className="p-10 text-center text-red-500">
        Alojamiento no encontrado
      </div>
    );

  const portadaActiva = cabana.imagenes?.find((img) => img.es_portada);
  const otrasFotos = cabana.imagenes?.filter((img) => !img.es_portada) || [];
  const invalidFieldClass = `${cabanaFieldClass} border-red-300 focus:border-red-500 focus:ring-red-500/20`;

  return (
    <div className="mx-auto max-w-6xl p-6 pb-28 md:p-10 md:pb-28">
      <button
        type="button"
        onClick={() => router.push("/dashboard/cabanas")}
        className="mb-6 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={20} /> Volver a Mis Alojamientos
      </button>

      <div className="mb-6">
        <h1 className="page-title-sm">Editar: {cabana.nombre}</h1>
        <p className="page-subtitle mt-1">
          Los cambios se guardan al presionar &ldquo;Guardar cambios&rdquo;.
          Fotos, videos y precios por día se guardan por separado.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-8">
        <FormSectionNav sections={sections} />

        <div className="space-y-6">
          <form
            id="editar-cabana-form"
            onSubmit={handleSubmit}
            className="space-y-6"
            noValidate
          >
            <section
              id="sec-datos"
              aria-labelledby="sec-datos-title"
              className={`${cabanaSectionClass} scroll-mt-24`}
            >
              <h2
                id="sec-datos-title"
                className="mb-4 font-black text-slate-900"
              >
                Datos básicos
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={cabanaLabelClass} htmlFor="nombre">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={
                      errors.nombre ? invalidFieldClass : cabanaFieldClass
                    }
                    placeholder="Nombre del alojamiento"
                    aria-invalid={Boolean(errors.nombre)}
                    aria-describedby={errors.nombre ? "err-nombre" : undefined}
                  />
                  {errors.nombre && (
                    <p
                      id="err-nombre"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {errors.nombre}
                    </p>
                  )}
                </div>
                <div>
                  <label className={cabanaLabelClass} htmlFor="precio">
                    Precio Base ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="precio"
                    type="number"
                    min={0}
                    step="0.01"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    className={
                      errors.precio ? invalidFieldClass : cabanaFieldClass
                    }
                    placeholder="0.00"
                    aria-invalid={Boolean(errors.precio)}
                    aria-describedby={errors.precio ? "err-precio" : undefined}
                  />
                  {errors.precio && (
                    <p
                      id="err-precio"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {errors.precio}
                    </p>
                  )}
                </div>
                <div>
                  <label className={cabanaLabelClass} htmlFor="capacidad">
                    Capacidad (personas) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="capacidad"
                    type="number"
                    min={1}
                    step={1}
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleChange}
                    className={
                      errors.capacidad ? invalidFieldClass : cabanaFieldClass
                    }
                    placeholder="Ej: 4"
                    aria-invalid={Boolean(errors.capacidad)}
                    aria-describedby={
                      errors.capacidad ? "err-capacidad" : undefined
                    }
                  />
                  {errors.capacidad && (
                    <p
                      id="err-capacidad"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {errors.capacidad}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section
              id="sec-descripcion"
              aria-labelledby="sec-descripcion-title"
              className={`${cabanaSectionClass} scroll-mt-24`}
            >
              <h2
                id="sec-descripcion-title"
                className="mb-4 font-black text-slate-900"
              >
                Descripción
              </h2>
              <label className={cabanaLabelClass} htmlFor="descripcion">
                Contales a los huéspedes cómo es el lugar
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
            </section>

            <section id="sec-contacto" className="scroll-mt-24">
              <CabinContactMethodToggle
                value={metodoContacto}
                onChange={setMetodoContacto}
                hasPhone={hasPhone}
                hasEmail={hasEmail}
                onBlocked={openContactModal}
              />
            </section>

            <section id="sec-airbnb" className="scroll-mt-24">
              <AirbnbCalendarConnect
                value={formData.ical_url}
                onChange={(ical_url) => setFormData({ ...formData, ical_url })}
                showSyncButton
                onSync={handleSyncIcal}
                syncing={syncingIcal}
                bloqueosCount={
                  cabana.bloqueos_externos?.filter((b) =>
                    b.uid.startsWith("airbnb__")
                  ).length ?? 0
                }
              />
            </section>

            <section id="sec-booking" className="scroll-mt-24">
              <BookingCalendarConnect
                value={formData.ical_url_booking}
                onChange={(ical_url_booking) =>
                  setFormData({ ...formData, ical_url_booking })
                }
                showSyncButton
                onSync={handleSyncIcalBooking}
                syncing={syncingIcalBooking}
                bloqueosCount={
                  cabana.bloqueos_externos?.filter((b) =>
                    b.uid.startsWith("booking__")
                  ).length ?? 0
                }
              />
            </section>

            {cabana && (
              <section id="sec-precios-especiales" className="scroll-mt-24">
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
              </section>
            )}

            <section id="sec-amenities" className="scroll-mt-24">
              <AmenityPicker
                value={formData.amenities}
                onChange={(amenities) =>
                  setFormData({ ...formData, amenities })
                }
              />
            </section>
          </form>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section
              id="sec-galeria"
              aria-labelledby="sec-galeria-title"
              className={`${cabanaSectionClass} scroll-mt-24`}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2
                  id="sec-galeria-title"
                  className="flex items-center gap-2 font-black text-slate-900"
                >
                  <ImageIcon size={20} className="text-primary" /> Galería
                </h2>
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
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Star size={16} className="text-yellow-500" /> Portada Principal
                </h3>
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
            </section>

            <section
              id="sec-precios-dia"
              aria-labelledby="sec-precios-dia-title"
              className={`${cabanaSectionClass} scroll-mt-24 flex flex-col`}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2
                  id="sec-precios-dia-title"
                  className="flex items-center gap-2 font-black text-slate-900"
                >
                  <DollarSign size={20} className="text-emerald-600" /> Precios
                  por día
                </h2>
                <button
                  type="button"
                  onClick={handleGuardarPrecios}
                  disabled={savingPrecios}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                >
                  {savingPrecios ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {savingPrecios ? "Guardando..." : "Guardar"}
                </button>
              </div>
              <div className="flex-1 overflow-hidden rounded-xl border border-slate-100 bg-white">
                <table className="w-full text-sm">
                  <caption className="sr-only">Precios por día de la semana</caption>
                  <tbody className="divide-y divide-slate-100">
                    {preciosEspeciales.map((item) => {
                      const inputId = `precio-dia-edit-${item.dia_semana}`;
                      return (
                        <tr
                          key={item.dia_semana}
                          className="hover:bg-slate-50/80"
                        >
                          <td className="px-4 py-3">
                            <label
                              htmlFor={inputId}
                              className="font-semibold text-slate-700"
                            >
                              {diasSemana[item.dia_semana]}
                            </label>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              id={inputId}
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.precio}
                              onChange={(e) =>
                                handlePrecioChange(
                                  item.dia_semana,
                                  e.target.value
                                )
                              }
                              placeholder={`$${formData.precio}`}
                              className={cabanaPriceInputClass}
                              aria-label={`Precio para ${diasSemana[item.dia_semana]}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section id="sec-videos" className="scroll-mt-24">
            <CabinVideoLinks
              mode="api"
              videos={cabana.videos || []}
              onAdd={handleAgregarVideo}
              onRemove={handleEliminarVideo}
            />
          </section>
        </div>
      </div>

      <FormStickySaveBar
        form="editar-cabana-form"
        loading={saving}
        submitLabel="Guardar cambios"
        loadingLabel="Guardando..."
        missingCount={missingCount}
        disabled={missingCount > 0}
        onCancel={() => router.push("/dashboard/cabanas")}
      />

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
