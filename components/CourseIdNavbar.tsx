"use client";
import { X } from "lucide-react";
import React, { useState } from "react";
import ProgressBar from "./ProgressBar";

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

  return (
    <>
      <div className="w-full fixed top-0 left-0 bg-[#fefaf1] shadow-md z-50 h-20 flex items-center px-4">
        {/* X icon on the left */}
        <div className="absolute left-4">
          <button
            onClick={handleExitClick}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress bar centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-96">
          <ProgressBar
            current={currentProgress}
            total={totalProgress}
            className=""
          />
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Exit Course?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit? Your progress will be saved, but
              you'll lose your current position in the lesson.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelExit}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Exit Course
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseIdNavbar;
