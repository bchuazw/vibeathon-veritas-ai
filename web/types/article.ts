export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  source_url?: string;
  published_at: string;
  category: string;
  credibility_score: number;
  is_breaking: boolean;
  image_url?: string;
  author?: string;
  created_at: string;
  updated_at: string;
  // Virlo optimization fields
  virlo_optimized?: boolean;
  virlo_score?: number;
  virlo_original_headline?: string;
  virlo_suggested_hashtags?: string[];
}

export interface GenerateArticleRequest {
  topic?: string;
  category?: string;
}

export interface GenerateArticleResponse {
  article: Article;
  success: boolean;
}

export interface ApiError {
  detail: string;
}