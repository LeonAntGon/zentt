"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const VIDEO_SRC =
  "https://pub-c733a6715f2143e6bde8a8e7d27ba2e7.r2.dev/zentt-whatsapp-16x9.mp4";
const POSTER_SRC = "/assets/zentt-launch-poster.jpg";

/**
 * Video de presentación del SaaS dentro de un marco con la estética Zentt.
 * Click-to-play: el MP4 solo se descarga cuando el usuario lo pide; el poster
 * local (~130 KB) cubre el primer render.
 */
export function SaasVideoShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Pausa el video si el usuario scrollea fuera del Hero.
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !video.paused) video.pause();
      },
      { threshold: 0.25 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setHasStarted(true);
      void video.play().catch(() => {
        // Autoplay bloqueado o archivo aún cargando: el overlay sigue visible.
        setIsPlaying(false);
        setHasStarted(false);
      });
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration === 0) {
      return;
    }
    setProgress((video.currentTime / video.duration) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative isolate mx-auto w-full max-w-5xl"
    >
      {/* Glow ambiental detrás del marco */}
      {!prefersReducedMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 bottom-0 top-1/3 -z-10 rounded-[3rem] bg-primary/20 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.04, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 bottom-0 top-1/3 -z-10 rounded-[3rem] bg-primary/15 blur-3xl"
        />
      )}

      <div
        ref={containerRef}
        role="group"
        aria-label="Video de demostración de Zentt"
        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-primary/10 ring-1 ring-primary/5 sm:rounded-3xl"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          <Image
            src={POSTER_SRC}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className={cn(
              "object-cover transition-opacity duration-500",
              hasStarted ? "opacity-0" : "opacity-100",
            )}
          />

          <video
            ref={videoRef}
            src={VIDEO_SRC}
            preload="none"
            playsInline
            loop
            muted={isMuted}
            onClick={togglePlayback}
            onPlay={() => {
              setHasStarted(true);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            aria-label="Demostración en video del panel de Zentt"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              hasStarted ? "cursor-pointer opacity-100" : "opacity-0",
            )}
          />

          {/* Overlay de reproducción / pausa */}
          <AnimatePresence>
            {!isPlaying ? (
              <motion.button
                key="play-overlay"
                type="button"
                onClick={togglePlayback}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
              >
                <span className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                  {!prefersReducedMotion ? (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-primary/30"
                      animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  ) : null}
                  <span className="relative flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 ring-4 ring-white/40 transition-transform duration-300 group-hover:scale-105">
                    <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
                  </span>
                </span>
                <span className="sr-only">
                  {hasStarted ? "Reanudar video" : "Reproducir video"}
                </span>
              </motion.button>
            ) : null}
          </AnimatePresence>

          {/* Controles */}
          {hasStarted ? (
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent px-3 pb-4 pt-10 transition-opacity duration-300 sm:px-4 sm:pb-5",
                isPlaying
                  ? "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                  : "opacity-100",
              )}
            >
              <button
                type="button"
                onClick={togglePlayback}
                aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                )}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Activar sonido" : "Silenciar video"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : null}

          {/* Progreso */}
          {hasStarted ? (
            <div
              className="absolute inset-x-0 bottom-0 z-40 h-1 bg-white/25"
              aria-hidden
            >
              <motion.div
                className="h-full bg-primary-foreground"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.15, ease: "linear" }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
