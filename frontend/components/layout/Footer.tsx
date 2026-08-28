"use client";

import { useState } from "react";
import { ExternalLink, Download, Heart, Flag } from "lucide-react";
import { ReportDialog } from "@/components/dialogs/ReportDialog";
import { InfoDialog } from "@/components/dialogs/InfoDialog";
import { CompanionDialog } from "@/components/dialogs/CompanionDialog";

export function Footer() {
  const [reportOpen, setReportOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoSlug, setInfoSlug] = useState<string | null>(null);
  const [companionOpen, setCompanionOpen] = useState(false);

  const openInfo = (slug: string) => {
    setInfoSlug(slug);
    setInfoOpen(true);
  };

  return (
    <>
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-md mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 text-foreground font-bold text-lg mb-3">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/80 bg-background flex items-center justify-center flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
<img
                    src="/logo.png"
                    alt="BulkStoreInstaller"
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <span>BulkStoreInstaller</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                The fastest way to set up your Windows PC. Browse thousands of
                applications, select what you need, and install everything with a
                single click via Microsoft Winget.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground flex flex-col items-start">
                <li>
                  <button onClick={() => { if(window.location.pathname === '/') { window.scrollTo({ top: 0, behavior: 'smooth' }); } else { window.location.href = '/'; } }} className="hover:text-foreground transition-colors">
                    Browse Apps
                  </button>
                </li>
                <li>
                  <button onClick={() => openInfo("how-it-works")} className="hover:text-foreground transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => openInfo("safety")} className="hover:text-foreground transition-colors">
                    Safety
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCompanionOpen(true)}
                    className="hover:text-foreground transition-colors text-left"
                  >
                    Download Companion
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground flex flex-col items-start">
                <li>
                  <button onClick={() => openInfo("about")} className="hover:text-foreground transition-colors">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => openInfo("terms")} className="hover:text-foreground transition-colors">
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button onClick={() => openInfo("privacy")} className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openInfo("disclaimer")} className="hover:text-foreground transition-colors">
                    Disclaimer
                  </button>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Companion CTA */}
          <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm">
                Don&apos;t have the Windows Companion?
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download our lightweight desktop app to enable one-click
                installations.
              </p>
            </div>
            <button
              id="footer-download-btn"
              onClick={() => setCompanionOpen(true)}
              className="
                flex items-center justify-center gap-2 flex-shrink-0
                w-full sm:w-[180px]
                px-4 py-2 text-sm font-medium rounded-[var(--radius-button)]
                bg-primary hover:bg-primary-hover text-primary-foreground
                shadow-md hover:shadow-primary/40
                transition-all duration-200 ease-out
                hover:scale-105 active:scale-95
              "
            >
              <Download className="h-4 w-4" />
              Download Now
            </button>
          </div>

          {/* Report / Feedback CTA */}
          <div className="mt-3 p-4 bg-muted/40 border border-border/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm">
                Found a bug or a missing app?
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send us a report — we review every submission and update the catalog regularly.
              </p>
            </div>
            <button
              id="footer-report-btn"
              onClick={() => setReportOpen(true)}
              className="
                flex items-center justify-center gap-2 flex-shrink-0
                w-full sm:w-[180px]
                px-4 py-2 text-sm font-medium rounded-[var(--radius-button)]
                bg-primary hover:bg-primary-hover text-primary-foreground
                shadow-md hover:shadow-primary/40
                transition-all duration-200 ease-out
                hover:scale-105 active:scale-95
              "
            >
              <Flag className="h-4 w-4" />
              Report / Feedback
            </button>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© 2026 BulkStoreInstaller. Built by Akilan R.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> using Next.js &amp; Winget
            </p>
          </div>
        </div>
      </footer>

      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} />
      <InfoDialog open={infoOpen} onOpenChange={setInfoOpen} slug={infoSlug} />
      <CompanionDialog open={companionOpen} onOpenChange={setCompanionOpen} />
    </>
  );
}
