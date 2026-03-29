# Keys Reference - web-landing/

> **⚠️ SENSITIVE INFORMATION** - Do not commit this file with actual values to public repositories.
> This document lists all API keys, secrets, and configuration values used in the web-landing project.

---

## 1. Supabase

| Key                 | Value                                                                                                                                                                                                              | Usage                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `SUPABASE_URL`      | `https://zvpudxinbcsrfyojrhhv.supabase.co`                                                                                                                                                                         | Supabase project endpoint                                 |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cHVkeGluYmNzcmZ5b2pyaGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTE3MjksImV4cCI6MjA4MjUyNzcyOX0.5vV65qusPzu7847VxbiodRU0DZG1AryUuoklX3qFAWk` | Supabase anonymous API key (public, safe for client-side) |

**Files using these:**

- `campaign-modal.js` (lines 23-26)
- `auth-callback.html` (lines 93-94)
- All HTML landing pages (tracking section)

**Next.js equivalent:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://zvpudxinbcsrfyojrhhv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Google Tag Manager (GTM)

| Key      | Value          | Usage            |
| -------- | -------------- | ---------------- |
| `GTM_ID` | `GTM-KFK8WHV5` | GTM Container ID |

**Files using this:**

- All HTML landing pages (head script + noscript fallback)

**Next.js equivalent:**

```env
NEXT_PUBLIC_GTM_ID=GTM-KFK8WHV5
```

---

## 3. Reddit Pixel

| Key               | Value             | Usage                          |
| ----------------- | ----------------- | ------------------------------ |
| `REDDIT_PIXEL_ID` | `a2_i1xf5fcreuso` | Reddit Ads conversion tracking |

**Files using this:**

- `spoon-saver.html` (head script)
- `top-suspect.html` (head script)
- `flare-forecast.html` (head script)
- `crash-prevention.html` (head script)

**Note:** `index.html`, `auth-callback.html`, and `tracking.html` do NOT include Reddit Pixel.

**Next.js equivalent:**

```env
NEXT_PUBLIC_REDDIT_PIXEL_ID=a2_i1xf5fcreuso
```

---

## 4. Google OAuth (Supabase Auth Provider)

| Key             | Value                                                                     | Usage                      |
| --------------- | ------------------------------------------------------------------------- | -------------------------- |
| `client_id`     | `57139079584-grq71jj08i1o84etbfek2s64tqt71fja.apps.googleusercontent.com` | Google OAuth Client ID     |
| `client_secret` | `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`                                     | Google OAuth Client Secret |
| `project_id`    | `gen-lang-client-0399129918`                                              | Google Cloud Project ID    |

**Source file:** `client_secret_57139079584-grq71jj08i1o84etbfek2s64tqt71fja.apps.googleusercontent.com.json`

**Configured redirect URIs:**

- `http://localhost:3000/api/auth/callback/google`
- `https://chroniclife.app/api/auth/callback/google`

**Note:** The `client_secret` is configured in Supabase Dashboard → Authentication → Providers → Google. The client-side code only needs the redirect URL, not the secret.

---

## 5. OpenAI API

| Key              | Value                                              | Usage                                 |
| ---------------- | -------------------------------------------------- | ------------------------------------- |
| `OPENAI_API_KEY` | _(Set via `window.OPENAI_API_KEY` or server-side)_ | AI summary generation, chat responses |

**Files using this:**

- `campaign-modal.js` (lines 1692, 1725, 1980, 2017, 2155-2157, 2168, 2179)
- `lib/summary-agent.js` (line 9 - expects key passed as parameter)

**How it's used:**

```javascript
// In campaign-modal.js
const OPENAI_API_KEY =
  (typeof window !== 'undefined' && window.OPENAI_API_KEY) || '';
```

**Next.js equivalent (server-side only!):**

```env
OPENAI_API_KEY=sk-...
```

**⚠️ Important:** Never expose the OpenAI API key on the client-side. Use a server-side API route or Supabase Edge Function.

---

## 6. Domain Configuration

| Key                  | Value                  | Usage                      |
| -------------------- | ---------------------- | -------------------------- |
| Production Domain    | `chroniclife.app`      | Main production URL        |
| Supabase Project Ref | `zvpudxinbcsrfyojrhhv` | Supabase project reference |

---

## Summary: Environment Variables for Next.js Migration

Create a `.env.local` file in `web-landing-next/`:

```env
# Supabase (public - safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://zvpudxinbcsrfyojrhhv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cHVkeGluYmNzcmZ5b2pyaGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTE3MjksImV4cCI6MjA4MjUyNzcyOX0.5vV65qusPzu7847VxbiodRU0DZG1AryUuoklX3qFAWk

# GTM (public)
NEXT_PUBLIC_GTM_ID=GTM-KFK8WHV5

# Reddit Pixel (public)
NEXT_PUBLIC_REDDIT_PIXEL_ID=a2_i1xf5fcreuso

# OpenAI (SERVER-SIDE ONLY - never prefix with NEXT_PUBLIC_)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## Security Notes

1. **Supabase Anon Key**: Safe for client-side use (protected by Row Level Security)
2. **GTM ID**: Public by design
3. **Reddit Pixel ID**: Public by design
4. **Google OAuth Client Secret**: Should be configured in Supabase Dashboard only, not exposed in client code
5. **OpenAI API Key**: Must be kept server-side only. Use API routes or Edge Functions.

---

## Where Keys Are Used

| File                                                                                   | Keys Used                                 |
| -------------------------------------------------------------------------------------- | ----------------------------------------- |
| `campaign-modal.js`                                                                    | Supabase URL/Key, OpenAI API Key          |
| `lib/summary-agent.js`                                                                 | OpenAI API Key (passed as parameter)      |
| `auth-callback.html`                                                                   | Supabase URL/Key                          |
| `index.html`                                                                           | GTM ID, Supabase URL/Key                  |
| `spoon-saver.html`, `top-suspect.html`, `flare-forecast.html`, `crash-prevention.html` | GTM ID, Reddit Pixel ID, Supabase URL/Key |
| `tracking.html`                                                                        | GTM ID, Supabase URL/Key                  |
| `client_secret_*.json`                                                                 | Google OAuth credentials                  |

---

_Last updated: January 2026_
