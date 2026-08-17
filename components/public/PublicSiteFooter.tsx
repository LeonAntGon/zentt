import Link from "next/link";
import { ZenttLogo } from "@/components/landing/ZenttLogo";

type PublicSiteFooterProps = {
  businessName?: string | null;
};

export function PublicSiteFooter({ businessName }: PublicSiteFooterProps) {
  const year = new Date().getFullYear();
  const name = (businessName || "").trim();

  return (
    <footer className="mt-auto bg-white">
      <div className="mx-auto max-w-md px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
        {name ? (
          <p className="text-[11px] text-slate-400">
            © {year} {name}
          </p>
        ) : null}
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-2 py-1 transition-opacity hover:opacity-80"
          aria-label="Zentt"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-300">
            Powered by
          </span>
          <ZenttLogo className="aspect-[290/130] h-4 w-auto -translate-x-[9px] -translate-y-[1px]" />
        </Link>
      </div>
    </footer>
  );
}
