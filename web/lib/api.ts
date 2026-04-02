const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://veritas-ai-backend-p7t5.onrender.com';

export async function fetchArticle(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/news/article/${id}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  return response.json();
}

export async function fetchBreakingNews() {
  // Fetch stored articles from the articles list endpoint
  const response = await fetch(`${API_BASE_URL}/api/news/articles?limit=20`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}

export async function generateArticle(topic: string, keywords?: string[], targetLength?: number) {
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
    throw new Error('Failed to generate article');
  }
  return response.json();
}