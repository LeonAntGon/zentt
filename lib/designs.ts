export type DesignKey = "claro" | "oscuro" | "elegante" | "atardecer";

export type DesignDefinition = {
  id: DesignKey;
  name: string;
  description: string;
  idealFor: string;
  tokens: {
    bg: string;
    text: string;
    surface: string;
    border: string;
    primary: string;
    primaryText: string;
    muted: string;
    accent: string;
    accentText: string;
  };
};

export const DESIGNS: DesignDefinition[] = [
  {
    id: "claro",
    name: "Claro",
    description: "Limpio, confiable y fácil de recorrer.",
    idealFor: "Cualquier alojamiento",
    tokens: {
      bg: "#f8fafc",
      text: "#0a2342",
      surface: "#ffffff",
      border: "#dbe5ee",
      primary: "#0a2342",
      primaryText: "#ffffff",
      muted: "#526477",
      accent: "#184e77",
      accentText: "#ffffff",
    },
  },
  {
    id: "oscuro",
    name: "Oscuro",
    description: "Íntimo y moderno, con tus fotos como protagonistas.",
    idealFor: "Bosque y montaña",
    tokens: {
      bg: "#101923",
      text: "#f4f7fa",
      surface: "#192632",
      border: "#334554",
      primary: "#8bd3ff",
      primaryText: "#092337",
      muted: "#c0ced8",
      accent: "#9be2c0",
      accentText: "#092b1b",
    },
  },
  {
    id: "elegante",
    name: "Elegante",
    description: "Cálido y sobrio, con una personalidad editorial.",
    idealFor: "Casas de campo y estancias",
    tokens: {
      bg: "#f5f0e8",
      text: "#352b25",
      surface: "#fffdf8",
      border: "#d8cbbc",
      primary: "#624838",
      primaryText: "#fffdf8",
      muted: "#6d6259",
      accent: "#966f3e",
      accentText: "#fffdf8",
    },
  },
  {
    id: "atardecer",
    name: "Atardecer",
    description: "Memorable y envolvente, pensado para enamorar a primera vista.",
    idealFor: "Alojamientos con buenas fotos",
    tokens: {
      bg: "#fff7f1",
      text: "#3c1f1a",
      surface: "#ffffff",
      border: "#f0d3c5",
      primary: "#8f3528",
      primaryText: "#ffffff",
      muted: "#765e58",
      accent: "#d56b3e",
      accentText: "#ffffff",
    },
  },
];

export const DEFAULT_DESIGN: DesignKey = "claro";

export function getDesign(value?: string | null): DesignDefinition {
  return DESIGNS.find((design) => design.id === value) || DESIGNS[0];
}
