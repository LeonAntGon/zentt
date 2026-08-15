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
      className="group flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-slate-200"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={image || FALLBACK_IMAGE}
          alt={name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <Users size={12} className="shrink-0" />
          <span>{capacity} personas</span>
        </p>
        <p className="text-lg font-bold text-primary">
          $ {price.toLocaleString("es-AR")}
          <span className="ml-1 text-xs font-normal text-slate-400">
            / noche
          </span>
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
    </Link>
  );
}
