"use client";

import React, { memo } from "react";
import { Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bundle } from "@/types";
import { cn } from "@/lib/utils";

interface BundleCardProps {
  bundle: Bundle;
  onInstall?: (bundle: Bundle) => void;
  index?: number;
}

// Gradient presets for visual variety
const gradients = [
  "from-blue-500/10 to-violet-500/10",
  "from-emerald-500/10 to-teal-500/10",
  "from-rose-500/10 to-orange-500/10",
  "from-amber-500/10 to-yellow-500/10",
  "from-indigo-500/10 to-blue-500/10",
];

const accentColors = [
  "text-blue-500",
  "text-emerald-500",
  "text-rose-500",
  "text-amber-500",
  "text-indigo-500",
];

function BundleCardComponent({ bundle, onInstall, index = 0 }: BundleCardProps) {
  const gradient = gradients[index % gradients.length];
  const accent = accentColors[index % accentColors.length];

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full rounded-[var(--radius-card)] p-5 cursor-pointer overflow-hidden",
        "bg-card border border-border/60 hover:border-primary/40",
        "shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ease-out"
      )}
      onClick={() => onInstall?.(bundle)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onInstall?.(bundle);
        }
      }}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-75 transition-opacity duration-150 pointer-events-none",
          gradient
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2.5 rounded-xl bg-background/80 shadow-xs", accent)}>
            <Package className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-background/80 rounded-full text-muted-foreground shadow-xs">
            {bundle.appCount || bundle.apps.length} apps
          </span>
        </div>

        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
          {bundle.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {bundle.description}
        </p>

        <Button
          size="sm"
          variant="secondary"
          className="rounded-[var(--radius-button)] w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          Install Bundle
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

export const BundleCard = memo(BundleCardComponent);

