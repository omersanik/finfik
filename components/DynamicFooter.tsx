"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function DynamicFooter() {
  const pathname = usePathname();
  const { userId } = useAuth();

  // Show privacy policy link on landing page (when not authenticated)
  // and on specific public pages, but hide it on the homepage dashboard
  const showPrivacyPolicy =
    !userId || pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <footer className="py-4 px-8 border-t border-border bg-background">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-2 md:mb-0">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Finfik. All rights reserved.
          </p>
        </div>
        {showPrivacyPolicy && (
          <div className="text-center md:text-right">
            <a
              href="/privacy-policy"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
