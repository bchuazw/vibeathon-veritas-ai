"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArticleReader } from "@/components/ArticleReader";
import { Article } from "@/types/article";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://veritas-ai-backend-p7t5.onrender.com';

// Generate Article structured data for SEO
function generateArticleSchema(article: Article, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.summary,
    "image": article.image_url || "https://veritas-ai-frontend.onrender.com/og-image.svg",
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at || article.created_at,
    "author": {
      "@type": "Organization",
      "name": article.author || "Veritas AI"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Veritas AI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://veritas-ai-frontend.onrender.com/og-image.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "articleSection": article.category,
    "keywords": article.keywords?.join(", ") || "AI news, journalism",
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "aggregateRating": article.credibility_score ? {
      "@type": "AggregateRating",
      "ratingValue": article.credibility_score.toString(),
      "bestRating": "100",
      "worstRating": "0"
    } : undefined
  };
}

export default function ArticlePageClient() {
  const params = useParams();
  const paramId = params?.id as string;
  
  // Handle fallback redirect from 404.html
  const [id, setId] = useState<string>(paramId);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored article ID from 404 redirect (old method)
    if (paramId === '_fallback') {
      const storedId = sessionStorage.getItem('articleId');
      if (storedId) {
        setId(storedId);
        sessionStorage.removeItem('articleId');
        return;
      }
      
      // Check for query parameter (new method from not-found.tsx)
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get('id');
      if (queryId) {
        setId(queryId);
        return;
      }
    }
  }, [paramId]);

  useEffect(() => {
    if (!id || id === '_fallback') return;
    
    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/news/article/${id}`);
        if (!response.ok) {
          throw new Error('Article not found');
        }
        const data = await response.json();
        setArticle(data.article);
      } catch (err) {
        console.error("Failed to load article:", err);
        setError("Failed to load article. The backend may be starting up — please try again in a moment.");
      } finally {
        setLoading(false);
      }
    };
    
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-24">
        <div className="mx-auto max-w-3xl">
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-10 w-10 text-stone-400" />
            </motion.div>
            <p className="mt-4 text-stone-500">Loading article...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-100 mx-auto mb-6">
            <svg className="h-10 w-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
            Article Not Found
          </h1>
          <p className="text-stone-600 mb-8">
            {error || "The article you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors"
            >
              Back to Home
            </a>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-700 rounded-full hover:bg-stone-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/article/${id}/`
    : `https://veritas-ai-frontend.onrender.com/article/${id}/`;

  return (
    <>
      {/* JSON-LD Article Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(generateArticleSchema(article, canonicalUrl)) 
        }}
      />
      <div className="container py-20 md:py-24">
        <ArticleReader article={article} />
      </div>
    </>
  );
}
