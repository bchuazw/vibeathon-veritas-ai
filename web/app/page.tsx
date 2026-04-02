"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ArticleList } from "@/components/ArticleList";
import { GenerateButton } from "@/components/GenerateButton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { fetchBreakingNews, generateArticle } from "@/lib/api";
import { Article } from "@/types/article";
import { Newspaper, Sparkles } from "lucide-react";

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
      
      <HowItWorks />
      
      <section id="latest" className="py-20 md:py-28 bg-stone-50/50">
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
              <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
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
                />
                <GenerateButton 
                  onGenerate={handleGenerate} 
                  size="default"
                  className="rounded-xl bg-stone-900 hover:bg-stone-800 shadow-button hover:shadow-button-hover transition-all duration-300"
                />
              </div>
            </motion.div>
          </motion.div>

          <Separator className="mb-12" />

          {/* Articles Grid */}
          <ArticleList articles={articles} isLoading={isLoading} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-stone-200/60 bg-stone-50">
        <div className="container">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-stone-50">
                <Newspaper className="h-4 w-4" />
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
    </>
  );
}
