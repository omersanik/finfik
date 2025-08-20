"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import NavbarSkeleton from "./skeletons/NavbarSkeleton";
import { SignedIn, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const [showNavbar, setShowNavbar] = useState(false);
  
  const hideNavbar =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    /^\/courses\/[^\/]+\/[^\/]+$/.test(pathname);

  // Show navbar skeleton immediately, then real navbar when auth is loaded
  useEffect(() => {
    if (isLoaded) {
      setShowNavbar(true);
    }
  }, [isLoaded]);

  return (
    <>
      {!hideNavbar && (
        <>
          {!showNavbar ? (
            <NavbarSkeleton />
          ) : (
            <SignedIn>
              <Navbar />
            </SignedIn>
          )}
        </>
      )}
      {children}
    </>
  );
}
