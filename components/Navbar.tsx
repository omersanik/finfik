"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

import {
  House,
  Landmark,
  LogOut,
  Moon,
  Sun,
  User,
  Wallet,
  Crown,
} from "lucide-react";

import finfiklogo from "@/logo/finfiklogo.svg";
import finfikwhitelogo from "@/logo/finfikwhitelogo.svg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import NavbarSkeleton from "./skeletons/NavbarSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useClerk, useUser, useAuth } from "@clerk/nextjs";
import { Flame } from "lucide-react";

const Navbar = () => {
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [streak, setStreak] = useState({
    current_streak: 0,
    longest_streak: 0,
  });
  const [streakLoading, setStreakLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) return;

      try {
        setPremiumLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
        console.log("Base URL:", baseUrl); // Debug log

        const token = await getToken();
        console.log("Token received:", token ? "✓" : "✗"); // Debug log

        if (!token) {
          console.log("No token available, skipping premium check");
          setIsPremiumUser(false);
          return;
        }

        const apiUrl = `${baseUrl}/api/users/premium-users`;
        console.log("API URL:", apiUrl); // Debug log

        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        console.log("Response status:", res.status); // Debug log
        console.log("Response ok:", res.ok); // Debug log

        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error:", errorText);
          throw new Error(
            `Failed to fetch user premium status: ${res.status} ${errorText}`
          );
        }

        const data = await res.json();
        console.log("Premium data:", data); // Debug log
        setIsPremiumUser(data.is_premium);
      } catch (error) {
        console.error("Error fetching the premium status", error);
        // For now, let's not show premium badge on error
        setIsPremiumUser(false);
      } finally {
        setPremiumLoading(false);
      }
    };

    if (mounted && user) {
      checkPremiumStatus();
    }
  }, [mounted, user, getToken]);

  // Fetch streak data
  useEffect(() => {
    const fetchStreak = async () => {
      if (!user) return;

      try {
        setStreakLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
        const token = await getToken();

        if (!token) {
          console.log("No token available, skipping streak check");
          return;
        }

        const res = await fetch(`${baseUrl}/api/streak`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (res.ok) {
          const streakData = await res.json();
          setStreak({
            current_streak: streakData.current_streak,
            longest_streak: streakData.longest_streak,
          });
        } else {
          console.error("Streak API error:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Error fetching streak:", error);
      } finally {
        setStreakLoading(false);
      }
    };

    if (mounted && user) {
      fetchStreak();
    }
  }, [mounted, user, getToken]);

  // Show skeleton while mounting or if user data is still loading
  if (!mounted || !user || streakLoading || premiumLoading) {
    return <NavbarSkeleton />;
  }

  return (
    <header className="w-full border-b shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/">
          {mounted ? (
            <Image
              src={theme === "light" ? finfiklogo : finfikwhitelogo}
              alt="Finfik Logo"
              width={100}
              height={50}
            />
          ) : (
            <Skeleton className="w-[140px] h-[70px] rounded-lg" />
          )}
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden sm:flex gap-8 items-center">
          {mounted ? (
            <>
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
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-14 h-5 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-20 h-5 rounded" />
              </div>
            </>
          )}
        </nav>

        {/* Right: Premium Button/Badge, Theme Toggle, Avatar */}
        <div className="flex items-center justify-center gap-4">
          {/* Streak Counter */}
          {streakLoading ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full text-sm font-semibold shadow-md">
              <Skeleton variant="circular" className="w-4 h-4" />
              <Skeleton variant="text" className="w-6 h-4" />
            </div>
          ) : (
            streak.current_streak >= 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold shadow-md">
                <Flame className="size-4 animate-pulse" />
                <span>{streak.current_streak}</span>
              </div>
            )
          )}

          {/* Premium Status */}
          {premiumLoading ? (
            <div className="hidden sm:flex">
              <Skeleton className="w-28 h-8 rounded-full" />
            </div>
          ) : (
            isPremiumUser ? (
              <Badge
                variant="default"
                className="hidden sm:flex items-center gap-1 px-4 py-2 text-sm font-medium"
              >
                <Crown className="size-4" />
                Premium
              </Badge>
            ) : (
              <Button className="rounded-3xl px-6 text-base hidden sm:block hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg">
                <Link href="/subscription">Go Premium</Link>
              </Button>
            )
          )}

          {/* Theme Toggle */}
          {mounted ? (
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
          ) : (
            <Skeleton className="w-9 h-9 rounded-lg" />
          )}

          {/* Avatar */}
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="hidden sm:block">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>FF</AvatarFallback>
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
                <Link href="/subscription">
                  {" "}
                  <DropdownMenuItem className="flex items-start gap-1">
                    <Wallet className="size-4" />
                    Billing
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="flex items-start gap-1 text-red-700"
                  onClick={() => signOut()}
                >
                  <LogOut className="size-4 text-red-700" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Skeleton className="w-9 h-9 rounded-full" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
