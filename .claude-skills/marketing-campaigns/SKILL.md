---
name: marketing-campaigns
description: Create and manage marketing campaigns, ads, and tracking URLs for Reddit and other channels. Use when: (1) Creating new campaigns or ads in Supabase, (2) Generating tracking URLs with UTM parameters, (3) Setting up A/B tests with multiple ad variants, (4) Querying campaign performance data, or (5) Understanding the campaign tracking system architecture.
---

# Marketing Campaigns

## Overview

This skill enables creation and management of marketing campaigns with proper tracking setup. It handles campaign/ad creation in Supabase, generates tracking URLs with UTM parameters, and provides tools for analyzing campaign performance.

## Quick Start

### Creating a New Campaign Ad

To create a new ad in a campaign:

1. **Use the Supabase MCP** to insert into `campaign_config` table
2. **Generate tracking URL** with proper UTM parameters
3. **Verify** the ad appears in the tracking dashboard

**Example workflow:**

```sql
-- Create ad entry
INSERT INTO campaign_config (
  config_type, config_key, product_offering, config_data, active, display_order
) VALUES (
  'ad',
  'chat_not_forms',
  'spoon-saver',
  jsonb_build_object(
    'headline', 'Too tired to track symptoms? Same. Chat, don''t fill forms.',
    'description', 'Track symptoms without draining your energy.',
    'primary_cta', 'Start a 20-second check-in',
    'utm_content', 'chat_not_forms',
    'utm_campaign', 'spoon_saver_v1',
    'ad_group', 'spoon_saver_v1',
    'target_subreddits', ARRAY['r/cfs', 'r/ChronicIllness', 'r/Fibromyalgia']
  ),
  true,
  20
);
```

**Generated tracking URL:**
```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v1&utm_content=chat_not_forms
```

## Core Workflows

### 1. Creating Campaigns and Ads

**When to use:** Setting up a new campaign or adding ad variants to an existing campaign.

**Process:**

1. **Define campaign structure:**
   - Campaign name (e.g., `spoon_saver_v1`)
   - Product offering (e.g., `spoon-saver`, `flare-forecast`)
   - Ad headline and description

2. **Create ad entry** using Supabase MCP:
   - Use `config_type = 'ad'`
   - Set `config_key` to unique identifier (matches `utm_content`)
   - Include `utm_campaign` and `utm_content` in `config_data`
   - Set `display_order` for sorting

3. **Generate tracking URL** using the pattern:
   ```
   https://chroniclife.app/{product}?utm_source=reddit&utm_medium=paid&utm_campaign={campaign}&utm_content={content_id}
   ```

**Scripts available:**
- `scripts/create_campaign_ad.py` - Generates SQL and tracking URL
- `scripts/generate_tracking_url.py` - Generates URL for existing ads

**Reference:** See `references/database_schema.md` for table structure and examples.

### 2. Generating Tracking URLs

**When to use:** Need a tracking URL for an existing campaign/ad or creating URLs programmatically.

**Standard pattern:**
```
https://chroniclife.app/{product}?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content_id}
```

**Parameters:**
- `utm_source`: Traffic source (`reddit`, `google`, `facebook`, etc.)
- `utm_medium`: Marketing medium (`paid`, `organic`, `social`, `cpc`)
- `utm_campaign`: Campaign identifier (groups multiple ads)
- `utm_content`: Unique ad identifier (individual ad variant)

**Reference:** See `references/url_patterns.md` for complete URL patterns and examples.

### 3. A/B Testing Setup

**When to use:** Creating multiple ad variants to test headline performance.

**Process:**

1. Create multiple ads with same `utm_campaign` but different `utm_content`
2. Use different headlines but same product/description
3. Generate unique tracking URLs for each variant
4. Compare performance in tracking dashboard filtered by `utm_campaign`

**Example:** Campaign `spoon_saver_v1` with variants:
- `chat_not_forms` - "Too tired to track symptoms? Same. Chat, don't fill forms."
- `spoon_cost_chat` - "Tracking shouldn't cost you a spoon..."
- `no_forms_20sec` - "Log symptoms without filling forms. 20 seconds. That's it."

All share `utm_campaign=spoon_saver_v1` but have unique `utm_content` values.

### 4. Querying Campaign Performance

**When to use:** Analyzing campaign results, comparing ad variants, or generating reports.

**Key tables:**
- `campaign_config` - Campaign/ad definitions
- `landing_visits` - Page views with UTM tracking
- `modal_sessions` - Modal engagement
- `modal_responses` - Question answers
- `beta_signups` - Conversions

**Common queries:**

```sql
-- Get all ads in a campaign
SELECT config_key, config_data->>'headline' as headline, config_data->>'utm_content' as utm_content
FROM campaign_config
WHERE config_data->>'utm_campaign' = 'spoon_saver_v1'
ORDER BY display_order;

-- Get campaign funnel metrics
SELECT
  lv.utm_content,
  COUNT(DISTINCT lv.id) as visits,
  COUNT(DISTINCT ms.id) as modal_opens,
  COUNT(DISTINCT CASE WHEN ms.completed THEN ms.id END) as completed,
  COUNT(DISTINCT bs.id) as signups
FROM landing_visits lv
LEFT JOIN modal_sessions ms ON ms.visit_id = lv.id
LEFT JOIN beta_signups bs ON bs.utm_content = lv.utm_content
WHERE lv.utm_campaign = 'spoon_saver_v1'
GROUP BY lv.utm_content;
```

**Reference:** See `references/database_schema.md` for complete schema and query examples.

## Tracking Dashboard

View campaign performance at: `https://chroniclife.app/tracking`

**Features:**
- Filter by `utm_campaign` to see all ads in a campaign
- Compare by `utm_content` to see individual ad performance
- View funnel metrics: visits → modal opens → completion → signups
- Analyze drop-off points and user journeys

## Resources

### Scripts

- **`scripts/create_campaign_ad.py`** - Creates ad entry and generates tracking URL
  - Usage: `python create_campaign_ad.py --campaign CAMPAIGN --headline "HEADLINE" --product PRODUCT --content-id CONTENT_ID`
  - Outputs SQL INSERT statement and tracking URL

- **`scripts/generate_tracking_url.py`** - Generates tracking URL for existing ads
  - Usage: `python generate_tracking_url.py --campaign CAMPAIGN --content CONTENT_ID --product PRODUCT`
  - Outputs complete tracking URL

### References

- **`references/url_patterns.md`** - Complete guide to URL patterns, UTM parameters, and encoding
- **`references/database_schema.md`** - Database schema, table structures, and query examples

## Best Practices

1. **Naming conventions:**
   - Campaign names: lowercase with underscores (e.g., `spoon_saver_v1`)
   - Content IDs: lowercase with underscores (e.g., `chat_not_forms`)
   - Match `config_key` to `utm_content` for consistency

2. **URL encoding:**
   - Use `urllib.parse.urlencode()` when generating URLs programmatically
   - Escape apostrophes in SQL as `''` (double single quote)

3. **Campaign organization:**
   - Group related ads under same `utm_campaign`
   - Use `display_order` to control sorting
   - Keep `active=true` for live campaigns

4. **Tracking:**
   - Always include all UTM parameters in tracking URLs
   - Use consistent `utm_source` and `utm_medium` values
   - Verify URLs work before deploying ads
