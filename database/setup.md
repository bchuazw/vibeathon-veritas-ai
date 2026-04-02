# Veritas AI - Supabase Setup Guide

This guide walks you through setting up Supabase for the Veritas AI multi-agent news system.

## Prerequisites

- A Supabase account (free tier works fine)
- Node.js 18+ and npm/yarn
- Your Next.js application ready

---

## Step 1: Create a Supabase Project

### 1.1 Sign Up / Log In
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or sign in to your existing account
3. You can sign up with GitHub, GitLab, or email

### 1.2 Create New Project
1. Click **"New Project"**
2. Select your organization (or create one)
3. Fill in project details:
   - **Name**: `veritas-ai` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `Southeast Asia (Singapore)`)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning to complete

---

## Step 2: Run the Database Schema

### 2.1 Open SQL Editor
1. In your Supabase dashboard, click the **"SQL Editor"** tab in the left sidebar
2. Click **"New query"**
3. Name your query: `veritas-schema`

### 2.2 Run the Schema
1. Open `schema.sql` from this folder
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)

You should see green checkmarks for:
- Tables created: `articles`, `agent_logs`, `sources`
- Indexes created
- RLS policies enabled
- Functions created

### 2.3 Verify Tables
1. Click **"Table Editor"** in the left sidebar
2. You should see three tables:
   - `articles`
   - `agent_logs`
   - `sources`

---

## Step 3: Seed Sample Data (Optional)

To add sample data for testing:

1. In SQL Editor, create a new query
2. Copy contents of `seed.sql` from this folder
3. Run the query
4. Verify in Table Editor that articles and logs appear

---

## Step 4: Get Your API Keys

### 4.1 Project URL and Anon Key
1. In Supabase dashboard, click **"Project Settings"** (gear icon)
2. Click **"API"** in the left menu
3. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **anon public** key (starts with `eyJ...`)

### 4.2 Service Role Key (For Server-side Only)
- Also on the API page, copy the **service_role** key
- ⚠️ **IMPORTANT**: Never expose this key in client-side code
- Use it only in serverless functions or backend APIs

---

## Step 5: Configure Environment Variables

### 5.1 Create .env.local in your Next.js app

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5.2 For Server-side Operations (Optional)

If you need admin operations, also add:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5.3 Restart Your Dev Server

After adding environment variables, restart Next.js:

```bash
npm run dev
```

---

## Step 6: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## Step 7: Test the Connection

Create a test file `test-db.ts`:

```typescript
import { supabase, listArticles } from './database/supabase-client';

async function testConnection() {
  try {
    // Test listing published articles
    const articles = await listArticles(5);
    console.log('✅ Connection successful!');
    console.log(`Found ${articles.length} articles`);
    
    if (articles.length > 0) {
      console.log('First article:', articles[0].headline);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
```

Run it:
```bash
npx ts-node test-db.ts
```

---

## Row Level Security (RLS) Explained

The schema includes RLS policies for security:

| Table | Public Access | Service Role |
|-------|--------------|--------------|
| articles | Read published only | Full CRUD |
| agent_logs | Read only | Insert only |
| sources | Read only | Full CRUD |

### Why This Matters
- **Public users** can only read published articles and logs (transparency)
- **Service role** (your backend) can create, update, and manage everything
- **No authentication required** for reading - articles are publicly accessible

---

## Troubleshooting

### "Failed to fetch" or connection errors
- Check that `NEXT_PUBLIC_SUPABASE_URL` is correct (includes `https://`)
- Verify the `anon` key is complete (not truncated)
- Ensure your IP isn't blocked in Supabase Settings > Database > Network Bans

### "new row violates row-level security policy"
- You're trying to insert from the client without proper setup
- Use the service role key for insertions (server-side only)
- Or set up proper user authentication if you want users to create content

### Tables don't appear in Table Editor
- Refresh the page
- Check SQL Editor for any errors in schema execution
- Verify you're in the correct project

### "relation does not exist"
- Schema hasn't been run yet
- Run `schema.sql` in the SQL Editor first

---

## Next Steps

1. ✅ Database schema created
2. ✅ RLS policies configured
3. ✅ API keys set up
4. ✅ Environment variables configured
5. ➡️ Start building your agents that use these tables!

## Useful Links

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Postgres Full Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

---

## File Structure

```
database/
├── schema.sql          # Full database schema with RLS
├── supabase-client.ts  # TypeScript client functions
├── types.ts            # TypeScript type definitions
├── seed.sql            # Sample data for testing
└── setup.md            # This file
```

---

## Quick Reference: Common Operations

### Insert new article (server-side with service role)
```typescript
import { createArticle } from './database/supabase-client';

const article = await createArticle({
  headline: 'Your Article Title',
  summary: 'Brief summary',
  body: 'Full article content...',
  status: 'draft',
  confidence: 85,
  sources: [{ url: 'https://...', title: 'Source', domain: 'example.com' }]
});
```

### List published articles
```typescript
import { listArticles } from './database/supabase-client';

const articles = await listArticles(10); // Get 10 latest
```

### Log agent activity
```typescript
import { logAgentActivity } from './database/supabase-client';

await logAgentActivity({
  article_id: articleId,
  agent: 'scout',
  action: 'research_started',
  details: { query: 'search terms' }
});
```
