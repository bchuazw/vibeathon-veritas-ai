"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TargetMarket } from "@/components/TargetMarket";
import { BusinessModel } from "@/components/BusinessModel";
import { ArticleList } from "@/components/ArticleList";
import { GenerateButton } from "@/components/GenerateButton";
import { ErrorBoundary, ErrorDisplay } from "@/components/ErrorBoundary";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { fetchBreakingNews, generateArticle, APIError } from "@/lib/api";
import { useRateLimit, useThrottle } from "@/lib/rate-limit";
import { Article } from "@/types/article";
import { Newspaper, Sparkles, AlertCircle, X, Clock } from "lucide-react";
import { RateLimitDisplay } from "@/components/CountdownTimer";

// Maximum retries for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState("latest technology news");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { checkRateLimit, recordRequest, getRateLimitState } = useRateLimit();
  const [rateLimitState, setRateLimitState] = useState<{ remaining: number; resetTime: number | null; isLimited: boolean }>({ 
    remaining: 3, 
    resetTime: null, 
    isLimited: false 
  });

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, []);

  // Update remaining requests on mount
  useEffect(() => {
    const limit = checkRateLimit();
    setRemainingRequests(limit.remainingRequests);
    setRateLimitState(getRateLimitState());
  }, [checkRateLimit, getRateLimitState]);

  const loadArticles = useCallback(async (retryAttempt = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBreakingNews();
      setArticles(data.articles || []);
      setRetryCount(0);
    } catch (err) {
      const message = err instanceof APIError 
        ? err.message 
        : "Failed to load articles. Please try again later.";
      
      // Retry logic for network errors
      if (retryAttempt < MAX_RETRIES && err instanceof APIError && err.isNetworkError) {
        setRetryCount(retryAttempt + 1);
        setTimeout(() => {
          loadArticles(retryAttempt + 1);
        }, RETRY_DELAY_MS * (retryAttempt + 1));
        return;
      }
      
      setError(message);
      console.error("Failed to load articles:", err);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Throttled generate handler to prevent spam clicks
  const throttledGenerate = useThrottle(async () => {
    // Check rate limit before proceeding
    const limitCheck = checkRateLimit();
    const currentState = getRateLimitState();
    setRemainingRequests(limitCheck.remainingRequests);
    setRateLimitState(currentState);

    if (!limitCheck.canProceed) {
      setRateLimitError(limitCheck.message || "Rate limit exceeded. Please try again later.");
      return;
    }

    setRateLimitError(null);
    setIsGenerating(true);
    setError(null);

    try {
      // Record the request for rate limiting
      recordRequest();
      
      const result = await generateArticle(topic);
      
      if (result.success && result.article) {
        setArticles((prev) => [result.article, ...prev]);
        // Update remaining requests after successful generation
        const updatedLimit = checkRateLimit();
        setRemainingRequests(updatedLimit.remainingRequests);
        setRateLimitState(getRateLimitState());
      }
    } catch (err) {
      const message = err instanceof APIError 
        ? err.message 
        : "Failed to generate article. Please try again.";
      setError(message);
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }, 2000); // 2 second throttle between clicks

  const handleGenerate = useCallback(async () => {
    await throttledGenerate();
  }, [throttledGenerate]);

  return (
    <ErrorBoundary>
      <Hero />
      
      <HowItWorks />
      
      <TargetMarket />
      
      <BusinessModel />
      
      <section id="latest" className="py-20 md:py-28 bg-stone-50/50" aria-labelledby="latest-stories-title">
        <div className="container">
          {/* Section Header */}
          <motion.div 
            className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>
              <motion.div 
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100">
                  <Newspaper className="h-4 w-4 text-stone-600" />
                </div>
                <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Stories</span>
              </motion.div>
              <h2 id="latest-stories-title" className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Latest Stories
              </h2>
              <p className="mt-3 text-lg text-stone-600 max-w-xl">
                Breaking news and AI-generated analysis from around the world
              </p>
            </div>
            
            {/* Generate section */}
            <motion.div 
              className="flex flex-col gap-3 sm:flex-row sm:items-center p-4 bg-white rounded-2xl border border-stone-200/60 shadow-card"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 text-sm text-stone-500 mb-2 sm:mb-0 sm:mr-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Generate on topic:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="Enter a topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border-stone-200 focus:border-stone-400 focus:ring-stone-400"
                  aria-label="Article topic"
                  disabled={isGenerating}
                />
                <GenerateButton 
                  onGenerate={handleGenerate} 
                  size="default"
                  className="rounded-xl bg-stone-900 hover:bg-stone-800 shadow-button hover:shadow-button-hover transition-all duration-300"
                  aria-label="Generate article"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Rate Limit Indicator with Countdown */}
          <RateLimitDisplay 
            remainingRequests={rateLimitState.remaining}
            resetTime={rateLimitState.resetTime}
            isLimited={rateLimitState.isLimited}
            onReset={() => setRateLimitState(getRateLimitState())}
          />

          <Separator className="mb-12" />

          {/* Rate Limit Error Display */}
          <AnimatePresence>
            {rateLimitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800">{rateLimitError}</p>
                  </div>
                  <button
                    onClick={() => setRateLimitError(null)}
                    className="p-1 hover:bg-amber-100 rounded-lg transition-colors"
                    aria-label="Dismiss rate limit warning"
                  >
                    <X className="h-4 w-4 text-amber-600" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* General Error Display */}
          <ErrorDisplay 
            error={error} 
            onDismiss={() => setError(null)}
            onRetry={() => loadArticles()}
          />

          {/* Retry indicator */}
          {retryCount > 0 && retryCount < MAX_RETRIES && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex items-center gap-2 text-sm text-stone-500"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              Retrying... (attempt {retryCount}/{MAX_RETRIES})
            </motion.div>
          )}

          {/* Articles Grid */}
          <ArticleList articles={articles} isLoading={isLoading} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-stone-200/60 bg-stone-50" role="contentinfo">
        <div className="container">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-stone-50" aria-hidden="true">
                <Newspaper className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-serif text-lg font-bold text-stone-900">
                Veritas AI
              </span>
            </div>
            <p className="text-sm text-stone-500 text-center">
              Truth in the Age of Information. AI-powered journalism you can trust.
            </p>
            <p className="text-sm text-stone-400">
              © {new Date().getFullYear()} Veritas AI
            </p>
          </motion.div>
        </div>
      </footer>
    </ErrorBoundary>
  );
}
