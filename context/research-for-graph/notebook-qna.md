```json
{
  "nodeTypes": [
    {
      "name": "Symptom",
      "fields": [
        { "name": "severity", "type": "number", "example": "8" },
        { "name": "location", "type": "string", "example": "Joints" },
        { "name": "quality", "type": "string", "example": "Ache/Burning" },
        { "name": "onset", "type": "string", "example": "Gradual" },
        { "name": "duration", "type": "string", "example": "4 hours" }
      ],
      "captureMethod": "User input via 0-10 Quick Entry sliders or NLP extraction from chat (using 8-characteristics/OLDCARTS framework)"
    },
    {
      "name": "Flare",
      "fields": [
        { "name": "is_active", "type": "boolean", "example": "true" },
        { "name": "start_time", "type": "datetime", "example": "2026-03-29T06:30:00Z" },
        { "name": "peak_severity", "type": "number", "example": "9" },
        { "name": "duration", "type": "string", "example": "1.5 days" }
      ],
      "captureMethod": "Manual 'I'm Wiped' one-tap toggle, inferred from severity spikes (>= 8), or chat context ('everything hurts')"
    },
    {
      "name": "Medication",
      "fields": [
        { "name": "status", "type": "string", "example": "Taken / Missed / Changed" },
        { "name": "time_taken", "type": "datetime", "example": "2026-03-29T14:00:00Z" }
      ],
      "captureMethod": "User input via Quick Entry checkboxes, time pickers, or chat"
    },
    {
      "name": "Sleep",
      "fields": [
        { "name": "duration", "type": "number", "example": "5.5" },
        { "name": "quality", "type": "number", "example": "3" }
      ],
      "captureMethod": "Auto-synced from Apple Health/Google Fit (HealthKit API) or manual user input"
    },
    {
      "name": "Stress",
      "fields": [
        { "name": "level", "type": "string", "example": "High" }
      ],
      "captureMethod": "User input via 'Top Suspects' chips (Low/Med/High) or chat"
    },
    {
      "name": "Diet",
      "fields": [
        { "name": "food_trigger", "type": "string", "example": "Gluten" },
        { "name": "meal_timing", "type": "string", "example": "Skipped lunch" }
      ],
      "captureMethod": "User input via 'Top Suspects' chips, or free-text chat parsing"
    },
    {
      "name": "Activity",
      "fields": [
        { "name": "intensity", "type": "string", "example": "Pushed Limits" },
        { "name": "step_count", "type": "number", "example": "8500" }
      ],
      "captureMethod": "Imported from wearables (Apple Health/Google Fit) or user-reported exertion levels"
    },
    {
      "name": "Wearable Biomarkers",
      "fields": [
        { "name": "hrv_rmssd", "type": "number", "example": "22" },
        { "name": "resting_heart_rate", "type": "number", "example": "85" }
      ],
      "captureMethod": "Passively collected via wearable integrations (Apple Watch, Oura, Fitbit)"
    }
  ],
  "edgeTypes": [
    {
      "source": "Sleep",
      "target": "Symptom",
      "relationship": "worsens",
      "evidenceRequired": "Statistical correlation with >= 6 sample days, abs(effect_size) >= 1.0, and missing data rate <= 25%"
    },
    {
      "source": "Activity",
      "target": "Flare",
      "relationship": "precedes (lag effect)",
      "evidenceRequired": "Automated lag detection (24-72 hour lookback window) with confidence score >= 0.70"
    },
    {
      "source": "Medication",
      "target": "Symptom",
      "relationship": "helps",
      "evidenceRequired": "User-reported via chat (Alleviating factor) or statistical correlation of med timing with symptom reduction"
    },
    {
      "source": "Wearable Biomarkers",
      "target": "Flare",
      "relationship": "predicts",
      "evidenceRequired": "Algorithm detects drop in HRV / spike in RHR over 24-48 hours preceding subjective crash"
    },
    {
      "source": "Diet",
      "target": "Symptom",
      "relationship": "triggers",
      "evidenceRequired": "Lag check correlation (4-24h for gut issues) needing >= 6 sample days"
    }
  ],
  "insightTypes": [
    {
      "template": "After [Feature], [Outcome] is [+/- X] avg over [Y] days.",
      "inputNodes": ["Sleep", "Symptom", "Stress"],
      "minDataDays": 6,
      "confidenceThreshold": ">= 0.70 (High confidence pattern)"
    },
    {
      "template": "Your [Outcome] increases [X]% on days following less than [Y] hours of sleep.",
      "inputNodes": ["Sleep", "Symptom"],
      "minDataDays": 14,
      "confidenceThreshold": ">= 0.70 (High confidence)"
    },
    {
      "template": "Weak signal: [Feature] might be impacting your [Outcome].",
      "inputNodes": ["Diet", "Activity", "Symptom"],
      "minDataDays": 3,
      "confidenceThreshold": "0.50 - 0.69 (Inconclusive/Early Signal)"
    },
    {
      "template": "Your flares typically appear 24-48 hours after [Feature], not immediately.",
      "inputNodes": ["Activity", "Flare", "Stress"],
      "minDataDays": 6,
      "confidenceThreshold": ">= 0.70 (High confidence, Lag Effect Detected)"
    },
    {
      "template": "This flare looks like your last [X] flares. [Feature] dipped 24-72h before.",
      "inputNodes": ["Flare", "Sleep", "Medication"],
      "minDataDays": 2,
      "confidenceThreshold": "Rule-based deterministic pattern match of historical day cards"
    }
  ]
}
```


**Mental health conditions and chronic physical illnesses influence each other in a bidirectional, mutually reinforcing cycle**. Living with a chronic medical condition can trigger severe psychological distress, while pre-existing mental health issues can increase the risk of developing a chronic disease and worsen its outcomes.

This two-way relationship operates through several interconnected pathways:

**How Chronic Illness Impacts Mental Health**
Chronic diseases are not purely physical experiences; emotional and psychological distress are intrinsic components of the illness.
*   **The Psychosocial Burden:** The daily realities of managing a chronic condition often entail a loss of autonomy, distorted body image, reduced mobility, and significant financial strain. The unpredictability of symptom flares and the resulting social isolation contribute heavily to clinical depression and anxiety.
*   **Biological Alterations:** Chronic physical conditions can directly alter brain chemistry. The continuous stress of a chronic illness dysregulates the hypothalamic-pituitary-adrenal (HPA) axis, leading to elevated cortisol levels. Furthermore, chronic inflammation—a hallmark of diseases like diabetes, cardiovascular disease, and autoimmune disorders—releases pro-inflammatory cytokines that disrupt mood-regulating neurotransmitters such as serotonin and dopamine, predisposing patients to mood disorders.

**How Mental Health Impacts Chronic Illness**
Conversely, mental health struggles actively drive physical disease progression:
*   **Increased Risk of Disease Onset:** Depression is a significant risk factor for developing certain physical illnesses. For example, a history of depression increases the risk of developing type 2 diabetes by approximately 60%, and chronic stress is linked to a higher incidence of heart attacks and strokes.
*   **Behavioral Consequences:** Conditions like depression can severely hinder a patient's ability to engage in self-care. Depressed individuals often experience disrupted sleep, poor diet, and reduced exercise, and are significantly less likely to adhere to medical treatments or lifestyle recommendations.
*   **Worsening Disease Prognosis:** The physiological stress of depression, including autonomic nervous system imbalance and sustained low-grade inflammation, actively exacerbates physical disease processes. In patients with inflammatory bowel disease (IBD), the combination of psychological comorbidity and active physical disease has a cumulative adverse impact, drastically increasing the likelihood of flares, hospitalization, and surgical intervention. The impact of depression on mortality in medically ill patients has even been shown to be comparable in magnitude to smoking.

**The Pain-Mood Feedback Loop**
One of the clearest examples of this bidirectional relationship is found in chronic pain syndromes. Physical pain and depression are deeply connected, as both involve the dysregulation of serotonin and norepinephrine. Unrelenting pain erodes a person's mental well-being, leading to depression and anxiety. In turn, these mental states lower pain thresholds and amplify the brain's perception of physical pain, creating a vicious cycle where poor mental health and physical pain continuously worsen each other.

Ultimately, because physical and mental health "feed off each other," it is impossible to effectively treat one while ignoring the other. Managing the psychological impact is a required, integral component of improving physical chronic disease outcomes.

Chronic mental stress triggers a cascade of maladaptive physiological and neurobiological responses, leading to a state of systemic wear and tear known as an **allostatic load**.

The primary biological changes caused by chronic mental stress include:

*   **HPA Axis Dysregulation:** A central effect of chronic stress is the overactivation and dysregulation of the hypothalamic-pituitary-adrenal (HPA) axis, which governs the body's stress response. This continuous activation results in **elevated and sustained levels of cortisol**, a primary stress hormone.
*   **Autonomic Nervous System Imbalance:** Chronic stress disrupts the autonomic nervous system. For example, it heavily impacts the vagus nerve, which plays a crucial role in regulating gut motility and digestion. It can also lead to platelet activation and cardiovascular strain.
*   **Brain Plasticity and Structural Changes:** Prolonged stress causes functional and morphological plasticity changes in critical brain networks, specifically altering the structure of the **hippocampus, amygdala, and prefrontal cortex**.
*   **Systemic Inflammation and Immune Dysfunction:** Chronic mental stress induces sustained, low-grade systemic inflammation and alters overall immune function, including impairing immune surveillance.
*   **Neurotransmitter Disruption:** The chronic inflammation triggered by stress increases the production of pro-inflammatory cytokines in the body. These cytokines can directly cross into or impact the brain, **damaging mood-regulating neurotransmitter systems** such as serotonin and dopamine.
