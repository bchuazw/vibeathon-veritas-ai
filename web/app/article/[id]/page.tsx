import ArticlePageClient from "./ArticlePageClient";

// Generate a single fallback page for the static export
// Render's _redirects will serve this page for all /article/* routes
// The client component reads the actual ID from the URL and fetches the article
export function generateStaticParams() {
  return [{ id: "_fallback" }];
}

export default function ArticlePage() {
  return <ArticlePageClient />;
}
