import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Article, ArticleInsert, ArticleUpdate, AgentLog, AgentLogInsert, Source, SourceInsert } from './types';

// ============================================
// Supabase Client Configuration
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// ============================================
// Article Operations
// ============================================

/**
 * Create a new article
 */
export async function createArticle(data: ArticleInsert) {
  const { data: article, error } = await supabase
    .from('articles')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating article:', error);
    throw new Error(`Failed to create article: ${error.message}`);
  }

  return article as Article;
}

/**
 * Get a single article by ID
 */
export async function getArticleById(id: string) {
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    throw new Error(`Failed to fetch article: ${error.message}`);
  }

  return article as Article;
}

/**
 * Get article with its sources
 */
export async function getArticleWithSources(id: string) {
  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      sources (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article with sources:', error);
    throw new Error(`Failed to fetch article: ${error.message}`);
  }

  return article as Article & { sources: Source[] };
}

/**
 * List published articles (newest first)
 */
export async function listArticles(limit = 10, offset = 0) {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error listing articles:', error);
    throw new Error(`Failed to list articles: ${error.message}`);
  }

  return articles as Article[];
}

/**
 * List articles by status
 */
export async function listArticlesByStatus(
  status: 'draft' | 'published' | 'failed',
  limit = 10,
  offset = 0
) {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error listing articles by status:', error);
    throw new Error(`Failed to list articles: ${error.message}`);
  }

  return articles as Article[];
}

/**
 * Update an article
 */
export async function updateArticle(id: string, data: ArticleUpdate) {
  const { data: article, error } = await supabase
    .from('articles')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating article:', error);
    throw new Error(`Failed to update article: ${error.message}`);
  }

  return article as Article;
}

/**
 * Publish an article (sets status to published)
 */
export async function publishArticle(id: string) {
  return updateArticle(id, { status: 'published' });
}

/**
 * Delete an article
 */
export async function deleteArticle(id: string) {
  const { error } = await supabase.from('articles').delete().eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    throw new Error(`Failed to delete article: ${error.message}`);
  }

  return true;
}

/**
 * Search articles by headline or body content
 */
export async function searchArticles(query: string, limit = 10) {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .or(`headline.ilike.%${query}%,body.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching articles:', error);
    throw new Error(`Failed to search articles: ${error.message}`);
  }

  return articles as Article[];
}

// ============================================
// Agent Log Operations
// ============================================

/**
 * Log an agent activity
 */
export async function logAgentActivity(log: AgentLogInsert) {
  const { data, error } = await supabase.from('agent_logs').insert(log).select().single();

  if (error) {
    console.error('Error logging agent activity:', error);
    throw new Error(`Failed to log agent activity: ${error.message}`);
  }

  return data as AgentLog;
}

/**
 * Get logs for a specific article
 */
export async function getArticleLogs(articleId: string) {
  const { data: logs, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching article logs:', error);
    throw new Error(`Failed to fetch article logs: ${error.message}`);
  }

  return logs as AgentLog[];
}

/**
 * Get recent agent activity
 */
export async function getRecentActivity(limit = 50) {
  const { data: logs, error } = await supabase
    .from('agent_logs')
    .select(`
      *,
      articles (headline)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    throw new Error(`Failed to fetch recent activity: ${error.message}`);
  }

  return logs as (AgentLog & { articles: { headline: string } | null })[];
}

// ============================================
// Source Operations
// ============================================

/**
 * Add a source to an article
 */
export async function addSource(data: SourceInsert) {
  const { data: source, error } = await supabase
    .from('sources')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error adding source:', error);
    throw new Error(`Failed to add source: ${error.message}`);
  }

  return source as Source;
}

/**
 * Add multiple sources to an article
 */
export async function addSources(articleId: string, sources: Omit<SourceInsert, 'article_id'>[]) {
  const sourcesWithArticleId = sources.map((s) => ({ ...s, article_id: articleId }));

  const { data, error } = await supabase.from('sources').insert(sourcesWithArticleId).select();

  if (error) {
    console.error('Error adding sources:', error);
    throw new Error(`Failed to add sources: ${error.message}`);
  }

  return data as Source[];
}

/**
 * Get sources for an article
 */
export async function getArticleSources(articleId: string) {
  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .eq('article_id', articleId)
    .order('relevance_score', { ascending: false });

  if (error) {
    console.error('Error fetching article sources:', error);
    throw new Error(`Failed to fetch article sources: ${error.message}`);
  }

  return sources as Source[];
}

/**
 * Delete a source
 */
export async function deleteSource(id: string) {
  const { error } = await supabase.from('sources').delete().eq('id', id);

  if (error) {
    console.error('Error deleting source:', error);
    throw new Error(`Failed to delete source: ${error.message}`);
  }

  return true;
}

// ============================================
// Statistics & Analytics
// ============================================

/**
 * Get article statistics
 */
export async function getArticleStats() {
  const { data, error } = await supabase.rpc('get_article_stats');

  if (error) {
    console.error('Error fetching article stats:', error);
    throw new Error(`Failed to fetch article stats: ${error.message}`);
  }

  return data as {
    total_articles: number;
    published_count: number;
    draft_count: number;
    failed_count: number;
    avg_confidence: number;
    avg_generation_time: number;
  };
}

// ============================================
// Real-time Subscriptions (for live updates)
// ============================================

/**
 * Subscribe to new published articles
 */
export function subscribeToNewArticles(callback: (article: Article) => void) {
  return supabase
    .channel('new-articles')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'articles',
        filter: 'status=eq.published',
      },
      (payload) => {
        callback(payload.new as Article);
      }
    )
    .subscribe();
}

/**
 * Subscribe to article updates
 */
export function subscribeToArticleUpdates(
  articleId: string,
  callback: (article: Article) => void
) {
  return supabase
    .channel(`article-${articleId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'articles',
        filter: `id=eq.${articleId}`,
      },
      (payload) => {
        callback(payload.new as Article);
      }
    )
    .subscribe();
}
