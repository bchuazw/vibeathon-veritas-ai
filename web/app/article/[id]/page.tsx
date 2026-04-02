"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArticleReader } from "@/components/ArticleReader";
import { fetchArticle } from "@/lib/api";
import { Article } from "@/types/article";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!params.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchArticle(params.id as string);
        setArticle(data.article);
      } catch (err) {
        console.error("Failed to load article:", err);
        setError("Failed to load article. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="aspect-[21/9] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Article Not Found
          </h1>
          <p className="mt-4 text-stone-600">
            {error || "The article you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <ArticleReader article={article} />
    </div>
  );
}
