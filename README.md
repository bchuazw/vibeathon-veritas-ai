# Veritas AI ✨

> AI-powered autonomous news generation system. Scout, research, write, and publish breaking news articles — fully automated.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-cyan.svg)](https://tailwindcss.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991.svg)](https://openai.com)

---

## 🏗️ Architecture

Veritas AI uses a **3-agent pipeline architecture** that mimics a real newsroom:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   🔍 Scout      │────▶│   ✍️ Creator    │────▶│   📰 Publisher  │
│   Agent         │     │   Agent         │     │   Agent         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
• Monitor news    │     • Research topic│     • SEO optimize  │
• Score relevance │     • Write draft   │     • Add metadata  │
• Enrich sources  │     • Fact-check    │     • Format output │
└─────────────────┘     • AP Style edit   │     └─────────────────┘
                        └─────────────────┘
```

### Agent Responsibilities

| Agent | Role | Key Tasks |
|-------|------|-----------|
| **Scout** | News Discovery | Monitors NewsAPI, scores relevance, enriches sources |
| **Creator** | Content Production | Research, writing, fact-checking, AP Style editing |
| **Publisher** | Distribution | SEO optimization, metadata, formatting, social previews |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- API keys: [OpenAI](https://platform.openai.com), [NewsAPI](https://newsapi.org)

### 1. Clone & Setup

```bash
git clone <repository-url>
cd vibeathon-veritas-ai

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup frontend
cd ../web
npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your API keys

# Frontend
cd ../web
cp .env.local.example .env.local
# Edit .env.local with backend URL
```

### 3. Run Development Servers

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd web
npm run dev
```

### 4. Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📡 API Documentation

### Health Check
```http
GET /health
```

### Generate Article (Synchronous)
```http
POST /api/news/generate
Content-Type: application/json

{
  "topic": "AI breakthroughs in 2024",
  "keywords": ["artificial intelligence", "technology"],
  "target_length": 400
}
```

### Start Breaking News Job (Async)
```http
GET /api/news/breaking?category=technology
```

### Check Job Status
```http
GET /api/news/status/{job_id}
```

### Get Published Article
```http
GET /api/news/article/{article_id}
```

### Search Topics
```http
GET /api/news/topics?query=climate change
```

---

## 📸 Screenshots

> _Screenshots to be added after UI completion_

| Dashboard | Article View | Pipeline Status |
|-----------|--------------|-----------------|
| _TBD_ | _TBD_ | _TBD_ |

---

## 📁 Project Structure

```
vibeathon-veritas-ai/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── agents/         # Scout, Creator, Publisher agents
│   │   ├── api/            # API routes
│   │   ├── integrations/   # OpenAI, NewsAPI clients
│   │   ├── models/         # Pydantic models
│   │   ├── pipeline/       # Pipeline orchestration
│   │   ├── config.py       # Settings management
│   │   └── main.py         # FastAPI entry point
│   ├── requirements.txt
│   └── .env.example
├── web/                    # Next.js frontend
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   ├── app/                # App router pages
│   ├── package.json
│   └── tailwind.config.ts
├── database/               # Database schema
│   └── schema.sql          # Supabase PostgreSQL schema
├── deployment/             # Deployment configs
│   ├── railway.json        # Railway deployment
│   └── vercel.json         # Vercel deployment
├── README.md               # This file
├── DEPLOYMENT.md           # Deployment guide
├── API_KEYS.md             # API key setup
└── PROJECT_STATUS.md       # Current status
```

---

## 🔧 Tech Stack

### Backend
- **FastAPI** — Modern Python web framework
- **Pydantic** — Data validation
- **OpenAI** — GPT-4 for content generation
- **NewsAPI** — Breaking news data source
- **Uvicorn** — ASGI server

### Frontend
- **Next.js 15** — React framework
- **TypeScript** — Type safety
- **TailwindCSS** — Utility-first styling
- **TanStack Query** — Data fetching
- **Lucide React** — Icons

### Database & Deployment
- **Supabase** — PostgreSQL database
- **Railway** — Backend hosting
- **Vercel** — Frontend hosting

---

## 📄 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Step-by-step deployment guide
- **[API_KEYS.md](API_KEYS.md)** — How to get required API keys
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** — Current completion status

---

## 📝 License

MIT License — Built for the Vibeathon hackathon.

---

Built with ✨ by the Veritas AI team.
