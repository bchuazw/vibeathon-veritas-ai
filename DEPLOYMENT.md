# 🚀 Deployment Guide

Complete step-by-step guide to deploy Veritas AI to production.

---

## 📋 Table of Contents

1. [Local Development](#local-development)
2. [Railway Deployment (Backend)](#railway-deployment-backend)
3. [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Verification](#post-deployment-verification)

---

## Local Development

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn
- Git

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd vibeathon-veritas-ai
```

### Step 2: Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Backend Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your API keys
# Required:
# - OPENAI_API_KEY
# - NEWSAPI_KEY (optional, has fallback)
```

### Step 4: Run Backend

```bash
# Start development server
uvicorn app.main:app --reload --port 8000

# Server will be available at:
# - API: http://localhost:8000
# - Docs: http://localhost:8000/docs
# - Health: http://localhost:8000/health
```

### Step 5: Setup Frontend

```bash
# Open a new terminal
cd web

# Install dependencies
npm install

# Install additional dependency if needed
npm install @radix-ui/react-slot
```

### Step 6: Configure Frontend Environment

```bash
# Create environment file
cp .env.local.example .env.local

# Edit .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 7: Run Frontend

```bash
npm run dev

# App will be available at:
# http://localhost:3000
```

### Running Both Together

Use two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd web
npm run dev
```

---

## Railway Deployment (Backend)

[Railway](https://railway.app) offers easy Python deployment with automatic scaling.

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your email

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Select the `backend/` directory as the root

### Step 3: Configure Environment Variables

1. Go to your project dashboard
2. Click **"Variables"** tab
3. Add the following:

```
OPENAI_API_KEY=sk-your-openai-key-here
NEWSAPI_KEY=your-newsapi-key-here
APP_NAME=Veritas AI
APP_VERSION=1.0.0
```

### Step 4: Configure Build Settings

1. Click **"Settings"** tab
2. Set **Root Directory**: `backend`
3. Set **Build Command**: (leave empty, uses Procfile)
4. Set **Start Command**: (leave empty, uses Procfile)

### Step 5: Deploy

1. Railway will auto-deploy on push
2. Or click **"Deploy"** manually
3. Wait for build to complete (2-3 minutes)

### Step 6: Get Backend URL

1. Once deployed, click on the service
2. Go to **"Settings"** → **"Public Networking"**
3. Click **"Generate Domain"**
4. Copy your URL: `https://your-app.up.railway.app`

---

## Vercel Deployment (Frontend)

[Vercel](https://vercel.com) is the optimal platform for Next.js apps.

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Verify your email

### Step 2: Import Project

1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Choose your repository
4. Click **"Import"**

### Step 3: Configure Project Settings

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `web`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
```

Replace with your actual Railway backend URL.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

### Step 6: Configure Custom Domain (Optional)

1. Go to project dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Environment Variables

### Backend Variables (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | ✅ Yes | — |
| `NEWSAPI_KEY` | NewsAPI key for news data | ⚠️ Optional | — |
| `APP_NAME` | Application name | ❌ No | "Veritas AI" |
| `APP_VERSION` | Version string | ❌ No | "1.0.0" |
| `DEBUG` | Debug mode | ❌ No | false |
| `NEWSAPI_BASE_URL` | NewsAPI endpoint | ❌ No | https://newsapi.org/v2 |
| `NEWSAPI_PAGE_SIZE` | Results per request | ❌ No | 20 |
| `OPENAI_MODEL` | GPT model to use | ❌ No | gpt-4 |
| `OPENAI_MAX_TOKENS` | Max tokens per request | ❌ No | 2000 |
| `OPENAI_TEMPERATURE` | Creativity (0-1) | ❌ No | 0.7 |
| `MAX_RETRIES` | Pipeline retry attempts | ❌ No | 3 |
| `RETRY_DELAY` | Retry delay (seconds) | ❌ No | 1.0 |

### Frontend Variables (.env.local)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ Yes | https://api.veritas-ai.com |

---

## Post-Deployment Verification

After deploying, verify everything works:

### 1. Health Check

```bash
curl https://your-backend.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": 1704067200.123
}
```

### 2. API Docs

Open in browser:
```
https://your-backend.up.railway.app/docs
```

Should show interactive Swagger UI.

### 3. Test Article Generation

```bash
curl -X POST https://your-backend.up.railway.app/api/news/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "technology news", "target_length": 300}'
```

### 4. Frontend Connectivity

Open your Vercel app and verify:
- ✅ Page loads without errors
- ✅ Can trigger article generation
- ✅ Pipeline status updates in real-time
- ✅ Articles display correctly

### 5. CORS Check

If frontend can't connect to backend, verify CORS:

```bash
curl -H "Origin: https://your-frontend.vercel.app" \
  -I https://your-backend.up.railway.app/health
```

Should see:
```
Access-Control-Allow-Origin: *
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 errors | Check Railway logs for API key errors |
| CORS errors | Backend has `allow_origins=["*"]` configured |
| Slow responses | NewsAPI may be slow; check fallback works |
| Build failures | Verify Node.js 18+ for frontend |

---

## 🎉 Success!

Your Veritas AI instance is now live and ready to generate news articles autonomously!

### Next Steps

1. Set up monitoring (Railway has built-in logs)
2. Configure custom domains
3. Add authentication if needed
4. Set up database persistence (Supabase)

### Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Next.js Docs: https://nextjs.org/docs
