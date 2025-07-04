"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { SignedIn } from "@clerk/nextjs";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    /^\/courses\/[^\/]+\/[^\/]+$/.test(pathname);

  return (
    <>
      {!hideNavbar && (
        <SignedIn>
          <Navbar />
        </SignedIn>
      )}
      {children}
    </>
  );
}
