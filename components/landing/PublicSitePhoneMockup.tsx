import { Users } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { ZenttLogo } from "@/components/landing/ZenttLogo";

type PublicSitePhoneMockupProps = {
  compact?: boolean;
  showBioChip?: boolean;
};

const cabins = [
  { name: "Alojamiento del Bosque", people: 6, price: "$84k" },
  { name: "Cabaña Río Claro", people: 4, price: "$48k" },
];

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

      <div
        className={`relative overflow-hidden rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-primary/10 ${
          compact ? "rounded-[1.75rem] border-[7px]" : ""
        }`}
      >
        <div
          className={`relative overflow-hidden bg-gradient-to-b from-slate-50 to-white ${
            compact ? "aspect-[9/16]" : "aspect-[9/19.5]"
          }`}
        >
          <div
            className={`absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-900 ${
              compact ? "top-1.5 h-3 w-14" : "top-2 h-4 w-[72px]"
            }`}
          />

          <div
            className={`flex h-full flex-col ${
              compact ? "px-2.5 pb-2 pt-6" : "px-3.5 pb-3 pt-8"
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center rounded-xl bg-slate-900 font-bold text-white ${
                  compact ? "h-8 w-8 text-[10px]" : "h-11 w-11 text-sm"
                }`}
              >
                SL
              </div>
              <p
                className={`mt-1.5 text-center font-bold text-slate-900 ${
                  compact ? "text-[9px]" : "text-[11px]"
                }`}
              >
                Sol y Luna
              </p>
              <p
                className={`font-medium text-slate-400 ${
                  compact ? "text-[7px]" : "text-[9px]"
                }`}
              >
                zentt.agency/solyluna
              </p>
            </div>

            <div className={`mt-2.5 space-y-1.5 ${compact ? "mt-2" : ""}`}>
              {cabins.map((cabin) => (
                <div
                  key={cabin.name}
                  className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-1.5 shadow-sm"
                >
                  <div
                    className={`shrink-0 rounded-lg bg-gradient-to-br from-primary/80 to-navy ${
                      compact ? "h-8 w-8" : "h-10 w-10"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-semibold text-slate-900 ${
                        compact ? "text-[8px]" : "text-[10px]"
                      }`}
                    >
                      {cabin.name}
                    </p>
                    <p
                      className={`flex items-center gap-0.5 text-slate-400 ${
                        compact ? "text-[7px]" : "text-[8px]"
                      }`}
                    >
                      <Users size={compact ? 8 : 9} />
                      {cabin.people} personas
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`font-bold text-primary ${
                        compact ? "text-[8px]" : "text-[10px]"
                      }`}
                    >
                      {cabin.price}
                    </p>
                    <p className="text-[7px] text-slate-400">/ noche</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-auto flex items-center justify-center gap-1 pt-2 ${
                compact ? "pt-1.5" : ""
              }`}
            >
              <span
                className={`font-medium uppercase tracking-widest text-slate-300 ${
                  compact ? "text-[6px]" : "text-[8px]"
                }`}
              >
                Powered by
              </span>
              <ZenttLogo
                className={`w-auto ${compact ? "h-2.5" : "h-3"} aspect-[290/130]`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
