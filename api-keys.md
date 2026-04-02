# Veritas AI API Keys

## ⚠️ Manual Sign-up Required

All four services require manual sign-up due to CAPTCHA protections and email verification. Below are the step-by-step instructions for each service.

---

## Credentials to Use

**Google Account:**
- **Email:** gladys.tech.aipa@gmail.com
- **Password:** Gladysisthebest!

---

## 1. Supabase (https://supabase.com)

### Sign-up Steps:
1. Go to https://supabase.com/dashboard/sign-up
2. Click "Continue with GitHub" OR use email signup
3. If using email:
   - Email: `gladys.tech.aipa@gmail.com`
   - Password: Create a new secure password (save it!)
4. Complete the CAPTCHA challenge
5. Verify email if required

### Create Project:
1. After login, click "New Project"
2. Organization: Select or create your organization
3. Project name: `veritas-ai`
4. Database password: Generate a secure one
5. Region: Choose closest to your users (e.g., Singapore)
6. Click "Create new project"

### Get API Keys:
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL:** `https://[project-ref].supabase.co`
   - **Anon Key:** (starts with `eyJ...`)

### Supabase Settings:
- **Project URL:** (fill in after creation)
- **Anon Key:** (fill in after creation)

---

## 2. Serper.dev (https://serper.dev)

### Sign-up Steps:
1. Go to https://serper.dev
2. Click "Sign up" button
3. Fill in the form:
   - First name: `Gladys`
   - Last name: `AI`
   - Email: `gladys.tech.aipa@gmail.com`
   - Password: `Gladysisthebest!`
4. Complete the reCAPTCHA challenge
5. Submit the form

### Get API Key:
1. After login, go to Dashboard
2. The API key will be displayed on the main dashboard
3. Copy the API key (starts with a long string)

### Serper.dev Settings:
- **API Key:** (fill in after registration)

---

## 3. NewsAPI (https://newsapi.org)

### Sign-up Steps:
1. Go to https://newsapi.org/register
2. Select "I am an individual 👤"
3. Fill in the form:
   - Name: `Gladys AI`
   - Email: `gladys.tech.aipa@gmail.com`
   - Password: Create a secure password
4. Agree to terms
5. Submit registration
6. Check email for verification link and click it

### Get API Key:
1. After email verification and login
2. Go to https://newsapi.org/account
3. Copy the API key displayed

### NewsAPI Settings:
- **API Key:** (fill in after registration)

---

## 4. Pinecone (https://pinecone.io)

### Sign-up Steps:
1. Go to https://pinecone.io
2. Click "Sign up" or "Get started"
3. Click "Continue with Google"
4. Select/sign in with: `gladys.tech.aipa@gmail.com`
5. Complete any verification steps
6. Select the "Free" plan (100K vectors, 1 pod)

### Create Index:
1. After login, go to Dashboard
2. Click "Create Index"
3. Index name: `veritas-sources`
4. Dimensions: `1536` (for OpenAI embeddings) or `768` (for other models)
5. Metric: `cosine`
6. Pod type: `starter` (free tier)
7. Create the index

### Get API Key:
1. Go to API Keys section in the dashboard
2. Copy the API key value
3. Note the Environment (e.g., `us-east1-gcp` or similar)

### Pinecone Settings:
- **API Key:** (fill in after registration)
- **Environment:** (fill in after registration - e.g., `us-east1-gcp`)
- **Index Name:** `veritas-sources`

---

## Summary Table (Fill in after sign-up)

| Service | Status | API Key / URL | Notes |
|---------|--------|---------------|-------|
| Supabase | ⬜ Pending | Project URL: ___<br>Anon Key: ___ | Create project "veritas-ai" |
| Serper.dev | ⬜ Pending | API Key: ___ | 2,500 free searches/month |
| NewsAPI | ⬜ Pending | API Key: ___ | 100 requests/day |
| Pinecone | ⬜ Pending | API Key: ___<br>Environment: ___ | Index: veritas-sources |

---

## Important Notes

1. **Use FREE tiers only** - Do not enter payment information
2. **Save all API keys securely** - They won't be shown again
3. **Supabase project** takes a few minutes to provision after creation
4. **NewsAPI** requires email verification before the API key works
5. **Pinecone** free tier is limited but sufficient for the hackathon

## Next Steps After Sign-up

Once all services are signed up and API keys are obtained:
1. Update this file with the actual API keys
2. Store keys in environment variables for the application
3. Test each API connection
4. Begin building the Veritas AI application
