"use client";

import { useState, useCallback, useRef } from "react";

interface RateLimitState {
  requests: number;
  resetTime: number;
  isLimited: boolean;
}

const RATE_LIMIT_KEY = "veritas_rate_limit";
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

interface RateLimitResult {
  canProceed: boolean;
  remainingRequests: number;
  resetTime: Date | null;
  message: string | null;
}

export function useRateLimit(): {
  checkRateLimit: () => RateLimitResult;
  recordRequest: () => void;
  resetLimit: () => void;
} {
  const checkRateLimit = useCallback((): RateLimitResult => {
    if (typeof window === "undefined") {
      return { canProceed: true, remainingRequests: MAX_REQUESTS, resetTime: null, message: null };
    }

    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      const now = Date.now();

      if (!stored) {
        return { canProceed: true, remainingRequests: MAX_REQUESTS, resetTime: null, message: null };
      }

      const data: RateLimitState = JSON.parse(stored);

      // Reset if window has passed
      if (now > data.resetTime) {
        localStorage.removeItem(RATE_LIMIT_KEY);
        return { canProceed: true, remainingRequests: MAX_REQUESTS, resetTime: null, message: null };
      }

      const remainingRequests = Math.max(0, MAX_REQUESTS - data.requests);
      const isLimited = data.requests >= MAX_REQUESTS;

      return {
        canProceed: !isLimited,
        remainingRequests,
        resetTime: new Date(data.resetTime),
        message: isLimited
          ? `Rate limit reached. Please try again after ${new Date(data.resetTime).toLocaleTimeString()}.`
          : null,
      };
    } catch (error) {
      console.error("Error checking rate limit:", error);
      return { canProceed: true, remainingRequests: MAX_REQUESTS, resetTime: null, message: null };
    }
  }, []);

  const recordRequest = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const now = Date.now();
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      
      let data: RateLimitState;
      
      if (!stored) {
        data = {
          requests: 1,
          resetTime: now + WINDOW_MS,
          isLimited: false,
        };
      } else {
        data = JSON.parse(stored);
        
        // Reset if window has passed
        if (now > data.resetTime) {
          data = {
            requests: 1,
            resetTime: now + WINDOW_MS,
            isLimited: false,
          };
        } else {
          data.requests += 1;
          data.isLimited = data.requests >= MAX_REQUESTS;
        }
      }

      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error recording request:", error);
    }
  }, []);

  const resetLimit = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(RATE_LIMIT_KEY);
  }, []);

  return { checkRateLimit, recordRequest, resetLimit };
}

// Debounce hook for preventing rapid clicks
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

// Throttle hook for limiting execution rate
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  ) as T;
}
