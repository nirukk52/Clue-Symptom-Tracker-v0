# **Architectural Schema and Knowledge Graph Design for the Clue Chronic Illness Tracker**

## **Introduction to Graph-Based Chronic Illness Tracking**

The proliferation of chronic illnesses requires a paradigm shift in how patient-generated health data is captured, structured, and analyzed. Traditional relational databases, which rely on rigid schemas and flattened tables, often fail to capture the nuanced, interconnected reality of human health and the myriad factors that influence disease progression.1 In contrast, a Knowledge Graph (KG) organizes information as an interconnected network of entities, commonly referred to as nodes, and their relationships, known as edges. This architecture mirrors the cognitive framework utilized by clinicians and medical researchers, representing healthcare data as a web of connected concepts rather than isolated data points.1 For a chat-based chronic illness symptom tracker like Clue—designed to replicate and enhance the functionality of the Bearable application—a robust, semantically precise health knowledge graph is not merely an option, but a foundational requirement.

Chronic disease management demands continuous longitudinal care, dictating that isolated data points must be contextualized over extended periods to reveal underlying patterns, environmental triggers, and management efficacies.2 Patients utilizing health tracking applications regularly record a highly diverse array of data streams. These streams encompass physical symptoms, psychological states, sleep quality, dietary intake, social interactions, and objective biometric measurements.3 Extracting actionable intelligence from this multidimensional data necessitates an architecture capable of supporting complex semantic relationships. By representing this data within a Personalized Healthcare Knowledge Graph (PHKG), the Clue application can identify subtle correlations between lifestyle modifications and treatment responses, ultimately improving clinical decision-making and patient autonomy.5 Furthermore, integrating statistical relational learning techniques into these knowledge graphs enhances inference capabilities, allowing the system to uncover insights that would remain obscured within raw, unstructured data.7

The transition to a conversational, chat-based interface introduces unique computational and architectural complexities. Unlike traditional graphical user interfaces (GUIs) where users select predetermined variables from rigid dropdown menus—such as Bearable's toggle-based customization screens—chat interfaces yield unstructured, highly variable natural language.2 Consequently, the knowledge graph schema must be intrinsically linked to an advanced Natural Language Processing (NLP) pipeline capable of Named Entity Recognition (NER), intent classification, and syntactic dependency parsing.9 The ensuing analysis details the exhaustive architectural schema required for the Clue platform. This schema is systematically segmented into node typologies, edge formulations based on statistical causality, and insight generation logic, culminating in a strict, comprehensive JSON representation of the database architecture.

## **Natural Language Processing Pipeline Architecture**

To populate the knowledge graph dynamically from free-text user inputs, Clue must employ a sophisticated, multi-tiered NLP pipeline. The healthcare industry generates vast amounts of unstructured text, and translating this colloquial patient data into structured graph entities requires mitigating the inherent ambiguity of human language.11 The architecture must seamlessly blend rule-based heuristics with advanced deep learning models to achieve both precision and contextual awareness.

### **Clinical Named Entity Recognition**

The foundational step in knowledge graph population is the extraction of clinical and lifestyle entities from chat logs. Traditional rule-based techniques, such as regular expression matching and dictionary lookups utilizing tools like Spark NLP's EntityRulerInternal, offer high precision for specific, predictable patterns.12 These rule-based annotators match exact strings or regex patterns against a document and assign them a named entity, which is highly effective for extracting standardized dosages or specific biometric units.12 However, capturing the diverse semantic expressions of subjective symptoms and emotional states requires deep learning paradigms.

Integrating Bidirectional Long Short-Term Memory (BiLSTM) networks with Conditional Random Field (CRF) layers provides a robust solution.13 In this architecture, the BiLSTM captures the sequential context of the patient's narrative, while the CRF layer examines the semantic relations and transition probabilities between words to determine the precise boundaries of symptom extractions.14 This hybrid model has been successfully applied to perceive various medical entities from biomedical corpora, ensuring that complex, multi-word symptoms are accurately mapped to standardized medical ontologies such as SNOMED-CT or the International Classification of Diseases (ICD).14 Furthermore, modern NLP workflows increasingly leverage transformer-based architectures like BERT (Bidirectional Encoder Representations from Transformers) for token classification, which excel at contextualizing patient narratives and identifying subtle correlations within the text.12

### **Syntactic Dependency Parsing and Attribute Association**

Extracting a medical entity is insufficient without its corresponding qualifying attributes. For instance, if a user types, "The patient report is positive for ABC disease but my joint pain is mild today," the system must associate "positive" with "ABC disease" and "mild" exclusively with "joint pain".16 This is achieved through syntactic dependency parsing, which analyzes the grammatical structure of the sentence to establish relationships between tokens.14

By traversing the dependency tree using algorithms such as Breadth-First Search (BFS), the NLP engine can link entities to their descriptive modifiers. A baseline Python implementation using the SpaCy library involves identifying the entity of interest and executing a BFS traversal until the algorithm encounters a token classified as an adjective (the attribute) or until it exceeds a predefined maximum distance threshold to prevent erroneous associations across different clauses.16 Furthermore, the parser must encode rules for handling negations—such as distinguishing between "positive" and "not positive"—to ensure data integrity within the graph.16 In medical NER, these attributes can be assigned directly to the entity type, encompassing factuality (whether a disease is present or absent) and schedule (when a medication was taken).17

### **Zero-Shot Extraction and Large Language Models**

For highly unstructured, novel, or emotionally charged inputs, Large Language Models (LLMs) provide advanced common-sense reasoning and zero-shot extraction capabilities.18 Biomedical text data presents unique challenges, as queries are often incomplete, lack specific structure, and contain hard-to-interpret, context-specific medical terminologies.18 When an LLM is grounded using the structured, fact-checked data of the knowledge graph—a process known as Retrieval-Augmented Generation (RAG)—it can accurately interpret complex patient narratives while drastically reducing the risk of AI hallucinations.1

The LLM can be prompted with highly specific question templates to extract medical histories, interventions, and qualitative observations from the conversational chat, seamlessly converting them into structured node data ready for graph ingestion.15 By fusing knowledge representation with generative AI, the system becomes highly auditable and trustworthy in a clinical context, preserving the provenance of the data while automating the burdensome task of manual data entry.1

## **Node Types: Ontological Representation of the Patient State**

Nodes represent the foundational, discrete entities within the Clue knowledge graph. Each node type corresponds to a distinct category of health or lifestyle data, defined by specific operational fields and tailored data capture methodologies. To replicate and enhance the Bearable application's holistic tracking capabilities, the node ontology must be exceptionally comprehensive.

### **Mood and Emotional Affect Nodes**

Tracking emotional states is critical for understanding the holistic impact of chronic illness. Mood tracking serves multiple clinical and personal purposes: identifying environmental or social emotional triggers, observing temporal changes in mental health, and correlating psychological states with physical health outcomes.8

Mood nodes require a standardized numerical scale to facilitate statistical analysis. Emulating the Bearable model, Clue utilizes a 1 to 10 scale, where lower numbers represent distressed states and higher numbers represent optimal states.8 Specifically, scores of 1 to 3 denote low moods characterized by significant anxiety or depression; scores of 4 to 6 denote moderate, neutral, or mildly fluctuating moods; and scores of 7 to 10 denote high, positive, and content states.8 Additionally, these nodes must capture an array of specific feelings or emotions as discrete tags.19 NLP extraction for mood relies heavily on sentiment analysis coupled with rigorous keyword spotting. When a user states, "I am feeling incredibly down and highly anxious today due to work," the NLP pipeline maps the semantic concept of "down" to a low mood score (e.g., 2\) and extracts "anxious" and "stressed" as associated feeling tags, effectively translating qualitative prose into quantitative graph data.8

| Field Name | Data Type | Clinical Purpose | NLP Extraction Mechanism |
| :---- | :---- | :---- | :---- |
| mood\_score | Integer (1-10) | Establishes a quantitative baseline for emotional well-being | Sentiment analysis polarity mapping |
| feeling\_tags | Array of Strings | Captures granular emotional nuances beyond the numerical score | Keyword spotting and NER |
| timestamp | DateTime | Enables longitudinal temporal correlation | Metadata ingestion from chat timestamp |

### **Symptom and Condition Nodes**

The core functionality of a chronic illness tracker is the granular, reliable recording of the physical and cognitive manifestations of disease. Users must be able to track new and existing symptoms, document flare-ups, and monitor changes in severity over time in response to treatments.20 Studies indicate that patients utilizing electronic patient-reported outcome (ePRO) applications record almost twice as many different symptoms as doctors document in electronic health records, highlighting the necessity for a highly flexible symptom ontology.22

Symptom nodes must encapsulate the symptom name, its severity, its frequency, and its temporal grouping. Emulating best practices, severity is typically categorized as mild, moderate, or severe, while temporal grouping assigns the symptom to a specific time period (e.g., morning, afternoon, evening) to facilitate intra-day correlation analysis.22 Utilizing clinical NER, the system identifies the core symptom entity. Dependency parsing then links severity adjectives to the symptom.16 If a patient chats, "My chronic brain fog is significantly worse this morning," the system generates a Symptom Node for "brain fog," sets the severity to a higher comparative value based on the modifier "significantly worse," and assigns the timestamp to the morning period.23

| Field Name | Data Type | Clinical Purpose | NLP Extraction Mechanism |
| :---- | :---- | :---- | :---- |
| symptom\_name | String (Ontology Mapped) | Identifies the specific physical or cognitive affliction | BiLSTM-CRF clinical entity recognition |
| severity | Categorical (1-5 scale) | Measures the intensity of the symptom | Syntactic dependency parsing of adjectives |
| time\_period | Categorical (AM/MID/PM) | Localizes the symptom within the daily circadian cycle | Time-expression extraction |

### **Factor and Habit Nodes (Nutrition, Environment, Activity)**

Factors encompass all external variables, daily habits, and lifestyle choices that may influence a user's health trajectory.3 This broad category includes dietary intake, social interactions, weather conditions, physical activity, and screen time.

Factor nodes can be configured as binary (an event either happened or did not happen) or variable (quantified as none, little, some, or lots).24 For nutrition tracking, demanding that users log specific caloric values or exact macronutrients can induce tracking fatigue or exacerbate anxiety, particularly in patients with chronic digestive or eating disorders. Therefore, adopting a broad categorization strategy—such as tracking "high fat," "raw vegetables," "caffeine," "sweets," or "spicy foods" evaluated on a variable scale—provides sufficient data for correlation without overburdening the user.25 Entity classification models categorize these chat inputs dynamically. A message stating, "I drank three cups of coffee and ate a massive amount of spicy takeout for dinner" generates multiple distinct Factor Nodes: Caffeine (lots), Spicy Food (lots), and Takeout (binary: true).25 Furthermore, continuous monitoring of smartphone telemetry can automatically populate environmental factors, such as time spent outside, ambient temperature, or UV index, enriching the knowledge graph without requiring manual user input.26

### **Biometric Measurement Nodes**

Integrating objective physiological data provides a critical, unbiased counterbalance to subjective self-reporting. Biomarkers offer profound insights into the underlying mechanisms of chronic illnesses and autonomic nervous system regulation.

Essential metrics include Resting Heart Rate (RHR), Heart Rate Variability (HRV), blood pressure, blood glucose levels, and body composition.28 Heart Rate Variability is particularly vital; it is a clinical gold standard for assessing nervous system recovery, physiological stress, and the balance between the sympathetic and parasympathetic nervous systems.29 The node must support specific time-domain indices of HRV, such as SDNN (the standard deviation of the interbeat interval of normal sinus beats) and RMSSD (the root mean square of successive differences between normal heartbeats).29 During strength training or physiological stress, HRV typically changes, and regular tracking can optimize cardiac output understanding.31 Additionally, tracking weight is vital for conditions like heart failure, where sudden fluctuations indicate fluid retention.32 While users can manually input these metrics via chat, automatic ingestion via APIs from wearables (e.g., Apple Health, Google Health Connect) is the preferred capture method to ensure high data density, accuracy, and ultra-short-term measurement validity.26

| Field Name | Data Type | Clinical Purpose | NLP Extraction Mechanism |
| :---- | :---- | :---- | :---- |
| metric\_type | String | Identifies the biomarker (e.g., HRV, Blood Glucose) | Regex matching and contextual LLM extraction |
| numerical\_value | Float | The objective measurement | Regex digit extraction |
| unit | String | Standardizes the measurement (e.g., ms, mg/dL, BPM) | Dictionary lookup |

### **Menstrual and Reproductive Health Nodes**

For many individuals, hormonal fluctuations intrinsically tied to the menstrual cycle significantly influence the manifestation of chronic illness symptoms. The Sympto-Thermal Method and natural family planning protocols highlight the profound data embedded within reproductive health indicators.34

Cycle tracking requires specialized nodes capturing a variety of physical states. Essential fields include menstrual bleeding flow (categorized as light, medium, heavy, or spotting), cervical firmness (firm, medium, soft), cervical openness (closed, medium, open), and basal body temperature.35 Accurate logging of these variables can help predict ovulation and explain distressing behavioral or physical symptoms linked to hormonal shifts.35 NLP extraction models must be trained on reproductive health terminology to accurately parse inputs. For example, processing the phrase "My flow is incredibly heavy today and my temperature spiked" requires translating colloquialisms into structured variables with standardized severity scales, assigning the flow field to "heavy" and the temperature field to the corresponding numerical value.36

### **Medication and Intervention Nodes**

Monitoring the efficacy, adherence, and side effects of pharmacological treatments is a primary use case for chronic illness applications.39

Medication nodes must record the pharmacological drug name, the exact dosage, the frequency of administration, and boolean adherence markers.3 Pharmacological NER models, trained on extensive databases like RxNorm, are utilized to identify drug names and extract complex dosage schedules.40 In a conversational context, the system can parse the input, "I took my 20mg Adderall at 9 AM," to update the medication adherence log, extract the dosage, and establish a precise temporal marker.41 This temporal marker is absolutely critical for subsequent symptom correlation, allowing the knowledge graph to distinguish between symptoms that occurred prior to medication administration and side effects that manifested afterward.23

## **Edge Types: Formulating Relationships, Temporal Logic, and Causality**

While nodes represent isolated, cross-sectional data points, the true clinical and analytical value of the knowledge graph resides in its edges—the mathematical relationships connecting lifestyle factors to health outcomes. Establishing these edges requires rigorous statistical inferencing to prevent the dissemination of misleading medical insights.

### **The Correlation Versus Causation Paradigm**

A fundamental tenet of data analysis and scientific inquiry is the axiom that correlation does not imply causation.42 In the context of health tracking, the fact that two events occur simultaneously or sequentially does not guarantee a cause-and-effect relationship; they may simply be associated, or they may both be influenced by an unseen third variable.23 This is known as a questionable-cause logical fallacy, specifically *cum hoc ergo propter hoc* ("with this, therefore because of this").43 For example, data might show that when ice cream sales increase, drownings also increase. Concluding that ice cream causes drowning is fallacious; the underlying confounding factor is warm summer weather, which drives both activities independently.42

In chronic illness tracking, users frequently encounter reverse relationships and confounding variables. A user might notice a strong correlation between taking pain medication and experiencing severe fatigue. However, the pain medication does not necessarily cause the fatigue; rather, severe pain (the underlying confounding factor) causes both the fatigue and the necessity to take the medication.23 Therefore, the knowledge graph schema must explicitly distinguish between purely associative edges (labeled CORRELATES\_WITH) and directional, potentially causal edges (labeled TRIGGERS, WORSENS, or IMPROVES).36 Causal edges require strict temporal precedence—the factor must verifiably occur before the change in symptom severity—and ideally align with epidemiological principles such as the Bradford Hill criteria for causation.23

### **Statistical Thresholds and Data Density Requirements**

To generate statistically valid and clinically safe edges, the application must enforce strict minimum data density thresholds. Analyzing inadequate sample sizes generates noisy, inaccurate correlations that can mislead users.45

To begin calculating any correlation edge, the system requires a baseline of at least three days where a specific factor actively occurred, and three days where the same factor did not occur.45 Furthermore, daily health scores (such as mood, symptom severity, sleep quality, or energy levels) must be concurrently present on those respective days to establish a comparative baseline.45 However, while this three-day minimum serves as a functional starting point, generating highly reliable, "less noisy" insights dictates that data should be aggregated and analyzed over an optimal 30-day continuous period.45 This extended timeline smooths out daily anomalies, accounts for weekend-versus-weekday behavioral shifts, and provides a sufficiently robust dataset for advanced significance testing.

### **Mathematical Determination Mechanisms**

The mathematical foundation of edge creation relies on rigorous statistical testing. The system automates the comparison of mean symptom or mood scores on days with the factor against days without the factor.45

The strength and direction of the relationship are quantified using correlation coefficients, such as Pearson's *r* or Spearman's rho.46 The coefficient varies between \-1 and \+1. A coefficient approaching \+1 indicates a strong positive correlation (e.g., as the intake of highly processed sugar increases, the severity of systemic inflammation increases). Conversely, a coefficient approaching \-1 indicates a strong negative correlation (e.g., as sleep duration increases, the frequency of migraine attacks decreases).

To determine if the observed correlation is statistically significant rather than a byproduct of random chance within the dataset, the algorithm calculates a p-value.48 In null-hypothesis significance testing, the p-value represents the probability of obtaining test results at least as extreme as the result actually observed, under the assumption that the null hypothesis (that no relationship exists) is correct.48 The industry-standard threshold for statistical significance is a p-value of less than 0.05. If the p-value is \< 0.05, the probability that the observed relationship is due to randomness is less than 5%, allowing the system to confidently instantiate an edge between the two nodes.49

For highly granular temporal data, particularly biometric measurements logged at specific times, traditional correlation indices may fail to capture subtle physiological synchrony. In these instances, the knowledge graph can employ advanced metrics like the Spike Time Tiling Coefficient (STTC).50 The STTC evaluates synchrony by calculating the proportion of total recording time that lies within a defined window around an event, mitigating the biases present in standard correlation indices when dealing with low-frequency versus high-frequency events.50 The STTC formula is expressed as:

![][image1]  
where ![][image2] is the proportion of total recording time within a defined window around a spike in factor A, and ![][image3] is the proportion of spikes in factor A that lie within the window around any spike in factor B.50 This sophisticated mathematical approach ensures that edges representing physiological triggers are highly accurate and resilient to variations in symptom frequency.

Furthermore, temporal logic is hardcoded into the edge determination algorithm. If a user logs caffeine consumption in the evening, the system's logic explicitly prevents the creation of a causal edge connecting that evening caffeine to symptoms experienced earlier that same morning.45 By breaking the day into discrete chronological periods (AM, Mid, PM), the graph establishes the directional time vectors essential for inferring potential causality.23

| Edge Label | Source Node | Target Node | Mathematical Determination |
| :---- | :---- | :---- | :---- |
| CORRELATES\_WITH | Factor | Symptom / Mood | Pearson/Spearman coefficient \> |0.5|, P-value \< 0.05 |
| TRIGGERS | Factor | Symptom | Temporal precedence established; Positive coefficient; STTC synchrony |
| IMPROVES | Medication | Symptom | Temporal precedence; Strong negative coefficient indicating symptom reduction |
| CO\_OCCURS | Factor | Factor | High frequency of simultaneous logging without temporal direction (identifies confounding variables) |

## **Insight Generation and Confidence Thresholds**

The ultimate output of the knowledge graph is the generation of insights that empower users to alter their behaviors, improve their self-care regimens, or effectively communicate longitudinal trends with their medical professionals.21 Insights abstract the complex mathematics of the graph's edges into readable, actionable summaries presented to the user.

### **Plain English Templating and Natural Language Generation**

Raw statistical outputs—such as "Spearman's rho \= 0.72, p \< 0.05"—are generally unintelligible and intimidating to the average patient. Therefore, insights must utilize Natural Language Generation (NLG) techniques to populate plain English templates.27

The templates map directly to the specific edge types generated by the graph. For an IMPROVES edge, the template reads: "Days with \[Factor\] improve your \[Health Outcome\] by \[X\]%." For a TRIGGERS edge, the text reads: "Instances of \[Factor\] are frequently followed by a \[X\]% increase in severity within".27 These templates must be carefully engineered to provide context and avoid making definitive, universally binding medical claims. Utilizing phrasing such as "is associated with" or "correlates with" is vital unless the user has conducted a strict, isolated custom experiment that controls for confounding variables.51

### **Confidence Thresholds and Risk Frameworks**

The dissemination of algorithmic health insights carries inherent clinical risk. Presenting an inaccurate or poorly supported insight could lead a user to abandon an effective prescribed medication, adopt a harmful dietary restriction, or misunderstand the nature of their chronic illness. Consequently, the instantiation of insights must be tightly gated behind rigorous statistical confidence thresholds.52

Confidence scores are probability estimates representing the system's certainty in a specific relationship.53 Relying on a default threshold of 0.5 (50%) is a critical failure in production AI systems, as false positives in medical contexts carry significantly higher costs than false positives in standard commercial applications.53 The threshold gating is divided into three distinct risk tiers:

1. **High-Stakes Decisions (![][image4] 90% confidence)**: This threshold is required for insights involving medication adherence, severe chronic pain triggers, or cardiac events. Reaching this confidence level requires vast amounts of longitudinal data, strict p-values, and the elimination of known confounding variables.52  
2. **Medium-Stakes Decisions (75–89% confidence)**: This tier is applied to lifestyle interventions and behavioral modifications, such as identifying the correlation between moderate physical exercise and improved sleep quality, or specific food types and mild gastrointestinal distress.52  
3. **Low-Stakes Decisions (60–74% confidence)**: This tier is suitable only for minor behavioral correlations, such as the relationship between evening screen time and mild morning grogginess. Any calculated correlation falling below the 60% threshold is actively suppressed from the user interface to prevent the patient from acting upon noisy, unreliable data.52

To further bolster the confidence of the NLP-extracted variables that feed these insights, the Clue system can employ ensemble methods like majority voting across multiple extraction models.55 This ensures that an entity was correctly identified by multiple algorithmic approaches before it is permitted to influence an insight calculation, providing an additional layer of safety and accuracy in the financial and clinical automation process.55

## **Complete JSON Schema Specification**

To strictly satisfy the architectural requirements of the Clue application, the multidimensional theories, NLP extraction methods, statistical algorithms, and insight generation frameworks detailed above are synthesized into the following JSON knowledge graph schema. This JSON structure serves as the definitive blueprint for backend database deployment, ontology mapping, and NLP pipeline configuration.

JSON

{  
  "nodeTypes":,  
      "captureMethods": {  
        "nlpExtraction": "Bidirectional LSTM-CRF architecture for clinical entity recognition; Syntactic dependency parsing utilizing Breadth-First Search (BFS) tree traversal to map severity adjectives directly to symptom entities while ignoring distant clauses.",  
        "chatEmphasis": "Zero-shot LLM extraction via RAG for parsing highly colloquial symptom descriptions (e.g., translating 'my head is absolutely pounding' to the standardized node 'Headache' with severity '5')."  
      },  
      "examples":  
    },  
    {  
      "category": "Mood",  
      "fields": \[  
        "mood\_score\_1\_to\_10",  
        "feeling\_tags",  
        "timestamp"  
      \],  
      "captureMethods": {  
        "nlpExtraction": "Sentiment analysis polarity mapping combined with dictionary-based keyword spotting for specific emotions.",  
        "chatEmphasis": "Classification of free-text into numerical severity scales (e.g., 'feeling incredibly down and hopeless' mapped to score: 2, tags: \['depressed', 'anxious'\])."  
      },  
      "examples":",  
        "Score: 3, Tags: \[Anxious, Irritable, Overwhelmed\]"  
      \]  
    },  
    {  
      "category": "Factor\_Nutrition",  
      "fields": \[  
        "dietary\_element",  
        "quantity\_scale\_none\_little\_some\_lots",  
        "binary\_occurrence",  
        "timestamp"  
      \],  
      "captureMethods": {  
        "nlpExtraction": "Rule-based EntityRulerInternal and RegexMatcher operating against a standardized food ontology dictionary.",  
        "chatEmphasis": "Abstracting specific foods into broad categories to systematically avoid calorie-counting fatigue and eating disorder triggers (e.g., parsing 'ate a large pepperoni pizza' into 'High Fat': 'lots')."  
      },  
      "examples":  
    },  
    {  
      "category": "Biometric\_Measurement",  
      "fields": \[  
        "metric\_type",  
        "numerical\_value",  
        "unit\_of\_measurement",  
        "timestamp"  
      \],  
      "captureMethods": {  
        "nlpExtraction": "Regex extraction algorithms targeting numerical values explicitly coupled with recognized medical unit identifiers.",  
        "chatEmphasis": "Prioritized automated API ingestion from external wearables (Apple Health / Google Health Connect) to ensure ultra-short-term measurement validity, falling back on chat extraction for manual inputs."  
      },  
      "examples":  
    },  
    {  
      "category": "Medication",  
      "fields": \[  
        "medication\_name",  
        "dosage\_mg",  
        "adherence\_boolean",  
        "timestamp"  
      \],  
      "captureMethods": {  
        "nlpExtraction": "Pharmacological Named Entity Recognition (NER) utilizing expansive RxNorm ontologies to identify drug families and specific compounds.",  
        "chatEmphasis": "Advanced intent detection to differentiate between 'taking medication' (triggering an adherence event) versus 'prescribed medication' (updating the user profile)."  
      },  
      "examples":  
    },  
    {  
      "category": "Sleep",  
      "fields": \[  
        "duration\_hours",  
        "quality\_score\_1\_to\_5",  
        "interruptions\_count",  
        "timestamp"  
      \],  
      "captureMethods": {  
        "nlpExtraction": "Time-expression parsing and comparative sentiment analysis to evaluate qualitative sleep descriptions.",  
        "chatEmphasis": "Extracting numerical duration and qualitative scores from complex phrases like 'slept for 6 hours but kept waking up and feel terrible'."  
      },  
      "examples":  
    },  
    {  
      "category": "Menstrual\_Cycle",  
      "fields": \[  
        "flow\_intensity\_light\_medium\_heavy\_spotting",  
        "cervical\_firmness\_firm\_medium\_soft",  
        "cervical\_openness\_closed\_medium\_open",  
        "basal\_body\_temperature",  
        "timestamp"  
      \],  
      "captureMethods": {  
        "nlpExtraction": "Domain-specific terminology extraction heavily tailored to reproductive health and Sympto-Thermal tracking methods.",  
        "chatEmphasis": "Mapping colloquialisms (e.g., 'started my period', 'super heavy flow') to standardized clinical attributes within the database."  
      },  
      "examples":  
    }  
  \],  
  "edgeTypes":,  
  "insightTypes":\[Factor\] improve your \[Health Outcome\] by \[X\]%.",  
      "inputNodes":,  
      "requiredData": "A statistically validated IMPROVES edge containing a calculated percentage differential based on the mean outcome scores of factor-positive versus factor-negative days.",  
      "confidenceLevel": "Medium to High (75% \- 95%). Displayed prominently to the user within the UI as a 'Positive Impact' insight to encourage behavioral reinforcement."  
    },  
    {  
      "template": "Instances of \[Factor\] are frequently followed by a \[X\]% increase in severity within.",  
      "inputNodes":,  
      "requiredData": "A validated TRIGGERS edge requiring strict temporal formatting where Factor timestamps verifiably precede Symptom timestamps.",  
      "confidenceLevel": "High (\> 90%). Due to the severe clinical risk of false-causation assumptions, trigger warnings mandate rigorous p-value testing and at least 14 to 30 days of continuous data before surfacing."  
    },  
    {  
      "template": "Your correlates closely with changes in.",  
      "inputNodes":,  
      "requiredData": "A CORRELATES\_WITH edge successfully connecting subjective self-reported data with objective API-ingested metrics (e.g., mathematically linking self-reported 'Fatigue' with 'HRV (SDNN)').",  
      "confidenceLevel": "Medium (75% \- 89%). Intentionally framed as an observational insight rather than a definitive causal one, explicitly encouraging the user to discuss the trend with a physician."  
    },  
    {  
      "template": "We noticed you often report \[Factor A\] on the same days you report. This may affect your symptom tracking.",  
      "inputNodes": \[  
        "FactorNode",  
        "FactorNode"  
      \],  
      "requiredData": "A CO\_OCCURS edge indicating the presence of potential confounding variables in the user's dataset.",  
      "confidenceLevel": "Low to Medium (60% \- 74%). Deployed as a conversational nudging insight to educate the user on complex health variables and encourage them to run isolated behavioral experiments."  
    }  
  \]  
}

#### **Works cited**

1. Knowledge graphs in healthcare: Use cases, challenges, and key benefits \- IMO Health, accessed March 29, 2026, [https://www.imohealth.com/resources/knowledge-graphs-in-healthcare-use-cases-challenges-and-key-benefits/](https://www.imohealth.com/resources/knowledge-graphs-in-healthcare-use-cases-challenges-and-key-benefits/)  
2. Knowledge Graphs for Clinical Management — Part I \- Curai Health, accessed March 29, 2026, [https://www.curaihealth.com/blog/knowledge-graphs-for-clinical-management-part-i](https://www.curaihealth.com/blog/knowledge-graphs-for-clinical-management-part-i)  
3. Bearable Symptom Tracker App | Track Pain, Mood & Medication, accessed March 29, 2026, [https://bearable.app/](https://bearable.app/)  
4. “You Get Reminded You're a Sick Person”: Personal Data Tracking and Patients With Multiple Chronic Conditions \- Journal of Medical Internet Research, accessed March 29, 2026, [https://www.jmir.org/2015/8/e202/](https://www.jmir.org/2015/8/e202/)  
5. Personalized Health Knowledge Graph \- PubMed \- NIH, accessed March 29, 2026, [https://pubmed.ncbi.nlm.nih.gov/34690624/](https://pubmed.ncbi.nlm.nih.gov/34690624/)  
6. Extract Clinical Entities From Patient Forums with Healthcare NLP \- John Snow Labs, accessed March 29, 2026, [https://www.johnsnowlabs.com/extract-clinical-entities-from-patient-forums-with-healthcare-nlp/](https://www.johnsnowlabs.com/extract-clinical-entities-from-patient-forums-with-healthcare-nlp/)  
7. Patient-centric knowledge graphs: a survey of current methods, challenges, and applications, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC11558794/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11558794/)  
8. Configure and Enter data into Bearable, accessed March 29, 2026, [https://bearable.app/support/howto/configure-and-enter-data-into-bearable/](https://bearable.app/support/howto/configure-and-enter-data-into-bearable/)  
9. A Survey on Recent Named Entity Recognition and Relationship Extraction Techniques on Clinical Texts \- MDPI, accessed March 29, 2026, [https://www.mdpi.com/2076-3417/11/18/8319](https://www.mdpi.com/2076-3417/11/18/8319)  
10. Text Analytics & NLP in Healthcare: Applications & Use Cases \- Lexalytics, accessed March 29, 2026, [https://www.lexalytics.com/blog/text-analytics-nlp-healthcare-applications/](https://www.lexalytics.com/blog/text-analytics-nlp-healthcare-applications/)  
11. Extracting Medical Information From Clinical Text With NLP \- Analytics Vidhya, accessed March 29, 2026, [https://www.analyticsvidhya.com/blog/2023/02/extracting-medical-information-from-clinical-text-with-nlp/](https://www.analyticsvidhya.com/blog/2023/02/extracting-medical-information-from-clinical-text-with-nlp/)  
12. Extracting Medical Named Entities with Healthcare NLP's EntityRulerInternal | by Gökhan TÜRER | John Snow Labs | Medium, accessed March 29, 2026, [https://medium.com/john-snow-labs/extracting-medical-named-entities-with-healthcare-nlps-entityrulerinternal-1eddfb2d0181](https://medium.com/john-snow-labs/extracting-medical-named-entities-with-healthcare-nlps-entityrulerinternal-1eddfb2d0181)  
13. Extracting entities with attributes in clinical text via joint deep learning \- PMC \- NIH, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC7647140/](https://pmc.ncbi.nlm.nih.gov/articles/PMC7647140/)  
14. A Deep Language Model for Symptom Extraction from Clinical Text and Its Application to Extract COVID-19 symptoms from Social Media \- PMC, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC9074854/](https://pmc.ncbi.nlm.nih.gov/articles/PMC9074854/)  
15. An Entity Extraction Pipeline for Medical Text Records Using Large Language Models \- PMC, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC11015372/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11015372/)  
16. Entity Attribute Extraction On Unstructured Medical Text \- Stack Overflow, accessed March 29, 2026, [https://stackoverflow.com/questions/64192586/entity-attribute-extraction-on-unstructured-medical-text](https://stackoverflow.com/questions/64192586/entity-attribute-extraction-on-unstructured-medical-text)  
17. Natural Language Processing: from Bedside to Everywhere \- PMC \- NIH, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC9719781/](https://pmc.ncbi.nlm.nih.gov/articles/PMC9719781/)  
18. Intent Detection and Entity Extraction from Biomedical Literature \- arXiv, accessed March 29, 2026, [https://arxiv.org/html/2404.03598v2](https://arxiv.org/html/2404.03598v2)  
19. Support \- Bearable App, accessed March 29, 2026, [https://bearable.app/support-archive/](https://bearable.app/support-archive/)  
20. Symptom Tracker \- Bearable App, accessed March 29, 2026, [https://bearable.app/symptom-tracker/](https://bearable.app/symptom-tracker/)  
21. Symptom, Mood & Period Tracker \- Apps on Google Play, accessed March 29, 2026, [https://play.google.com/store/apps/details?id=com.bearable\&hl=en\_US](https://play.google.com/store/apps/details?id=com.bearable&hl=en_US)  
22. Patients' daily reporting of symptoms via mobile application reveals a significant difference between patients' perceptions and doctors' interpretations \- PMC, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC12305432/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12305432/)  
23. My correlations are wrong / don't make sense \- Bearable App, accessed March 29, 2026, [https://bearable.app/support/troubleshooting/my-correlations-are-wrong-dont-make-sense/](https://bearable.app/support/troubleshooting/my-correlations-are-wrong-dont-make-sense/)  
24. How to track or edit hydration? \- Bearable App, accessed March 29, 2026, [https://bearable.app/support/common-questions/how-to-track-or-edit-hydration/](https://bearable.app/support/common-questions/how-to-track-or-edit-hydration/)  
25. tracking some nutritional data without tracking specific items : r/BearableApp \- Reddit, accessed March 29, 2026, [https://www.reddit.com/r/BearableApp/comments/1rtrfrs/tracking\_some\_nutritional\_data\_without\_tracking/](https://www.reddit.com/r/BearableApp/comments/1rtrfrs/tracking_some_nutritional_data_without_tracking/)  
26. A Complete Guide To Using The Bearable App in 2025 \- YouTube, accessed March 29, 2026, [https://www.youtube.com/watch?v=C6LpL-xPYI8](https://www.youtube.com/watch?v=C6LpL-xPYI8)  
27. How to interpret Correlation Insights : r/BearableApp \- Reddit, accessed March 29, 2026, [https://www.reddit.com/r/BearableApp/comments/1d0w0xn/how\_to\_interpret\_correlation\_insights/](https://www.reddit.com/r/BearableApp/comments/1d0w0xn/how_to_interpret_correlation_insights/)  
28. Building a Personal Health Timeline: Vital Personal Health Metrics to Measure \- Ezra, accessed March 29, 2026, [https://ezra.com/blog/health-timeline-vital-metrics](https://ezra.com/blog/health-timeline-vital-metrics)  
29. An Overview of Heart Rate Variability Metrics and Norms \- PMC, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC5624990/](https://pmc.ncbi.nlm.nih.gov/articles/PMC5624990/)  
30. 10 Health Metrics to Measure \- Experience Life Magazine, accessed March 29, 2026, [https://experiencelife.lifetime.life/article/10-health-metrics-to-measure/](https://experiencelife.lifetime.life/article/10-health-metrics-to-measure/)  
31. Guideline for the application of heart rate and heart rate variability in occupational medicine and occupational health science \- PMC, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC11089808/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11089808/)  
32. Tracking Your Health When You Have a Chronic Illness: The Ultimate Guide \- CNET, accessed March 29, 2026, [https://www.cnet.com/health/medical/tracking-your-health-with-a-chronic-illness-the-ultimate-guide/](https://www.cnet.com/health/medical/tracking-your-health-with-a-chronic-illness-the-ultimate-guide/)  
33. Bearable \- Symptom Tracker \- App Store \- Apple, accessed March 29, 2026, [https://apps.apple.com/us/app/bearable-symptom-tracker/id1482581097](https://apps.apple.com/us/app/bearable-symptom-tracker/id1482581097)  
34. Menstrual Cycle Tracking: The Best “Me-Search” You Can Do \- Aviva Romm, MD, accessed March 29, 2026, [https://avivaromm.com/menstrual-cycle-tracking/](https://avivaromm.com/menstrual-cycle-tracking/)  
35. Monitoring Chart: Menstrual Cycle \- Vanderbilt Kennedy Center, accessed March 29, 2026, [https://vkc.vumc.org/assets/files/idd/3-4\_Menstrual\_Cycle.pdf](https://vkc.vumc.org/assets/files/idd/3-4_Menstrual_Cycle.pdf)  
36. The real-world applications of the symptom tracking functionality available to menstrual health tracking apps \- PMC, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC8631160/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8631160/)  
37. Menses Period Chart: Track Your Period \- Liv Hospital, accessed March 29, 2026, [https://int.livhospital.com/menses-period-chart/](https://int.livhospital.com/menses-period-chart/)  
38. Menstrual Tracking, Fitness Tracking and Body Work: Digital Tracking Tools and Their Use in Optimising Health, Beauty, Wellness and the Aesthetic Self \- MDPI, accessed March 29, 2026, [https://www.mdpi.com/2673-995X/3/2/45](https://www.mdpi.com/2673-995X/3/2/45)  
39. How to \- Bearable, accessed March 29, 2026, [https://bearable.app/support/category/howto/](https://bearable.app/support/category/howto/)  
40. Extracting Clinical Information from EHRs Using NLP & AI Models \- Shaip, accessed March 29, 2026, [https://www.shaip.com/blog/extracting-key-clinical-information-from-electronic-health-records-ehrs-using-nlp/](https://www.shaip.com/blog/extracting-key-clinical-information-from-electronic-health-records-ehrs-using-nlp/)  
41. Determining Causation vs Correlation \[Feature Suggestion\] : r/BearableApp \- Reddit, accessed March 29, 2026, [https://www.reddit.com/r/BearableApp/comments/r8hh6v/determining\_causation\_vs\_correlation\_feature/](https://www.reddit.com/r/BearableApp/comments/r8hh6v/determining_causation_vs_correlation_feature/)  
42. How to Avoid Confusing Correlation and Causation When Investigating Incidents, accessed March 29, 2026, [https://blog.thinkreliability.com/how-to-avoid-confusing-correlation-and-causation-when-investigating-incidents](https://blog.thinkreliability.com/how-to-avoid-confusing-correlation-and-causation-when-investigating-incidents)  
43. Correlation does not imply causation \- Wikipedia, accessed March 29, 2026, [https://en.wikipedia.org/wiki/Correlation\_does\_not\_imply\_causation](https://en.wikipedia.org/wiki/Correlation_does_not_imply_causation)  
44. Routine self-tracking of health: reasons, facilitating factors, and the potential impact on health management practices \- PMC, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC5977566/](https://pmc.ncbi.nlm.nih.gov/articles/PMC5977566/)  
45. How to find correlations. \- Bearable, accessed March 29, 2026, [https://bearable.app/support/howto/how-to-find-correlations/](https://bearable.app/support/howto/how-to-find-correlations/)  
46. User's guide to correlation coefficients \- PMC, accessed March 29, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC6107969/](https://pmc.ncbi.nlm.nih.gov/articles/PMC6107969/)  
47. 11\. Correlation and regression \- The BMJ, accessed March 29, 2026, [https://www.bmj.com/about-bmj/resources-readers/publications/statistics-square-one/11-correlation-and-regression](https://www.bmj.com/about-bmj/resources-readers/publications/statistics-square-one/11-correlation-and-regression)  
48. P-value \- Wikipedia, accessed March 29, 2026, [https://en.wikipedia.org/wiki/P-value](https://en.wikipedia.org/wiki/P-value)  
49. Relationship Between P-Values, Correlation & Coefficients Explained Like Never Before\!, accessed March 29, 2026, [https://himalii.medium.com/relationship-between-p-values-correlation-coefficients-explained-like-never-before-5311f89145ec](https://himalii.medium.com/relationship-between-p-values-correlation-coefficients-explained-like-never-before-5311f89145ec)  
50. Correlation analysis \- University of St Andrews, accessed March 29, 2026, [https://www.st-andrews.ac.uk/\~wjh/dataview/tutorials/correlation.html](https://www.st-andrews.ac.uk/~wjh/dataview/tutorials/correlation.html)  
51. How to use Bearable to discover what's improving and worsening your health., accessed March 29, 2026, [https://bearable.app/support/howto/how-to-use-bearable-to-discover-whats-improving-and-worsening-your-health/](https://bearable.app/support/howto/how-to-use-bearable-to-discover-whats-improving-and-worsening-your-health/)  
52. Introduction to Confidence Threshold App \- EvalCommunity Academy, accessed March 29, 2026, [https://academy.evalcommunity.com/introduction-to-confidence-threshold-app/](https://academy.evalcommunity.com/introduction-to-confidence-threshold-app/)  
53. Understanding Confidence Threshold in AI Systems \- LlamaIndex, accessed March 29, 2026, [https://www.llamaindex.ai/glossary/what-is-confidence-threshold](https://www.llamaindex.ai/glossary/what-is-confidence-threshold)  
54. What is a Confidence Score in Machine Learning? | Ultralytics, accessed March 29, 2026, [https://www.ultralytics.com/glossary/confidence](https://www.ultralytics.com/glossary/confidence)  
55. Building Confidence: A Case Study in How to Create Confidence Scores for GenAI Applications | Spotify Engineering, accessed March 29, 2026, [https://engineering.atspotify.com/2024/12/building-confidence-a-case-study-in-how-to-create-confidence-scores-for-genai-applications](https://engineering.atspotify.com/2024/12/building-confidence-a-case-study-in-how-to-create-confidence-scores-for-genai-applications)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAYCAYAAAD+vg1LAAABBElEQVR4XmNgGAX0ApuB+D8JmGgAUhyGRQzdEA0sYjiBEAPExciAiQFiwAU0cRB4hC6AC2wFYkY0sQIGiMH+aOJsQNyHJoYT5KMLAMF7BuxeFgBicXRBUgC28KUYMDNADD2DLoEHGKELYAPlDBCDvdEl8ACQen50QXTwmYG0YFjBAFFvjS6BDkgJX1CwZTNA1GegyaEAUHIiJXzfQunvQDwFWQIdzGaAGJyAJo4NGACxNJR9EYgPIsmBQRAQf2OApF2QC0AYFM6/GPAHCUhuIxCvB+KXQPwOVZo80InGr2LA7wiiADcQT0YTC2Sg0OAfDJBg+s2AKF9WAfFXKP4LFRsFdAAA+OlFVkj24y4AAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABEElEQVR4XmNgGAWDDUwA4o9A/B+KvwPxOzSxVXDVFACYYehAngEivgtdglQAMuQ4uiAU4LKcaBDBADHAHV0CCDgZqGDBNQbcBqxngMgFoEuQAnC50JEBIj4RXYJUALPgAxC/B+IfUP5lIBZGUocORIGYH10QHcDCPwldgggA0uePLogObjJgDx5CIIMBoq8aXQId4Ap/QmA1ED8A4hVo4hgAZPgddEEC4ACU3g7EV5DEMQDIeyAL0tEl8AAuBkS4g1LXXyQ5OJgMxJ8ZICkGVO58BeJ/KCpwA1AK28QAyR9XGcgLXpzAE4j5kPhWDFS24CIaX5CBShYcYoAE6S8g1oGKZTFAgvYLEP+Bio2CQQIAlvZIu0sjIooAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAXCAYAAADUUxW8AAAAiElEQVR4XmNgGAVkAVcg/g/EWegSpABrBogh3egSpABVIP4JxMvQJUgBIkD8HogPoUuQAjiA+D4QXwNiZjQ5ooAYEH8A4h3oEviAOhD/AuKF6BL4gB0DJOTb0CXwgUgGMuI8lwGiyQ9dghBoAGIjdMHBD6SB2JtIbAHVAwegZGhOJNaE6hmqAADk7RfSbVOfYwAAAABJRU5ErkJggg==>