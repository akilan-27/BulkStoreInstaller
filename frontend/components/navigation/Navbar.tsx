"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, ShoppingCart, Wifi, WifiOff } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { useCompanion } from "@/hooks/useCompanion";
import { useEffect, useState, useRef, useCallback } from "react";
import { SearchInput } from "@/components/inputs/SearchInput";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface NavbarProps {
  onCartOpen: () => void;
}

export function Navbar({ onCartOpen }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { cart } = useCart();
  const companion = useCompanion();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ctrl+K focuses search
  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  useKeyboardShortcuts({
    "ctrl+k": focusSearch,
  });

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full h-[72px] bg-background/50 backdrop-blur-md border-b border-transparent" />
    );
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-background/50 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="h-[72px] px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo & Site Title */}
        <a href="#" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border border-border/80 bg-background/80 flex items-center justify-center transition-transform group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
<img
              src="/logo.png"
              alt="BulkStoreInstaller"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
              BulkStoreInstaller
            </span>
          </div>
        </a>

        {/* Search - Centered */}
        <div className="flex-1 max-w-2xl flex justify-center">
          <SearchInput ref={searchRef} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Companion Status */}
          <Tooltip>
            <TooltipTrigger
              render={
                companion.isConnected ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default">
                    <Wifi className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Companion Connected</span>
                  </div>
                ) : (
                  <a
                    href="/BulkStoreInstallerCompanionSetup.exe"
                    download="BulkStoreInstallerCompanionSetup.exe"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <WifiOff className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Offline (Download Companion)</span>
                  </a>
                )
              }
            />
            <TooltipContent>
              {companion.isConnected
                ? "Windows Companion is connected"
                : "Windows Companion is offline. Click to download the installer."}
            </TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground rounded-full"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {resolvedTheme === "dark" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Cart Button */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="default"
              className="relative bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground shadow-none rounded-[var(--radius-button)]"
              onClick={onCartOpen}
              aria-label={`Open install queue with ${cart.length} items`}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span>{cart.length} Items</span>

              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.span
                    key={cart.length}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    {cart.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
