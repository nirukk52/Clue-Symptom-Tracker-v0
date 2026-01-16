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

**config_key**: Unique identifier for the ad (e.g., `chat_not_forms`)

**config_data** structure:
```json
{
  "headline": "Ad headline text",
  "description": "Ad description text",
  "primary_cta": "CTA button text",
  "utm_content": "content_id",
  "utm_campaign": "campaign_name",
  "ad_group": "campaign_name",
  "target_subreddits": ["r/cfs", "r/ChronicIllness", ...]
}
```

### Example Ad Insert

```sql
INSERT INTO campaign_config (
  config_type,
  config_key,
  product_offering,
  config_data,
  active,
  display_order
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

## Tracking Tables

### landing_visits
Tracks page views with UTM parameters:
- `utm_campaign`, `utm_content`, `utm_source`, `utm_medium`
- `product_offering`, `device_type`, `time_on_page_ms`, `scroll_depth_pct`
- `cta_clicked`, `cta_element_id`

### modal_sessions
Tracks modal engagement:
- `visit_id` (links to landing_visits)
- `step_reached`, `completed`, `abandoned_at_step`
- `time_to_complete_ms`

### modal_responses
Tracks individual question answers:
- `modal_session_id` (links to modal_sessions)
- `question_key`, `answer_value`, `answer_label`

### beta_signups
Tracks conversions:
- `email`, `utm_campaign`, `utm_content`, `utm_source`
- `landing_url`, `user_agent`

## Querying Campaign Performance

### Get all ads in a campaign
```sql
SELECT
  config_key,
  config_data->>'headline' as headline,
  config_data->>'utm_content' as utm_content,
  active
FROM campaign_config
WHERE config_data->>'utm_campaign' = 'spoon_saver_v1'
ORDER BY display_order;
```

### Get campaign funnel metrics
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
WHERE lv.utm_campaign = 'spoon_saver_v1'
GROUP BY lv.utm_content;
```
