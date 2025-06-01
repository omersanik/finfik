"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

import { House, Landmark, LogOut, Moon, Sun, User, Wallet } from "lucide-react";

import finfiklogo from "@/logo/finfiklogo.svg";
import finfikwhitelogo from "@/logo/finfikwhitelogo.svg";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";

const Navbar = () => {
  const { signOut } = useClerk();

  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <header className="w-full border-b shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/">
          {mounted && (
            <Image
              src={theme === "light" ? finfiklogo : finfikwhitelogo}
              alt="Finfik Logo"
              width={100}
              height={50}
            />
          )}
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden sm:flex gap-8 items-center">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 text-lg transition hover:opacity-80",
              pathname === "/" && "underline underline-offset-4"
            )}
          >
            <House className="size-5" />
            Home
          </Link>

          <Link
            href="/courses"
            className={cn(
              "flex items-center gap-2 text-lg transition hover:opacity-80",
              pathname === "/courses" && "underline underline-offset-4"
            )}
          >
            <Landmark className="size-5" />
            Courses
          </Link>
        </nav>

        {/* Right: Premium Button, Theme Toggle, Avatar */}
        <div className="flex items-center justify-center gap-4">
          <Button className="rounded-3xl px-6 text-base hidden sm:block">
            Go Premium
          </Button>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Sun className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Avatar */}

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="hidden sm:block">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href="/profile">
                <DropdownMenuLabel className="flex items-start gap-1">
                  <User className="size-4" />
                  Profile
                </DropdownMenuLabel>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start gap-1">
                <Wallet className="size-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-start gap-1 text-red-700"
                onClick={() => signOut()}
              >
                <LogOut className="size-4 text-red-700" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
