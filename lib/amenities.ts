import type { LucideIcon } from "lucide-react";
import {
  Wifi,
  Car,
  Waves,
  Flame,
  Wind,
  Thermometer,
  UtensilsCrossed,
  Tv,
  PawPrint,
  Dumbbell,
  Bath,
  Shirt,
  Refrigerator,
  Microwave,
  Coffee,
  Heater,
  BedDouble,
  Droplets,
  Trees,
  Croissant,
  Accessibility,
} from "lucide-react";

export type AmenityId =
  | "wifi"
  | "tv"
  | "aire"
  | "calefaccion"
  | "ropa_blanca"
  | "agua_caliente"
  | "cocina"
  | "heladera"
  | "microondas"
  | "pava_electrica"
  | "cafetera"
  | "estacionamiento"
  | "pileta"
  | "parrilla"
  | "gimnasio"
  | "jacuzzi"
  | "jardin"
  | "mascotas"
  | "lavanderia"
  | "desayuno"
  | "accesibilidad";

export type AmenityCategoryId =
  | "basicos"
  | "cocina"
  | "predio"
  | "extras";

export type AmenityOption = {
  id: AmenityId;
  label: string;
  icon: LucideIcon;
  category: AmenityCategoryId;
};

export const AMENITY_CATEGORIES: {
  id: AmenityCategoryId;
  label: string;
}[] = [
  { id: "basicos", label: "Básicos" },
  { id: "cocina", label: "Cocina y electrodomésticos" },
  { id: "predio", label: "Instalaciones del predio" },
  { id: "extras", label: "Servicios extras y reglas" },
];

/** Códigos válidos — deben coincidir con el backend AMENITY_CODES. */
export const AMENITY_OPTIONS: AmenityOption[] = [
  // Básicos
  { id: "wifi", label: "Wi-Fi de alta velocidad", icon: Wifi, category: "basicos" },
  { id: "tv", label: "Smart TV", icon: Tv, category: "basicos" },
  { id: "aire", label: "Aire acondicionado", icon: Wind, category: "basicos" },
  {
    id: "calefaccion",
    label: "Calefacción",
    icon: Thermometer,
    category: "basicos",
  },
  {
    id: "ropa_blanca",
    label: "Ropa de cama y toallas",
    icon: BedDouble,
    category: "basicos",
  },
  {
    id: "agua_caliente",
    label: "Agua caliente 24hs",
    icon: Droplets,
    category: "basicos",
  },
  // Cocina
  {
    id: "cocina",
    label: "Cocina equipada",
    icon: UtensilsCrossed,
    category: "cocina",
  },
  {
    id: "heladera",
    label: "Heladera",
    icon: Refrigerator,
    category: "cocina",
  },
  { id: "microondas", label: "Microondas", icon: Microwave, category: "cocina" },
  {
    id: "pava_electrica",
    label: "Pava eléctrica / Hervidor",
    icon: Heater,
    category: "cocina",
  },
  { id: "cafetera", label: "Cafetera", icon: Coffee, category: "cocina" },
  // Predio
  {
    id: "estacionamiento",
    label: "Estacionamiento gratuito",
    icon: Car,
    category: "predio",
  },
  { id: "pileta", label: "Pileta / Piscina", icon: Waves, category: "predio" },
  {
    id: "parrilla",
    label: "Parrilla / Asador",
    icon: Flame,
    category: "predio",
  },
  { id: "gimnasio", label: "Gimnasio", icon: Dumbbell, category: "predio" },
  { id: "jacuzzi", label: "Jacuzzi", icon: Bath, category: "predio" },
  { id: "jardin", label: "Patio o jardín", icon: Trees, category: "predio" },
  // Extras
  {
    id: "mascotas",
    label: "Pet friendly",
    icon: PawPrint,
    category: "extras",
  },
  {
    id: "lavanderia",
    label: "Lavarropas / Lavandería",
    icon: Shirt,
    category: "extras",
  },
  {
    id: "desayuno",
    label: "Desayuno incluido",
    icon: Croissant,
    category: "extras",
  },
  {
    id: "accesibilidad",
    label: "Apto para sillas de ruedas",
    icon: Accessibility,
    category: "extras",
  },
];

const VALID_IDS = new Set(AMENITY_OPTIONS.map((o) => o.id));

export function normalizeAmenities(ids?: string[] | null): AmenityId[] {
  if (!ids?.length) return [];
  const seen = new Set<AmenityId>();
  const result: AmenityId[] = [];
  for (const raw of ids) {
    const code = String(raw).trim().toLowerCase() as AmenityId;
    if (VALID_IDS.has(code) && !seen.has(code)) {
      seen.add(code);
      result.push(code);
    }
  }
  return result;
}

export function resolveAmenities(ids?: string[] | null): AmenityOption[] {
  const normalized = normalizeAmenities(ids);
  return AMENITY_OPTIONS.filter((o) => normalized.includes(o.id));
}

/** Unión de amenities de varios alojamientos (orden de AMENITY_OPTIONS). */
export function unionAmenities(
  lists: Array<string[] | null | undefined>
): AmenityOption[] {
  const set = new Set<AmenityId>();
  for (const list of lists) {
    for (const id of normalizeAmenities(list)) set.add(id);
  }
  return AMENITY_OPTIONS.filter((o) => set.has(o.id));
}
