"use client";
import { X } from "lucide-react";
import React, { useState } from "react";
import { Progress } from "./ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface CourseIdNavbarProps {
  hrefX: string;
  currentProgress: number;
  totalProgress: number;
}

const CourseIdNavbar = ({
  hrefX,
  currentProgress,
  totalProgress,
}: CourseIdNavbarProps) => {
  const [showExitModal, setShowExitModal] = useState(false);

  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    window.location.href = hrefX;
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const progressValue =
    totalProgress > 0 ? (currentProgress / totalProgress) * 100 : 0;

  return (
    <>
      <div className="w-full fixed top-0 left-0 bg-background border-b border-border shadow-sm z-50 h-20 flex items-center px-4">
        {/* X icon on the left */}
        <div className="absolute left-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitClick}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Progress bar centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-96">
          <Progress value={progressValue} />
          <div className="text-xs text-center mt-1 text-muted-foreground">
            {currentProgress} / {totalProgress} completed
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Course?</DialogTitle>
            <DialogDescription>
              Are you sure you want to exit? Your progress will be saved, but
              you&apos;ll lose your current position in the lesson.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelExit}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmExit}>
              Exit Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseIdNavbar;
