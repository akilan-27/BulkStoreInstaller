import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "bulkstoreinstaller — Install Windows Apps in One Click",
  description:
    "Browse hundreds of Windows applications and install them all with a single click. Powered by Microsoft Winget. The fastest way to set up your PC.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  keywords: [
    "windows app installer",
    "bulk installer",
    "winget",
    "software installer",
    "app store",
    "windows setup",
  ],
  authors: [{ name: "Akilan R" }],
  openGraph: {
    title: "bulkstoreinstaller — Install Windows Apps in One Click",
    description:
      "Install hundreds of Windows applications with a single click.",
    type: "website",
    locale: "en_US",
    siteName: "bulkstoreinstaller",
    images: [{ url: "/logo.png", width: 800, height: 800, alt: "bulkstoreinstaller" }],
  },
  twitter: {
    card: "summary",
    title: "bulkstoreinstaller",
    description:
      "Install hundreds of Windows applications with a single click.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('app-ui-theme');
                const root = document.documentElement;
                if (theme === 'dark') {
                  root.classList.add('dark');
                } else if (theme === 'light') {
                  root.classList.add('light');
                } else {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  root.classList.add(prefersDark ? 'dark' : 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary/30`}
      >
        <ThemeProvider defaultTheme="system">
          <SmoothScrollProvider>
            <QueryProvider>
              <CartProvider>
                <TooltipProvider>
                  {children}
                  <Toaster />
                </TooltipProvider>
              </CartProvider>
            </QueryProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
