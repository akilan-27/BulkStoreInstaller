"use client";

import React, { useState, memo } from "react";
import { cn } from "@/lib/utils";

interface AppIconProps {
  src: string;
  name: string;
  className?: string;
}

const colors = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-fuchsia-500",
  "from-red-500 to-orange-500",
  "from-sky-500 to-indigo-500",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function AppIconComponent({ src, name, className }: AppIconProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    const gradient = getGradient(name);
    const initial = name.charAt(0).toUpperCase();

    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br text-white font-bold shadow-xs",
          gradient,
          className
        )}
      >
        <span className="opacity-90" style={{ fontSize: "50%" }}>
          {initial}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
      decoding="async"
    />
  );
}

export const AppIcon = memo(AppIconComponent);

