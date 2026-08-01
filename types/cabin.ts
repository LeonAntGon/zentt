export interface PrecioEspecial {
  id: number;
  dia_semana: number; // 0=Lunes, 6=Domingo
  nombre_dia: string;
  precio: string;
}

export interface PrecioPorFecha {
  id?: number;
  fecha: string; // YYYY-MM-DD
  precio: string | number;
}

export interface CabanaImagen {
  id: number;
  imagen: string;
  es_portada: boolean;
}

export type VideoProveedor = "youtube" | "instagram" | "facebook";

export interface CabanaVideo {
  id: number;
  url: string;
  proveedor: VideoProveedor;
}

export interface Cabana {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string;
  capacidad: number;
  amenities?: string[];
  metodo_contacto: "WA" | "MAIL";
  telefono_whatsapp: string | null;
  email_contacto: string | null;
  ical_url?: string | null;
  imagen_portada: string | null;
  imagenes: CabanaImagen[];
  videos?: CabanaVideo[];
  precios_especiales: PrecioEspecial[];
  precios_por_fecha?: PrecioPorFecha[];
  bloqueos_externos?: BloqueoExterno[];
}

export interface BloqueoExterno {
  id: number;
  inicio: string;
  fin: string;
  uid: string;
  titulo?: string;
  synced_at?: string;
}

export type MessageOrigen = "WEB" | "WA" | "AIRBNB";

export interface Mensaje {
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

export interface Reserva {
  id: number;
  cabana: number;
  cabana_nombre?: string;
  nombre_turista: string;
  email_turista?: string | null;
  telefono_turista?: string | null;
  check_in: string;
  check_out: string;
  estado: "pendiente" | "confirmada" | "cancelada" | "finalizada" | string;
  total_reserva: string | number;
  created_at: string;
}

export interface FechaOcupada {
  check_in: string;
  check_out: string;
  fuente?: "reserva" | "ical" | string;
  titulo?: string;
}
