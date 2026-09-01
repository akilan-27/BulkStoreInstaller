import { useState, useEffect } from "react";
import { useInstallStatus } from "@/hooks/useInstall";
import { X } from "lucide-react";

interface InstallToastProps {
  onOpen: () => void;
}

export function InstallToast({ onOpen }: InstallToastProps) {
  const status = useInstallStatus();
  const [hidden, setHidden] = useState(false);
  
  useEffect(() => {
    if (status.queue.length === 0) {
      setHidden(false);
    }
  }, [status.queue.length]);
  
  // reset hidden if installation starts again or changes?
  const isInstalling = status.isInstalling && status.queue.length > 0 && !hidden;

  const progressPercent = isInstalling
    ? Math.round(
        status.queue.reduce((acc, item) => acc + (item.progress ?? 0), 0) /
          status.queue.length
      )
    : 0;

  if (!isInstalling) return null;

  return (
    <div
      className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-lg shadow-lg p-3 flex items-center space-x-3 max-w-xs cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">Installation in progress</div>
        <div className="text-xs text-muted-foreground">
          {status.queue.length} app{status.queue.length !== 1 ? "s" : ""} • {progressPercent}%
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setHidden(true);
        }}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
