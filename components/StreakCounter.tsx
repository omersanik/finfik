"use client";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  lastCompletedDate?: string | null;
  week?: boolean[]; // Last 7 days (oldest to newest)
}

// Generate dynamic day labels for the last 7 days
const getDayLabels = () => {
  const labels = [];
  const names = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const label = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    const name = date.toLocaleDateString('en-US', { weekday: 'long' });
    labels.push(label);
    names.push(name);
  }
  
  return { labels, names };
};

export default function StreakCounter({ currentStreak, longestStreak, lastCompletedDate, week }: StreakCounterProps) {
  // Get dynamic day labels
  const { labels: dayLabels, names: dayNames } = getDayLabels();
  

  
  // Animation: bounce on streak change
  const [animate, setAnimate] = useState(false);
  const prevStreak = useRef(currentStreak);

  useEffect(() => {
    if (prevStreak.current !== currentStreak) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 700);
      prevStreak.current = currentStreak;
    }
  }, [currentStreak]);

  // Confetti burst (simple emoji for now)
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (animate) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  }, [animate]);

  return (
    <TooltipProvider>
      <Card className="w-full max-w-md mx-auto shadow-lg border-orange-200 mt-0">
        <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-2">
          <div className="flex items-center gap-3">
            <span className="relative flex items-center justify-center">
              <span className="absolute animate-ping-slow inline-flex h-12 w-12 rounded-full bg-orange-300 opacity-60" />
              <Flame className="w-12 h-12 text-orange-500 drop-shadow-lg animate-flame-glow" />
            </span>
            <span className={`font-extrabold text-4xl text-orange-700 drop-shadow-md ${animate ? 'animate-bounce' : ''}`}>{currentStreak}</span>
          </div>
          <div className="text-lg font-bold text-orange-700">Streak</div>
          <div className="text-sm text-muted-foreground">Complete a lesson every day to build your streak</div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          {/* Week row */}
          {week && (
            <div className="flex gap-2 mb-2">
              {week.map((done, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={done ? "default" : "outline"}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${done ? 'bg-orange-400 text-white border-none' : 'bg-background text-gray-400 border-gray-300'}`}
                    >
                      {done ? (
                        <Flame className="w-5 h-5 text-white animate-flame-glow" />
                      ) : ""}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {dayNames[i]}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
          {/* Day labels */}
          {week && (
            <div className="flex gap-2">
              {dayLabels.map((label, i) => (
                <span key={i} className="text-xs text-muted-foreground w-8 text-center">{label}</span>
              ))}
            </div>
          )}
          {/* Confetti burst */}
          {showConfetti && (
            <div className="absolute left-1/2 top-0 -translate-x-1/2 text-2xl pointer-events-none select-none animate-confetti">🎉✨🔥</div>
          )}
        </CardContent>
      </Card>
      <style jsx global>{`
        @keyframes flame-glow {
          0%, 100% { filter: drop-shadow(0 0 8px #fdba74); }
          50% { filter: drop-shadow(0 0 24px #fb923c); }
        }
        .animate-flame-glow { animation: flame-glow 1.2s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-18px) scale(1.15); }
          60% { transform: translateY(2px) scale(0.98); }
        }
        .animate-bounce { animation: bounce 0.7s; }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.6; }
          80%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes confetti {
          0% { opacity: 0; transform: scale(0.7) translateY(0); }
          10% { opacity: 1; transform: scale(1.1) translateY(-10px); }
          80% { opacity: 1; transform: scale(1) translateY(-18px); }
          100% { opacity: 0; transform: scale(0.7) translateY(-30px); }
        }
        .animate-confetti { animation: confetti 1.2s; }
      `}</style>
    </TooltipProvider>
  );
} 