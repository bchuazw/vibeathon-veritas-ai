# Veritas AI Backend - Run Instructions

## Quick Start

### 1. Install Dependencies

```bash
cd /root/OpenClaw/workspaces/gladys/projects/vibeathon-veritas-ai/backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

The `.env` file is already created with default values. Update the following:

- **OPENAI_API_KEY**: Already configured ✓
- **NEWSAPI_KEY** (optional): Add for real news data, or leave empty for mock data
- **SUPABASE_URL** & **SUPABASE_KEY** (optional): Add to persist articles to Supabase

```bash
# Edit the .env file
nano .env
```

### 3. Run the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

## API Documentation

Once running, view interactive docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing Endpoints

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": 1700000000.0
}
```

### Generate Article from Topic

```bash
curl -X POST http://localhost:8000/api/news/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI breakthrough", "target_length": 400}'
```

### Get Breaking News Topics

```bash
curl http://localhost:8000/api/news/topics
```

### Search Topics

```bash
curl "http://localhost:8000/api/news/topics?query=artificial%20intelligence"
```

### List Recent Articles (Supabase)

```bash
curl "http://localhost:8000/api/news/articles?limit=5"
```

### Get Article by ID

```bash
curl http://localhost:8000/api/news/article/{article_id}
```

### Generate Breaking News (Async)

```bash
curl -X POST "http://localhost:8000/api/news/breaking?category=technology"
```

Returns a job_id to track progress:
```json
{
  "success": true,
  "job_id": "uuid-here",
  "message": "Breaking news generation started"
}
```

### Check Generation Status

```bash
curl http://localhost:8000/api/news/status/{job_id}
```

## Features

- **Mock News Data**: Works without NEWSAPI_KEY using realistic tech/AI headlines
- **Supabase Integration**: Optional - articles persist to database when configured
- **Async Pipeline**: Background jobs for article generation
- **OpenAI GPT-4**: Generates high-quality articles from news topics

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn app.main:app --reload --port 8001
```

### Missing OpenAI API Key
The server will start but article generation will fail. Check the logs for:
```
WARNING: OPENAI_API_KEY not set - article generation will fail
```

### Supabase Connection Issues
If Supabase credentials are invalid or missing:
- The server will still run
- Articles are stored in-memory only
- Check logs for connection warnings
