import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  Anchor,
  Armchair,
  Bath,
  BedDouble,
  Car,
  Coffee,
  CookingPot,
  Croissant,
  Droplets,
  Dumbbell,
  Flame,
  GalleryHorizontal,
  Heater,
  Home,
  Library,
  LifeBuoy,
  Microwave,
  Mountain,
  PawPrint,
  Refrigerator,
  Sailboat,
  Shirt,
  Ship,
  Snowflake,
  Sofa,
  Sun,
  Thermometer,
  Trees,
  Tv,
  Umbrella,
  Utensils,
  UtensilsCrossed,
  Warehouse,
  Waves,
  Wifi,
  Wind,
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
  | "accesibilidad"
  | "habitaciones"
  | "bano_completo"
  | "living"
  | "comedor"
  | "cocina_isla"
  | "biblioteca"
  | "salamandra"
  | "horno_barro"
  | "horno_electrico"
  | "disco_reposteras"
  | "freezer"
  | "vajilla"
  | "playa_privada"
  | "muelle_privado"
  | "kayak"
  | "canoa"
  | "deck_rio"
  | "vista_rio"
  | "galeria_exterior"
  | "hamacas"
  | "equipo_seguridad"
  | "warehouse";

export type AmenityCategoryId =
  | "basicos"
  | "ambientes"
  | "cocina"
  | "rio"
  | "predio"
  | "extras";

export type AmenityOption = {
  id: AmenityId;
  label: string;
  icon: LucideIcon;
  category: AmenityCategoryId;
  /** Palabras extra para el buscador. */
  keywords?: string[];
};

export const AMENITY_CATEGORIES: {
  id: AmenityCategoryId;
  label: string;
}[] = [
  { id: "basicos", label: "Básicos" },
  { id: "ambientes", label: "Ambientes" },
  { id: "cocina", label: "Cocina y electrodomésticos" },
  { id: "rio", label: "Río y exteriores" },
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
  // Ambientes
  {
    id: "habitaciones",
    label: "Habitaciones separadas",
    icon: Home,
    category: "ambientes",
    keywords: ["cuartos", "dormitorios"],
  },
  {
    id: "bano_completo",
    label: "Baño completo",
    icon: Bath,
    category: "ambientes",
    keywords: ["baño", "ducha"],
  },
  { id: "living", label: "Living", icon: Sofa, category: "ambientes" },
  { id: "comedor", label: "Comedor", icon: Utensils, category: "ambientes" },
  {
    id: "cocina_isla",
    label: "Cocina en isla",
    icon: CookingPot,
    category: "ambientes",
    keywords: ["isla", "cocina integrada"],
  },
  {
    id: "biblioteca",
    label: "Biblioteca",
    icon: Library,
    category: "ambientes",
    keywords: ["libros"],
  },
  {
    id: "salamandra",
    label: "Salamandra",
    icon: Flame,
    category: "ambientes",
    keywords: ["fuego", "leña"],
  },
  {
    id: "horno_barro",
    label: "Horno de barro",
    icon: Flame,
    category: "ambientes",
    keywords: ["barro", "pizza", "pan"],
  },
  {
    id: "horno_electrico",
    label: "Horno eléctrico",
    icon: Microwave,
    category: "ambientes",
  },
  {
    id: "disco_reposteras",
    label: "Disco y reposteras",
    icon: UtensilsCrossed,
    category: "ambientes",
    keywords: ["disco", "repostería", "pastelería"],
  },
  {
    id: "freezer",
    label: "Freezer",
    icon: Snowflake,
    category: "ambientes",
    keywords: ["congelador", "heladera"],
  },
  {
    id: "vajilla",
    label: "Vajilla y utensilios",
    icon: Utensils,
    category: "ambientes",
    keywords: ["platos", "cubiertos"],
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
  // Río y exteriores
  {
    id: "playa_privada",
    label: "Playa privada",
    icon: Umbrella,
    category: "rio",
    keywords: ["río", "arena", "costa"],
  },
  {
    id: "muelle_privado",
    label: "Muelle privado con amarras",
    icon: Anchor,
    category: "rio",
    keywords: ["amarra", "lancha", "embarcadero"],
  },
  {
    id: "kayak",
    label: "Kayak",
    icon: Sailboat,
    category: "rio",
    keywords: ["remo", "piragua"],
  },
  {
    id: "canoa",
    label: "Canoa",
    icon: Ship,
    category: "rio",
    keywords: ["remo", "embarcación"],
  },
  {
    id: "deck_rio",
    label: "Deck con vista al río",
    icon: Sun,
    category: "rio",
    keywords: ["terraza", "deck", "río"],
  },
  {
    id: "vista_rio",
    label: "Vista al río",
    icon: Mountain,
    category: "rio",
    keywords: ["paisaje", "río"],
  },
  {
    id: "galeria_exterior",
    label: "Galería / corredor exterior",
    icon: GalleryHorizontal,
    category: "rio",
    keywords: ["corredor", "galería", "porche"],
  },
  {
    id: "hamacas",
    label: "Hamacas paraguayas",
    icon: Armchair,
    category: "rio",
    keywords: ["hamaca", "descanso"],
  },
  {
    id: "equipo_seguridad",
    label: "Equipo de seguridad",
    icon: LifeBuoy,
    category: "rio",
    keywords: ["chaleco", "salvavidas"],
  },
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
  {
    id: "warehouse",
    label: "Galpón / depósito",
    icon: Warehouse,
    category: "predio",
  },
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

/** Búsqueda simple por label, keywords y categoría. */
export function filterAmenities(query: string): AmenityOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return AMENITY_OPTIONS;
  return AMENITY_OPTIONS.filter((option) => {
    const category = AMENITY_CATEGORIES.find((c) => c.id === option.category);
    return (
      option.label.toLowerCase().includes(q) ||
      option.id.includes(q) ||
      (category?.label.toLowerCase().includes(q) ?? false) ||
      (option.keywords || []).some((keyword) => keyword.includes(q))
    );
  });
}
