"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { ArticleList } from "@/components/ArticleList";
import { GenerateButton } from "@/components/GenerateButton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { fetchBreakingNews, generateArticle } from "@/lib/api";
import { Article } from "@/types/article";

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState("latest technology news");

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBreakingNews();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    const result = await generateArticle(topic);
    if (result.success && result.article) {
      setArticles((prev) => [result.article, ...prev]);
    }
  };

  return (
    <>
      <Hero />
      
      <section id="latest" className="py-16">
        <div className="container">
          {/* Section Header */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900">
                Latest Stories
              </h2>
              <p className="mt-2 text-stone-600">
                Breaking news and AI-generated analysis
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="text"
                placeholder="Enter a topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full sm:w-64"
              />
              <GenerateButton onGenerate={handleGenerate} size="default" />
            </div>
          </div>

          <Separator className="mb-10" />

          {/* Articles Grid */}
          <ArticleList articles={articles} isLoading={isLoading} />
        </div>
      </section>
    </>
  );
}
