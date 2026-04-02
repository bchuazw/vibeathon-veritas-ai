// ============================================
// Veritas AI - TypeScript Type Definitions
// ============================================

/**
 * Article status types
 */
export type ArticleStatus = 'draft' | 'published' | 'failed';

/**
 * Agent types that can perform actions
 */
export type AgentType = 'scout' | 'creator' | 'publisher' | 'fact_checker';

/**
 * Source information for fact-checking
 */
export interface Source {
  id: string;
  article_id: string;
  url: string;
  title?: string;
  domain?: string;
  relevance_score?: number;
  created_at: string;
}

/**
 * Source data for inserting (omits auto-generated fields)
 */
export interface SourceInsert {
  article_id: string;
  url: string;
  title?: string;
  domain?: string;
  relevance_score?: number;
}

/**
 * Source data for updating (all fields optional)
 */
export interface SourceUpdate {
  url?: string;
  title?: string;
  domain?: string;
  relevance_score?: number;
}

/**
 * JSON structure for article sources stored in articles.sources JSONB column
 */
export interface ArticleSource {
  url: string;
  title: string;
  domain: string;
}

/**
 * Main Article interface
 */
export interface Article {
  id: string;
  headline: string;
  summary?: string;
  body: string;
  status: ArticleStatus;
  confidence?: number;
  sources?: ArticleSource[];
  created_at: string;
  published_at?: string;
  generation_time_ms?: number;
}

/**
 * Article data for inserting (omits auto-generated fields)
 */
export interface ArticleInsert {
  headline: string;
  summary?: string;
  body: string;
  status?: ArticleStatus;
  confidence?: number;
  sources?: ArticleSource[];
  published_at?: string;
  generation_time_ms?: number;
}

/**
 * Article data for updating (all fields optional)
 */
export interface ArticleUpdate {
  headline?: string;
  summary?: string;
  body?: string;
  status?: ArticleStatus;
  confidence?: number;
  sources?: ArticleSource[];
  published_at?: string;
  generation_time_ms?: number;
}

/**
 * Agent activity log entry
 */
export interface AgentLog {
  id: string;
  article_id?: string;
  agent: AgentType;
  action: string;
  details?: Record<string, any>;
  created_at: string;
}

/**
 * Agent log data for inserting
 */
export interface AgentLogInsert {
  article_id?: string;
  agent: AgentType;
  action: string;
  details?: Record<string, any>;
}

/**
 * Article with full source details (joined query result)
 */
export interface ArticleWithSources extends Article {
  sources: Source[];
}

/**
 * Article statistics (from database function)
 */
export interface ArticleStats {
  total_articles: number;
  published_count: number;
  draft_count: number;
  failed_count: number;
  avg_confidence: number;
  avg_generation_time: number;
}

/**
 * Paginated response for article lists
 */
export interface PaginatedArticles {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Search filters for articles
 */
export interface ArticleSearchFilters {
  status?: ArticleStatus;
  query?: string;
  fromDate?: string;
  toDate?: string;
  minConfidence?: number;
  maxConfidence?: number;
}

/**
 * Real-time subscription event types
 */
export type DatabaseChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Real-time change payload
 */
export interface DatabaseChangePayload<T> {
  eventType: DatabaseChangeEvent;
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
  errors: any[];
}

/**
 * Agent action types for logging
 */
export type AgentAction =
  | 'article_created'
  | 'article_updated'
  | 'article_published'
  | 'article_failed'
  | 'research_started'
  | 'research_completed'
  | 'sources_found'
  | 'content_generated'
  | 'fact_check_started'
  | 'fact_check_completed'
  | 'confidence_calculated'
  | 'publish_attempted'
  | 'publish_success'
  | 'publish_failed';

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
