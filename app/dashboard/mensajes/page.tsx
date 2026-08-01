"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { StaySummary } from "@/components/dashboard/StaySummary";
import {
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  MessageSquare,
  Inbox as InboxIcon,
  Home,
  ExternalLink,
  BookmarkPlus,
  Loader2,
  XCircle,
  Trash2,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  MessageChannelBadge,
  MessageInitialAvatar,
} from "@/components/dashboard/MessageChannelBadge";
import type { MessageOrigen } from "@/types/cabin";

interface MensajeCabana {
  id: number;
  cabana: number;
  cabana_nombre?: string;
  nombre_turista: string;
  email_turista: string;
  telefono_turista: string;
  contenido: string;
  origen?: MessageOrigen;
  fecha_envio: string;
  leido: boolean;
  fecha_desde?: string | null;
  fecha_hasta?: string | null;
  total_estimado?: string | number | null;
}

interface ContactoGeneral {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  origen?: MessageOrigen;
  fecha_envio: string;
  leido: boolean;
}

type UnifiedMessage =
  | (MensajeCabana & { _tipo: "cabanas" })
  | (ContactoGeneral & { _tipo: "general" });

function normalizePhone(phone?: string | null): string {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

export default function InboxPage() {
  const [mensajesUnificados, setMensajesUnificados] = useState<
    UnifiedMessage[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMensajes, resGeneral] = await Promise.all([
        api.get<MensajeCabana[]>("/mensajes/"),
        api.get<ContactoGeneral[]>("/contacto/"),
      ]);

      const cabanasList: UnifiedMessage[] = resMensajes.data.map((m) => ({
        ...m,
        _tipo: "cabanas",
      }));
      const generalList: UnifiedMessage[] = resGeneral.data.map((m) => ({
        ...m,
        _tipo: "general",
      }));

      const todosLosMensajes = [...cabanasList, ...generalList];

      todosLosMensajes.sort(
        (a, b) =>
          new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime()
      );

      setMensajesUnificados(todosLosMensajes);
    } catch (error) {
      console.error("Error cargando mensajes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (
    id: number,
    type: "cabanas" | "general"
  ) => {
    try {
      const endpoint =
        type === "cabanas" ? `/mensajes/${id}/` : `/contacto/${id}/`;
      await api.patch(endpoint, { leido: true });

      setMensajesUnificados((prev) =>
        prev.map((m) =>
          m.id === id && m._tipo === type ? { ...m, leido: true } : m
        )
      );
    } catch (error) {
      console.error("Error marcando como leído", error);
    }
  };

  const handleConfirmReserva = async (msg: MensajeCabana) => {
    if (!msg.fecha_desde || !msg.fecha_hasta) {
      toast.error("Este mensaje no tiene fechas para confirmar.");
      return;
    }
    try {
      await api.post("/booking/gestion-reservas/", {
        cabana: msg.cabana,
        nombre_turista: msg.nombre_turista,
        email_turista: msg.email_turista,
        telefono_turista: msg.telefono_turista || null,
        check_in: msg.fecha_desde,
        check_out: msg.fecha_hasta,
        estado: "confirmada",
      });
      if (!msg.leido) {
        await handleMarkAsRead(msg.id, "cabanas");
      }
      toast.success("Reserva confirmada. Esas fechas quedan bloqueadas.");
    } catch {
      toast.error(
        "No se pudo confirmar. Puede haber otra reserva confirmada en esas fechas."
      );
    }
  };

  const handleRejectConsulta = async (msg: MensajeCabana) => {
    try {
      if (!msg.leido) {
        await handleMarkAsRead(msg.id, "cabanas");
      }
      toast.success("Consulta marcada como rechazada (leída).");
    } catch {
      toast.error("No se pudo rechazar");
    }
  };

  const handleDeleteConsulta = async (
    id: number,
    type: "cabanas" | "general"
  ) => {
    try {
      const endpoint =
        type === "cabanas" ? `/mensajes/${id}/` : `/contacto/${id}/`;
      await api.delete(endpoint);
      setMensajesUnificados((prev) =>
        prev.filter((m) => !(m.id === id && m._tipo === type))
      );
      toast.success("Consulta eliminada.");
    } catch {
      toast.error("No se pudo eliminar la consulta.");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">Cargando buzón...</p>
      </div>
    );

  const noLeidos = mensajesUnificados.filter((m) => !m.leido).length;

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <header className="mb-10">
        <h1 className="page-title flex items-center gap-3">
          <InboxIcon className="text-primary" size={32} /> Buzón
        </h1>
        <p className="page-subtitle mt-2 flex items-center gap-2">
          Tienes{" "}
          <strong className="rounded bg-primary/10 px-2 py-0.5 text-primary">
            {noLeidos} mensajes sin leer
          </strong>{" "}
          en total.
        </p>
      </header>

      <div className="grid gap-4">
        {mensajesUnificados.length > 0 ? (
          mensajesUnificados.map((msg) => (
            <MessageCard
              key={`${msg._tipo}-${msg.id}`}
              msg={msg}
              onMarkRead={handleMarkAsRead}
              onConfirmReserva={handleConfirmReserva}
              onRejectConsulta={handleRejectConsulta}
              onDelete={handleDeleteConsulta}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

const MessageCard: React.FC<{
  msg: UnifiedMessage;
  onMarkRead: (id: number, type: "cabanas" | "general") => void;
  onConfirmReserva: (msg: MensajeCabana) => Promise<void>;
  onRejectConsulta: (msg: MensajeCabana) => Promise<void>;
  onDelete: (id: number, type: "cabanas" | "general") => Promise<void>;
}> = ({ msg, onMarkRead, onConfirmReserva, onRejectConsulta, onDelete }) => {
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isCabana = msg._tipo === "cabanas";
  const cabanaMsg = isCabana ? (msg as MensajeCabana) : null;
  const nombre = isCabana
    ? cabanaMsg!.nombre_turista
    : (msg as ContactoGeneral).nombre;
  const email = isCabana
    ? cabanaMsg!.email_turista
    : (msg as ContactoGeneral).email;
  const telefono = isCabana
    ? cabanaMsg!.telefono_turista
    : (msg as ContactoGeneral).telefono;
  const texto = isCabana
    ? cabanaMsg!.contenido
    : (msg as ContactoGeneral).mensaje;
  const cabanaNombre = isCabana
    ? cabanaMsg!.cabana_nombre || "Alojamiento"
    : null;

  const phoneHref = normalizePhone(telefono);
  const waDigits = phoneHref.replace(/\D/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        cabanaNombre
          ? `Hola ${nombre}, te escribo por tu consulta sobre ${cabanaNombre}.`
          : `Hola ${nombre}, te escribo por tu consulta.`
      )}`
    : null;
  const mailSubject = cabanaNombre
    ? `Consulta por ${cabanaNombre}`
    : "Consulta desde tu web Zentt";
  const mailHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(mailSubject)}`
    : null;

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(msg.id, msg._tipo);
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <div
      className={`rounded-xl border bg-white p-5 transition-all duration-300 md:p-6 ${
        !msg.leido
          ? "border-slate-200 border-l-4 border-l-primary shadow-sm"
          : "border-slate-200"
      }`}
    >
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="flex w-full gap-4 md:w-auto">
          <MessageInitialAvatar name={nombre} leido={msg.leido} size="md" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{nombre}</h3>
              <MessageChannelBadge origen={msg.origen} />
              {!msg.leido && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                  Nuevo
                </span>
              )}

              {isCabana ? (
                <span className="ml-0.5 inline-flex max-w-full items-center gap-1.5 truncate rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                  <Home size={11} className="shrink-0 text-slate-400" />
                  <span className="truncate">{cabanaNombre}</span>
                </span>
              ) : (
                <span className="ml-0.5 rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                  Consulta general
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-col gap-1.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5 truncate">
                <Mail size={14} className="shrink-0" /> {email}
              </span>
              {telefono ? (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="shrink-0" /> {telefono}
                </span>
              ) : (
                <span className="text-xs italic text-slate-400">
                  Sin teléfono
                </span>
              )}
            </div>

            {isCabana && cabanaMsg && (
              <StaySummary
                className="mt-3"
                fechaDesde={cabanaMsg.fecha_desde}
                fechaHasta={cabanaMsg.fecha_hasta}
                totalEstimado={cabanaMsg.total_estimado}
              />
            )}
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2 md:w-auto md:items-end">
          <span className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-400">
            <Clock size={12} /> {new Date(msg.fecha_envio).toLocaleString()}
          </span>
          {!msg.leido && (
            <button
              type="button"
              onClick={() => onMarkRead(msg.id, msg._tipo)}
              className="flex items-center gap-1 p-1 text-xs font-black uppercase tracking-widest text-primary transition-colors hover:text-primary/80"
            >
              <CheckCircle2 size={16} /> Marcar leído
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 leading-relaxed text-slate-700">
        <MessageSquare
          size={16}
          className="absolute -left-2 -top-2 text-slate-300"
        />
        {texto}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {mailHref && (
            <a
              href={mailHref}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-800 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-95"
            >
              <Mail size={15} />
              Responder mail
              <ExternalLink size={12} className="opacity-50" />
            </a>
          )}
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest shadow-sm transition-all active:scale-95"
            >
              <WhatsAppIcon className="text-base" />
              WhatsApp
            </a>
          )}
          {phoneHref && (
            <a
              href={`tel:${phoneHref}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
              <Phone size={15} />
              Llamar
            </a>
          )}
          {isCabana && cabanaMsg?.fecha_desde && cabanaMsg?.fecha_hasta && (
            <>
              <button
                type="button"
                disabled={confirming || rejecting}
                onClick={async () => {
                  setConfirming(true);
                  await onConfirmReserva(cabanaMsg);
                  setConfirming(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60"
              >
                {confirming ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <BookmarkPlus size={15} />
                )}
                Confirmar reserva
              </button>
              <button
                type="button"
                disabled={confirming || rejecting || deleting}
                onClick={async () => {
                  setRejecting(true);
                  await onRejectConsulta(cabanaMsg);
                  setRejecting(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-700 transition-all hover:bg-red-100 disabled:opacity-60"
              >
                {rejecting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <XCircle size={15} />
                )}
                Rechazar
              </button>
            </>
          )}
          <button
            type="button"
            disabled={confirming || rejecting || deleting}
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
          >
            <Trash2 size={15} />
            Eliminar
          </button>
        </div>
      </div>
    </div>

    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">
            Eliminar consulta
          </h3>
          <p className="mb-6 text-gray-500">
            ¿Seguro que querés eliminar la consulta de{" "}
            <span className="font-bold text-gray-800">{nombre}</span>
            {cabanaNombre ? (
              <>
                {" "}
                por <span className="font-bold text-gray-800">{cabanaNombre}</span>
              </>
            ) : null}
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={confirmDelete}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-red-200 transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

const EmptyState = () => (
  <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
    <Mail size={48} className="mx-auto mb-4 text-slate-200" />
    <h3 className="text-lg font-bold text-slate-400">Buzón vacío</h3>
    <p className="text-sm text-slate-400">
      No tienes mensajes pendientes. ¡Gran trabajo!
    </p>
  </div>
);
