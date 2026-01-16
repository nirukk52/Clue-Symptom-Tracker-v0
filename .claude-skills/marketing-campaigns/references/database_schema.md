# Campaign Database Schema

## campaign_config Table

Stores all campaign configuration including ads, landing pages, modal questions, and personas.

### Structure

```sql
CREATE TABLE campaign_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL CHECK (config_type IN ('ad', 'landing', 'question', 'persona')),
  config_key TEXT NOT NULL,
  product_offering TEXT,
  config_data JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Ad Configuration (config_type = 'ad')

**IMPORTANT**: `config_key` MUST match `config_data.utm_content`

**config_data** structure:
```json
{
  "headline": "Ad headline text",
  "description": "Ad description text",
  "primary_cta": "CTA button text",
  "utm_content": "content_id",
  "utm_campaign": "spoon_saver_v3",
  "ad_group": "ad_group_name",
  "target_subreddits": ["r/cfs", "r/ChronicIllness", "r/Fibromyalgia", "r/LongCOVID", "r/spoonies"]
}
```

### Example: Create Single Ad

```sql
INSERT INTO campaign_config (config_type, config_key, product_offering, config_data, active, display_order)
VALUES (
  'ad',
  'chat_not_forms',
  'spoon-saver',
  '{
    "headline": "Too tired to track symptoms? Same. Chat, don''t fill forms.",
    "description": "Track symptoms without draining your energy.",
    "primary_cta": "Start a 20-second check-in",
    "utm_content": "chat_not_forms",
    "utm_campaign": "spoon_saver_v3",
    "ad_group": "too_tired_to_track",
    "target_subreddits": ["r/cfs", "r/ChronicIllness", "r/Fibromyalgia", "r/LongCOVID", "r/spoonies", "r/endometriosis", "r/PCOS"]
  }',
  true,
  20
);
```

### Example: Create Multiple Ads

```sql
INSERT INTO campaign_config (config_type, config_key, product_offering, config_data, active, display_order)
VALUES
('ad', 'ad_1', 'spoon-saver', '{"headline": "Headline 1", "utm_content": "ad_1", "utm_campaign": "spoon_saver_v3", "ad_group": "group_1", "target_subreddits": ["r/cfs"]}', true, 30),
('ad', 'ad_2', 'spoon-saver', '{"headline": "Headline 2", "utm_content": "ad_2", "utm_campaign": "spoon_saver_v3", "ad_group": "group_1", "target_subreddits": ["r/cfs"]}', true, 31),
('ad', 'ad_3', 'spoon-saver', '{"headline": "Headline 3", "utm_content": "ad_3", "utm_campaign": "spoon_saver_v3", "ad_group": "group_2", "target_subreddits": ["r/cfs"]}', true, 32);
```

### Example: Update Campaign Version

```sql
UPDATE campaign_config
SET config_data = jsonb_set(config_data, '{utm_campaign}', '"spoon_saver_v3"')
WHERE config_type = 'ad'
AND config_key IN ('ad_1', 'ad_2', 'ad_3');
```

---

## Tracking Tables

### landing_visits
Tracks page views with UTM parameters:
- `id`, `session_id`
- `product_offering`
- `utm_campaign`, `utm_content`, `utm_source`, `utm_medium`
- `device_type`, `user_agent`
- `time_on_page_ms`, `scroll_depth_pct`
- `cta_clicked`, `cta_element_id`, `cta_clicked_at`
- `persona_shown`, `headline_variant`
- `created_at`

### modal_sessions
Tracks modal engagement:
- `id`, `visit_id` (links to landing_visits)
- `session_id`, `product_offering`
- `step_reached`, `total_steps`
- `completed`, `completed_at`
- `abandoned_at_step`
- `time_to_complete_ms`
- `created_at`

### modal_responses
Tracks individual question answers:
- `id`, `modal_session_id` (links to modal_sessions)
- `question_key`, `question_text`, `question_number`, `step_number`
- `answer_value`, `answer_label`
- `time_to_answer_ms`, `was_changed`
- `created_at`

### beta_signups
Tracks conversions:
- `id`, `email`
- `utm_campaign`, `utm_content`, `utm_source`, `utm_medium`
- `landing_url`, `referrer`, `user_agent`
- `created_at`

---

## Common Queries

### List all ads in a campaign
```sql
SELECT config_key, config_data->>'headline' as headline
FROM campaign_config
WHERE config_type = 'ad'
AND config_data->>'utm_campaign' = 'spoon_saver_v3'
ORDER BY display_order;
```

### Check if ad exists
```sql
SELECT config_key, config_data->>'utm_campaign' as campaign
FROM campaign_config
WHERE config_type = 'ad' AND config_key = 'chat_not_forms';
```

### Campaign funnel metrics
```sql
SELECT
  lv.utm_content,
  COUNT(DISTINCT lv.id) as visits,
  COUNT(DISTINCT ms.id) as modal_opens,
  COUNT(DISTINCT CASE WHEN ms.completed THEN ms.id END) as completed,
  COUNT(DISTINCT bs.id) as signups
FROM landing_visits lv
LEFT JOIN modal_sessions ms ON ms.visit_id = lv.id
LEFT JOIN beta_signups bs ON bs.utm_content = lv.utm_content
WHERE lv.utm_campaign = 'spoon_saver_v3'
GROUP BY lv.utm_content
ORDER BY visits DESC;
```

### Individual user journey
```sql
SELECT
  lv.session_id,
  lv.utm_campaign,
  lv.utm_content,
  lv.device_type,
  lv.created_at as visit_time,
  ms.step_reached,
  ms.completed
FROM landing_visits lv
LEFT JOIN modal_sessions ms ON ms.visit_id = lv.id
WHERE lv.utm_campaign = 'spoon_saver_v3'
ORDER BY lv.created_at DESC
LIMIT 50;
```
