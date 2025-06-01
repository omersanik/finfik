"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import finfiklogo from "@/logo/finfiklogo.svg";
import finfikwhitelogo from "@/logo/finfikwhitelogo.svg";

export default function ThemeLogo() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <Image
      src={currentTheme === "light" ? finfiklogo : finfikwhitelogo}
      alt="Finfik Logo"
      width={200}
      height={100}
      className="mx-auto"
    />
  );
}
