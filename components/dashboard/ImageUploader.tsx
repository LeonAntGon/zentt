"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/media";

type ImageUploaderProps = {
  value?: string | null;
  onChange: (file: File) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  uploading?: boolean;
  disabled?: boolean;
  aspect?: "square" | "landscape" | "portrait" | "auto";
  placeholder?: string;
  fallbackInitial?: string;
  accept?: string;
  maxSizeMB?: number;
  onError?: (message: string) => void;
  className?: string;
  showRemove?: boolean;
};

const aspectClasses = {
  square: "aspect-square",
  landscape: "aspect-video",
  portrait: "aspect-[3/4]",
  auto: "",
};

const MAX_SIZE_MB_DEFAULT = 10;

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

function isSupportedImage(file: File): boolean {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
    file.type.toLowerCase()
  );
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  uploading = false,
  disabled = false,
  aspect = "square",
  placeholder = "Subir imagen",
  fallbackInitial,
  accept = IMAGE_ACCEPT,
  maxSizeMB = MAX_SIZE_MB_DEFAULT,
  onError,
  className,
  showRemove = true,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const imageUrl = getMediaUrl(value) || undefined;
  const hasImage = Boolean(imageUrl);

  const handleFile = (file: File) => {
    if (disabled || uploading) return;

    if (!isSupportedImage(file)) {
      onError?.("Elegí una imagen JPG, PNG o WebP.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`La imagen no puede superar los ${maxSizeMB} MB.`);
      return;
    }

    void onChange(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!disabled && !uploading) setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        disabled={disabled || uploading}
        aria-label={hasImage ? "Cambiar imagen" : placeholder}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          aspectClasses[aspect],
          dragOver && "border-primary bg-primary/[0.04]",
          hasImage && "border-solid border-slate-200 bg-white",
          (disabled || uploading) && "cursor-not-allowed opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={onInputChange}
          disabled={disabled || uploading}
        />

        {hasImage ? (
          <img
            src={imageUrl}
            alt="Vista previa"
            className={cn(
              "h-full w-full object-cover transition-opacity duration-200",
              uploading && "opacity-50"
            )}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="text-xs font-semibold text-slate-500">
              {placeholder}
            </span>
            {fallbackInitial && (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#184E77] to-[#0A2342] text-xl font-black text-white">
                {fallbackInitial.charAt(0).toUpperCase()}
              </span>
            )}
            {!fallbackInitial && (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                <Camera size={18} />
              </span>
            )}
          </div>
        )}

        {/* Hover / focus overlay */}
        {!uploading && (
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 text-white opacity-0 transition-opacity duration-200",
              !disabled && "group-hover:opacity-100 group-focus:opacity-100"
            )}
          >
            <Camera size={22} />
            <span className="text-xs font-semibold">
              {hasImage ? "Cambiar" : "Seleccionar"}
            </span>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 text-white">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-xs font-semibold">Subiendo…</span>
          </div>
        )}
      </button>

      {hasImage && showRemove && onRemove && !uploading && (
        <button
          type="button"
          onClick={() => void onRemove()}
          disabled={disabled}
          aria-label="Eliminar imagen"
          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * Button-style uploader for toolbars (e.g. cabin gallery).
 */
export function ImageUploadButton({
  onChange,
  uploading = false,
  disabled = false,
  accept = IMAGE_ACCEPT,
  multiple = false,
  children,
  className,
}: {
  onChange: (files: File[]) => void | Promise<void>;
  uploading?: boolean;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={disabled || uploading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length > 0) void onChange(files);
        }}
      />
      {uploading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Subiendo…
        </>
      ) : (
        children
      )}
    </button>
  );
}
