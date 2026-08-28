"use client";

import { useCart } from "@/contexts/CartContext";
import { useInstall, useInstallStatus } from "@/hooks/useInstall";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Info,
  StopCircle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { App, InstallQueueItem } from "@/types";
import { AppIcon } from "@/components/ui/app-icon";
import { InstallProgress } from "@/components/ui/InstallProgress";

interface InstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallDialog({ open, onOpenChange }: InstallDialogProps) {
  const queryClient = useQueryClient();
  const { cart, clearCart, removeFromCart } = useCart();
  const { install, cancel, retryFailed, isInstalling, isRetrying } = useInstall();
  const backendStatus = useInstallStatus();

  const [hasStarted, setHasStarted] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [localQueue, setLocalQueue] = useState<InstallQueueItem[]>([]);
  const installingAppsRef = useRef<App[]>([]);

  // Reset state when dialog is opened
  useEffect(() => {
    if (open) {
      if (!backendStatus.isInstalling) {
        setHasStarted(false);
        setIsStopping(false);
        setShowStopConfirm(false);
        setLocalQueue([]);
        installingAppsRef.current = [];
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Merge backend status updates into our local queue
  useEffect(() => {
    if (!hasStarted || localQueue.length === 0) return;
    if (backendStatus.queue.length === 0) return;

    const backendMap = new Map<string, InstallQueueItem>();
    for (const item of backendStatus.queue) {
      backendMap.set(item.app.id, item);
      if (item.app.wingetId) {
        backendMap.set(item.app.wingetId, item);
      }
    }

    const matchCount = localQueue.filter(
      (lq) => backendMap.has(lq.app.id) || backendMap.has(lq.app.wingetId || "")
    ).length;

    if (matchCount === 0) return;

    setLocalQueue((prev) =>
      prev.map((lq) => {
        const match =
          backendMap.get(lq.app.id) ||
          backendMap.get(lq.app.wingetId || "");
        if (match) {
          // Prevent the backend from reverting our fake progress or status
          const newStatus = match.status === "pending" ? lq.status : match.status;
          const newProgress = Math.max(lq.progress, match.progress);
          const newStatusText = match.statusText === "Waiting..." ? lq.statusText : (match.statusText || lq.statusText);
          
          return {
            ...lq,
            status: newStatus,
            progress: newProgress,
            statusText: newStatusText,
            errorMessage: match.errorMessage,
          };
        }
        return lq;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, localQueue.length, backendStatus.queue]);

  // Derived metrics
  const successCount = localQueue.filter((q) => q.status === "success").length;
  const failedCount = localQueue.filter((q) => q.status === "error").length;
  const remainingCount = localQueue.filter(
    (q) => q.status === "pending" || q.status === "installing"
  ).length;

  const isFinished =
    hasStarted &&
    localQueue.length > 0 &&
    localQueue.every((q) => q.status === "success" || q.status === "error");

  const hasFailures = failedCount > 0;

  // Frontend-driven fake progress simulator to ensure the bar ALWAYS increases 
  // even if Winget hangs silently in the background
  useEffect(() => {
    if (!hasStarted || isFinished || isStopping) return;
    
    const interval = setInterval(() => {
      setLocalQueue((prev) => 
        prev.map((item) => {
          if (item.status === "installing" && item.progress < 85) {
            return { ...item, progress: item.progress + 1 };
          }
          return item;
        })
      );
    }, 1500); // +1% every 1.5 seconds

    return () => clearInterval(interval);
  }, [hasStarted, isFinished, isStopping]);

  // Handle dialog close logic
  const handleOpenChange = (newOpen: boolean) => {
    if (backendStatus.isInstalling && !isFinished) return;
    onOpenChange(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setHasStarted(false);
        setIsStopping(false);
        setShowStopConfirm(false);
        setLocalQueue([]);
        installingAppsRef.current = [];
      }, 300);
    }
  };

  const handleStart = async () => {
    setHasStarted(true);
    setIsStopping(false);

    // Only the first app starts as "installing"; the rest wait as "pending"
    // so the UI matches the backend's sequential one-at-a-time execution.
    const initialQueue: InstallQueueItem[] = cart.map((app, index) => ({
      app,
      status: index === 0 ? "installing" : "pending",
      progress: index === 0 ? 1 : 0,
      statusText: index === 0 ? "Downloading..." : "Waiting...",
    }));
    setLocalQueue(initialQueue);

    try {
      await install(cart);
    } catch {
      setHasStarted(false);
      setLocalQueue([]);
    }
  };

  // User confirmed "Stop Installation"
  const handleConfirmStop = async () => {
    setShowStopConfirm(false);
    setIsStopping(true);
    
    try {
      await cancel();
    } catch (err) {
      console.error("Cancel failed:", err);
    }

    // Optimistically mark unstarted apps as stopped
    setLocalQueue((prev) =>
      prev.map((item) => {
        if (item.status === "pending") {
          return {
            ...item,
            status: "error",
            statusText: "Stopped",
            errorMessage: "Skipped by user request",
          };
        }
        return item;
      })
    );
  };

  const handleRetry = () => {
    retryFailed();
  };

  // Auto-sync if backend is already installing when dialog opens
  useEffect(() => {
    if (open && backendStatus.isInstalling && !hasStarted) {
      setLocalQueue(backendStatus.queue);
      setHasStarted(true);
    }
  }, [open, backendStatus.isInstalling, hasStarted, backendStatus.queue]);

  // On completion, remove successful apps from cart & refresh installed apps
  const handleDone = () => {
    if (isFinished) {
      if (!hasFailures) {
        clearCart();
      } else {
        localQueue.forEach((q) => {
          if (q.status === "success") {
            removeFromCart(q.app.id);
          }
        });
      }
      queryClient.invalidateQueries({ queryKey: ["installedApps"] });
    }
    handleOpenChange(false);
  };

  // Overall progress percentage
  const progressPercent =
    hasStarted && localQueue.length > 0
      ? isFinished && !hasFailures
        ? 100
        : Math.min(
            100,
            Math.round(
              localQueue.reduce(
                (acc, q) => acc + Math.min(100, Math.max(0, q.progress)),
                0
              ) / localQueue.length
            )
          )
      : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-3xl overflow-hidden border-border/80 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {isFinished && !hasFailures
                ? "Installation Complete"
                : hasStarted
                  ? isStopping
                    ? "Stopping Installation"
                    : "Installing Applications"
                  : "Ready to Install"}
            </DialogTitle>
            <DialogDescription>
              {isFinished && !hasFailures
                ? "All applications installed successfully!"
                : isFinished && hasFailures
                  ? `Completed with ${failedCount} failure${failedCount !== 1 ? "s" : ""}`
                  : isStopping
                    ? "Stopping after the current installation finishes…"
                    : backendStatus.isInstalling || hasStarted
                      ? `Installing applications... ${progressPercent}% complete`
                      : `${cart.length} application${cart.length !== 1 ? "s" : ""} selected for installation`}
            </DialogDescription>
          </DialogHeader>

          {/* Tab Browsing Notice */}
          {hasStarted && !isFinished && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-primary flex-shrink-0" />
              <span>
                You can continue browsing in another tab. Keep this tab open to view the installation progress.
              </span>
            </div>
          )}

          {/* Progress Summary Bar */}
          {hasStarted && localQueue.length > 0 && (
            <div className="flex items-center gap-4 text-sm pt-1">
              <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span className="tabular-nums">
                  {successCount} {isFinished && !hasFailures ? `of ${localQueue.length} installed` : ""}
                </span>
              </div>
              {failedCount > 0 && (
                <div className="flex items-center gap-1.5 text-destructive font-medium">
                  <XCircle className="h-4 w-4" />
                  <span className="tabular-nums">{failedCount} failed</span>
                </div>
              )}
              {remainingCount > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Circle className="h-4 w-4" />
                  <span className="tabular-nums">{remainingCount} remaining</span>
                </div>
              )}
              <div className="flex-1">
                <InstallProgress
                  progress={progressPercent}
                  className="h-2 bg-muted border border-border/40"
                  fillClassName={
                    isFinished && !hasFailures
                      ? "!bg-emerald-500"
                      : ""
                  }
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums font-semibold">
                {progressPercent}%
              </span>
            </div>
          )}

          {/* Application List */}
          <div className="py-2">
            <div className="bg-muted/40 rounded-2xl p-1 border border-border/50">
              <ScrollArea className="h-[280px] p-3">
                <div className="flex flex-col gap-2.5">
                  <AnimatePresence mode="popLayout">
                    {hasStarted && localQueue.length > 0
                      ? localQueue.map((item, i) => (
                          <motion.div
                            layout
                            key={item.app.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-center gap-3.5 bg-background p-3 rounded-xl border border-border/60 shadow-xs"
                          >
                            <div className="relative flex-shrink-0">
                              <AppIcon
                                src={item.app.iconPlaceholder}
                                name={item.app.name}
                                className="w-10 h-10 rounded-xl bg-muted object-contain p-1"
                              />
                              {item.status === "success" && (
                                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-xs">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-background" />
                                </div>
                              )}
                              {item.status === "error" && (
                                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-xs">
                                  <XCircle className="w-4 h-4 text-destructive fill-background" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold truncate">
                                  {item.app.name}
                                </span>
                                <div className="text-xs font-medium capitalize flex-shrink-0 ml-2">
                                  {item.status === "success" ? (
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                      Success
                                    </span>
                                  ) : item.status === "installing" ? (
                                    <span className="text-primary">
                                      {item.statusText || "Installing..."} ({Math.min(100, Math.max(0, item.progress))}%)
                                    </span>
                                  ) : item.status === "error" ? (
                                    <span className="text-destructive">
                                      {item.statusText || "Failed"}
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                      <motion.span
                                        className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                                      />
                                      Waiting...
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full pt-1">
                                <InstallProgress
                                  progress={item.status === "success" ? 100 : item.progress}
                                  showWave={item.status === "installing"}
                                  className="h-1 bg-muted border border-border/20 mt-2"
                                  fillClassName={
                                    item.status === "error"
                                      ? "!bg-destructive"
                                      : item.status === "success"
                                      ? "!bg-emerald-500"
                                      : ""
                                  }
                                />
                              </div>

                              {item.errorMessage && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                  {item.errorMessage.includes("[ADMIN_REQUIRED]")
                                    ? "Requires administrator privileges."
                                    : item.errorMessage}
                                </p>
                              )}
                              {item.status === "error" && item.app.downloadUrl && (
                                <a
                                  href={item.app.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-1 text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                                >
                                  ↗ Download manually from official site
                                </a>
                              )}
                            </div>
                          </motion.div>
                        ))
                      : cart.map((app, i) => (
                          <motion.div
                            layout
                            key={app.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-center gap-3 bg-background p-3 rounded-xl border border-border/50 shadow-xs opacity-90"
                          >
                            <AppIcon
                              src={app.iconPlaceholder}
                              name={app.name}
                              className="w-10 h-10 rounded-xl bg-muted object-contain p-1"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">
                                {app.name}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {app.publisher}
                              </span>
                            </div>
                            <div className="ml-auto flex-shrink-0">
                              <Circle className="w-4 h-4 text-muted-foreground/40" />
                            </div>
                          </motion.div>
                        ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>

            {/* Neutral Information Message */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 pt-2.5">
              <Info className="h-3.5 w-3.5 text-muted-foreground/70 flex-shrink-0" />
              <span>Some applications may take a while.</span>
            </div>
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="gap-2 sm:gap-2 sm:justify-between items-center w-full pt-2">
            <div className="text-xs text-muted-foreground mr-auto">
              {isStopping && "Stopping after the current installation finishes…"}
            </div>

            <div className="flex gap-2">
              {/* Cancel before start */}
              {!hasStarted && !isFinished && (
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
              )}

              {/* During installation: Stop Installation */}
              {(backendStatus.isInstalling || hasStarted) && !isFinished ? (
                <Button
                  variant="outline"
                  onClick={() => setShowStopConfirm(true)}
                  disabled={isStopping}
                  className="border-border text-foreground hover:bg-muted font-medium"
                >
                  <StopCircle className="h-3.5 w-3.5 mr-1.5 fill-current" />
                  Stop Installation
                </Button>
              ) : isFinished ? (
                <>
                  {hasFailures && (
                    <Button
                      variant="outline"
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="text-primary border-primary/30 hover:bg-primary/10"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
                      />
                      Retry Failed ({failedCount})
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDone();
                    }}
                  >
                    Install More Apps
                  </Button>
                  <Button
                    onClick={handleDone}
                    className="bg-primary text-primary-foreground font-semibold px-6"
                  >
                    Done
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleStart}
                  disabled={cart.length === 0 || isInstalling}
                  className="font-semibold"
                >
                  Start Installation
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Stop Installation */}
      <Dialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-2xl border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Stop installation?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1.5 leading-relaxed">
              The current application has already been sent to Winget and may continue installing. Stopping now will prevent the remaining applications from starting, but it may not cancel the application currently being installed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-3">
            <Button
              variant="outline"
              onClick={() => setShowStopConfirm(false)}
            >
              Continue Installation
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmStop}
            >
              Stop Installation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

