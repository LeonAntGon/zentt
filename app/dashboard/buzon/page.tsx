"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox as InboxIcon, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Cabana, Mensaje } from "@/types/cabin";
import {
  InboxDetail,
} from "@/components/dashboard/buzon/InboxDetail";
import {
  InboxFilters,
  type InboxChannel,
  type InboxTab,
} from "@/components/dashboard/buzon/InboxFilters";
import { InboxListItem } from "@/components/dashboard/buzon/InboxListItem";
import {
  inboxKey,
  type ContactoGeneral,
  type InboxMessage,
} from "@/components/dashboard/buzon/types";

type BusyAction = "read" | "confirm" | "reject" | "delete" | null;

function sortMessages(messages: InboxMessage[]) {
  return [...messages].sort(
    (a, b) =>
      new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime()
  );
}

export default function BuzonPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<InboxTab>("todas");
  const [channel, setChannel] = useState<InboxChannel>("all");
  const [cabanaId, setCabanaId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesResponse, contactsResponse, cabanasResponse] =
          await Promise.all([
            api.get<Mensaje[]>("/mensajes/"),
            api.get<ContactoGeneral[]>("/contacto/"),
            api.get<Cabana[]>("/cabanas/"),
          ]);

        const cabinMessages: InboxMessage[] = messagesResponse.data.map((message) => ({
          ...message,
          _tipo: "cabanas" as const,
        }));
        const generalMessages: InboxMessage[] = contactsResponse.data.map((message) => ({
          ...message,
          _tipo: "general" as const,
        }));
        const nextMessages = sortMessages([...cabinMessages, ...generalMessages]);

        setMessages(nextMessages);
        setCabanas(cabanasResponse.data || []);
        setSelectedKey(nextMessages[0] ? inboxKey(nextMessages[0]) : null);
      } catch (error) {
        console.error("Error cargando buzón", error);
        toast.error("No pudimos cargar el buzón.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const unreadCount = useMemo(
    () => messages.filter((message) => !message.leido).length,
    [messages]
  );

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return messages.filter((message) => {
      const text =
        message._tipo === "cabanas"
          ? [
              message.nombre_turista,
              message.email_turista,
              message.telefono_turista,
              message.contenido,
              message.cabana_nombre,
            ]
          : [
              message.nombre,
              message.email,
              message.telefono,
              message.mensaje,
            ];

      if (
        normalizedSearch &&
        !text.filter(Boolean).join(" ").toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }
      if (tab === "sin_leer" && message.leido) return false;
      if (
        tab === "con_fechas" &&
        (message._tipo !== "cabanas" ||
          !message.fecha_desde ||
          !message.fecha_hasta)
      ) {
        return false;
      }
      if (channel !== "all" && message.origen !== channel) return false;
      if (
        cabanaId !== "all" &&
        (message._tipo !== "cabanas" || String(message.cabana) !== cabanaId)
      ) {
        return false;
      }
      return true;
    });
  }, [messages, search, tab, channel, cabanaId]);

  const selectedMessage = useMemo(
    () => messages.find((message) => inboxKey(message) === selectedKey) || null,
    [messages, selectedKey]
  );

  const updateMessage = (key: string, patch: Partial<InboxMessage>) => {
    setMessages((current) =>
      current.map((message) =>
        inboxKey(message) === key ? ({ ...message, ...patch } as InboxMessage) : message
      )
    );
  };

  const handleToggleRead = async () => {
    if (!selectedMessage) return;
    const key = inboxKey(selectedMessage);
    setBusyAction("read");
    try {
      const endpoint =
        selectedMessage._tipo === "cabanas"
          ? `/mensajes/${selectedMessage.id}/`
          : `/contacto/${selectedMessage.id}/`;
      await api.patch(endpoint, { leido: !selectedMessage.leido });
      updateMessage(key, { leido: !selectedMessage.leido });
    } catch {
      toast.error("No se pudo actualizar el estado de lectura.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAllRead(true);
    try {
      await Promise.all([
        api.post("/mensajes/marcar_todos_leidos/"),
        api.post("/contacto/marcar_todos_leidos/"),
      ]);
      setMessages((current) => current.map((message) => ({ ...message, leido: true })));
      toast.success("Todo el buzón quedó marcado como leído.");
    } catch {
      toast.error("No se pudo marcar todo como leído.");
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedMessage || selectedMessage._tipo !== "cabanas") return;
    const key = inboxKey(selectedMessage);
    setBusyAction("confirm");
    try {
      const response = await api.post<Mensaje>(
        `/mensajes/${selectedMessage.id}/confirmar_reserva/`
      );
      updateMessage(key, {
        ...response.data,
        _tipo: "cabanas",
      });
      toast.success("Reserva confirmada y vinculada a la consulta.");
    } catch (error: unknown) {
      const detail =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail;
      toast.error(typeof detail === "string" ? detail : "No se pudo confirmar la reserva.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleReject = async () => {
    if (!selectedMessage || selectedMessage._tipo !== "cabanas") return;
    const key = inboxKey(selectedMessage);
    setBusyAction("reject");
    try {
      await api.patch(`/mensajes/${selectedMessage.id}/`, { leido: true });
      updateMessage(key, { leido: true });
      toast.success("Consulta marcada como rechazada.");
    } catch {
      toast.error("No se pudo rechazar la consulta.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    const key = inboxKey(selectedMessage);
    setBusyAction("delete");
    try {
      const endpoint =
        selectedMessage._tipo === "cabanas"
          ? `/mensajes/${selectedMessage.id}/`
          : `/contacto/${selectedMessage.id}/`;
      await api.delete(endpoint);
      setMessages((current) => current.filter((message) => inboxKey(message) !== key));
      setSelectedKey(null);
      toast.success("Consulta eliminada.");
    } catch {
      toast.error("No se pudo eliminar la consulta.");
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">Cargando buzón...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col px-3 py-4 sm:px-6 sm:py-6">
      <header className="mb-4 flex shrink-0 items-start gap-3 sm:mb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20">
          <InboxIcon size={20} />
        </div>
        <div>
          <h1 className="page-title text-2xl sm:text-3xl">Buzón</h1>
          <p className="page-subtitle mt-1 text-xs sm:text-sm">
            Consultas de tu mini-sitio, WhatsApp y Airbnb en un solo lugar.
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside
          className={`min-h-0 flex-col border-slate-100 lg:flex lg:border-r ${
            selectedMessage ? "hidden" : "flex"
          }`}
        >
          <InboxFilters
            search={search}
            onSearchChange={setSearch}
            tab={tab}
            onTabChange={setTab}
            channel={channel}
            onChannelChange={setChannel}
            cabanaId={cabanaId}
            onCabanaChange={setCabanaId}
            cabanas={cabanas}
            unreadCount={unreadCount}
            onMarkAllRead={() => void handleMarkAllRead()}
            markingAllRead={markingAllRead}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <InboxListItem
                  key={inboxKey(message)}
                  message={message}
                  selected={inboxKey(message) === selectedKey}
                  onSelect={() => setSelectedKey(inboxKey(message))}
                />
              ))
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <MessageSquare size={26} className="mb-3 text-slate-200" />
                <p className="text-sm font-bold text-slate-400">No hay consultas</p>
                <p className="mt-1 text-xs text-slate-400">Probá cambiar los filtros.</p>
              </div>
            )}
          </div>
        </aside>

        {selectedMessage ? (
          <InboxDetail
            message={selectedMessage}
            onBack={() => setSelectedKey(null)}
            onToggleRead={handleToggleRead}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onDelete={handleDelete}
            busyAction={busyAction}
          />
        ) : (
          <section className="hidden min-h-0 flex-1 flex-col items-center justify-center bg-slate-50/50 lg:flex">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-100">
              <InboxIcon size={26} />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-500">Seleccioná una consulta</p>
            <p className="mt-1 text-xs text-slate-400">La conversación aparecerá en este panel.</p>
          </section>
        )}
      </div>
    </div>
  );
}
