"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Search, Loader2, Plus, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSearch } from "@/hooks/useSearch";
import { useCart } from "@/contexts/CartContext";
import { useInstalledApps } from "@/hooks/useCompanion";
import { App } from "@/types";
import { AppIcon } from "@/components/ui/app-icon";

export const SearchInput = forwardRef<HTMLInputElement>(function SearchInput(_, ref) {
  const { searchQuery, setSearchQuery, clearSearch, searchResults, isSearching, hasQuery } =
    useSearch();
  const { addToCart, isInCart } = useCart();
  const { data: installedAppIds } = useInstalledApps();
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Forward ref to input
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
    setShowAll(false);
  }, [searchResults]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchResults) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const app = searchResults[selectedIndex];
      const isInstalled = installedAppIds?.includes(app?.wingetId || app?.id);
      if (app && !isInCart(app.id) && !isInstalled) {
        addToCart(app);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const showResults = isFocused && hasQuery && searchResults;

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <motion.div
        initial={false}
        animate={{
          boxShadow: isFocused ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
        }}
        className={cn(
          "relative flex items-center rounded-[var(--radius-search)] transition-all duration-200",
          "bg-input/50 backdrop-blur-md border",
          isFocused ? "border-ring bg-input backdrop-blur-lg" : "border-border/50"
        )}
      >
        <div className="pl-3 flex-shrink-0 text-muted-foreground">
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search applications... Ctrl + K"
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-transparent !outline-none !ring-0 !shadow-none !border-transparent px-3 h-10 shadow-none"
          style={{ outline: 'none', boxShadow: 'none' }}
          role="combobox"
          aria-expanded={!!showResults}
          aria-controls="search-results"
          aria-activedescendant={
            selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined
          }
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="pr-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {/* Floating Results Panel */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            id="search-results"
            role="listbox"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "absolute top-12 left-0 right-0 z-50 bg-background border border-border/50 rounded-[var(--radius-search)] shadow-2xl overflow-hidden transition-[max-height] duration-300 ease-in-out",
              showAll ? "max-h-[60vh]" : "max-h-80"
            )}
          >
            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No applications found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className={cn(
                "overflow-y-auto transition-[max-height] duration-300 ease-in-out",
                showAll ? "max-h-[60vh]" : "max-h-80"
              )}>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/30">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </div>
                {searchResults.slice(0, showAll ? undefined : 8).map((app: App, index: number) => {
                  const isInstalled = installedAppIds?.includes(app.wingetId || app.id);
                  const added = isInCart(app.id) || isInstalled;
                  return (
                    <button
                      key={app.id}
                      id={`search-result-${index}`}
                      role="option"
                      aria-selected={selectedIndex === index}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                        selectedIndex === index
                          ? "bg-primary/10"
                          : "hover:bg-muted/50",
                        isInstalled && "opacity-75"
                      )}
                      onClick={() => {
                        if (!added) addToCart(app);
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <AppIcon
                          src={app.iconPlaceholder}
                          name={app.name}
                          className="w-8 h-8 rounded-[8px] flex-shrink-0 bg-muted object-contain p-1"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {app.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {app.publisher} · {app.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {added ? (
                          <span className="flex items-center text-xs text-primary font-medium">
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Added
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-muted-foreground group-hover:text-foreground">
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {searchResults.length > 8 && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full px-4 py-3 text-xs text-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors border-t border-border/30 cursor-pointer"
                  >
                    + {searchResults.length - 8} more results
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
