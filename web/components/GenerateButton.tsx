"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThrottle } from "@/lib/rate-limit";

interface GenerateButtonProps {
  onGenerate?: () => Promise<void>;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function GenerateButton({
  onGenerate,
  variant = "default",
  size = "default",
  className,
  children = "Generate Article",
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const generationSteps = [
    "Analyzing sources...",
    "Researching facts...",
    "Crafting narrative...",
    "Optimizing content...",
  ];

  // Minimum time between clicks (3 seconds)
  const MIN_CLICK_INTERVAL = 3000;

  const handleClick = useCallback(async () => {
    // Prevent rapid clicks
    const now = Date.now();
    if (now - lastClickTime < MIN_CLICK_INTERVAL) {
      console.log("Click throttled - too soon");
      return;
    }
    setLastClickTime(now);

    if (!onGenerate || isGenerating) return;
    
    setIsGenerating(true);
    setGenerationStep(0);
    
    // Cycle through generation steps
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev + 1) % generationSteps.length);
    }, 2000);
    
    try {
      await onGenerate();
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  }, [onGenerate, isGenerating, lastClickTime, generationSteps.length]);

  // Apply throttling at hook level as additional safeguard
  const throttledHandleClick = useThrottle(handleClick, 2000);

  return (
    <Button
      variant={variant}
      size={size}
      className={`relative overflow-hidden group ${className}`}
      onClick={throttledHandleClick}
      disabled={isGenerating}
      aria-busy={isGenerating}
      aria-label={isGenerating ? "Generating article, please wait" : children?.toString()}
    >
      {/* Background animation for generating state */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600"
            style={{
              backgroundSize: "200% 100%",
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ["0% 0%", "200% 0%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content */}
      <span className="relative z-10 flex items-center">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <AnimatePresence mode="wait">
              <motion.span
                key={generationStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {generationSteps[generationStep]}
              </motion.span>
            </AnimatePresence>
          </>
        ) : (
          <>
            <motion.span
              initial={false}
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.2 }}
              className="mr-2"
            >
              <Sparkles className="h-4 w-4" />
            </motion.span>
            {children}
          </>
        )}
      </span>
    </Button>
  );
}
