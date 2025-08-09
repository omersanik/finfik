"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface StreakAnimationProps {
  isVisible: boolean;
  streakCount: number;
  onAnimationComplete?: () => void;
}

const StreakAnimation = ({ isVisible, streakCount, onAnimationComplete }: StreakAnimationProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
        onAnimationComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Main streak card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="relative bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 p-8 rounded-2xl shadow-2xl text-white text-center max-w-sm mx-4"
          >
            {/* Animated flame */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mb-4"
            >
              <Flame className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
            </motion.div>

            {/* Streak text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-2"
            >
              🔥 Streak Earned! 🔥
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg mb-4"
            >
              {streakCount} Day{streakCount > 1 ? 's' : ''} in a row!
            </motion.p>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 200],
                  y: [0, (Math.random() - 0.5) * 200],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                }}
              >
                <Star className="w-4 h-4 text-yellow-300" />
              </motion.div>
            ))}

            {/* Zap effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4"
            >
              <Zap className="w-8 h-8 mx-auto text-yellow-300 animate-pulse" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakAnimation;
