import { cn } from "@/lib/utils";
import React from "react";

interface InstallProgressProps {
  progress: number;
  showWave?: boolean;
  className?: string;
  fillClassName?: string;
}

export function InstallProgress({
  progress,
  showWave,
  className,
  fillClassName,
}: InstallProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const isActive = showWave && clampedProgress > 0 && clampedProgress < 100;

  return (
    <div
      className={cn("install-progress-track", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedProgress}
    >
      {/* Solid fill */}
      <div
        className={cn("install-progress-fill", fillClassName)}
        style={{ "--progress": `${clampedProgress}%` } as React.CSSProperties}
      />

      {/* Animated shimmer sweep over the fill */}
      {isActive && (
        <div
          className="install-progress-shimmer"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
