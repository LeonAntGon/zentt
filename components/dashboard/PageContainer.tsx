import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageWidth = "default" | "content" | "form" | "narrow";

const widthClass: Record<PageWidth, string> = {
  default: "max-w-7xl",
  content: "max-w-6xl",
  form: "max-w-4xl",
  narrow: "max-w-3xl",
};

type PageContainerProps = {
  children: ReactNode;
  width?: PageWidth;
  className?: string;
};

/**
 * Shared dashboard page shell. Keeps horizontal padding and max-width
 * consistent across routes so navigation doesn't shift the layout.
 */
export function PageContainer({
  children,
  width = "default",
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8",
        widthClass[width],
        className
      )}
    >
      {children}
    </div>
  );
}
