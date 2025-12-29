# Campaign Creation

How to create a complete marketing campaign for Chronic Life.

## Campaign Components

Every campaign needs:

1. **UTM URL** - Trackable link following conventions
2. **Website Copy** - Headlines, CTAs, supporting text
3. **Image Creative** - Ad image prompt for Nano Banana Pro 3
4. **Campaign Log** - Documented in `knowledge/campaigns/`

## UTM Conventions

Base URL: `https://chronic-life-landing.vercel.app`

| Parameter      | Format                | Examples                          |
| -------------- | --------------------- | --------------------------------- |
| `utm_source`   | platform              | `reddit`, `facebook`, `instagram` |
| `utm_medium`   | type                  | `cpc` (paid), `social` (organic)  |
| `utm_campaign` | `{condition}_{angle}` | `endo_pain`, `pcos_fatigue`       |
| `utm_content`  | `{format}_{version}`  | `image_v1`, `text_v2`             |

### Campaign Naming Matrix

| Condition   | Angles                          |
| ----------- | ------------------------------- |
| `endo`      | pain, fatigue, tracking, doctor |
| `pcos`      | fatigue, cycles, hormones       |
| `longcovid` | brainfog, energy, recovery      |
| `fibro`     | pain, flares, management        |
| `chronic`   | general, tracking, evidence     |

## Copy Framework

### Headlines

- Lead with the pain point
- Use "without" or "that actually" to show contrast
- Keep under 10 words

**Good:** "Track symptoms without draining your energy"
**Bad:** "The best symptom tracking app for chronic illness management"

### CTAs

- Action-oriented, specific
- Include time element when possible

**Good:** "Start a 20-second check-in"
**Bad:** "Get Started"

### Supporting Copy

- Reinforce ease/speed
- Name specific features
- Use parallel structure

**Good:** "20-second check-ins • Flare mode • Doctor-ready export"

## Versioning

When iterating on a campaign:

- Increment version: `endo_pain_v1` → `endo_pain_v2`
- Document what changed in campaign log
- Keep old version for comparison

## Quality Checklist

- [ ] UTM follows naming conventions
- [ ] Copy addresses specific pain point from research
- [ ] CTA is action-oriented with specificity
- [ ] Image prompt includes brand colors
- [ ] Campaign logged in `knowledge/campaigns/`
