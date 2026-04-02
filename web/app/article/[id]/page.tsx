import { ArticleReader } from "@/components/ArticleReader";
import { fetchArticle } from "@/lib/api";
import { Article } from "@/types/article";
import { Metadata } from "next";

// Generate static params for build time
export function generateStaticParams() {
  return [
    { id: "demo-1" },
    { id: "demo-2" },
    { id: "demo-3" },
  ];
}

// Generate metadata dynamically
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const data = await fetchArticle(id);
    const article = data.article;
    
    if (article) {
      return {
        title: `${article.title} | Veritas AI`,
        description: article.summary,
      };
    }
  } catch {
    // Fall back to default metadata
  }
  
  return {
    title: "Article | Veritas AI",
    description: "Read the latest AI-generated news analysis",
  };
}

// Server component that renders the article
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let article: Article | null = null;
  let error: string | null = null;

  try {
    const data = await fetchArticle(id);
    article = data.article;
  } catch (err) {
    console.error("Failed to load article:", err);
    error = "Failed to load article. Please try again.";
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
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-20 md:py-24">
      <ArticleReader article={article} />
    </div>
  );
}
