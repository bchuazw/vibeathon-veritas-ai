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

// User-friendly error messages
const ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input and try again.",
  401: "Authentication required. Please sign in to continue.",
  403: "Access denied. You don't have permission to perform this action.",
  404: "Content not found. It may have been moved or deleted.",
  408: "Request timed out. The server is taking too long to respond.",
  429: "Too many requests. Please wait a moment before trying again.",
  500: "Server error. Our team has been notified and is working on it.",
  502: "Service temporarily unavailable. Please try again in a few moments.",
  503: "Service is under maintenance. Please check back soon.",
  504: "Gateway timeout. The backend service is starting up—please try again.",
};

// Parse API error response
async function parseErrorResponse(response: Response): Promise<APIError> {
  try {
    const errorData = await response.json();
    const isRateLimit = response.status === 429;
    const retryAfter = isRateLimit 
      ? parseInt(response.headers.get('Retry-After') || errorData.retry_after || '3600')
      : undefined;
    
    // Use user-friendly message if available
    const userMessage = errorData.userMessage || ERROR_MESSAGES[response.status] || errorData.message || errorData.error || 'An unexpected error occurred';
    
    return new APIError(
      userMessage,
      response.status,
      false,
      retryAfter,
      isRateLimit
    );
  } catch {
    return new APIError(
      ERROR_MESSAGES[response.status] || `Server error (${response.status}). Please try again later.`,
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
      'Unable to connect to the server. Please check your internet connection and try again.',
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
      'Unable to load articles. The backend may be starting up—please try again in a moment.',
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
      'Failed to generate article. Please check your connection and try again.',
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
