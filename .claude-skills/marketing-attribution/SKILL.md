---
name: marketing-attribution
description: Track marketing campaign performance for Chronic Life. Generate UTM URLs for Reddit ads, capture events to Supabase, and analyze conversion funnels. Use consistent naming conventions across all campaigns.
license: Internal use only
---

This skill guides marketing attribution implementation for Chronic Life landing pages. It covers UTM parameter conventions, Supabase event tracking, and campaign analysis.

## UTM Parameter Conventions

### Standard Parameters

| Parameter      | Purpose                 | Format                | Examples                                                       |
| -------------- | ----------------------- | --------------------- | -------------------------------------------------------------- |
| `utm_source`   | Traffic source platform | lowercase, no spaces  | `reddit`, `google`, `facebook`, `instagram`, `tiktok`, `email` |
| `utm_medium`   | Marketing medium type   | lowercase             | `cpc` (paid), `social` (organic), `email`, `referral`          |
| `utm_campaign` | Campaign identifier     | `{condition}_{angle}` | `endo_pain`, `pcos_fatigue`, `longcovid_brainfog`              |
| `utm_content`  | Ad variant identifier   | `{format}_{version}`  | `image_v1`, `text_v2`, `video_v1`, `carousel_v1`               |
| `utm_term`     | Keywords (search ads)   | keyword phrase        | `symptom+tracker`, `chronic+illness+app`                       |

### URL Builder

**Base URL:** `https://chroniclife.app`

**Full Example:**

```
https://chroniclife.app?utm_source=reddit&utm_medium=cpc&utm_campaign=endo_pain&utm_content=image_v1
```

### Campaign Naming Matrix (Reddit)

| Condition   | Angle Options                   | Example Campaign     |
| ----------- | ------------------------------- | -------------------- |
| `endo`      | pain, fatigue, tracking, doctor | `endo_pain`          |
| `pcos`      | fatigue, cycles, hormones       | `pcos_fatigue`       |
| `longcovid` | brainfog, energy, recovery      | `longcovid_brainfog` |
| `fibro`     | pain, flares, management        | `fibro_flares`       |
| `chronic`   | general, tracking, evidence     | `chronic_tracking`   |

### Content Variants

| Format        | Description          | Version Pattern        |
| ------------- | -------------------- | ---------------------- |
| `image`       | Static image ad      | `image_v1`, `image_v2` |
| `text`        | Text-only ad         | `text_v1`, `text_v2`   |
| `video`       | Video ad             | `video_v1`, `video_v2` |
| `carousel`    | Multi-image carousel | `carousel_v1`          |
| `testimonial` | User quote focus     | `testimonial_v1`       |

## Supabase Schema

### Tables

**`beta_signups`** - Email captures (full conversions)

```sql
CREATE TABLE beta_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  landing_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`marketing_events`** - Page views and CTA clicks

```sql
CREATE TABLE marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,  -- 'page_view', 'cta_click', 'signup_complete'
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  element_id TEXT,
  element_text TEXT,
  page_url TEXT,
  referrer TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Event Types

| Event             | Description          | When Fired                      |
| ----------------- | -------------------- | ------------------------------- |
| `page_view`       | User landed on page  | Page load                       |
| `cta_click`       | User clicked any CTA | Click on `[data-modal-trigger]` |
| `signup_complete` | User submitted email | Form submission success         |

## Tracking Implementation

### JavaScript Integration

```javascript
// Initialize Supabase
const SUPABASE_URL = 'https://zvpudxinbcsrfyojrhhv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_...'; // Get from Supabase dashboard > Settings > API
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Capture UTM on page load
function captureUTMParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ].forEach((param) => {
    const value = params.get(param);
    if (value) utm[param] = value;
  });
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem('utm_data', JSON.stringify(utm));
  }
  return utm;
}

// Track event
async function trackEvent(eventType, elementId = null, elementText = null) {
  const utm = JSON.parse(sessionStorage.getItem('utm_data') || '{}');
  await supabase.from('marketing_events').insert({
    event_type: eventType,
    ...utm,
    element_id: elementId,
    element_text: elementText,
    page_url: window.location.href,
    referrer: document.referrer,
    session_id: sessionStorage.getItem('session_id'),
  });
}
```

## Dashboard Access

**URL:** `/tracking.html`
**Password:** `chroniclife2025` (stored in sessionStorage after auth)

### Metrics Displayed

| Metric          | Formula                            |
| --------------- | ---------------------------------- |
| Click Rate      | `(CTA clicks / Page views) × 100%` |
| Conversion Rate | `(Signups / CTA clicks) × 100%`    |

### Benchmarks (Reddit Ads)

| Metric     | Poor | OK    | Good  |
| ---------- | ---- | ----- | ----- |
| Click Rate | < 5% | 5-15% | > 15% |
| Conv Rate  | < 3% | 3-10% | > 10% |

## Agent Personalization (Future)

UTM data can inform the agent's first message:

```javascript
// In agent first-message template
const utm = getStoredUTM();
const source = utm.utm_source;
const campaign = utm.utm_campaign;

if (source === 'reddit' && campaign?.includes('endo')) {
  return "Welcome! I see you're part of our endometriosis community...";
}
```

### Campaign-to-Message Mapping

| Campaign Pattern | First Message Angle                     |
| ---------------- | --------------------------------------- |
| `endo_*`         | Emphasize period/cycle tracking         |
| `pcos_*`         | Emphasize hormone/cycle patterns        |
| `longcovid_*`    | Emphasize energy tracking, brain fog    |
| `fibro_*`        | Emphasize pain patterns, flare tracking |
| `chronic_*`      | General symptom tracking value          |

## Files Reference

| File                                                                                                                     | Purpose                    |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| [`web-landing/index.html`](../../web-landing/index.html)                                                                 | Landing page with tracking |
| [`web-landing/tracking.html`](../../web-landing/tracking.html)                                                           | Campaign dashboard         |
| [`web-landing/migrations/001_create_marketing_tables.sql`](../../web-landing/migrations/001_create_marketing_tables.sql) | Supabase schema            |

## Quick URL Generator

For 10 Reddit ads, generate URLs like:

```bash
# Endometriosis campaigns
https://chroniclife.app?utm_source=reddit&utm_medium=cpc&utm_campaign=endo_pain&utm_content=image_v1
https://chroniclife.app?utm_source=reddit&utm_medium=cpc&utm_campaign=endo_fatigue&utm_content=image_v1

# PCOS campaigns
https://chroniclife.app?utm_source=reddit&utm_medium=cpc&utm_campaign=pcos_cycles&utm_content=image_v1
https://chroniclife.app?utm_source=reddit&utm_medium=cpc&utm_campaign=pcos_fatigue&utm_content=text_v1

# Long COVID campaigns
https://chroniclife.app?utm_source=reddit&utm_medium=cpc&utm_campaign=longcovid_brainfog&utm_content=image_v1

# Fibromyalgia campaigns
https://chroniclife.app?utm_source=reddit&utm_medium=cpc&utm_campaign=fibro_flares&utm_content=image_v1

# General chronic illness
https://chroniclife.app?utm_source=reddit&utm_medium=cpc&utm_campaign=chronic_tracking&utm_content=image_v1
https://chroniclife.app?utm_source=reddit&utm_medium=cpc&utm_campaign=chronic_doctor&utm_content=testimonial_v1
```

## Extending to Other Channels

### Facebook/Instagram

```
utm_source=facebook&utm_medium=cpc&utm_campaign=...
utm_source=instagram&utm_medium=cpc&utm_campaign=...
```

### Google Ads

```
utm_source=google&utm_medium=cpc&utm_campaign=...&utm_term={keyword}
```

### Organic Social

```
utm_source=reddit&utm_medium=social&utm_campaign=community_post
```

### Email

```
utm_source=email&utm_medium=email&utm_campaign=waitlist_update
```
