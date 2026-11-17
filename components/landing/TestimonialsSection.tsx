import { Quote } from "lucide-react";

type Review = {
  name: string;
  /** Rol público con el que aparece la reseña en Google. */
  role?: string;
  text: string;
};

/** Reseñas reales de Google. Los textos son literales: no editar. */
const reviews: Review[] = [
  {
    name: "Luciana Andrada",
    text: "Muchas gracias por el trabajo realizado de página web, súper recomendable, trabajo prolijo, rápido y profesional. Recomiendo.",
  },
  {
    name: "Karla Mayorga",
    text: "Excelente profesional. Aplicado, aporta ideas al proyecto, cumple en tiempo y forma los proyectos. Recomendado 100%.",
  },
  {
    name: "Ale",
    role: "Local Guide",
    text: "Gracias por el trabajo de desarrollo web que han realizado. La atención profesional constante y la responsabilidad.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TestimonialsSection() {
  return (
    <section id="resenas" className="scroll-mt-20 bg-background py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold tracking-wide text-primary">
            RESEÑAS
          </span>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
            Lo que dicen mis clientes
          </h2>
          <p className="text-lg text-muted-foreground">
            Opiniones reales publicadas en Google por personas con las que ya
            trabajé.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.name}
              className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:p-7"
            >
              <Quote size={22} className="text-primary/25" aria-hidden />
              <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground/85">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {initials(review.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {review.name}
                    {review.role ? (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {review.role}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Reseña de Google
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
