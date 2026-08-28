"use client";

import { Download, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface CompanionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanionDialog({ open, onOpenChange }: CompanionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-3xl border-border/50">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-center text-xl">
            Windows Companion Required
          </DialogTitle>
          <DialogDescription className="text-center">
            The Windows Companion app is needed to install software on your
            computer. It runs locally and communicates securely with this
            website.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl text-sm">
            <span className="text-lg">🔒</span>
            <div>
              <p className="font-medium">Secure & Local</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                All installations run locally via Microsoft Winget. No data
                leaves your computer.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl text-sm">
            <span className="text-lg">⚡</span>
            <div>
              <p className="font-medium">Lightweight</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Less than 10MB. Runs silently in the background.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full h-11 text-base"
            render={<a href="https://github.com/akilan-27/BulkStoreInstaller/releases/tag/v1.0.0" target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
          >
            <Download className="h-5 w-5 mr-2" />
            Download Companion
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            I&apos;ll do this later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
