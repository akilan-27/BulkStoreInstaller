"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Package, Play } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { drawerVariants } from "@/animations/motion";
import { useEffect, useRef } from "react";
import { AppIcon } from "@/components/ui/app-icon";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export function CartDrawer({ isOpen, onClose, onInstall }: CartDrawerProps) {
  const { cart, removeFromCart, clearCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap: return focus to trigger on close
  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        drawerRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            tabIndex={-1}
            role="dialog"
            aria-label="Install Queue"
            aria-modal="true"
            className="fixed top-0 right-0 z-50 h-full w-full max-w-[460px] bg-background/95 backdrop-blur-xl border-l border-border/50 shadow-2xl flex flex-col outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-border/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">
                  Install Queue
                </h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary tabular-nums">
                  {cart.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close queue"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 px-6 py-4">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Package className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">
                    Your queue is empty
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[240px]">
                    Browse applications and click Add to Cart to add them to your
                    queue.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {cart.map((app) => (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, x: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{
                          opacity: 0,
                          x: -20,
                          height: 0,
                          marginBottom: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 35,
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/30 hover:border-border/60 transition-colors group"
                      >
                        {/* App Icon */}
                        <div className="w-10 h-10 rounded-[10px] bg-secondary/50 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <AppIcon
                            src={app.iconPlaceholder}
                            name={app.name}
                            className="w-full h-full object-contain p-1.5"
                          />
                        </div>

                        {/* App Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {app.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {app.publisher}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={() => removeFromCart(app.id)}
                          aria-label={`Remove ${app.name} from queue`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-4 border-t border-border/50 flex-shrink-0 space-y-3"
              >
                {/* Summary */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {cart.length} application{cart.length !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear All
                  </button>
                </div>

                {/* Install Button */}
                <Button
                  className="w-full h-11 rounded-[var(--radius-button)] text-base font-semibold shadow-md shadow-primary/20"
                  size="lg"
                  onClick={() => {
                    onClose();
                    setTimeout(onInstall, 300);
                  }}
                >
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  Install All ({cart.length})
                </Button>
              </motion.div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
