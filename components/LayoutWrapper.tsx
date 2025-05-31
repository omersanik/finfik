"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
