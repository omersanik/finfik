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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ClerkProvider>
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
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
