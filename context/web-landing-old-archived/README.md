# Web Landing Pages - Marketing Tracking System

Landing pages for Chronic Life with comprehensive tracking for Reddit Ads, Google Analytics, and attribution analysis.

## 🎯 Overview

This directory contains 8 landing page variants, each optimized for different messaging angles, with unified tracking infrastructure:

- **Dual-layer tracking**: Supabase (first-party data) + Google Tag Manager (GA4, Reddit Pixel)
- **UTM attribution**: Full campaign parameter capture and persistence
- **Session tracking**: Groups events from the same visitor session
- **Event tracking**: Page views, CTA clicks, signup completions

## 📁 Structure

```
web-landing/
├── index.html              # Main landing page
├── predict-flares.html     # Flare prediction angle
├── doctor-proof.html       # Doctor trust angle
├── appointment-prep.html   # Appointment preparation angle
├── find-triggers.html      # Trigger discovery angle
├── foggy-minds.html        # Brain fog angle
├── spoon-saver.html        # Energy conservation angle
├── tracking.html           # Internal dashboard (password protected)
├── migrations/             # Database schema
│   └── 001_create_marketing_tables.sql
├── v2/                     # Campaign planning docs
└── vercel.json             # Deployment config
```

## tracking Architecture

### Three-Layer Tracking System

```
┌─────────────────────────────────────────┐
│  1. Client-Side (Browser)               │
│     - UTM capture & session storage     │
│     - Event tracking via Supabase       │
│     - GTM dataLayer events              │
└─────────────────────────────────────────┘
              │
              ├─────────────────┐
              │                 │
┌─────────────▼─────┐  ┌────────▼────────────┐
│  2. Supabase      │  │  3. Google Tag      │
│     (First-party) │  │     Manager         │
│                   │  │                     │
│  - marketing_events│  │  - GA4 events      │
│  - beta_signups   │  │  - Reddit Pixel    │
│  - Attribution DB │  │  - Custom events    │
└───────────────────┘  └─────────────────────┘
```

### UTM Parameter Tracking

All landing pages automatically capture and persist UTM parameters:

- `utm_source` - Traffic source (e.g., "reddit")
- `utm_medium` - Medium (e.g., "paid", "social")
- `utm_campaign` - Campaign name (e.g., "clarity_experiment")
- `utm_content` - Ad variant/content (e.g., "predict_flares")
- `utm_term` - Keyword/targeting (optional)

**Storage**: UTM params are stored in `sessionStorage` and persist across page navigation within the same session.

**Example URL**:

```
https://chroniclife.app/predict-flares?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=predict_flares
```

### Tracked Events

| Event Type        | When Fired             | Data Captured                              |
| ----------------- | ---------------------- | ------------------------------------------ |
| `page_view`       | Page load              | UTM params, page URL, referrer, session ID |
| `cta_click`       | Any CTA button clicked | Element ID, button text, UTM params        |
| `signup_complete` | Email form submitted   | Email, all UTM params, landing URL         |

### Session Tracking

Each visitor gets a unique `session_id` (format: `sess_{timestamp}_{random}`) stored in `sessionStorage`. All events in the same session share this ID, enabling:

- Journey analysis (page views → CTA clicks → signups)
- Attribution for multi-step conversions
- Session replay and debugging

## 🗄️ Database Schema

### `marketing_events` Table

Tracks all user interactions on landing pages.

```sql
CREATE TABLE marketing_events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,        -- 'page_view', 'cta_click', 'signup_complete'
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  element_id TEXT,                 -- CTA identifier
  element_text TEXT,               -- Button text
  page_url TEXT,
  referrer TEXT,
  session_id TEXT,                 -- Groups events from same visit
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Indexes**:

- `idx_marketing_events_campaign` - Fast campaign queries
- `idx_marketing_events_session` - Session journey analysis
- `idx_marketing_events_created` - Time-based queries

### `beta_signups` Table

Captures email signups with full attribution.

```sql
CREATE TABLE beta_signups (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  landing_url TEXT,                -- Which landing page
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Indexes**:

- `idx_beta_signups_campaign` - Campaign performance
- `idx_beta_signups_created` - Time-series analysis

## 🚀 Setup

### 1. Database Setup

Run the migration in Supabase SQL Editor:

```bash
# File: migrations/001_create_marketing_tables.sql
# Execute in: https://supabase.com/dashboard/project/{project_id}/sql
```

This creates tables, indexes, and RLS policies for anonymous inserts.

### 2. Google Tag Manager Setup

All pages include GTM container `GTM-KFK8WHV5`:

```html
<!-- Head -->
<script>
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-KFK8WHV5');
</script>

<!-- Body -->
<noscript
  ><iframe
    src="https://www.googletagmanager.com/ns.html?id=GTM-KFK8WHV5"
    height="0"
    width="0"
    style="display:none;visibility:hidden"
  ></iframe
></noscript>
```

**Configure in GTM**:

1. **Google Analytics 4** - Add GA4 Configuration tag
2. **Reddit Pixel** - Add Reddit Conversion tag
3. **Custom Events** - Push `dataLayer` events for `cta_click`, `signup_complete`

### 3. Supabase Configuration

Each landing page has embedded Supabase config:

```javascript
const SUPABASE_URL = 'https://zvpudxinbcsrfyojrhhv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...';
```

**Update if needed**: Search and replace across all HTML files if Supabase project changes.

## 📊 Querying Data

### Campaign Performance

```sql
-- Signups by campaign
SELECT
  utm_campaign,
  utm_content,
  COUNT(*) as signups,
  COUNT(DISTINCT session_id) as unique_sessions
FROM beta_signups
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY utm_campaign, utm_content
ORDER BY signups DESC;
```

### Conversion Funnel

```sql
-- Journey: Page View → CTA Click → Signup
WITH page_views AS (
  SELECT session_id, created_at as pv_time
  FROM marketing_events
  WHERE event_type = 'page_view'
),
cta_clicks AS (
  SELECT session_id, created_at as cta_time
  FROM marketing_events
  WHERE event_type = 'cta_click'
),
signups AS (
  SELECT session_id, created_at as signup_time
  FROM marketing_events
  WHERE event_type = 'signup_complete'
)
SELECT
  COUNT(DISTINCT pv.session_id) as visitors,
  COUNT(DISTINCT cta.session_id) as cta_clickers,
  COUNT(DISTINCT s.session_id) as signups,
  ROUND(100.0 * COUNT(DISTINCT cta.session_id) / COUNT(DISTINCT pv.session_id), 2) as cta_rate,
  ROUND(100.0 * COUNT(DISTINCT s.session_id) / COUNT(DISTINCT cta.session_id), 2) as signup_rate
FROM page_views pv
LEFT JOIN cta_clicks cta ON pv.session_id = cta.session_id
LEFT JOIN signups s ON pv.session_id = s.session_id;
```

### Landing Page Performance

```sql
-- Compare landing page variants
SELECT
  SUBSTRING(page_url FROM '/([^/]+)$') as landing_page,
  utm_campaign,
  COUNT(*) as events,
  COUNT(DISTINCT CASE WHEN event_type = 'signup_complete' THEN session_id END) as signups
FROM marketing_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY landing_page, utm_campaign
ORDER BY signups DESC;
```

### CTA Performance

```sql
-- Which CTAs convert best
SELECT
  element_id,
  element_text,
  COUNT(*) as clicks,
  COUNT(DISTINCT session_id) as unique_clicks,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM marketing_events e2
    WHERE e2.session_id = marketing_events.session_id
    AND e2.event_type = 'signup_complete'
  ) THEN session_id END) as converted_sessions
FROM marketing_events
WHERE event_type = 'cta_click'
GROUP BY element_id, element_text
ORDER BY converted_sessions DESC;
```

## 🔧 Tracking Implementation

### Adding Event Tracking

All pages expose `window.ChronicLifeTracking`:

```javascript
// Track custom event
window.ChronicLifeTracking.trackEvent(
  'custom_event',
  'element_id',
  'Button Text'
);

// Get stored UTM params
const utm = window.ChronicLifeTracking.getStoredUTM();
console.log(utm.utm_campaign);
```

### CTA Click Tracking

CTAs automatically tracked via `data-modal-trigger` attribute:

```html
<a
  href="#"
  data-modal-trigger
  data-cta-id="hero_primary"
  data-cta-text="Start predicting flares"
>
  Get Started
</a>
```

Tracking captures:

- `element_id`: `data-cta-id` or fallback to element ID/section
- `element_text`: `data-cta-text` or button text (first 50 chars)
- Full UTM attribution from session storage

### GTM DataLayer Events

Push custom events to GTM for Reddit/GA4:

```javascript
// After signup (add to submitSignup function)
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'signup_complete',
  utm_campaign: utm.utm_campaign,
  utm_content: utm.utm_content,
  landing_page: window.location.pathname,
});
```

## 🐛 Troubleshooting

### Events Not Recording

1. **Check Supabase connection**:

   ```javascript
   console.log(window.ChronicLifeTracking);
   // Should log: { trackEvent: fn, submitSignup: fn, getStoredUTM: fn }
   ```

2. **Check browser console** for errors:

   - `Tracking error:` - Supabase insert failed
   - `Supabase not initialized` - Script loading issue

3. **Verify RLS policies** in Supabase:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'marketing_events';
   ```

### UTM Params Not Persisting

- Check `sessionStorage` in DevTools → Application → Session Storage
- Look for `utm_data` and `session_id` keys
- UTM params only stored if present in URL on first visit

### GTM Not Firing

1. **Verify GTM container ID**: `GTM-KFK8WHV5` in all pages
2. **Check GTM Preview mode**: https://tagassistant.google.com
3. **Verify tags configured** in GTM console for expected events

## 📈 Dashboard Access

Internal tracking dashboard: `tracking.html`

- **Password protected** (check with team for access)
- Real-time campaign metrics
- Conversion funnel visualization
- Landing page comparison

## 🔒 Privacy & Compliance

- **First-party data**: Supabase stores data directly (GDPR-friendly)
- **No PII in events**: Email only stored in `beta_signups` table
- **Session storage**: Client-side only, cleared on browser close
- **GTM consent**: Consider adding consent mode for EU visitors

## 📚 Related Documentation

- Campaign planning: `v2/PREDICTION-CAMPAIGN-MASTER.md`
- Landing page variants: See individual HTML files
- Main project README: `../README.md`

---

**Questions?** Check `CLAUDE.md` for AI assistant context on tracking implementation.
