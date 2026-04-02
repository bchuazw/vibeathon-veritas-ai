"use client";

import { motion } from "framer-motion";
import { ArticleCard } from "./ArticleCard";
import { Article } from "@/types/article";
import { FileText } from "lucide-react";

interface ArticleListProps {
  articles: Article[];
  isLoading?: boolean;
}

function ArticleSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="space-y-4"
    >
      {/* Image skeleton */}
      <div className="aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Category skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 rounded-full bg-stone-200" />
        <div className="h-1 w-1 rounded-full bg-stone-300" />
        <div className="h-4 w-20 rounded bg-stone-200" />
      </div>
      
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-full rounded bg-stone-200" />
        <div className="h-6 w-2/3 rounded bg-stone-200" />
      </div>
      
      {/* Summary skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-stone-200" />
        <div className="h-4 w-4/5 rounded bg-stone-200" />
      </div>
      
      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <div className="h-4 w-24 rounded bg-stone-200" />
        </div>
        <div className="h-4 w-16 rounded bg-stone-200" />
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div 
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-100 mb-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <FileText className="h-10 w-10 text-stone-400" />
      </motion.div>
      <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">
        No articles found
      </h3>
      <p className="text-stone-500 max-w-sm">
        Check back later for new stories or try generating an article on a topic you&apos;re interested in.
      </p>
    </motion.div>
  );
}

export function ArticleList({ articles, isLoading }: ArticleListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return <EmptyState />;
  }

  return (
    <motion.div 
      className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08 }
        }
      }}
    >
      {articles.map((article, index) => (
        <ArticleCard key={article.id} article={article} index={index} />
      ))}
    </motion.div>
  );
}
