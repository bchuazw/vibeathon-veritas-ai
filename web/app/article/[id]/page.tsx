import { ArticleReader } from "@/components/ArticleReader";
import { fetchArticle } from "@/lib/api";
import { Article } from "@/types/article";

// Generate static params for build time
export function generateStaticParams() {
  // Return placeholder IDs - actual data fetched at runtime
  return [
    { id: "demo-1" },
    { id: "demo-2" },
    { id: "demo-3" },
  ];
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
