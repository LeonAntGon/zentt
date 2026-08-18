import Image from "next/image";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

type PublicSitePhoneMockupProps = {
  compact?: boolean;
  showBioChip?: boolean;
};

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function PublicSitePhoneMockup({
  compact = false,
  showBioChip = true,
}: PublicSitePhoneMockupProps) {
  return (
    <div
      className={`relative ${compact ? "w-[148px]" : "w-[220px]"}`}
      aria-hidden
    >
      {showBioChip ? (
        <div className="absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-1 shadow-md">
          <InstagramGlyph className="h-3 w-3 text-[#E4405F]" />
          <WhatsAppIcon className="h-3 w-3 text-whatsapp" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
            Tu link
          </span>
        </div>
      ) : null}

      <Image
        src="/assets/img-link-in-phone.png"
        alt=""
        width={880}
        height={1760}
        unoptimized
        quality={100}
        className={`h-auto w-full ${compact ? "mt-0" : "mt-2"} drop-shadow-2xl`}
      />
    </div>
  );
}
