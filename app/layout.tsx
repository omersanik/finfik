import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import LayoutWrapper from "@/components/LayoutWrapper";
import PageLoading from "@/components/PageLoading";
import Providers from "./providers";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import BetaWelcomeHandler from "@/components/BetaWelcomeHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finfik",
  description: "Finfik makes finance fun and visual.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
        >
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <PageLoading />
              <LayoutWrapper>{children}</LayoutWrapper>
              <BetaWelcomeHandler />
              <Toaster 
                position="bottom-center"
                richColors
                closeButton
                duration={3000}
              />
            </ThemeProvider>
            <PerformanceMonitor />
            
            {/* Server-rendered footer with privacy policy link for Google crawler */}
            <footer className="py-4 px-8 border-t border-border bg-background">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left mb-2 md:mb-0">
                  <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Finfik. All rights reserved.
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <a 
                    href="/privacy-policy" 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </a>
                </div>
              </div>
            </footer>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
