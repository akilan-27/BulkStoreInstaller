"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { infoContent, infoTitles } from "@/constants/infoContent";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string | null;
}

export function InfoDialog({ open, onOpenChange, slug }: InfoDialogProps) {
  const content = slug && infoContent[slug] ? infoContent[slug] : null;
  const title = slug && infoTitles[slug] ? infoTitles[slug] : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-3xl border-border/80 shadow-2xl overflow-hidden p-0 max-h-[85vh] flex flex-col gap-0">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 md:px-8 md:py-6 border-b border-border/40 bg-muted/20 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {title}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          {/* Content */}
          <div className="p-6 md:p-8 overflow-y-auto">
            {content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
