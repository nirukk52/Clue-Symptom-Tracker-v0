---
name: marketing-campaigns
description: Create and manage marketing campaigns, ads, and tracking URLs for Reddit and other channels. Use when: (1) Creating new campaigns or ads in Supabase, (2) Generating tracking URLs with UTM parameters, (3) Listing existing campaign ads, (4) Updating campaign versions, or (5) Querying campaign performance data.
---

# Marketing Campaigns

## Overview

This skill enables creation and management of marketing campaigns with proper tracking setup. It handles campaign/ad creation in Supabase, generates tracking URLs with UTM parameters, and provides tools for analyzing campaign performance.

## Quick Reference

### URL Pattern

```
https://chroniclife.app/{product}?utm_source=reddit&utm_medium=paid&utm_campaign={campaign}&utm_content={content_id}
```

### Current Active Campaign

- **Campaign**: `spoon_saver_v3`
- **Product**: `spoon-saver`
- **Dashboard**: `https://chroniclife.app/tracking`

---

## Core Workflows

### 1. List All Ads in a Campaign

**Always do this first** to see what exists:

```sql
SELECT config_key, config_data->>'headline' as headline
FROM campaign_config
WHERE config_type = 'ad'
AND config_data->>'utm_campaign' = 'spoon_saver_v3'
ORDER BY display_order;
```

### 2. Create a New Ad

**Step 1:** Insert into `campaign_config`:

```sql
INSERT INTO campaign_config (config_type, config_key, product_offering, config_data, active, display_order)
VALUES (
  'ad',
  'my_new_ad',  -- This becomes utm_content
  'spoon-saver',
  '{
    "ad_group": "my_ad_group",
    "headline": "Your ad headline here",
    "description": "Track symptoms without draining your energy.",
    "primary_cta": "Start a 20-second check-in",
    "utm_content": "my_new_ad",
    "utm_campaign": "spoon_saver_v3",
    "target_subreddits": ["r/cfs", "r/ChronicIllness", "r/Fibromyalgia", "r/LongCOVID", "r/spoonies", "r/endometriosis", "r/PCOS"]
  }',
  true,
  40
);
```

**Step 2:** Generate tracking URL:

```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v3&utm_content=my_new_ad
```

### 3. Create Multiple Ads at Once

```sql
INSERT INTO campaign_config (config_type, config_key, product_offering, config_data, active, display_order)
VALUES
('ad', 'ad_variant_1', 'spoon-saver', '{"headline": "Headline 1", "utm_content": "ad_variant_1", "utm_campaign": "spoon_saver_v3", ...}', true, 41),
('ad', 'ad_variant_2', 'spoon-saver', '{"headline": "Headline 2", "utm_content": "ad_variant_2", "utm_campaign": "spoon_saver_v3", ...}', true, 42),
('ad', 'ad_variant_3', 'spoon-saver', '{"headline": "Headline 3", "utm_content": "ad_variant_3", "utm_campaign": "spoon_saver_v3", ...}', true, 43);
```

### 4. Update Campaign Version (e.g., v1 → v3)

When reusing existing ads in a new campaign version:

```sql
UPDATE campaign_config
SET config_data = jsonb_set(config_data, '{utm_campaign}', '"spoon_saver_v3"')
WHERE config_type = 'ad'
AND config_key IN ('ad_1', 'ad_2', 'ad_3');
```

### 5. Query Campaign Performance

```sql
SELECT
  lv.utm_content,
  COUNT(DISTINCT lv.id) as visits,
  COUNT(DISTINCT ms.id) as modal_opens,
  COUNT(DISTINCT CASE WHEN ms.completed THEN ms.id END) as completed
FROM landing_visits lv
LEFT JOIN modal_sessions ms ON ms.visit_id = lv.id
WHERE lv.utm_campaign = 'spoon_saver_v3'
GROUP BY lv.utm_content
ORDER BY visits DESC;
```

---

## Current spoon_saver_v3 Ads

| utm_content            | Headline                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `doctor_summaries`     | A chat-based symptom tracker that creates summaries your doctor will actually read. |
| `log_flare_niranjan`   | Log the flare without explaining your whole life... - Niranjan                      |
| `wiped_mode_niranjan`  | "I'm wiped" mode: For days when you can't even look at a screen. - Niranjan         |
| `tracking_cost_spoons` | Tracking shouldn't cost spoons.                                                     |
| `chat_not_forms`       | Too tired to track symptoms? Same. Chat, don't fill forms.                          |
| `no_forms_20sec`       | Log symptoms without filling forms. 20 seconds. That's it.                          |
| `log_flare_priyanka`   | Log the flare without explaining your whole life... - Priyanka                      |
| `wiped_mode_priyanka`  | "I'm wiped" mode: For days when you can't even look at a screen. - Priyanka         |

---

## Important Rules

### 1. config_key = utm_content

The `config_key` field MUST match the `utm_content` value in `config_data`. This is how the tracking dashboard looks up ad details.

### 2. Always verify after creating

After creating ads, always query to confirm they exist:

```sql
SELECT config_key, config_data->>'utm_campaign' as campaign
FROM campaign_config WHERE config_key = 'your_new_ad';
```

### 3. Escape apostrophes in SQL

Use `''` (double single quote) for apostrophes:

```sql
'{"headline": "I''m wiped mode"}'  -- Correct
'{"headline": "I'm wiped mode"}'   -- WRONG - will error
```

### 4. Don't give URLs for non-existent ads

Before providing a tracking URL, verify the ad exists in the database. Never assume an ad exists.

---

## Tracking Dashboard Features

**URL**: `https://chroniclife.app/tracking`

The dashboard shows:

- **Individual User Journeys**: Each session with campaign/ad info
- **Session Detail**: Full ad headline shown when clicking a row
- **Device breakdown**: mobile vs desktop
- **Funnel metrics**: visits → modal opens → completion → signups

When a user clicks through an ad, the dashboard displays:

- Campaign name
- Ad content ID (utm_content)
- Full ad headline (looked up from campaign_config)
- Target subreddits
- Device type and source

---

## Database Schema

### campaign_config (ads)

```
config_type: 'ad'
config_key: unique ad identifier (= utm_content)
product_offering: 'spoon-saver' | 'flare-forecast' | etc.
config_data: {
  headline: string,
  description: string,
  primary_cta: string,
  utm_content: string,
  utm_campaign: string,
  ad_group: string,
  target_subreddits: string[]
}
active: boolean
display_order: integer
```

### landing_visits

Tracks page views with UTM parameters, device type, time on page, scroll depth, CTA clicks.

### modal_sessions

Tracks modal engagement: step_reached, completed, abandoned_at_step.

### beta_signups

Tracks conversions with UTM attribution.

---

## Product Landing Pages

| Product          | URL                                        |
| ---------------- | ------------------------------------------ |
| Spoon Saver      | `https://chroniclife.app/spoon-saver`      |
| Flare Forecast   | `https://chroniclife.app/flare-forecast`   |
| Top Suspect      | `https://chroniclife.app/top-suspect`      |
| Crash Prevention | `https://chroniclife.app/crash-prevention` |

---

## Common Mistakes to Avoid

1. **Creating URLs for ads that don't exist** - Always query first
2. **Mismatched config_key and utm_content** - They must be identical
3. **Forgetting to escape apostrophes** - Use `''` in SQL strings
4. **Not verifying after insert** - Always confirm the ad was created
5. **Confusing campaign versions** - Check which version (v1, v2, v3) is active
