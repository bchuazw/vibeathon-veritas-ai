"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon, 
  Zap,
  Share2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Article } from "@/types/article";
import { useState } from "react";

interface ArticleReaderProps {
  article: Article;
}

export function ArticleReader({ article }: ArticleReaderProps) {
  const [copied, setCopied] = useState(false);
  
  const formattedDate = article.published_at 
    ? format(new Date(article.published_at), "MMMM d, yyyy")
    : format(new Date(article.created_at), "MMMM d, yyyy");

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const text = article.title;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      default:
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getCredibilityBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getCredibilityText = (score: number) => {
    if (score >= 80) return "text-emerald-900";
    if (score >= 60) return "text-amber-900";
    return "text-red-900";
  };

  return (
    <motion.article 
      className="mx-auto max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Back Link */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 -ml-2 rounded-full"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </Link>
        </Button>
      </motion.div>

      {/* Article Header */}
      <header className="mb-10">
        {/* Meta */}
        <motion.div 
          className="mb-6 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Badge className="bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium">
            {article.category}
          </Badge>
          {article.is_breaking && (
            <Badge className="bg-red-600 text-white hover:bg-red-700 animate-pulse-subtle">
              Breaking News
            </Badge>
          )}
          {article.virlo_optimized && (
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
              <Zap className="mr-1 h-3 w-3" />
              Virlo Optimized
            </Badge>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="font-serif text-3xl font-bold leading-tight text-stone-900 sm:text-4xl md:text-5xl tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {article.title}
        </motion.h1>

        {/* Author & Date */}
        <motion.div 
          className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-stone-200 to-stone-300 text-stone-600 font-serif font-bold text-lg">
              {article.author ? article.author.charAt(0).toUpperCase() : "V"}
            </div>
            <div>
              {article.author && (
                <p className="font-medium text-stone-900">{article.author}</p>
              )}
              <p className="text-sm text-stone-500">{formattedDate}</p>
            </div>
          </div>
          
          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all duration-200"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-4 w-4 text-stone-600" />
              <span className="sr-only">Share on Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all duration-200"
              onClick={() => handleShare("linkedin")}
            >
              <Linkedin className="h-4 w-4 text-stone-600" />
              <span className="sr-only">Share on LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all duration-200 relative"
              onClick={() => handleShare()}
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <LinkIcon className="h-4 w-4 text-stone-600" />
              )}
              <span className="sr-only">Copy link</span>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-stone-900 text-white text-xs rounded whitespace-nowrap"
                >
                  Copied!
                </motion.span>
              )}
            </Button>
          </div>
        </motion.div>
      </header>

      {/* Featured Image */}
      {article.image_url && (
        <motion.div 
          className="relative mb-10 aspect-[21/9] overflow-hidden rounded-2xl shadow-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </motion.div>
      )}

      {/* Article Content */}
      <motion.div 
        className="article-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <p className="text-xl leading-relaxed text-stone-700 font-medium">
          {article.summary}
        </p>
        
        <Separator className="my-10" />
        
        <div className="whitespace-pre-wrap text-stone-700">
          {article.content}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        className="mt-16 border-t border-stone-200/80 pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-stone-500">
              Source: <span className="text-stone-700 font-medium">{article.source}</span>
            </p>
            {article.virlo_optimized && article.virlo_score && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-purple-700 font-medium">
                  Virlo Viral Score: {article.virlo_score}/100
                </span>
              </div>
            )}
            {article.source_url && (
              <a 
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 underline underline-offset-4 transition-colors"
              >
                View original source
                <ArrowLeft className="h-3 w-3 rotate-180" />
              </a>
            )}
          </div>
          
          {/* Credibility Badge */}
          <div className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${getCredibilityBg(article.credibility_score)}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <span className={`font-serif text-2xl font-bold ${getCredibilityText(article.credibility_score)}`}>
                {article.credibility_score}
              </span>
            </div>
            <div>
              <p className={`text-sm font-semibold ${getCredibilityText(article.credibility_score)}`}>
                Credibility Score
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {article.credibility_score >= 80 
                  ? "High confidence" 
                  : article.credibility_score >= 60 
                  ? "Moderate confidence" 
                  : "Low confidence"}
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.article>
  );
}
