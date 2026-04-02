const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://veritas-ai-backend-p7t5.onrender.com';

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError?: boolean,
    public retryAfter?: number,
    public isRateLimit?: boolean
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Parse API error response
async function parseErrorResponse(response: Response): Promise<APIError> {
  try {
    const errorData = await response.json();
    const isRateLimit = response.status === 429;
    const retryAfter = isRateLimit 
      ? parseInt(response.headers.get('Retry-After') || errorData.retry_after || '3600')
      : undefined;
    
    return new APIError(
      errorData.message || errorData.error || 'An error occurred',
      response.status,
      false,
      retryAfter,
      isRateLimit
    );
  } catch {
    return new APIError(
      `HTTP error ${response.status}`,
      response.status,
      false
    );
  }
}

// Fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Exponential backoff retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);
      
      // Don't retry client errors (4xx) except rate limits
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit - don't retry, let the caller handle it
          throw await parseErrorResponse(response);
        }
        if (response.status >= 400 && response.status < 500) {
          throw await parseErrorResponse(response);
        }
        // Server error - may retry
        throw await parseErrorResponse(response);
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if it's a rate limit error or client error
      if (error instanceof APIError) {
        if (error.isRateLimit || (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)) {
          throw error;
        }
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Request failed after retries');
}

export async function fetchArticle(id: string) {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/news/article/${id}`, {
      cache: 'no-store',
    });
    return response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      'Network error. Please check your connection.',
      undefined,
      true
    );
  }
}

export async function fetchBreakingNews() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/news/articles?limit=20`, {
      cache: 'no-store',
    });
    return response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      'Network error. Please check your connection.',
      undefined,
      true
    );
  }
}

export async function generateArticle(topic: string, keywords?: string[], targetLength?: number) {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/news/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        topic, 
        keywords: keywords || [], 
        target_length: targetLength || 400 
      }),
    });
    
    return response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      'Network error. Please check your connection and try again.',
      undefined,
      true
    );
  }
}

// Get rate limit status from response headers
export function getRateLimitFromHeaders(response: Response) {
  return {
    limit: parseInt(response.headers.get('X-RateLimit-Limit') || '5'),
    remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
    reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
  };
}
