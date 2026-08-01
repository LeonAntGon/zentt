"use client";

import { parseSocialVideoUrl } from "@/lib/videoEmbeds";
import type { CabanaVideo } from "@/types/cabin";

type CabinVideoEmbedsProps = {
  videos: CabanaVideo[];
  className?: string;
};

export function CabinVideoEmbeds({
  videos,
  className,
}: CabinVideoEmbedsProps) {
  const embeds = (videos || [])
    .map((v) => {
      const parsed = parseSocialVideoUrl(v.url);
      if (!parsed) return null;
      return { id: v.id, ...parsed };
    })
    .filter(Boolean) as Array<{
    id: number;
    provider: string;
    embedUrl: string;
    originalUrl: string;
  }>;

  if (embeds.length === 0) return null;

  return (
    <section className={className}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
        Videos
      </p>
      <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
        Mirá el alojamiento en video
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {embeds.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
          >
            <div className="aspect-video w-full">
              <iframe
                src={item.embedUrl}
                title={`Video ${item.provider}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
