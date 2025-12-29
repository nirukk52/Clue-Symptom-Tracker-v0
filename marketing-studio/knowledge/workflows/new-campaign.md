# New Campaign Workflow

Step-by-step process for creating a marketing campaign.

## Phase 1: Discovery

### Step 1.1: Clarify Intent

Ask the user:

- **Condition:** Which community? (endo, pcos, longcovid, fibro, chronic)
- **Angle:** What pain point or hook? (pain, fatigue, tracking, doctor, etc.)
- **Context:** Any specific insight or ad they saw that inspired this?

If user provides a link or reference, analyze it first.

### Step 1.2: Research

Load relevant knowledge:

1. `knowledge/research/pain-points.md` - Find matching pain point
2. `knowledge/brand/audience.md` - Understand the community
3. `knowledge/campaigns/index.md` - Check what's been tried

Extract:

- Key quote for the angle
- Pain point number and severity
- Past campaign performance (if applicable)

---

## Phase 2: Draft

### Step 2.1: Generate UTM URL

Follow conventions from `skills/campaign-creation.md`:

```
https://chronic-life-landing.vercel.app/?utm_source={source}&utm_medium={medium}&utm_campaign={condition}_{angle}&utm_content={format}_{version}
```

Check `knowledge/campaigns/index.md` for next version number.

### Step 2.2: Draft Website Copy

Create copy following `skills/pain-point-mapping.md`:

```markdown
## Landing Page Updates

**Hero Headline:** [Under 10 words, lead with pain point]
**Hero Subhead:** [Features in parallel structure]
**Primary CTA:** [Action + specificity]
**Secondary CTA:** [Alternative action]
```

### Step 2.3: Draft Image Prompt

Create prompt following `skills/creative-brief.md`:

```markdown
## Image Generation Prompt (Nano Banana Pro 3)

[Full prompt with format, scene, visual style, text, exclusions]
```

---

## Phase 3: Review

### Step 3.1: Present Draft

Show the user:

1. Campaign Brief (target, pain point, angle)
2. UTM URL
3. Website Copy
4. Image Prompt(s)

### Step 3.2: Iterate

Based on feedback:

- Refine copy
- Adjust image prompt
- Change angle if needed

---

## Phase 4: Finalize

### Step 4.1: Create Campaign File

Create `knowledge/campaigns/{campaign_name}.md` with:

- All meta information
- Final copy
- Final image prompt(s)
- Empty results section

### Step 4.2: Update Registry

Add campaign to `knowledge/campaigns/index.md`

### Step 4.3: Update Prompt Library

If new image prompt, add to `knowledge/prompts/library.md`

---

## Output Checklist

Before finalizing, confirm:

- [ ] UTM follows naming conventions
- [ ] Copy addresses specific pain point with citation
- [ ] CTA is action-oriented and specific
- [ ] Image prompt includes brand colors by hex
- [ ] Campaign logged in `knowledge/campaigns/`
- [ ] Registry updated in `knowledge/campaigns/index.md`

---

## Quick Reference: Output Format

### For Coding Agent (Website Updates)

```markdown
## Landing Page Updates for {campaign_name}

**Hero Headline:** {headline}
**Hero Subhead:** {subhead}
**Primary CTA:** {cta_text}
**Secondary CTA:** {secondary_cta}

**Additional Changes:**

- {any section-specific changes}
```

### For Nano Banana Pro 3 (Image Generation)

```markdown
## Image Prompt

{full prompt}
```

### For Campaign Log

Create `knowledge/campaigns/{name}.md` using template from `endo_pain_v1.md`
