import { ArrowUpRight } from "lucide-react";

type ClientSite = {
  name: string;
  niche: string;
  domain: string;
  url: string;
  initials: string;
};

/** Orden intencional: primero las dos cabañas destacadas. */
const sites: ClientSite[] = [
  {
    name: "Cabañas La Norita",
    niche: "Cabañas",
    domain: "cabanaslanorita.com",
    url: "https://cabanaslanorita.com",
    initials: "LN",
  },
  {
    name: "Guarida del Zorro",
    niche: "Alojamiento",
    domain: "guaridadelzorro.com",
    url: "https://guaridadelzorro.com",
    initials: "GZ",
  },
  {
    name: "Inmo Nuevo",
    niche: "Inmobiliaria",
    domain: "inmonuevo.com.ar",
    url: "https://inmonuevo.com.ar",
    initials: "IN",
  },
];

export function ClientSitesSection() {
  return (
    <section id="casos" className="scroll-mt-20 bg-card py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold tracking-wide text-primary">
            CASOS REALES
          </span>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
            Alojamientos que ya tienen su web conmigo
          </h2>
          <p className="text-lg text-muted-foreground">
            Páginas publicadas y funcionando. Entrá, miralas y sacate las dudas
            antes de escribirme.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <a
              key={site.domain}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver el sitio de ${site.name} (se abre en otra pestaña)`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {/* Barra de navegador */}
              <div className="flex items-center gap-2 border-b border-border/60 bg-slate-50 px-3.5 py-2.5">
                <span className="flex shrink-0 gap-1.5" aria-hidden>
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </span>
                <span className="ml-1 min-w-0 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                  {site.domain}
                </span>
                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-slate-400 transition-colors group-hover:text-primary"
                  aria-hidden
                />
              </div>

              {/* Preview estilizada */}
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-[#184E77]">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:28px_28px]"
                />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 font-heading text-xl font-bold tracking-wide text-white ring-1 ring-white/25 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                  {site.initials}
                </span>
                <span className="absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  {site.niche}
                </span>
              </div>

              <div className="flex flex-1 items-end justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate font-heading text-lg font-bold text-foreground">
                    {site.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sitio en producción
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
                  Ver sitio
                  <ArrowUpRight size={15} aria-hidden />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClientSitesSection;
