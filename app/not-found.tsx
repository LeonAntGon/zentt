import Link from "next/link";
import { Home, LogIn, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 text-center">
      <div className="mx-auto max-w-md">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
          Error 404
        </p>
        <h1 className="mt-4 font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Página no encontrada
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          La dirección que buscás no existe o fue movida. Revisá la URL o volvé a
          una página que conozcas.
        </p>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Home size={17} />
            Ir al inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogIn size={17} />
            Iniciar sesión
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Search size={14} />
          <span>¿Buscás tu web pública?</span>
          <Link
            href="/dashboard/configuracion"
            className="font-semibold text-primary hover:underline"
          >
            Ver URL en Mi web
          </Link>
        </div>
      </div>
    </main>
  );
}
