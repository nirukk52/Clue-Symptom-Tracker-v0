# CLAUDE.md - Web Landing Tracking System

> Context for AI assistants working on landing page tracking, analytics, and attribution.

## Purpose

This directory contains **marketing landing pages** with a **dual-layer tracking system**:

1. **Supabase** (first-party data) - Campaign attribution, event tracking, signups
2. **Google Tag Manager** (third-party) - GA4, Reddit Pixel, conversion tracking

All pages track UTM parameters, user sessions, and conversion events for Reddit Ads performance analysis.

---

## Tracking Architecture

### Core Components

```
Browser → UTM Capture → Session Storage → Supabase Events + GTM DataLayer
```

**Why this design?**

- **Supabase**: Own your data, query easily, no vendor lock-in
- **GTM**: Standard marketing stack (GA4, Reddit), easy to add new tags
- **Session storage**: Persist UTM across page navigation within same visit

### Data Flow

1. **Page Load**:

   - Extract UTM params from URL
   - Store in `sessionStorage` (persists across navigation)
   - Generate `session_id` if new visit
   - Fire `page_view` event → Supabase
   - GTM initializes → fires GA4 page view

2. **CTA Click**:

   - User clicks button with `data-modal-trigger`
   - Extract `data-cta-id` and `data-cta-text` attributes
   - Get stored UTM from `sessionStorage`
   - Fire `cta_click` event → Supabase
   - Push to GTM `dataLayer` for Reddit/GA4 tracking

3. **Email Signup**:
   - Form submission → `submitSignup(email)`
   - Insert to `beta_signups` table with UTM attribution
   - Fire `signup_complete` event → Supabase
   - Push conversion event to GTM for Reddit Pixel

---

## Key Files & Functions

### Tracking Functions (in each HTML file)

```javascript
// UTM Management
captureUTMParams(); // Extracts UTM from URL, stores in sessionStorage
getStoredUTM(); // Retrieves persisted UTM params

// Event Tracking
trackEvent(eventType, elementId, elementText); // Supabase insert
submitSignup(email); // Beta signups + event tracking

// Session Management
generateSessionId(); // Creates unique session identifier
```

**Global Object**: `window.ChronicLifeTracking` exposes these functions for cross-page use.

### Database Tables

#### `marketing_events`

- **Purpose**: Track all user interactions (page views, clicks, signups)
- **Key fields**: `event_type`, `session_id`, UTM params, `element_id`, `element_text`
- **Indexes**: Campaign, session, created_at for fast queries

#### `beta_signups`

- **Purpose**: Email signups with attribution
- **Key fields**: `email`, UTM params, `landing_url`, `referrer`
- **Indexes**: Campaign, created_at

**Schema**: See `migrations/001_create_marketing_tables.sql`

---

## UTM Parameter Handling

### Capture Strategy

```javascript
// On page load
const params = new URLSearchParams(window.location.search);
const utm = {};
UTM_PARAMS.forEach((param) => {
  const value = params.get(param);
  if (value) utm[param] = value;
});

// Store in sessionStorage (persists across navigation)
if (Object.keys(utm).length > 0) {
  sessionStorage.setItem('utm_data', JSON.stringify(utm));
}
```

**Important**: UTM params only stored if present in URL. Once stored, they persist for the session even if user navigates to pages without UTM params.

### Standard UTM Values

**For Reddit Ads**:

- `utm_source=reddit`
- `utm_medium=paid`
- `utm_campaign={campaign_name}` (e.g., `clarity_experiment`)
- `utm_content={ad_variant}` (e.g., `predict_flares`, `doctor_proof`)
- `utm_term={keyword}` (optional)

**Example URL**:

```
https://chroniclife.app/predict-flares?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=predict_flares
```

---

## Event Types

### `page_view`

- **Fired**: On every page load
- **Captured**: UTM params, page URL, referrer, session ID
- **Use case**: Traffic analysis, campaign attribution

### `cta_click`

- **Fired**: When user clicks CTA button
- **Captured**: Element ID, button text, UTM params, session ID
- **Use case**: Button performance, conversion funnel

**CTA Attributes**:

```html
<a href="#"
   data-modal-trigger          <!-- Auto-attaches click handler -->
   data-cta-id="hero_primary"  <!-- Element identifier -->
   data-cta-text="Get Started"> <!-- Button text for clarity -->
  Get Started
</a>
```

### `signup_complete`

- **Fired**: After successful email submission
- **Captured**: Email (in `beta_signups`), all UTM params, landing URL
- **Use case**: Conversion tracking, campaign ROI

---

## Session Tracking

### Session ID Format

```javascript
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
// Example: sess_1735934400000_k3j9x2p
```

**Storage**: `sessionStorage.getItem('session_id')`

**Purpose**: Group events from same visit to analyze:

- Journey: Page view → CTA click → Signup
- Time-to-convert
- Multi-step attribution

**Lifetime**: Session storage cleared when browser tab closes.

---

## Google Tag Manager Integration

### Container ID

- **GTM-KFK8WHV5** (embedded in all pages)

### Implementation

**Head script** (loads GTM):

```html
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
```

**Body noscript** (fallback for JS-disabled):

```html
<noscript
  ><iframe
    src="https://www.googletagmanager.com/ns.html?id=GTM-KFK8WHV5"
    height="0"
    width="0"
    style="display:none;visibility:hidden"
  ></iframe
></noscript>
```

### Pushing Events to GTM

**Current**: GTM auto-fires on page load. Custom events should push to `dataLayer`:

```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'cta_click',
  cta_id: elementId,
  utm_campaign: utm.utm_campaign,
  landing_page: window.location.pathname,
});
```

**Recommended GTM Tags**:

- Google Analytics 4 Configuration
- Reddit Pixel (conversion tracking)
- Custom events for `cta_click`, `signup_complete`

---

## Common Tasks

### Adding Tracking to New Landing Page

1. **Copy tracking code** from `index.html` (lines ~1305-1445)
2. **Set `PAGE_ID` constant**:
   ```javascript
   const PAGE_ID = 'new_landing_page';
   ```
3. **Update page view tracking**:
   ```javascript
   trackEvent('page_view', PAGE_ID, 'New Landing Page Title');
   ```
4. **Add GTM container** (copy from head/body of any existing page)
5. **Test UTM capture**: Visit with `?utm_source=test&utm_campaign=test`

### Debugging Tracking Issues

**Check Supabase**:

```sql
-- Recent events
SELECT * FROM marketing_events
ORDER BY created_at DESC LIMIT 10;

-- Missing UTM params
SELECT COUNT(*) FROM marketing_events
WHERE utm_campaign IS NULL;
```

**Check Browser**:

```javascript
// In console
window.ChronicLifeTracking.getStoredUTM();
sessionStorage.getItem('session_id');
```

**Check GTM**:

- Use GTM Preview mode: https://tagassistant.google.com
- Check `dataLayer` in console: `window.dataLayer`

### Querying Campaign Performance

**Common queries** (see `README.md` for full examples):

- Signups by campaign
- Conversion funnel (page view → CTA → signup)
- Landing page performance comparison
- CTA click-through rates

---

## File Structure Context

### Landing Pages

- `index.html` - Main/control variant
- `predict-flares.html` - Flare prediction angle
- `doctor-proof.html` - Doctor trust angle
- `appointment-prep.html` - Appointment prep angle
- `find-triggers.html` - Trigger discovery angle
- `foggy-minds.html` - Brain fog angle
- `spoon-saver.html` - Energy conservation angle

**All pages share**: Same tracking code, different messaging/content.

### Dashboard

- `tracking.html` - Internal analytics dashboard (password protected)

### Config Files

- `migrations/001_create_marketing_tables.sql` - Database schema
- `vercel.json` - Deployment configuration
- `package.json` - Dependencies (if any)

---

## Constraints & Best Practices

### DO

✅ **Always include UTM params** in campaign URLs
✅ **Test tracking** after deploying new landing page
✅ **Query Supabase** for first-party data (more reliable than GA4)
✅ **Use session IDs** for journey analysis
✅ **Push events to GTM** for Reddit Pixel/GA4 integration

### DON'T

❌ **Don't hardcode** Supabase credentials (use environment vars if building)
❌ **Don't remove** GTM noscript fallback (accessibility)
❌ **Don't track PII** in marketing_events (only email in beta_signups)
❌ **Don't modify** session ID during same visit (breaks journey tracking)

---

## Related Systems

- **Supabase Project**: `zvpudxinbcsrfyojrhhv` (check main README for updates)
- **GTM Container**: `GTM-KFK8WHV5`
- **Domain**: `chroniclife.app` (configured in Vercel)
- **Campaign Docs**: `v2/PREDICTION-CAMPAIGN-MASTER.md`

---

## Troubleshooting Checklist

1. ✅ GTM container ID correct (`GTM-KFK8WHV5`)?
2. ✅ Supabase URL/key valid?
3. ✅ RLS policies allow anonymous inserts?
4. ✅ UTM params in URL format?
5. ✅ Browser console shows no errors?
6. ✅ `sessionStorage` contains `utm_data` and `session_id`?
7. ✅ Events appearing in Supabase dashboard?
8. ✅ GTM Preview mode shows tags firing?

---

**When modifying tracking**: Test in browser, check Supabase inserts, verify GTM dataLayer events, then deploy.
