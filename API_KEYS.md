# 🔑 API Keys Setup Guide

Complete guide to obtaining all required API keys for Veritas AI.

---

## Overview

| Service | Key Name | How to Get | Required? | Cost |
|---------|----------|------------|-----------|------|
| **MiniMax** | `MINIMAX_API_KEY` | [minimaxi.com](https://www.minimaxi.com) | ✅ Yes | Pay-as-you-go |
| **NewsAPI** | `NEWSAPI_KEY` | [newsapi.org](https://newsapi.org) | ⚠️ Optional | Free tier available |
| **Supabase** | `SUPABASE_URL`, `SUPABASE_KEY` | [supabase.com](https://supabase.com) | ✅ Yes | Free tier available |

**Note:** Veritas AI has migrated from OpenAI to MiniMax M2.7 for LLM operations.

---

## MiniMax API Key (Required)

Veritas AI uses MiniMax M2.7 for article generation, research, and fact-checking.

### Step 1: Create Account

1. Go to [minimaxi.com](https://www.minimaxi.com) or [api.minimaxi.chat](https://api.minimaxi.chat)
2. Click **"Sign up"** or **"Register"**
3. Verify your email address
4. Complete any required verification steps

### Step 2: Get API Key

1. Log in to the MiniMax platform
2. Navigate to **"API Keys"** or **"Developer"** section
3. Click **"Create API Key"** or **"Generate Key"**
4. Name it: `Veritas AI Production`
5. **⚠️ Copy the key immediately** — it won't be shown again!

### Step 3: Configure in Veritas AI

Add to your `.env` file:
```bash
MINIMAX_API_KEY=sk-api-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Model Information

| Model | Description |
|-------|-------------|
| MiniMax-M2.7 | General purpose LLM for text generation |

**Default model:** `MiniMax-M2.7`

### Pricing Reference

MiniMax uses a pay-as-you-go pricing model. Check the [MiniMax pricing page](https://www.minimaxi.com/pricing) for current rates.

**Estimated cost per article**: Similar to other LLM providers (~$0.05-0.15 USD)

---

## OpenAI (Deprecated)

**⚠️ Veritas AI no longer uses OpenAI.** The system has been migrated to MiniMax M2.7.

If you see references to `OPENAI_API_KEY` in legacy documentation, please use `MINIMAX_API_KEY` instead.

---

## NewsAPI Key (Optional)

NewsAPI provides real-time news data. Optional — system has fallback to mock data.

### Step 1: Create Account

1. Go to [newsapi.org](https://newsapi.org)
2. Click **"Get API Key"**
3. Enter your email
4. Verify your email address

### Step 2: Get API Key

1. Log in to [newsapi.org/account](https://newsapi.org/account)
2. Your API key is displayed on the dashboard
3. Copy the key (starts with alphanumeric characters)

### Step 3: Configure in Veritas AI

Add to your `.env` file:
```bash
NEWSAPI_KEY=your-newsapi-key-here
```

### Pricing Reference

| Plan | Price | Requests/Day |
|------|-------|--------------|
| Developer | Free | 100 |
| Business | $449/month | Unlimited |

**Note**: Free tier is sufficient for development and light usage.

---

## Supabase (Required)

Supabase provides the PostgreSQL database for storing articles and agent logs.

### Step 1: Create Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub or email

### Step 2: Create Project

1. Click **"New Project"**
2. Choose organization
3. Enter project name: `veritas-ai`
4. Set database password (save this!)
5. Choose region (closest to your users)
6. Click **"Create new project"**
7. Wait 2-3 minutes for provisioning

### Step 3: Get Connection Details

1. Go to **"Settings"** → **"Database"**
2. Under **"Connection string"**, select **"URI"**
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your actual password

Alternative: Use **"Project API"** credentials:
1. Go to **"Settings"** → **"API"**
2. Copy **"Project URL"** → `SUPABASE_URL`
3. Copy **"anon public"** key → `SUPABASE_KEY`

### Step 4: Run Database Schema

1. Go to **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy contents of `database/schema.sql` from this repo
4. Paste into SQL Editor
5. Click **"Run"**

### Step 5: Configure in Veritas AI

Add to your `.env` file:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Pricing Reference

| Plan | Price | Database Size |
|------|-------|---------------|
| Free | $0 | 500 MB |
| Pro | $25/month | 8 GB |
| Team | $599/month | Unlimited |

**Free tier is sufficient for initial development.**

---

## Complete .env Example

```bash
# ============================================
# Veritas AI Environment Configuration
# ============================================

# Required: MiniMax API (replaces OpenAI)
# Get from: https://www.minimaxi.com or https://api.minimaxi.chat
MINIMAX_API_KEY=sk-api-your-minimax-key-here

# Optional: NewsAPI (has fallback)
# Get from: https://newsapi.org
NEWSAPI_KEY=your-newsapi-key-here

# Required: Supabase Database
# Get from: https://supabase.com → Project Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# ============================================
# Application Settings (Optional)
# ============================================

APP_NAME=Veritas AI
APP_VERSION=1.0.0
DEBUG=false

# MiniMax Configuration
MINIMAX_MODEL=MiniMax-M2.7
MINIMAX_MAX_TOKENS=2000
MINIMAX_TEMPERATURE=0.7

# NewsAPI Configuration
NEWSAPI_BASE_URL=https://newsapi.org/v2
NEWSAPI_PAGE_SIZE=20

# Pipeline Configuration
MAX_RETRIES=3
RETRY_DELAY=1.0
```

---

## 🔒 Security Best Practices

### DO ✅

- Store API keys in environment variables
- Use different keys for development and production
- Rotate keys regularly (every 90 days)
- Set usage limits on MiniMax account
- Monitor API usage for anomalies
- Use `.env` files (already in `.gitignore`)

### DON'T ❌

- Never commit API keys to Git
- Never share keys in screenshots or logs
- Never hardcode keys in source code
- Never use the same key for multiple projects

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Verify key is copied correctly, no extra spaces |
| "Rate limit exceeded" | Check usage limits on MiniMax dashboard |
| "No news found" | NewsAPI free tier may be exhausted |
| "Database connection failed" | Verify Supabase URL and key are correct |

---

## Migration from OpenAI

If you were previously using OpenAI:

1. Replace `OPENAI_API_KEY` with `MINIMAX_API_KEY` in your `.env` file
2. Update any environment variable exports:
   ```bash
   # Old
   export OPENAI_API_KEY=sk-...
   
   # New
   export MINIMAX_API_KEY=sk-api-...
   ```
3. The API interface remains the same — no code changes needed beyond config

---

## Quick Links

- 🤖 [MiniMax Platform](https://www.minimaxi.com)
- 📰 [NewsAPI Dashboard](https://newsapi.org/account)
- 🗄️ [Supabase Dashboard](https://supabase.com/dashboard)
- 💰 [MiniMax Pricing](https://www.minimaxi.com/pricing)
- 📊 [Supabase Pricing](https://supabase.com/pricing)
