# Marketing Assets

Organized marketing assets for Chronic Life campaigns.

## Folder Structure

```
assets/
├── hero/           # Hero images for landing pages
├── ads/            # Ad creatives by platform (reddit/, instagram/, etc.)
├── screenshots/    # App screenshots
└── archive/        # Old/unused assets
```

## Hero Images

Compressed hero images generated with Gemini/Imagen:

| File          | Description                    | Status    |
| ------------- | ------------------------------ | --------- |
| `hero_v1.png` | Abstract symptom relief visual | Available |
| `hero_v2.png` | Variant 2                      | Available |
| `hero_v3.png` | Variant 3                      | Available |
| `hero_v4.png` | Variant 4                      | Available |
| `hero_v5.png` | Variant 5                      | Available |
| `hero_v6.png` | Variant 6                      | Available |

## Source Files

Original high-resolution images are stored in `context/marketing-assets/` (not committed due to size).

## Generating New Assets

Use the `generate_image` tool in the LangGraph agent:

```python
# Example via agent chat
"Generate a hero image for the endo_pain campaign with emotional style"
```
