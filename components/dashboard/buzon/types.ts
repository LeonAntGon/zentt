import type { Mensaje, MessageOrigen } from "@/types/cabin";

export interface ContactoGeneral {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  origen?: MessageOrigen;
  fecha_envio: string;
  leido: boolean;
}

export type InboxMessage =
  | (Mensaje & { _tipo: "cabanas" })
  | (ContactoGeneral & { _tipo: "general" });

export type InboxKey = `${"cabanas" | "general"}-${number}`;

export function inboxKey(message: InboxMessage): InboxKey {
  return `${message._tipo}-${message.id}`;
}

export function messageName(message: InboxMessage) {
  return message._tipo === "cabanas"
    ? message.nombre_turista
    : message.nombre;
}

export function messageEmail(message: InboxMessage) {
  return message._tipo === "cabanas" ? message.email_turista : message.email;
}

export function messagePhone(message: InboxMessage) {
  return message._tipo === "cabanas"
    ? message.telefono_turista
    : message.telefono;
}

export function messageText(message: InboxMessage) {
  return message._tipo === "cabanas" ? message.contenido : message.mensaje;
}
