"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export type FormSection = {
  id: string;
  label: string;
  required?: boolean;
  hasError?: boolean;
  complete?: boolean;
};

type FormSectionNavProps = {
  sections: FormSection[];
  offset?: number;
  className?: string;
};

function getScrollParent(el: HTMLElement): HTMLElement {
  let parent = el.parentElement;
  while (parent) {
    const overflowY = getComputedStyle(parent).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return (document.scrollingElement as HTMLElement) || document.documentElement;
}

export function FormSectionNav({
  sections,
  offset = 96,
  className = "",
}: FormSectionNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (targets.length === 0) return;

    const main = document.querySelector("main");

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: main instanceof HTMLElement ? main : null,
        rootMargin: `-${offset}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [sections, offset]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const scroller = getScrollParent(el);
    const top =
      el.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      offset;
    scroller.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      {/* Mobile: chips horizontales */}
      <nav
        aria-label="Secciones del formulario"
        className={`sticky top-0 z-30 -mx-6 mb-4 flex gap-2 overflow-x-auto border-b border-slate-100 bg-white/95 px-6 py-3 backdrop-blur md:-mx-10 md:px-10 lg:hidden ${className}`}
      >
        {sections.map((s) => {
          const active = activeId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleClick(s.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : s.hasError
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {s.hasError && <AlertCircle size={12} />}
              {s.complete && !s.hasError && <CheckCircle2 size={12} />}
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Desktop: TOC lateral */}
      <aside
        aria-label="Índice del formulario"
        className={`hidden lg:sticky lg:top-6 lg:block lg:h-fit lg:w-56 ${className}`}
      >
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Secciones
        </p>
        <ul className="space-y-1">
          {sections.map((s) => {
            const active = activeId === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => handleClick(s.id)}
                  className={`group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="flex items-center gap-2">
                    {s.label}
                    {s.required && (
                      <span
                        className="text-[10px] font-bold text-slate-400"
                        aria-hidden
                      >
                        *
                      </span>
                    )}
                  </span>
                  {s.hasError ? (
                    <AlertCircle size={14} className="text-red-500" />
                  ) : s.complete ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
