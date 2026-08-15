"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { CabinImageLightbox } from "./CabinImageLightbox";

export type CarouselImage = {
  src: string;
  alt?: string;
};

type CabinGalleryProps = {
  images: CarouselImage[];
  className?: string;
};

const FALLBACK = "https://images.unsplash.com/photo-1542718610-a1d656d1884c";

export function CabinGallery({ images, className }: CabinGalleryProps) {
  const valid = images.filter((img) => Boolean(img.src));
  const items =
    valid.length > 0 ? valid : [{ src: FALLBACK, alt: "Alojamiento" }];
  const total = items.length;

  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (start: number) => {
    setLightboxIndex(start);
    setLightboxOpen(true);
  };

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));

  const mosaicTiles = items.slice(0, 5);
  const remaining = total - mosaicTiles.length;
  const showViewAll = total > 1;

  return (
    <>
      <div className={cn("relative w-full", className)}>
        {/* Mobile: single-image carousel */}
        <div className="md:hidden">
          <div
            className="relative overflow-hidden rounded-2xl bg-slate-100"
            style={{ touchAction: "pan-y" }}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {items.map((img, i) => (
                <button
                  key={`${img.src}-${i}`}
                  type="button"
                  onClick={() => openLightbox(i)}
                  aria-label={`Ampliar foto ${i + 1}`}
                  className="relative aspect-[4/3] w-full shrink-0 overflow-hidden"
                >
                  <Image
                    src={img.src}
                    alt={img.alt || `Foto ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={index === 0}
                  aria-label="Imagen anterior"
                  className={cn(
                    "absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full",
                    "bg-white/95 text-slate-900 shadow-md transition-all",
                    "hover:bg-white disabled:pointer-events-none disabled:opacity-30"
                  )}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={index === total - 1}
                  aria-label="Imagen siguiente"
                  className={cn(
                    "absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full",
                    "bg-white/95 text-slate-900 shadow-md transition-all",
                    "hover:bg-white disabled:pointer-events-none disabled:opacity-30"
                  )}
                >
                  <ChevronRight size={18} />
                </button>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-10">
                  <div className="pointer-events-auto flex items-center gap-1.5">
                    {items.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Ir a imagen ${i + 1}`}
                        aria-current={i === index}
                        onClick={() => setIndex(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i === index
                            ? "w-5 bg-white"
                            : "w-1.5 bg-white/60 hover:bg-white/90"
                        )}
                      />
                    ))}
                  </div>
                  <span className="shrink-0 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white">
                    {index + 1} / {total}
                  </span>
                </div>
              </>
            )}
          </div>

          {showViewAll && (
            <button
              type="button"
              onClick={() => openLightbox(index)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Images size={14} />
              Ver las {total} fotos
            </button>
          )}
        </div>

        {/* Tablet (md → lg): 1 hero + 1 tile side-by-side */}
        <div className="hidden md:block lg:hidden">
          <div className="relative grid h-[340px] grid-cols-3 gap-2 overflow-hidden rounded-3xl bg-slate-100">
            <button
              type="button"
              onClick={() => openLightbox(0)}
              aria-label="Ampliar foto 1"
              className={cn(
                "group relative overflow-hidden",
                mosaicTiles.length > 1 ? "col-span-2" : "col-span-3"
              )}
            >
              <Image
                src={mosaicTiles[0].src}
                alt={mosaicTiles[0].alt || "Foto 1"}
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                draggable={false}
              />
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </button>

            {mosaicTiles[1] && (
              <button
                type="button"
                onClick={() => openLightbox(1)}
                aria-label="Ampliar foto 2"
                className="group relative overflow-hidden"
              >
                <Image
                  src={mosaicTiles[1].src}
                  alt={mosaicTiles[1].alt || "Foto 2"}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  draggable={false}
                />
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              </button>
            )}

            {showViewAll && (
              <button
                type="button"
                onClick={() => openLightbox(0)}
                className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 shadow-lg transition-transform hover:scale-[1.03]"
              >
                <Images size={14} />
                Mostrar las {total} fotos
                {remaining > 0 && (
                  <span className="text-[11px] font-medium text-slate-500">
                    +{remaining}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Desktop: Airbnb-style mosaic */}
        <div className="hidden lg:block">
          <div
            className={cn(
              "relative grid gap-2 overflow-hidden rounded-3xl bg-slate-100",
              "h-[440px] xl:h-[500px]",
              total >= 5
                ? "grid-cols-4 grid-rows-2"
                : total >= 3
                  ? "grid-cols-3 grid-rows-2"
                  : total === 2
                    ? "grid-cols-2"
                    : "grid-cols-1"
            )}
          >
            {mosaicTiles.map((img, i) => {
              const isHero = i === 0;
              const heroSpan =
                total >= 3 ? "col-span-2 row-span-2" : "col-span-1 row-span-1";
              return (
                <button
                  key={`${img.src}-${i}`}
                  type="button"
                  onClick={() => openLightbox(i)}
                  aria-label={`Ampliar foto ${i + 1}`}
                  className={cn(
                    "group relative overflow-hidden",
                    isHero ? heroSpan : ""
                  )}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || `Foto ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes={
                      isHero
                        ? "(min-width: 1024px) 50vw, 100vw"
                        : "(min-width: 1024px) 25vw, 50vw"
                    }
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    draggable={false}
                  />
                  <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </button>
              );
            })}

            {showViewAll && (
              <button
                type="button"
                onClick={() => openLightbox(0)}
                className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 shadow-lg transition-transform hover:scale-[1.03]"
              >
                <Images size={14} />
                Mostrar las {total} fotos
                {remaining > 0 && (
                  <span className="text-[11px] font-medium text-slate-500">
                    +{remaining}
                  </span>
                )}
              </button>
            )}

            {!showViewAll && total === 1 && (
              <button
                type="button"
                onClick={() => openLightbox(0)}
                aria-label="Ampliar foto"
                className="absolute bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition-transform hover:scale-105"
              >
                <Expand size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <CabinImageLightbox
          images={items}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
