"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useInstallStatus } from "@/hooks/useInstall";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { Sidebar } from "@/components/navigation/Sidebar";
import { InstallToast } from "@/components/ui/InstallToast";
import { ApplicationCard } from "@/components/cards/ApplicationCard";
import { BundleCard } from "@/components/cards/BundleCard";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { InstallDialog } from "@/components/dialogs/InstallDialog";
import { CompanionDialog } from "@/components/dialogs/CompanionDialog";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AppCardSkeleton } from "@/components/ui/AppCardSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApps, useBundles } from "@/hooks/useApps";
import { useInstalledApps, useCompanion } from "@/hooks/useCompanion";
import { useCart } from "@/contexts/CartContext";
import { SORT_OPTIONS, type SortOption, type Bundle, type App } from "@/types";
import { api } from "@/services/api";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0]);
  const [cartOpen, setCartOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [companionDialogOpen, setCompanionDialogOpen] = useState(false);

  // Track install status to reopen dialog on refresh if needed
  const installStatus = useInstallStatus();
  useEffect(() => {
    if (installStatus.isInstalling && !installOpen) {
      setInstallOpen(true);
    }
  }, [installStatus.isInstalling, installOpen]);

  const companion = useCompanion();
  const { addToCart, removeFromCart, cartIds } = useCart();

  const handleToggleCart = useCallback((app: App, isSelected: boolean) => {
    if (isSelected) {
      removeFromCart(app.id);
    } else {
      addToCart(app);
    }
  }, [addToCart, removeFromCart]);

  // Fetch data
  const { data: apps, isLoading: appsLoading } = useApps({
    category: activeCategory,
    sort: sortOption,
  });
  const { data: bundles } = useBundles();
  const { data: installedAppIds } = useInstalledApps();

  const installedSet = useMemo(
    () => new Set(installedAppIds || []),
    [installedAppIds]
  );

  // Handle bundle install: add all bundle apps to cart
  const handleBundleInstall = async (bundle: Bundle) => {
    try {
      const bundleApps = await api.getAppsByIds(bundle.apps);
      bundleApps.forEach((app) => addToCart(app));
      setCartOpen(true);
    } catch (err) {
      console.error("Failed to load bundle apps:", err);
    }
  };

  // Progressive rendering state for performance
  const [displayedCount, setDisplayedCount] = useState(100);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayedCount(100);
  }, [activeCategory, sortOption]);

  // Infinite scroll replaced by Show More button

  // Handle install: check companion first
  const handleInstall = () => {
    if (!companion.isConnected) {
      setCompanionDialogOpen(true);
      return;
    }
    setInstallOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <Navbar onCartOpen={() => setCartOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
        />

        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-10 space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <motion.h1
                  key={activeCategory || "all"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl md:text-4xl font-bold tracking-tight"
                >
                  {activeCategory || "All Applications"}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-muted-foreground max-w-2xl text-base"
                >
                  Browse, select, and install multiple Windows applications
                  simultaneously with our premium installer experience.
                </motion.p>
              </div>

              {/* Sort Control */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-[var(--radius-button)] gap-2 flex-shrink-0"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      {sortOption.label}
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  {SORT_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={`${opt.field}-${opt.direction}`}
                      onClick={() => setSortOption(opt)}
                      className={
                        sortOption.field === opt.field &&
                        sortOption.direction === opt.direction
                          ? "bg-primary/10 text-primary"
                          : ""
                      }
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Featured Bundles — show only on "All" */}
            {activeCategory === null && bundles && bundles.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🚀 Quick Start Bundles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bundles.map((bundle, index) => (
                    <BundleCard
                      key={bundle.id}
                      bundle={bundle}
                      index={index}
                      onInstall={handleBundleInstall}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Application Grid */}
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                {appsLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
                  >
                    {Array.from({ length: 15 }).map((_, i) => (
                      <AppCardSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : apps && apps.length > 0 ? (
                  <motion.div
                    key={`grid-${activeCategory || "all"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
                  >
                    {apps.slice(0, displayedCount).map((app, index) => (
                      <ApplicationCard
                        key={app.id}
                        app={app}
                        index={index}
                        isInstalled={installedSet.has(app.wingetId || app.id)}
                        selected={cartIds.has(app.id)}
                        onToggle={handleToggleCart}
                      />
                    ))}
                    {apps.length > displayedCount && (
                      <div className="col-span-full flex justify-center py-8">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setDisplayedCount(apps.length)}
                          className="rounded-[var(--radius-button)]"
                        >
                          Show More
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-20 text-center flex flex-col items-center justify-center bg-card/30 rounded-[var(--radius-card)] border border-border/50"
                  >
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-foreground">
                      No applications found
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                      We couldn&apos;t find any applications
                      {activeCategory ? ` in the ${activeCategory} category` : ""}.
                      Try selecting a different category.
                    </p>
                    {activeCategory && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveCategory(null)}
                      >
                        View All Applications
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </ErrorBoundary>

            {/* App count */}
            {apps && apps.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Showing {apps.length} application{apps.length !== 1 ? "s" : ""}
                {activeCategory ? ` in ${activeCategory}` : ""}
              </p>
            )}
          </div>

          <Footer />
        </main>
      </div>

      {/* Drawers & Dialogs */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onInstall={handleInstall}
      />
      <InstallDialog key={installOpen ? "open" : "closed"} open={installOpen} onOpenChange={setInstallOpen} />
      <CompanionDialog
        open={companionDialogOpen}
        onOpenChange={setCompanionDialogOpen}
      />
      <InstallToast onOpen={() => setInstallOpen(true)} />
    </div>
  );
}
