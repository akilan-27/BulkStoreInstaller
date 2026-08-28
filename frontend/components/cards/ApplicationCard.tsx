"use client";

import { Plus, CheckCircle2, Heart, Check } from "lucide-react";
import React, { useState, memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { App } from "@/types";
import { AppIcon } from "@/components/ui/app-icon";

interface ApplicationCardProps {
  app: App;
  index?: number;
  isInstalled?: boolean;
  selected?: boolean;
  onToggle?: (app: App, isSelected: boolean) => void;
}

function ApplicationCardComponent({
  app,
  isInstalled = false,
  selected = false,
  onToggle,
}: ApplicationCardProps) {
  const [favorite, setFavorite] = useState(false);

  const handleToggleCart = () => {
    if (isInstalled) return;
    onToggle?.(app, selected);
  };

  return (
    <div
      className="relative select-none p-1 -m-1"
      style={{ contentVisibility: "auto", containIntrinsicSize: "100% 200px" }}
    >
      <div
        className={cn(
          "group relative flex flex-col h-full rounded-[var(--radius-card)] p-5 cursor-pointer overflow-hidden",
          "bg-card/90 border shadow-xs hover:shadow-md hover:-translate-y-0.5",
          "transition-all duration-150 ease-out",
          selected
            ? "border-primary bg-primary/[0.04] shadow-primary/10"
            : isInstalled
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-border/60 hover:border-primary/40 hover:bg-card"
        )}
        onClick={handleToggleCart}
        role="button"
        tabIndex={0}
        aria-label={`${app.name} by ${app.publisher}. ${
          isInstalled ? "Already installed." : selected ? "Added to cart. Click to remove." : "Click to add to cart."
        }`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggleCart();
          }
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
            <AppIcon
              src={app.iconPlaceholder}
              name={app.name}
              className="w-full h-full object-contain p-2.5 rounded-2xl transition-transform duration-150 group-hover:scale-105"
            />
            {/* Selection Checkmark on Icon */}
            {selected && (
              <div
                className="absolute -top-1.5 -right-1.5 z-20 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md ring-2 ring-background animate-in zoom-in-50 duration-150"
              >
                <Check className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setFavorite(!favorite);
            }}
            className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10 active:scale-90"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-transform duration-100",
                favorite && "fill-current text-red-500 scale-110"
              )}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1 mb-5">
          <h3 className="font-semibold text-base leading-tight tracking-tight group-hover:text-primary transition-colors">
            {app.name}
          </h3>
          <p className="text-xs text-muted-foreground">{app.publisher}</p>
          <p className="text-sm text-muted-foreground/80 line-clamp-2 mt-2">
            {app.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto gap-2 min-w-0">
          <span className="text-xs font-medium px-2 py-1 bg-secondary/50 rounded-md text-secondary-foreground/70 truncate">
            {app.category}
          </span>

          {isInstalled ? (
            <div className="flex items-center text-emerald-500 text-sm font-medium flex-shrink-0">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Installed
            </div>
          ) : (
            <Button
              size="sm"
              variant={selected ? "default" : "secondary"}
              className={cn(
                "rounded-[var(--radius-button)] transition-colors duration-150 flex-shrink-0 font-medium",
                selected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "group-hover:bg-secondary-foreground/10 group-hover:text-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleCart();
              }}
            >
              {selected ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add to Cart
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export const ApplicationCard = memo(ApplicationCardComponent);

