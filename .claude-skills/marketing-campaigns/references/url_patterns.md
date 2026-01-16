# Tracking URL Patterns

## Standard UTM Parameter Structure

All tracking URLs follow this pattern:

```
https://chroniclife.app/{product}?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content_id}
```

## Parameter Definitions

### utm_source
- **Purpose**: Identifies the traffic source
- **Common values**: `reddit`, `google`, `facebook`, `twitter`, `direct`
- **Default**: `reddit`

### utm_medium
- **Purpose**: Identifies the marketing medium
- **Common values**: `paid`, `organic`, `social`, `email`, `cpc`
- **Default**: `paid`

### utm_campaign
- **Purpose**: Campaign identifier (groups multiple ads together)
- **Format**: Lowercase with underscores (e.g., `spoon_saver_v1`, `prediction_depth_test`)
- **Example**: `spoon_saver_v1`

### utm_content
- **Purpose**: Unique identifier for each ad variant
- **Format**: Lowercase with underscores (e.g., `chat_not_forms`, `wiped_mode`)
- **Example**: `chat_not_forms`

## Product Landing Pages

| Product | Base URL |
|---------|----------|
| Spoon Saver | `https://chroniclife.app/spoon-saver` |
| Flare Forecast | `https://chroniclife.app/flare-forecast` |
| Top Suspect | `https://chroniclife.app/top-suspect` |
| Crash Prevention | `https://chroniclife.app/crash-prevention` |

## Example URLs

### Reddit Paid Ad
```
https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=spoon_saver_v1&utm_content=chat_not_forms
```

### Google Search Ad
```
https://chroniclife.app/flare-forecast?utm_source=google&utm_medium=cpc&utm_campaign=prediction_test&utm_content=forecast_default
```

### Organic Social Media
```
https://chroniclife.app/spoon-saver?utm_source=twitter&utm_medium=social&utm_campaign=organic_posts&utm_content=spoon_saver
```

## URL Encoding

When creating URLs programmatically:
- Use `urllib.parse.urlencode()` for proper encoding
- Special characters in UTM values are automatically encoded
- Apostrophes in headlines are escaped in SQL as `''` (double single quote)

## Tracking Dashboard

View campaign performance at:
- **Dashboard**: `https://chroniclife.app/tracking`
- **Filter by**: `utm_campaign` to see all ads in a campaign
- **Compare by**: `utm_content` to compare individual ad performance
