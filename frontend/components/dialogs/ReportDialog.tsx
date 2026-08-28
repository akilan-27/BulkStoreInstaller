"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Bug,
  PackageSearch,
  Lightbulb,
  ShieldAlert,
  MessageSquare,
  Send,
  CheckCircle2,
  } from "lucide-react";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_TYPES = [
  {
    id: "missing_app",
    label: "Missing App",
    description: "App not in the catalog",
    icon: PackageSearch,
    color: "text-violet-500",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    id: "bug",
    label: "Bug Report",
    description: "Something isn't working",
    icon: Bug,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    id: "suggestion",
    label: "Suggestion",
    description: "Feature or improvement idea",
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "security",
    label: "Security Issue",
    description: "Vulnerability or concern",
    icon: ShieldAlert,
    color: "text-rose-600",
    bg: "bg-rose-600/10 border-rose-600/20",
  },
  {
    id: "other",
    label: "Other",
    description: "General feedback",
    icon: MessageSquare,
    color: "text-sky-500",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
];

const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

export function ReportDialog({ open, onOpenChange }: ReportDialogProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [reportType, setReportType] = useState<string>("bug");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedType = REPORT_TYPES.find((t) => t.id === reportType)!;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!contact.trim()) e.contact = "Email or phone is required";
    if (!description.trim()) e.description = "Please describe the issue";
    if (description.trim().length < 20) e.description = "Please provide more detail (at least 20 characters)";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType,
          name,
          contact,
          subject,
          description,
          severity: (reportType === "bug" || reportType === "security") ? severity : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send report");
      }

      if (data.simulated) {
        toast.info("Report simulated", {
          description: "RESEND_API_KEY is not configured yet, so the email was simulated.",
        });
      }
      
      setStep("success");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send report. Please try again.";
      toast.error("Error", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setStep("form");
      setName("");
      setContact("");
      setSubject("");
      setDescription("");
      setSeverity("Medium");
      setReportType("bug");
      setErrors({});
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-3xl border-border/80 shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  Report / Feedback
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Help us improve — report missing apps, bugs, or share ideas.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 space-y-5 overflow-y-auto max-h-[420px] pr-1">
                {/* Report Type Pills */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Report Type
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {REPORT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const active = reportType === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setReportType(type.id)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border text-center transition-all duration-150",
                            active
                              ? `${type.bg} border-current ${type.color} shadow-sm`
                              : "border-border/50 text-muted-foreground hover:border-border hover:bg-muted/50"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", active ? type.color : "")} />
                          <span className="text-[10px] font-medium leading-tight">
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name + Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Your Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="report-name"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      className={cn(
                        "h-9 text-sm rounded-[var(--radius-input)] bg-white dark:bg-zinc-900 shadow-sm border border-border/40 hover:border-border/80 placeholder:text-muted-foreground/60",
                        "focus-visible:!ring-0 focus-visible:!outline-none focus:!ring-0 focus:!outline-none focus-visible:border-border/80 focus-visible:shadow-md transition-all duration-200",
                        errors.name && "border-destructive focus-visible:border-destructive"
                      )}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Email / Phone <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="report-contact"
                      placeholder="email@example.com"
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        if (errors.contact) setErrors((prev) => ({ ...prev, contact: "" }));
                      }}
                      className={cn(
                        "h-9 text-sm rounded-[var(--radius-input)] bg-white dark:bg-zinc-900 shadow-sm border border-border/40 hover:border-border/80 placeholder:text-muted-foreground/60",
                        "focus-visible:!ring-0 focus-visible:!outline-none focus:!ring-0 focus:!outline-none focus-visible:border-border/80 focus-visible:shadow-md transition-all duration-200",
                        errors.contact && "border-destructive focus-visible:border-destructive"
                      )}
                    />
                    {errors.contact && (
                      <p className="text-xs text-destructive mt-1">{errors.contact}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Subject{" "}
                    <span className="text-muted-foreground/50 font-normal">(optional)</span>
                  </label>
                  <Input
                    id="report-subject"
                    placeholder={
                      reportType === "missing_app"
                        ? "e.g. Notepad++, 7-Zip, VLC..."
                        : reportType === "bug"
                        ? "e.g. Install button not working"
                        : "Brief summary"
                    }
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={cn(
                      "h-9 text-sm rounded-[var(--radius-input)] bg-white dark:bg-zinc-900 shadow-sm border border-border/40 hover:border-border/80 placeholder:text-muted-foreground/60",
                      "focus-visible:!ring-0 focus-visible:!outline-none focus:!ring-0 focus:!outline-none focus-visible:border-border/80 focus-visible:shadow-md transition-all duration-200"
                    )}
                  />
                </div>

                {/* Severity (always rendered, hidden when not applicable) */}
                <div className={cn(
                  "transition-all duration-200 overflow-hidden",
                  (reportType === "bug" || reportType === "security")
                    ? "opacity-100 max-h-20"
                    : "opacity-0 max-h-0 !mt-0 pointer-events-none"
                )}>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Severity
                  </label>
                  <div className="flex gap-2">
                    {SEVERITY_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeverity(s)}
                        className={cn(
                          "flex-1 text-xs py-1.5 rounded-lg border font-medium transition-all duration-150",
                          severity === s
                            ? s === "Critical"
                              ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400"
                              : s === "High"
                              ? "bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-400"
                              : s === "Medium"
                              ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400"
                              : "bg-primary/10 border-primary/30 text-primary"
                            : "border-border/50 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="report-description"
                    rows={4}
                    placeholder={
                      reportType === "missing_app"
                        ? "Provide the app name, its publisher, and a link to the official site if you have one. We'll add it to the catalog."
                        : reportType === "bug"
                        ? "Describe what happened, what you expected, and steps to reproduce the issue."
                        : reportType === "suggestion"
                        ? "Describe your idea and how it would improve the experience."
                        : reportType === "security"
                        ? "Describe the vulnerability. Please do not include sensitive data."
                        : "Share your feedback, question, or anything else on your mind."
                    }
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                    }}
                    className={cn(
                      "w-full resize-none rounded-[var(--radius-input)] bg-white dark:bg-zinc-900 shadow-sm border border-border/40 hover:border-border/80 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60",
                      "focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:border-border/80 focus:shadow-md transition-all duration-200",
                      errors.description
                        ? "border-destructive focus:border-destructive"
                        : ""
                    )}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description ? (
                      <p className="text-xs text-destructive">{errors.description}</p>
                    ) : (
                      <span />
                    )}
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        description.length > 800
                          ? "text-destructive"
                          : "text-muted-foreground/50"
                      )}
                    >
                      {description.length}/1000
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 gap-2">
                <Button variant="outline" onClick={handleClose} className="rounded-[var(--radius-button)]">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-[var(--radius-button)] gap-2 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 25 }}
              className="py-6 flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Report Received!</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Thanks{name ? `, ${name.split(" ")[0]}` : ""}! We&apos;ve received your{" "}
                  <span className="font-medium text-foreground">{selectedType.label.toLowerCase()}</span>{" "}
                  and will look into it shortly.
                </p>
              </div>
              <Button onClick={handleClose} className="rounded-[var(--radius-button)] mt-2">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
