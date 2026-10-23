import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Users } from "lucide-react";

type CabinLinkCardProps = {
  href: string;
  image: string;
  name: string;
  capacity: number;
  price: number;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400&q=80";

export function CabinLinkCard({
  href,
  image,
  name,
  capacity,
  price,
}: CabinLinkCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full w-full items-stretch gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-slate-200 hover:shadow-md"
    >
      <div className="relative h-16 w-16 shrink-0 self-center overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={image || FALLBACK_IMAGE}
          alt={name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <Users size={12} className="shrink-0" />
            <span>{capacity} personas</span>
          </p>
        </div>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-1">
          <p className="whitespace-nowrap text-lg font-bold tabular-nums text-primary">
            $ {price.toLocaleString("es-AR")}
          </p>
          <span className="whitespace-nowrap text-xs font-normal text-slate-400">
            / noche
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 self-end text-slate-300 transition-colors group-hover:text-slate-500" />
    </Link>
  );
}
