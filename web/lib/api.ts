const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://veritas-ai-backend-p7t5.onrender.com';

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError?: boolean
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function fetchArticle(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/news/article/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new APIError(
        response.status === 404 ? 'Article not found' : 'Failed to fetch article',
        response.status
      );
    }
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
    const response = await fetch(`${API_BASE_URL}/api/news/articles?limit=20`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new APIError('Failed to fetch articles', response.status);
    }
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
    const response = await fetch(`${API_BASE_URL}/api/news/generate`, {
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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Failed to generate article. Please try again.',
        response.status
      );
    }
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