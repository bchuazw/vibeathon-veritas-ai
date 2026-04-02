"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Zap, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
  index?: number;
}

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const formattedDate = article.published_at 
    ? format(new Date(article.published_at), "MMM d, yyyy")
    : format(new Date(article.created_at), "MMM d, yyyy");

  const getCredibilityColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getCredibilityText = (score: number) => {
    if (score >= 80) return "text-emerald-700";
    if (score >= 60) return "text-amber-700";
    return "text-red-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      <Link href={`/article/${article.id}`} className="group block">
        <Card className="h-full overflow-hidden border-stone-200/60 bg-white/80 backdrop-blur-sm shadow-card hover:shadow-card-hover transition-all duration-500 rounded-2xl">
          {/* Image container */}
          <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
            {article.image_url ? (
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                <div className="text-stone-400">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Arrow indicator on hover */}
            <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <ArrowUpRight className="h-5 w-5 text-stone-700" />
            </div>

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {article.is_breaking && (
                <Badge className="bg-red-600 text-white hover:bg-red-700 shadow-lg animate-pulse-subtle">
                  Breaking
                </Badge>
              )}
            </div>
            
            {article.virlo_optimized && (
              <div className="absolute right-4 bottom-4">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg">
                  <Zap className="mr-1 h-3 w-3" />
                  Virlo
                </Badge>
              </div>
            )}
          </div>

          <CardHeader className="space-y-3 pb-2 pt-5">
            {/* Meta row */}
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium">
                {article.category}
              </Badge>
              <span className="text-stone-400">•</span>
              <span className="text-stone-500">{formattedDate}</span>
            </div>
            
            {/* Title */}
            <h3 className="font-serif text-xl font-semibold leading-snug text-stone-900 group-hover:text-stone-700 transition-colors duration-300 line-clamp-2">
              {article.title}
            </h3>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="line-clamp-2 text-sm leading-relaxed text-stone-600 mb-4">
              {article.summary}
            </p>
            
            {/* Footer with credibility and source */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${getCredibilityColor(article.credibility_score)} shadow-sm`} />
                <span className={`text-xs font-medium ${getCredibilityText(article.credibility_score)}`}>
                  {article.credibility_score}% credible
                </span>
              </div>
              <span className="text-xs text-stone-400 font-medium truncate max-w-[120px]">
                {article.source}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
