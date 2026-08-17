"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AmenityPicker } from "@/components/dashboard/AmenityPicker";
import { AirbnbCalendarConnect } from "@/components/dashboard/AirbnbCalendarConnect";
import { BookingCalendarConnect } from "@/components/dashboard/BookingCalendarConnect";
import { CabinAvailabilityCalendar } from "@/components/dashboard/CabinAvailabilityCalendar";
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
import type { Cabana, PrecioPorFecha } from "@/types/cabin";
import {
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { UpgradePricingModal } from "@/components/dashboard/UpgradePricingModal";
import { canCreateCabana, getMaxCabanas } from "@/lib/planLimits";

function isImageFile(file: File): boolean {
  return Boolean(file.type && file.type.startsWith("image/"));
}

type ImageConfirmState = {
  title: string;
  body: string;
  confirmLabel: string;
  variant: "danger" | "primary";
  onConfirm: () => void;
} | null;

type FieldErrors = Partial<Record<"nombre" | "precio" | "capacidad", string>>;

export default function CreateCabanaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    capacidad: 2,
    amenities: [] as string[],
    ical_url: "",
    ical_url_booking: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [metodoContacto, setMetodoContacto] = useState<ContactMethod>("WA");
  const [contactModal, setContactModal] = useState<{
    open: boolean;
    method: ContactMethod;
  }>({ open: false, method: "WA" });
  const [imageConfirm, setImageConfirm] = useState<ImageConfirmState>(null);

  const [preciosPorFecha, setPreciosPorFecha] = useState<PrecioPorFecha[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [upgradeRequired, setUpgradeRequired] = useState<{
    show: boolean;
    message: string;
    plan: string;
  }>({ show: false, message: "", plan: "gratis" });
  const [paywallOpen, setPaywallOpen] = useState(false);

  const hasPhone = Boolean(user?.profile?.telefono?.trim());
  const hasEmail = Boolean(
    (user?.email || user?.profile?.email_contacto || "").trim()
  );

  const openContactModal = (method: ContactMethod) => {
    setContactModal({ open: true, method });
  };

  useEffect(() => {
    const guardPlanLimit = async () => {
      try {
        const { data } = await api.get<Cabana[]>("/cabanas/");
        const plan = user?.profile?.plan;
        if (!canCreateCabana(plan, data.length)) {
          setPaywallOpen(true);
        }
      } catch {
        // If we cannot check, the submit handler still respects the backend.
      }
    };
    if (user) void guardPlanLimit();
  }, [user]);

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
    if (!formData.precio.trim()) {
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
    if (!formData.precio.trim() || Number(formData.precio) <= 0) n++;
    if (!formData.capacidad || Number(formData.capacidad) <= 0) n++;
    return n;
  }, [formData.nombre, formData.precio, formData.capacidad]);

  const sections: FormSection[] = useMemo(
    () => [
      {
        id: "sec-datos",
        label: "Datos básicos",
        required: true,
        hasError: Boolean(errors.nombre || errors.precio || errors.capacidad),
        complete:
          !!formData.nombre.trim() &&
          Number(formData.precio) > 0 &&
          Number(formData.capacidad) > 0,
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
    [errors, formData.nombre, formData.precio, formData.capacidad]
  );

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
    setPreviews((prev) => {
      const url = prev[index];
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    setSelectedFiles((prev) => {
      const next = [...prev];
      const [file] = next.splice(index, 1);
      next.unshift(file);
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      const [url] = next.splice(index, 1);
      next.unshift(url);
      return next;
    });
    toast.success("Portada actualizada");
  };

  const askRemoveImage = (index: number) => {
    setImageConfirm({
      title: "Eliminar imagen",
      body: "Esta foto se quitará de la galería. Podés volver a subirla después si lo necesitás.",
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: () => removeImage(index),
    });
  };

  const askSetAsCover = (index: number) => {
    setImageConfirm({
      title: "Usar como portada",
      body: "Esta imagen será la portada principal del alojamiento al publicar.",
      confirmLabel: "Hacer portada",
      variant: "primary",
      onConfirm: () => setAsCover(index),
    });
  };

  const handlePrecioChange = (dia_semana: number, nuevoPrecio: string) => {
    setPreciosEspeciales((prev) =>
      prev.map((p) =>
        p.dia_semana === dia_semana ? { ...p, precio: nuevoPrecio } : p
      )
    );
  };

  const scrollToFirstError = (nextErrors: FieldErrors) => {
    const first =
      nextErrors.nombre && "sec-datos"
      || nextErrors.precio && "sec-datos"
      || nextErrors.capacidad && "sec-datos"
      || null;
    if (first) {
      const el = document.getElementById(first);
      if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 96,
          behavior: "smooth",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Revisá los campos marcados en rojo.");
      scrollToFirstError(nextErrors);
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

    setLoading(true);
    setStatusText("Creando alojamiento...");

    let slug = createdSlug;

    try {
      const icalUrl = formData.ical_url.trim();
      const icalUrlBooking = formData.ical_url_booking.trim();

      if (!slug) {
        const payload = {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion,
          precio: formData.precio,
          capacidad: formData.capacidad,
          amenities: formData.amenities,
          ical_url: icalUrl || null,
          ical_url_booking: icalUrlBooking || null,
          metodo_contacto: metodoContacto,
          telefono_whatsapp: null,
          email_contacto: null,
        };
        const response = await api.post("/cabanas/", payload);
        slug = response.data.slug as string;
        setCreatedSlug(slug);
      }

      if (icalUrl) {
        setStatusText("Sincronizando calendario Airbnb...");
        try {
          await api.post(`/cabanas/${slug}/sincronizar_ical/`, {
            ical_url: icalUrl,
            source: "airbnb",
          });
        } catch (syncErr) {
          console.error("Error al sincronizar calendario Airbnb", syncErr);
          toast.error(
            "Alojamiento creado, pero no se pudo sincronizar el calendario de Airbnb."
          );
        }
      }

      if (icalUrlBooking) {
        setStatusText("Sincronizando calendario Booking...");
        try {
          await api.post(`/cabanas/${slug}/sincronizar_ical/`, {
            ical_url_booking: icalUrlBooking,
            source: "booking",
          });
        } catch (syncErr) {
          console.error("Error al sincronizar calendario Booking", syncErr);
          toast.error(
            "Alojamiento creado, pero no se pudo sincronizar el calendario de Booking."
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
      router.replace("/dashboard/cabanas");
    } catch (error) {
      console.error("Error en la creación completa", error);

      // Handle plan limit exceeded (403 with upgrade_required)
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 403 &&
        error.response.data?.upgrade_required
      ) {
        setPaywallOpen(true);
        setUpgradeRequired({
          show: true,
          message: error.response.data.detail || "Alcanzaste el límite de tu plan.",
          plan: error.response.data.current_plan || "gratis",
        });
        setLoading(false);
        return;
      }

      if (axios.isAxiosError(error) && error.response?.data?.nombre) {
        const msg = Array.isArray(error.response.data.nombre)
          ? error.response.data.nombre[0]
          : String(error.response.data.nombre);
        setErrors((prev) => ({ ...prev, nombre: msg }));
        toast.error(msg);
        setLoading(false);
        scrollToFirstError({ nombre: msg });
        return;
      }

      if (slug) {
        toast.error(
          "El alojamiento se creó, pero falló un paso. Completá fotos u otros datos desde Editar."
        );
        router.replace(`/dashboard/cabanas/editar/${slug}`);
        return;
      }

      toast.error("Hubo un error al procesar la solicitud.");
      setLoading(false);
    }
  };

  const invalidFieldClass = `${cabanaFieldClass} border-red-300 focus:border-red-500 focus:ring-red-500/20`;

  return (
    <div className="mx-auto max-w-6xl p-6 pb-16 md:p-10 md:pb-28">
      <button
        type="button"
        onClick={() => router.push("/dashboard/cabanas")}
        className="mb-6 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={20} /> Volver a Mis Alojamientos
      </button>

      <div className="mb-6">
        <h1 className="page-title-sm">Publicar nuevo alojamiento</h1>
        <p className="page-subtitle mt-1">
          Completá los datos principales; podés seguir editando después.
        </p>
      </div>

      {paywallOpen ? (
        <UpgradePricingModal
          open={paywallOpen}
          onClose={() => {
            setPaywallOpen(false);
            router.push("/dashboard/cabanas");
          }}
          title={`Tu plan incluye ${getMaxCabanas(user?.profile?.plan)} ${
            getMaxCabanas(user?.profile?.plan) === 1
              ? "alojamiento"
              : "alojamientos"
          }`}
          body={
            upgradeRequired.message ||
            "Para agregar otro alojamiento, pasate a un plan pago. Es un cobro único por 30 días, sin débito automático."
          }
        />
      ) : (
        <>
      <div className="lg:grid lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-8">
        <FormSectionNav sections={sections} />

        <form
          id="crear-cabana-form"
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >
          <section
            id="sec-datos"
            aria-labelledby="sec-datos-title"
            className={`${cabanaSectionClass} scroll-mt-24`}
          >
            <h2 id="sec-datos-title" className="mb-4 font-black text-slate-900">
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
                  className={errors.nombre ? invalidFieldClass : cabanaFieldClass}
                  placeholder="Ej: Alojamiento del Bosque"
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
                  Precio base por noche ($) <span className="text-red-500">*</span>
                </label>
                <input
                  id="precio"
                  type="number"
                  min={0}
                  step="0.01"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  className={errors.precio ? invalidFieldClass : cabanaFieldClass}
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
              showSyncButton={false}
            />
          </section>

          <section id="sec-booking" className="scroll-mt-24">
            <BookingCalendarConnect
              value={formData.ical_url_booking}
              onChange={(ical_url_booking) =>
                setFormData({ ...formData, ical_url_booking })
              }
              showSyncButton={false}
            />
          </section>

          <section id="sec-precios-especiales" className="scroll-mt-24">
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
          </section>

          <section id="sec-amenities" className="scroll-mt-24">
            <AmenityPicker
              value={formData.amenities}
              onChange={(amenities) => setFormData({ ...formData, amenities })}
            />
          </section>

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
                  <ImageIcon size={20} className="text-primary" /> Galería de fotos
                </h2>
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
                    {index === 0 ? (
                      <>
                        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                          <Star size={12} className="fill-white" /> Portada
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => askRemoveImage(index)}
                            title="Eliminar imagen"
                            aria-label="Eliminar imagen"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => askSetAsCover(index)}
                          title="Usar como portada"
                          aria-label="Usar como portada"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition-colors hover:bg-primary hover:text-white"
                        >
                          <Star size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => askRemoveImage(index)}
                          title="Eliminar imagen"
                          aria-label="Eliminar imagen"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
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
                      La primera imagen será la portada. En el resto podés
                      cambiarla con el ícono de estrella.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section
              id="sec-precios-dia"
              aria-labelledby="sec-precios-dia-title"
              className={`${cabanaSectionClass} scroll-mt-24`}
            >
              <h2
                id="sec-precios-dia-title"
                className="mb-4 flex items-center gap-2 font-black text-slate-900"
              >
                <DollarSign size={20} className="text-emerald-600" /> Precios por
                día (opcional)
              </h2>
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                <table className="w-full text-sm">
                  <caption className="sr-only">Precios por día de la semana</caption>
                  <tbody className="divide-y divide-slate-100">
                    {preciosEspeciales.map((item) => {
                      const inputId = `precio-dia-${item.dia_semana}`;
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
                              placeholder={`Base: $${formData.precio || "0"}`}
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
              mode="local"
              value={videoUrls}
              onChange={setVideoUrls}
            />
          </section>
        </form>
      </div>

      <FormStickySaveBar
        form="crear-cabana-form"
        loading={loading}
        statusText={statusText}
        submitLabel="Publicar alojamiento"
        loadingLabel="Publicando..."
        missingCount={missingCount}
        disabled={missingCount > 0}
        onCancel={() => router.push("/dashboard/cabanas")}
      />
      </>
      )}

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
