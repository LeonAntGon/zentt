export const bookingFixtures = [
  {
    id: 1,
    guest: "Camila Ríos",
    property: "Cabaña del Bosque",
    dates: "12–15 nov",
    status: "Pendiente",
  },
  {
    id: 2,
    guest: "Martín López",
    property: "Casa de la Montaña",
    dates: "20–24 nov",
    status: "Confirmada",
  },
] as const;

export const messageFixtures = [
  {
    id: 1,
    guest: "Lucía Fernández",
    preview: "Hola, ¿tienen disponibilidad para el próximo fin de semana?",
    unread: true,
  },
  {
    id: 2,
    guest: "Nicolás Pérez",
    preview: "Gracias por la información. Lo revisamos y te confirmamos.",
    unread: false,
  },
] as const;
