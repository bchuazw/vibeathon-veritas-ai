import { ArticleReader } from "@/components/ArticleReader";
import { fetchArticle } from "@/lib/api";

// Generate static params for dynamic route (required for output: 'export')
export async function generateStaticParams() {
  // Articles are fetched client-side, so we return an empty array
  // The page will be rendered at request time on the client
  return [];
}

// Server component wrapper to fetch data
async function ArticleContent({ id }: { id: string }) {
  try {
    const data = await fetchArticle(id);
    return <ArticleReader article={data.article} />;
  } catch (err) {
    console.error("Failed to load article:", err);
    return (
      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Article Not Found
        </h1>
        <p className="mt-4 text-stone-600">
          The article you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }
}

// Next.js 15 params is now a Promise
export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return (
    <div className="container py-16">
      <ArticleContent id={id} />
    </div>
  );
}
