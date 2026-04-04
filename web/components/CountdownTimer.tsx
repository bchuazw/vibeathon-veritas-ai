"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Crown } from "lucide-react";

interface CountdownTimerProps {
  targetTime: number | null;
  onComplete?: () => void;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "00:00";
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function CountdownTimer({ targetTime, onComplete }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const calculateTimeRemaining = useCallback(() => {
    if (!targetTime) return 0;
    const remaining = targetTime - Date.now();
    return Math.max(0, remaining);
  }, [targetTime]);

  useEffect(() => {
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeRemaining, onComplete]);

  if (!targetTime || timeRemaining === 0) return null;

  return (
    <span className="font-mono font-semibold">
      {formatTimeRemaining(timeRemaining)}
    </span>
  );
}

interface RateLimitDisplayProps {
  remainingRequests: number;
  resetTime: number | null;
  isLimited: boolean;
  onReset?: () => void;
}

export function RateLimitDisplay({ 
  remainingRequests, 
  resetTime, 
  isLimited,
  onReset 
}: RateLimitDisplayProps) {
  const maxRequests = 3;
  const usedRequests = maxRequests - remainingRequests;

  if (isLimited) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-xl p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-red-900">Rate limit reached</h4>
              <p className="text-sm text-red-700 mt-1">
                You've used all {maxRequests} articles for this hour.
              </p>
              <p className="text-sm text-red-600 mt-2">
                Resets in <CountdownTimer targetTime={resetTime} onComplete={onReset} />
              </p>
            </div>
          </div>
          
          {/* Upgrade CTA */}
          <div className="flex-shrink-0">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show indicator when less than max requests
  if (remainingRequests < maxRequests) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {remainingRequests} of {maxRequests} articles remaining this hour
            </span>
          </div>
          {resetTime && (
            <div className="text-sm text-amber-600 border-l-0 sm:border-l border-amber-300 sm:pl-4">
              Resets in <CountdownTimer targetTime={resetTime} onComplete={onReset} />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Full quota - show subtle indicator
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {maxRequests} of {maxRequests} articles available
      </div>
    </motion.div>
  );
}
