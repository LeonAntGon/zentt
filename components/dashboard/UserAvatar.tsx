"use client";

import { cn } from "@/lib/utils";
import { getAvatarColor, getInitials } from "@/lib/avatar-utils";

const DEFAULT_AVATAR_SRC = "/avatars/default-user.svg";

const sizeClasses = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-16 w-16 text-sm",
  xl: "h-28 w-28 text-2xl",
  "2xl": "h-36 w-36 text-3xl",
} as const;

type UserAvatarProps = {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  alt?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
  useDefaultImage?: boolean;
  /** Solid brand blue instead of hashed palette (sidebar footer). */
  brandTone?: boolean;
};

export function UserAvatar({
  src,
  firstName,
  lastName,
  email,
  alt = "Avatar",
  size = "md",
  className,
  useDefaultImage = false,
  brandTone = false,
}: UserAvatarProps) {
  const initials = getInitials(firstName, lastName, email);
  const colorSeed = email || `${firstName ?? ""}${lastName ?? ""}` || "user";
  const bgColor = brandTone ? "#184E77" : getAvatarColor(colorSeed);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover border-2 border-white shadow-sm",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  if (useDefaultImage) {
    return (
      <img
        src={DEFAULT_AVATAR_SRC}
        alt={alt}
        className={cn(
          "rounded-full object-cover border-2 border-white shadow-sm",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden={alt === "Avatar"}
      title={alt}
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white border-2 border-white shadow-sm select-none",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}
