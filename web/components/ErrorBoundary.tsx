"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Error caught by boundary:", error);
      setErrorState({
        hasError: true,
        error: error.error,
        errorInfo: error.message,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event);
      setErrorState({
        hasError: true,
        error: new Error(String(event.reason)),
        errorInfo: String(event.reason),
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  const handleReset = () => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  if (errorState.hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[400px] flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
            Something went wrong
          </h2>
          
          <p className="text-stone-600 mb-6">
            We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </p>

          {process.env.NODE_ENV === "development" && errorState.errorInfo && (
            <div className="mb-6 p-4 bg-stone-50 rounded-lg text-left overflow-auto max-h-40">
              <p className="text-xs font-mono text-stone-500">
                {errorState.errorInfo}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleReset}
              className="bg-stone-900 hover:bg-stone-800"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}

// Error display component for inline errors
interface ErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onDismiss, onRetry }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-6"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline underline-offset-2"
              >
                Try again
              </button>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
