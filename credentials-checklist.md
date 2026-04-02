# Vibeathon Veritas AI — API Keys & Credentials Checklist

> **Project:** Veritas AI — Real-time AI Fact-Checking System  
> **Event:** Vibeathon 7-Day Hackathon  
> **Created:** 2026-04-01  
> **Status:** 🟡 In Progress — Section 2 keys needed

---

## Section 1: Already Available ✅

These credentials are already configured in Gladys's workspace and ready to use.

| Service | Account/Key | Status | Use For |
|---------|-------------|--------|---------|
| **OpenAI** | GPT-5.4 API Key | ✅ Ready | LLM processing, fact analysis, content generation |
| **Google** | gladys.tech.aipa@gmail.com | ✅ Ready | Signups, OAuth, email notifications |
| **GitHub** | bchuazw + PAT | ✅ Ready | Code repo, CI/CD, project hosting |
| **Render** | API Key (rnd_*) | ✅ Ready | Cloud hosting, deployments |
| **Uniswap** | Trading API Key | ✅ Ready | Token swaps (if monetization feature) |
| **Cursor** | Cloud Agent API | ✅ Ready | AI coding assistance |
| **BNB Chain** | Testnet Wallet (0x8713...88fF) | ✅ Ready | Blockchain features, crypto payments |

### Quick Access
- OpenAI Key: `accounts/openai-gpt-5.4.md`
- Google Account: `accounts/google.md`
- GitHub Token: `accounts/github.md`
- Render Key: `accounts/render.md`
- Uniswap Key: `accounts/uniswap.md`
- Cursor Key: `accounts/cursor.md`
- Wallet Info: `accounts/bnb-wallet.md`

---

## Section 2: Need to Create 📝

These are **essential** for the Veritas AI fact-checking system. Sign up and add keys to `accounts/` folder.

### 2.1 Supabase — Database & Auth
| Field | Details |
|-------|---------|
| **Service** | Supabase |
| **Purpose** | PostgreSQL database, real-time subscriptions, user auth |
| **Signup URL** | https://supabase.com |
| **Free Tier** | 500MB database, 2GB bandwidth, 50K auth users |
| **7-Day Cost** | $0 (free tier sufficient) |
| **Priority** | 🔴 **Must Have** |
| **Notes** | Use Google account for signup. Need: Project URL + anon key + service_role key |

### 2.2 Serper.dev — Google Search API
| Field | Details |
|-------|---------|
| **Service** | Serper (Google Search API) |
| **Purpose** | Real-time web search for fact verification |
| **Signup URL** | https://serper.dev |
| **Free Tier** | 2,500 searches/month |
| **7-Day Cost** | $0 (2,500 searches plenty for hackathon) |
| **Priority** | 🔴 **Must Have** |
| **Notes** | Alternative: Google Custom Search API (100 queries/day free) |

### 2.3 NewsAPI — News Verification
| Field | Details |
|-------|---------|
| **Service** | NewsAPI.org |
| **Purpose** | News article search and verification |
| **Signup URL** | https://newsapi.org |
| **Free Tier** | 100 requests/day |
| **7-Day Cost** | $0 (developer tier) |
| **Priority** | 🟡 **Should Have** |
| **Notes** | Good for cross-referencing claims with news sources |

### 2.4 Pinecone — Vector Database
| Field | Details |
|-------|---------|
| **Service** | Pinecone |
| **Purpose** | Store fact-check embeddings, semantic search |
| **Signup URL** | https://www.pinecone.io |
| **Free Tier** | 1 pod, 100K vectors, 2GB storage |
| **7-Day Cost** | $0 (free tier) |
| **Priority** | 🟡 **Should Have** |
| **Notes** | Alternative: Supabase pgvector (free, same account) |

### 2.5 Twitter/X API v2 — Social Media Fact Checking
| Field | Details |
|-------|---------|
| **Service** | X (Twitter) API v2 |
| **Purpose** | Fetch tweets for fact-checking, post results |
| **Signup URL** | https://developer.twitter.com/en/portal/dashboard |
| **Free Tier** | 1,500 tweets/month read limit |
| **7-Day Cost** | $0 (Basic tier) or $100/mo (Pro if higher limits needed) |
| **Priority** | 🟡 **Should Have** |
| **Notes** | Use Google account. Free tier may be sufficient for demo. |

---

## Section 3: Nice to Have ✨

Optional enhancements that could add polish but aren't critical for MVP.

### 3.1 ElevenLabs — Voice Synthesis
| Field | Details |
|-------|--------- |
| **Service** | ElevenLabs |
| **Purpose** | Voice narration for fact-check results (accessibility) |
| **Signup URL** | https://elevenlabs.io |
| **Free Tier** | 10K characters/month (~10 min audio) |
| **7-Day Cost** | $0 (free tier) |
| **Priority** | 🟢 **Nice to Have** |
| **Notes** | Great for demo video or accessibility features |

### 3.2 Cloudflare R2 — File Storage
| Field | Details |
|-------|---------|
| **Service** | Cloudflare R2 |
| **Purpose** | Image/screenshot storage for evidence |
| **Signup URL** | https://dash.cloudflare.com |
| **Free Tier** | 10GB/month, 1M operations |
| **7-Day Cost** | $0 (free tier) |
| **Priority** | 🟢 **Nice to Have** |
| **Notes** | Alternative: Supabase Storage (already using Supabase) |

### 3.3 Perplexity API — AI Search
| Field | Details |
|-------|---------|
| **Service** | Perplexity API |
| **Purpose** | AI-powered search with citations |
| **Signup URL** | https://www.perplexity.ai/settings/api |
| **Free Tier** | $5 credit (one-time) |
| **7-Day Cost** | ~$5-10 if usage exceeds credit |
| **Priority** | 🟢 **Nice to Have** |
| **Notes** | Alternative to Serper with built-in AI summarization |

### 3.4 PostHog — Analytics
| Field | Details |
|-------|---------|
| **Service** | PostHog |
| **Purpose** | Product analytics, user behavior tracking |
| **Signup URL** | https://posthog.com |
| **Free Tier** | 1M events/month, 5K recordings |
| **7-Day Cost** | $0 (free tier) |
| **Priority** | 🟢 **Nice to Have** |
| **Notes** | Track fact-check usage patterns for demo metrics |

---

## Quick Start Checklist

### Day 1 Setup Tasks
- [ ] Sign up for Supabase (use Google account)
- [ ] Sign up for Serper.dev
- [ ] Create Supabase project, save URL + keys
- [ ] Store all new keys in `accounts/` folder
- [ ] Test OpenAI integration (already have key)
- [ ] Test database connection

### Before Demo Day
- [ ] Verify all API keys are working
- [ ] Check rate limits won't be exceeded
- [ ] Set up error handling for API failures
- [ ] Document any API keys shared with team

---

## Key Storage Format

When adding new keys to `accounts/` folder, use this format:

```markdown
# Service Name — Description

## API Key
key_here_or_masked

## Notes
- Signup email: gladys.tech.aipa@gmail.com
- Created: YYYY-MM-DD
- Free tier limits: X requests/month
```

---

## Cost Summary (7-Day Hackathon)

| Category | Est. Cost |
|----------|-----------|
| **Must Have** (Section 2) | $0 |
| **Should Have** (Section 2) | $0-100 (only if Twitter Pro needed) |
| **Nice to Have** (Section 3) | $0-10 |
| **Total** | **$0-110** |

> 💡 **Tip:** Start with all free tiers. Only upgrade if you hit limits during testing.

---

## Team Access

If sharing keys with hackathon teammates:
1. Create a shared `.env.example` file (no real values)
2. Share actual keys via secure method (not in GitHub!)
3. Consider creating separate API keys for each teammate where possible
4. Revoke/rotate keys after hackathon

---

*Last updated: 2026-04-01 by Gladys*
