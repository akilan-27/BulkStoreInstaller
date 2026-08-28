"use client";

import { startTransition, useState, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCategories, useCategoryCounts } from "@/hooks/useApps";
import { CATEGORIES } from "@/constants/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers } from "lucide-react";

interface SidebarProps {
  activeCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function Sidebar({ activeCategory, onCategorySelect }: SidebarProps) {
  const [localActive, setLocalActive] = useState(activeCategory);
  
  useEffect(() => {
    setLocalActive(activeCategory);
  }, [activeCategory]);

  const { isLoading: categoriesLoading } = useCategories();
  const { data: counts } = useCategoryCounts();

  const handleSelect = (cat: string | null) => {
    setLocalActive(cat); // Instant visual update
    startTransition(() => {
      onCategorySelect(cat); // Deferred heavy grid rendering
    });
  };

  // Build category list matching CATEGORIES definition order and counts
  const categories = CATEGORIES.map((cat) => ({
    ...cat,
    count: counts?.[cat.name] || 0,
  }));

  const totalCount = counts
    ? Object.values(counts).reduce((a, b) => a + b, 0)
    : 0;

  if (categoriesLoading) {
    return (
      <aside className="w-[260px] h-screen sticky top-0 flex-shrink-0 border-r border-border/50 bg-background/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6 space-y-3">
          <Skeleton className="h-4 w-24 mb-4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-[260px] h-screen sticky top-0 flex-shrink-0 border-r border-border/50 bg-background/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4 px-2">
            Categories
          </h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <LayoutGroup id="sidebar-categories">
              <nav className="space-y-1 relative pr-4" role="tablist" aria-label="Application categories">
                {/* All Applications */}
                <SidebarItem
                  label="All Applications"
                  icon={Layers}
                  count={totalCount}
                  isActive={localActive === null}
                  onClick={() => handleSelect(null)}
                />

                {/* Category Items */}
                {categories.map((cat) => (
                  <SidebarItem
                    key={cat.id}
                    label={cat.name}
                    icon={cat.icon}
                    count={cat.count}
                    isActive={localActive === cat.name}
                    onClick={() => handleSelect(cat.name)}
                  />
                ))}
              </nav>
            </LayoutGroup>
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile Category Bar */}
      <div className="md:hidden w-full overflow-x-auto border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-[72px] z-30">
        <div className="flex gap-2 px-4 py-3 min-w-max" role="tablist" aria-label="Application categories">
          <MobilePill
            label="All"
            isActive={localActive === null}
            onClick={() => handleSelect(null)}
          />
          {categories.map((cat) => (
            <MobilePill
              key={cat.id}
              label={cat.name}
              isActive={localActive === cat.name}
              onClick={() => handleSelect(cat.name)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────

function SidebarItem({
  label,
  icon: Icon,
  count,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 3 }}
      whileTap={{ scale: 0.97 }}
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm font-medium transition-colors group",
        isActive
          ? "text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-sm bg-primary shadow-md"
          initial={false}
          style={{ pointerEvents: "none" }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 28,
            mass: 0.6,
          }}
        />
      )}
      <span className="flex items-center gap-2.5 z-10 min-w-0 flex-1">
        <Icon className={cn("h-4 w-4 flex-shrink-0 relative z-10", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
        <span className="truncate relative z-10">{label}</span>
      </span>
      {count > 0 && (
        <span
          className={cn(
            "text-xs relative z-10 tabular-nums flex-shrink-0 ml-1",
            isActive ? "text-primary-foreground/80" : "text-muted-foreground/60"
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

function MobilePill({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
