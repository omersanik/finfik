"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BetaBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function BetaBadge({ className = "", size = "md" }: BetaBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white border-0 font-medium shadow-sm hover:shadow-md transition-all duration-200",
        sizeClasses[size],
        className
      )}
    >
      <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
      Beta User
    </Badge>
  );
}
