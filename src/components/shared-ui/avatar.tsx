"use client";

import * as React from "react";
import Image from "next/image";
import { toImageSrc, getInitials } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  name?: string; // fallback full name string
  initials?: string; // explicit initials override
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  brandColor?: string | null;
}

const sizes = {
  xs: { outer: "h-7 w-7", text: "text-[10px]" },
  sm: { outer: "h-9 w-9", text: "text-xs" },
  md: { outer: "h-11 w-11", text: "text-sm" },
  lg: { outer: "h-16 w-16", text: "text-lg" },
  xl: { outer: "h-24 w-24", text: "text-2xl" },
};

export function Avatar({
  src,
  firstName,
  lastName,
  name,
  initials: initialsOverride,
  size = "md",
  className,
  brandColor,
}: AvatarProps) {
  const [error, setError] = React.useState(false);
  const imgSrc = toImageSrc(src);

  React.useEffect(() => {
    setError(false);
  }, [src]);

  const initials =
    initialsOverride ||
    getInitials(firstName, lastName) ||
    getInitials(name) ||
    "?";

  const sz = sizes[size];

  if (imgSrc && !error) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-slate-800",
          sz.outer,
          className,
        )}
      >
        <img
          key={imgSrc}
          src={imgSrc}
          alt="Avatar"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // Fallback: styled initials
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white dark:ring-slate-800",
        sz.outer,
        sz.text,
        className,
      )}
      style={{
        background: brandColor
          ? `linear-gradient(135deg, ${brandColor}dd, ${brandColor}99)`
          : "linear-gradient(135deg, #3b82f6, #6366f1)",
      }}
    >
      {initials}
    </div>
  );
}
