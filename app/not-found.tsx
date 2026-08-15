import Link from "next/link";
import { Home, LogIn } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
          Error 404
        </p>
        <h1 className="mt-3 font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Página no encontrada
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          La página que buscás no existe o fue movida. Volvé al inicio o
          ingresá a tu panel.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Home size={16} />
            Ir al inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogIn size={16} />
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
