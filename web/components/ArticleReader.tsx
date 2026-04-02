"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Share2, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Article } from "@/types/article";

interface ArticleReaderProps {
  article: Article;
}

export function ArticleReader({ article }: ArticleReaderProps) {
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
          // Could show a toast here
        } catch (err) {
          console.error("Failed to copy:", err);
        }
    }
  };

  return (
    <article className="mx-auto max-w-3xl">
      {/* Back Link */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="text-stone-600">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge className="bg-stone-100 text-stone-700 hover:bg-stone-200">
            {article.category}
          </Badge>
          {article.is_breaking && (
            <Badge className="bg-red-600 text-white hover:bg-red-700">
              Breaking News
            </Badge>
          )}
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <div 
              className={`h-2 w-2 rounded-full ${
                article.credibility_score >= 80 
                  ? "bg-green-500" 
                  : article.credibility_score >= 60 
                  ? "bg-yellow-500" 
                  : "bg-red-500"
              }`} 
            />
            <span>{article.credibility_score}% Credibility Score</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-bold leading-tight text-stone-900 sm:text-4xl md:text-5xl">
          {article.title}
        </h1>

        {/* Author & Date */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              {article.author && (
                <p className="font-medium text-stone-900">{article.author}</p>
              )}
              <p className="text-stone-500">{formattedDate}</p>
            </div>
          </div>
          
          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-stone-200"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-4 w-4 text-stone-600" />
              <span className="sr-only">Share on Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-stone-200"
              onClick={() => handleShare("linkedin")}
            >
              <Linkedin className="h-4 w-4 text-stone-600" />
              <span className="sr-only">Share on LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-stone-200"
              onClick={() => handleShare()}
            >
              <LinkIcon className="h-4 w-4 text-stone-600" />
              <span className="sr-only">Copy link</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.image_url && (
        <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-lg">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-stone-900 prose-strong:text-stone-900">
        <p className="text-xl leading-relaxed text-stone-700">
          {article.summary}
        </p>
        <Separator className="my-8" />
        <div className="whitespace-pre-wrap text-base leading-relaxed">
          {article.content}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-200 pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-stone-500">
              Source: <span className="text-stone-700">{article.source}</span>
            </p>
            {article.source_url && (
              <a 
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-stone-600 underline hover:text-stone-900"
              >
                View original source
              </a>
            )}
          </div>
          
          {/* Credibility Badge */}
          <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              <span className="font-serif text-lg font-bold text-stone-800">
                {article.credibility_score}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">Credibility Score</p>
              <p className="text-xs text-stone-500">
                {article.credibility_score >= 80 
                  ? "High confidence" 
                  : article.credibility_score >= 60 
                  ? "Moderate confidence" 
                  : "Low confidence"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
}
