# Tracking URL Patterns

## Standard URL Structure

```
https://chroniclife.app/{product}?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content_id}
```

## Current Active Campaign

**Campaign**: `spoon_saver_v3`
**Product**: `spoon-saver`
**Source**: `reddit`
**Medium**: `paid`

---

## Parameter Definitions

### utm_source
- **Purpose**: Identifies the traffic source
- **Values**: `reddit`, `google`, `facebook`, `twitter`, `direct`
- **Default**: `reddit`

### utm_medium
- **Purpose**: Identifies the marketing medium
- **Values**: `paid`, `organic`, `social`, `email`, `cpc`
- **Default**: `paid`

### utm_campaign
- **Purpose**: Campaign identifier (groups multiple ads)
- **Format**: lowercase_with_underscores
- **Current**: `spoon_saver_v3`

### utm_content
- **Purpose**: Unique identifier for each ad variant
- **Format**: lowercase_with_underscores
- **MUST match**: `config_key` in campaign_config table

---

## Product Landing Pages

| Product | Base URL |
|---------|----------|
| Spoon Saver | `https://chroniclife.app/spoon-saver` |
| Flare Forecast | `https://chroniclife.app/flare-forecast` |
| Top Suspect | `https://chroniclife.app/top-suspect` |
| Crash Prevention | `https://chroniclife.app/crash-prevention` |

---

## Current spoon_saver_v3 URLs

```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v3&utm_content=doctor_summaries
```

```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v3&utm_content=log_flare_niranjan
```

```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v3&utm_content=wiped_mode_niranjan
```

```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v3&utm_content=tracking_cost_spoons
```

```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v3&utm_content=chat_not_forms
```

```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v3&utm_content=no_forms_20sec
```

```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v3&utm_content=log_flare_priyanka
```

```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v3&utm_content=wiped_mode_priyanka
```

---

## Creating New URLs

### Step 1: Verify ad exists in database
```sql
SELECT config_key FROM campaign_config
WHERE config_type = 'ad' AND config_key = 'your_content_id';
```

### Step 2: Generate URL
```
https://chroniclife.app/{product}?utm_source=reddit&utm_medium=paid&utm_campaign={campaign}&utm_content={content_id}
```

### Step 3: Test the URL
Open in browser and verify it loads the correct landing page.

---

## Tracking Dashboard

**URL**: `https://chroniclife.app/tracking`

Features:
- Filter by `utm_campaign` to see all ads in a campaign
- Compare by `utm_content` to see individual ad performance
- View funnel: visits → modal opens → completion → signups
- See full ad headline when clicking user journey rows

---

## Common Mistakes

1. **URL for non-existent ad** - Always verify ad exists before giving URL
2. **Typo in utm_content** - Must exactly match `config_key` in database
3. **Wrong campaign version** - Double-check v1 vs v2 vs v3
4. **Missing parameters** - Always include all 4 UTM parameters
