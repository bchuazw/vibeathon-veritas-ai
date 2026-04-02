const API_BASE_URL = 'http://localhost:8000';

export async function fetchArticle(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/news/article/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  return response.json();
}

export async function fetchBreakingNews() {
  const response = await fetch(`${API_BASE_URL}/api/news/breaking`);
  if (!response.ok) {
    throw new Error('Failed to fetch breaking news');
  }
  return response.json();
}

export async function generateArticle(topic?: string, category?: string) {
  const response = await fetch(`${API_BASE_URL}/api/news/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, category }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate article');
  }
  return response.json();
}