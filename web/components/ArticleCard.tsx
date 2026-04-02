import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = article.published_at 
    ? format(new Date(article.published_at), "MMM d, yyyy")
    : format(new Date(article.created_at), "MMM d, yyyy");

  return (
    <Link href={`/article/${article.id}`} className="group block">
      <Card className="h-full overflow-hidden border-stone-200 bg-white transition-shadow hover:shadow-md">
        {article.image_url && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {article.is_breaking && (
              <div className="absolute left-4 top-4">
                <Badge className="bg-red-600 text-white hover:bg-red-700">
                  Breaking
                </Badge>
              </div>
            )}
          </div>
        )}
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Badge variant="secondary" className="bg-stone-100 text-stone-700">
              {article.category}
            </Badge>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
          <h3 className="font-serif text-xl font-semibold leading-tight text-stone-900 group-hover:text-stone-700">
            {article.title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm leading-relaxed text-stone-600">
            {article.summary}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div 
                className={`h-2 w-2 rounded-full ${
                  article.credibility_score >= 80 
                    ? "bg-green-500" 
                    : article.credibility_score >= 60 
                    ? "bg-yellow-500" 
                    : "bg-red-500"
                }`} 
              />
              <span className="text-xs text-stone-500">
                {article.credibility_score}% credible
              </span>
            </div>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500">{article.source}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
