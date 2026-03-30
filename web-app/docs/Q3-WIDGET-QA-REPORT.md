# Q3 Widget QA Report

> Expert Designer Review - 30 Onboarding Widgets
> Date: January 12, 2026

## Executive Summary

**Overall Assessment:** ✅ Solid foundation with enhancement opportunities

- **15 widgets** are production-ready with correct data capture
- **12 widgets** need enhancement to match JSON spec's richer data capture
- **3 widgets** have critical gaps that impact Q4 value propositions

---

## Supabase Schema Analysis

### Current Tables

| Table             | Q3-Related Columns                           | Status             |
| ----------------- | -------------------------------------------- | ------------------ |
| `modal_responses` | `answer_value` (text), `answer_label` (text) | ✅ Can store JSON  |
| `user_contexts`   | `q3_warning`, `q3_label`                     | ⚠️ Naming outdated |

### Recommendations

1. **Rename** `user_contexts.q3_warning` → `q3_baseline` (or keep and document)
2. **Add** `q3_condition` column to `user_contexts` for condition picker selection
3. **Consider** JSONB column for structured Q3 widget data

---

## Widget QA by Domain

### FATIGUE Domain (Widgets 1-5)

| ID  | Widget Name       | Type   | Status | Data Captured        | Issues                            |
| --- | ----------------- | ------ | ------ | -------------------- | --------------------------------- |
| W1  | `energy_envelope` | Slider | ⚠️     | energy_level (0-100) | JSON spec has time segments       |
| W2  | `good_days_trap`  | Chips  | ⚠️     | activity_suspects[]  | Missing "feeling today" follow-up |
| W3  | `brain_fog`       | Slider | ⚠️     | cognitive_clarity    | Missing sleep quality input       |
| W4  | `mood_connection` | Slider | ⚠️     | mood_level           | Missing energy slider (dual)      |
| W5  | `no_focus`        | Slider | ✅     | overall_feeling      | Acceptable baseline               |

**Q4 Alignment:**

- W1-W4: Partial - need dual data points for correlation analysis
- W5: Good - intentionally open-ended

---

### FLARES Domain (Widgets 6-10)

| ID  | Widget Name        | Type   | Status | Data Captured        | Issues                      |
| --- | ------------------ | ------ | ------ | -------------------- | --------------------------- |
| W6  | `unknown_triggers` | Chips  | ✅     | potential_triggers[] | None                        |
| W7  | `early_warning`    | Chips  | ✅     | prodrome_symptoms[]  | None                        |
| W8  | `treatment_effect` | Slider | ⚠️     | flare_intensity      | Missing treatment adherence |
| W9  | `flare_patterns`   | Chips  | ✅     | flare_recency        | Optional: cycle follow-up   |
| W10 | `log_and_see`      | Slider | ⚠️     | flare_intensity      | Missing symptom + location  |

**Q4 Alignment:**

- W6, W7, W9: Excellent - actionable trigger/warning data
- W8, W10: Need enhancement for treatment correlation

---

### MIGRAINES Domain (Widgets 11-15)

| ID  | Widget Name        | Type   | Status | Data Captured        | Issues                      |
| --- | ------------------ | ------ | ------ | -------------------- | --------------------------- |
| W11 | `food_triggers`    | Chips  | ✅     | recent_food_intake[] | Validated trigger list      |
| W12 | `weather_triggers` | Slider | ⚠️     | headache_intensity   | Missing weather perception  |
| W13 | `hormonal_link`    | Chips  | ✅     | cycle_phase          | Good cycle data             |
| W14 | `stress_sleep`     | Slider | ⚠️     | stress_level         | Missing sleep + headache    |
| W15 | `find_any_pattern` | Slider | ⚠️     | headache_intensity   | Missing location + duration |

**Q4 Alignment:**

- W11, W13: Good for trigger analysis
- W12, W14, W15: Need enhancement for MIDAS-compatible data

---

### IBS/GUT Domain (Widgets 16-20)

| ID  | Widget Name       | Type   | Status | Data Captured       | Issues             |
| --- | ----------------- | ------ | ------ | ------------------- | ------------------ |
| W16 | `food_culprits`   | Slider | ⚠️     | gut_status          | Missing meal type  |
| W17 | `stress_gut`      | Slider | ⚠️     | stress_level        | Missing gut status |
| W18 | `timing_patterns` | Chips  | ✅     | worst_symptom_time  | Good temporal data |
| W19 | `diet_working`    | Slider | ⚠️     | symptom_level       | Missing adherence  |
| W20 | `track_trends`    | Chips  | ✅     | primary_gut_symptom | Good symptom ID    |

**Q4 Alignment:**

- W18, W20: Good for pattern finding
- W16, W17, W19: Need dual structure for correlation

---

### MULTIPLE CONDITIONS Domain (Widgets 21-25)

| ID  | Widget Name        | Type   | Status | Data Captured   | Issues                                      |
| --- | ------------------ | ------ | ------ | --------------- | ------------------------------------------- |
| W21 | `symptom_overlap`  | Chips  | 🚨     | primary_symptom | **CRITICAL: Missing condition attribution** |
| W22 | `competing_needs`  | Chips  | ✅     | med_adherence   | Acceptable                                  |
| W23 | `unified_view`     | Slider | ⚠️     | overall_symptom | Should track multiple                       |
| W24 | `prioritize_issue` | Chips  | ✅     | primary_impact  | Acceptable                                  |
| W25 | `reduce_overwhelm` | Slider | ✅     | overall_status  | Perfect for low spoons                      |

**Q4 Alignment:**

- W21: CRITICAL - "untangle which condition" requires attribution
- W22-W25: Acceptable baseline capture

---

### OTHER Domain (Widgets 26-30)

| ID  | Widget Name       | Type   | Status | Data Captured             |
| --- | ----------------- | ------ | ------ | ------------------------- |
| W26 | `find_patterns`   | Slider | ✅     | symptom_intensity         |
| W27 | `track_treatment` | Slider | ✅     | target_symptom_status     |
| W28 | `doctor_log`      | Slider | ✅     | intensity_1_10 (clinical) |
| W29 | `see_trends`      | Chips  | ✅     | relative_status           |
| W30 | `just_curious`    | Slider | ✅     | overall_feeling           |

**Q4 Alignment:** All acceptable for baseline capture.

---

## Priority Enhancements

### Phase 1: Critical (Before Launch)

1. **W21 symptom_overlap**: Add condition attribution follow-up
   - After selecting symptom, ask "Which condition do you think is causing it?"
   - Use conditions from picker

### Phase 2: High Value (Sprint 2)

2. **W3 brain_fog**: Add sleep quality question
3. **W4 mood_connection**: Add energy slider (dual)
4. **W8 treatment_effect**: Add treatment adherence question
5. **W14 stress_sleep**: Add sleep + headache (triple)

### Phase 3: Enhanced Analytics (Sprint 3)

6. Add dual/triple structure to remaining widgets
7. Implement MIDAS-compatible migraine capture (W15)
8. Add Bristol scale option for gut widgets

---

## Data Flow Verification

### Current Implementation (`Q3Step.tsx`)

```typescript
// Q3 data structure on completion
{
  condition: string,      // From condition picker
  widgetType: string,     // 'slider' | 'chips'
  widgetValue: number | string | string[]
}
```

### Stored in Supabase

```sql
-- modal_responses.answer_value stores:
'{"condition":"mecfs","widgetType":"slider","widgetValue":35}'

-- modal_responses.answer_label stores:
'ME/CFS: slider: 35'
```

### Recommended Enhanced Schema

```sql
-- Add to user_contexts for persistent profile:
ALTER TABLE user_contexts
ADD COLUMN q3_condition TEXT,
ADD COLUMN q3_widget_type TEXT,
ADD COLUMN q3_baseline_value JSONB;
```

---

## Screen 4 Integration Points

Each Q3 widget feeds a specific Q4 value proposition:

| Q4 Category           | Q2 Options                                                                                          | Screen 4 Headline                                        |
| --------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Prediction**        | energy_envelope, early_warning, flare_patterns, weather_triggers, hormonal_link                     | "Give us a few days. We'll predict your next [symptom]." |
| **Trigger Discovery** | good_days_trap, brain_fog, unknown_triggers, food_triggers, stress_sleep, food_culprits, stress_gut | "We're already building your trigger profile."           |
| **Validation**        | treatment_effect, diet_working, track_treatment, doctor_log                                         | "You now have evidence your doctor can see."             |
| **Pattern Finding**   | no_focus, log_and_see, find_any_pattern, track_trends, find_patterns, see_trends, just_curious      | "Patterns are forming. Check back tomorrow."             |
| **Multi-Condition**   | symptom_overlap, competing_needs, unified_view, prioritize_issue, reduce_overwhelm                  | "One dashboard for everything you're managing."          |

---

## Conclusion

The 30-widget system provides a solid foundation for personalized onboarding. The simplified implementation (slider/chips) captures core data points efficiently within the "max 3 taps" constraint.

**Immediate Action:**

- Fix W21 (symptom_overlap) condition attribution before launch

**Recommended:**

- Phase 2 enhancements for richer correlation data
- Schema update for structured Q3 storage

---

_Report generated by Expert Designer QA - Clue Symptom Tracker_
