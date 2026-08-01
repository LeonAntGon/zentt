"use client";

import { cn } from "@/lib/utils";
import { getBusinessInitials } from "@/lib/avatar-utils";
import { getMediaUrl } from "@/lib/media";

const sizeClasses = {
  sm: "h-10 w-10 text-xs rounded-xl",
  md: "h-14 w-14 text-sm rounded-2xl",
  lg: "h-44 w-44 text-3xl rounded-full",
} as const;

type BusinessAvatarProps = {
  fotoPerfil?: string | null;
  nombreNegocio?: string | null;
  alt?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function BusinessAvatar({
  fotoPerfil,
  nombreNegocio,
  alt = "Logo del negocio",
  size = "sm",
  className,
}: BusinessAvatarProps) {
  const imageUrl = getMediaUrl(fotoPerfil);
  const initials = getBusinessInitials(nombreNegocio);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={cn(
          "object-cover border-2 border-white shadow-sm",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center font-black text-white border-2 border-white shadow-sm bg-gradient-to-br from-[#184E77] to-[#0A2342]",
        sizeClasses[size],
        className
      )}
      title={alt}
    >
      {initials}
    </div>
  );
}
