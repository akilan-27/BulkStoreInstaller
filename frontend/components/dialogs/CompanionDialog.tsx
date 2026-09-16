"use client";

import { Download, WifiOff, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BridgeState } from "@/lib/bridge/client";
import { toast } from "sonner";


interface CompanionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bridgeState: BridgeState;
}

export function CompanionDialog({ open, onOpenChange, bridgeState }: CompanionDialogProps) {
  const copyDiagnostics = () => {
    const diag = {
      timestamp: new Date().toISOString(),
      origin: window.location.origin,
      bridgeUrl: "http://127.0.0.1:4545",
      state: bridgeState.kind,
      userAgent: navigator.userAgent
    };
    navigator.clipboard.writeText(JSON.stringify(diag, null, 2));
    toast.success("Diagnostics copied to clipboard");
  };

  const renderContent = () => {
    switch (bridgeState.kind) {
      case "offline":
      case "timed-out":
        return (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <WifiOff className="h-8 w-8 text-destructive" />
              </div>
              <DialogTitle className="text-center text-xl">
                Windows Bridge Not Detected
              </DialogTitle>
              <DialogDescription className="text-center">
                The Windows Bridge application is required to securely install software on your computer.
                If it&apos;s already installed, please ensure it&apos;s running in your system tray.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
              <Button
                className="w-full h-11 text-base"
                onClick={() => {
                  window.location.href = "/api/download/bridge";
                }}
              >
                <Download className="h-5 w-5 mr-2" />
                Download Bridge
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </>
        );

      case "permission-blocked":
        return (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <DialogTitle className="text-center text-xl">
                Browser Permission Required
              </DialogTitle>
              <DialogDescription className="text-center">
                Your browser is blocking access to the local network. Please grant permission for this site to access local devices.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
              <Button variant="outline" className="w-full" onClick={copyDiagnostics}>
                <Copy className="h-4 w-4 mr-2" /> Copy Diagnostics
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        );

      case "version-mismatch":
        return (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
              <DialogTitle className="text-center text-xl">
                Update Required
              </DialogTitle>
              <DialogDescription className="text-center">
                Your Windows Bridge version is outdated. Please download the latest version to continue.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
              <Button
                className="w-full h-11 text-base"
                onClick={() => window.location.href = "/api/download/bridge"}
              >
                <Download className="h-5 w-5 mr-2" />
                Download Latest Version
              </Button>
            </DialogFooter>
          </>
        );



      case "winget-unavailable":
        return (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <DialogTitle className="text-center text-xl">
                Winget Unavailable
              </DialogTitle>
              <DialogDescription className="text-center">
                The Windows Package Manager (winget) is not installed on this system. Please install &quot;App Installer&quot; from the Microsoft Store.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
              <Button
                className="w-full h-11 text-base"
                onClick={() => window.open("ms-windows-store://pdp/?productid=9nblggh4nns1", "_blank")}
              >
                Open Microsoft Store
              </Button>
            </DialogFooter>
          </>
        );

      case "connected":
        return (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <DialogTitle className="text-center text-xl">
                Connected securely
              </DialogTitle>
              <DialogDescription className="text-center">
                The Windows Bridge is running and securely paired.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" className="w-full" onClick={copyDiagnostics}>
                <Copy className="h-4 w-4 mr-2" /> Copy Diagnostics
              </Button>
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        );

      default:
        return (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Checking Bridge status...</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-3xl border-border/50">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
