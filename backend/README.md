# Veritas AI Backend

AI-powered news automation system built with FastAPI.

## Features

- **Scout Agent**: Monitors NewsAPI for breaking news
- **Content Creator Agent**: Researches, writes, and fact-checks articles
- **Publisher Agent**: SEO optimization and formatting
- **Async Pipeline**: Background processing with status tracking

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Run the server:
```bash
uvicorn app.main:app --reload
```

4. Access the API:
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/news/generate` | Generate article from topic |
| GET | `/api/news/breaking` | Find and generate breaking news |
| GET | `/api/news/status/{id}` | Check generation status |
| GET | `/api/news/article/{id}` | Get published article |
| GET | `/api/news/topics` | Search news topics |

## Docker

Build and run with Docker:

```bash
docker build -t veritas-ai .
docker run -p 8000:8000 --env-file .env veritas-ai
```
