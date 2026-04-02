"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const generationSteps = [
    "Analyzing sources...",
    "Researching facts...",
    "Crafting narrative...",
    "Optimizing content...",
  ];

  const handleClick = async () => {
    if (!onGenerate || isGenerating) return;
    
    setIsGenerating(true);
    setGenerationStep(0);
    
    // Cycle through generation steps
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev + 1) % generationSteps.length);
    }, 1500);
    
    try {
      await onGenerate();
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`relative overflow-hidden group ${className}`}
      onClick={handleClick}
      disabled={isGenerating}
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
