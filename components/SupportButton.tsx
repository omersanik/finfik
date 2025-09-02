"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import SupportModal from "./SupportModal";

interface SupportButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function SupportButton({
  variant = "outline",
  size = "sm",
  className = "",
}: SupportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant={variant}
        size={size}
        className={`gap-2 ${className}`}
      >
        <Heart className="w-4 h-4 text-red-500" />
        Support
      </Button>

      <SupportModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
