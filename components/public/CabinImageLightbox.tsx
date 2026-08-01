"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CarouselImage } from "./CabinGallery";

type CabinImageLightboxProps = {
  images: CarouselImage[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

export function CabinImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: CabinImageLightboxProps) {
  const total = images.length;
  const multi = total > 1;
  const thumbsRef = useRef<HTMLDivElement>(null);

  const goPrev = useCallback(() => {
    if (index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const goNext = useCallback(() => {
    if (index < total - 1) onIndexChange(index + 1);
  }, [index, total, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLButtonElement>(
      `[data-thumb-index="${index}"]`
    );
    if (active) {
      active.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [index]);

  const current = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galería de fotos"
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6 sm:py-4">
        <span className="text-sm font-semibold tabular-nums">
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar galería"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 py-4 sm:px-20 sm:py-6">
        {multi && (
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Imagen anterior"
            className={cn(
              "absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full",
              "bg-white/95 text-slate-900 shadow-lg transition-all",
              "hover:bg-white hover:scale-105 disabled:pointer-events-none disabled:opacity-30",
              "sm:left-6 sm:h-14 sm:w-14"
            )}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {current && (
          <img
            key={current.src}
            src={current.src}
            alt={current.alt || `Foto ${index + 1}`}
            className="max-h-[72vh] max-w-[92vw] select-none rounded-lg object-contain shadow-2xl sm:max-h-[75vh] sm:max-w-[78vw]"
            draggable={false}
          />
        )}

        {multi && (
          <button
            type="button"
            onClick={goNext}
            disabled={index === total - 1}
            aria-label="Imagen siguiente"
            className={cn(
              "absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full",
              "bg-white/95 text-slate-900 shadow-lg transition-all",
              "hover:bg-white hover:scale-105 disabled:pointer-events-none disabled:opacity-30",
              "sm:right-6 sm:h-14 sm:w-14"
            )}
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {multi && (
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto px-4 py-4 sm:gap-3 sm:px-6 sm:py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              type="button"
              data-thumb-index={i}
              onClick={() => onIndexChange(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition-all sm:h-20 sm:w-28",
                i === index
                  ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                  : "opacity-50 hover:opacity-100"
              )}
            >
              <img
                src={img.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
