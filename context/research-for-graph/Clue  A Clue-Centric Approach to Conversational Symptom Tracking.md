# Clue: A Clue-Centric Approach to Conversational Symptom Tracking
## Abstract
Clue is a chat-based health agent that continuously tracks symptoms, mood, sleep, medication, and lifestyle factors to surface actionable insights — called *clues* — for patients and clinicians. Rather than presenting a flat symptom history or a one-shot differential diagnosis, Clue maintains a living, patient-editable knowledge graph centered on derived insights. The agent incrementally gathers information by asking targeted follow-up questions ranked by information gain, using a structured graph of known and unknown entities as its reasoning and memory layer. This document describes the motivation, design, and technical architecture of Clue.

***
## 1. Motivation
### 1.1 The limits of existing symptom checkers
Existing symptom checker applications suffer from poor data-gathering performance. A clinical vignette study evaluating eight widely used chatbot-based symptom checkers found an overall data-gathering recall of only 0.32 across all pertinent clinical findings, with the best-performing platform (Kahun) achieving a recall of just 0.51. These tools ask a fixed sequence of questions, do not learn over time, and do not expose their reasoning to the user. Most discard conversation history between sessions, preventing longitudinal insight.[^1][^2]

Conversational agents in healthcare have been identified as promising for treatment monitoring, lifestyle change support, and diagnosis support; however, studies consistently find that unconstrained natural language understanding, context persistence, and interpretable reasoning remain open problems.[^3][^4][^5]
### 1.2 The limits of existing LLM-based approaches
Naive LLM-based approaches to symptom checking also have significant problems. MediQ, a benchmark for interactive clinical reasoning presented at NeurIPS 2024, showed that directly prompting state-of-the-art LLMs to ask questions actually *degrades* performance compared to single-turn answering. LLMs are trained to answer any question even with incomplete context, leading to overconfident, unreliable diagnoses. MediQ demonstrated that explicit abstention strategies — deciding *when* to ask and *what* to ask based on model confidence — improve diagnostic accuracy by 22.3% over naive prompting.[^6][^7][^8][^9][^10]

This evidence motivates Clue's core design principle: question-asking must be driven by an explicit, structured policy grounded in a knowledge graph, not left to LLM prompting alone.
### 1.3 The case for longitudinal, patient-centric tracking
Continuous monitoring of mental and physical health over time improves outcome prediction, enables early detection of symptom pattern changes, and allows personalized interventions that respond to an individual's baseline rather than a population average. Patient-Centric Knowledge Graphs (PCKGs) represent a shift in healthcare that focuses on individualized patient care by mapping health information holistically and multi-dimensionally, integrating diverse data types to provide a comprehensive understanding of a patient's health. Clue operationalizes this approach in a consumer-facing, interactive chat application.[^11][^12][^13][^14][^15]

***
## 2. Core Design: The Clue-Centric Knowledge Graph
### 2.1 Central concept: the Clue node
Traditional health knowledge graphs are organized around diseases or patient records. Clue organizes the graph around **insight nodes** — called Clues — that represent derived hypotheses about what the patient's data means. A Clue node might read: *"Sleep deprivation is likely amplifying your anxiety symptoms this week."* It is the graph's interpretive center: it connects raw observed data (symptoms, lifestyle factors) to clinical hypotheses (conditions) and open questions (unknowns), and it is visible and editable by the patient.

This design reflects the principle from patient-journey knowledge graph research that graphs should encode temporal and causal relationships among clinical encounters, diagnoses, and outcomes, enabling personalized care insights and advanced temporal reasoning.[^16][^17][^18]
### 2.2 Node types
The Clue graph uses six node types:

| Node Type | Role | Editable by Patient |
|-----------|------|---------------------|
| **Clue** | Derived insight or hypothesis; visual center | Confirm, dismiss, relabel |
| **Symptom** | Observed patient complaint (e.g., headache, nausea) | Severity, timing |
| **Factor** | Contextual lifestyle data (sleep, mood, meditation, medication, stress) | Values, timestamps |
| **Condition** | Suspected or confirmed diagnosis | Status (suspected / confirmed / ruled out) |
| **Unknown** | Missing data point; represents a next-best question | Answered by replying in chat |
| **Episode** | Backend time-bounded container grouping all nodes for one health problem | Label, date range |

PCKGs in the literature commonly distinguish between patient entities, clinical event entities (diagnoses, symptoms, medications), and derived or inferred entities. Clue's Clue and Unknown node types represent its extension to explicitly surface both the agent's conclusions and its open uncertainties to the user.[^11][^13][^19]
### 2.3 Edge types
Edges define the causal, evidential, and epistemic relationships between nodes:

- `CLUE –SUPPORTED_BY→ SYMPTOM | FACTOR`: shows which data points underpin an insight
- `CLUE –ABOUT→ CONDITION`: links an insight to the clinical entity it addresses
- `CLUE –NEEDS_INFO→ UNKNOWN`: marks what the agent still needs to know
- `EPISODE –HAS_SYMPTOM→ SYMPTOM`, `–HAS_FACTOR→ FACTOR`, `–HAS_CONDITION→ CONDITION`, `–HAS_CLUE→ CLUE`: groups all data within an episode

The `NEEDS_INFO` edge is uniquely Clue's invention: it externalizes the agent's uncertainty as a first-class graph citizen, visible to the patient as a pulsing, answerable node.

***
## 3. The "Next Best Question" Policy
### 3.1 The problem with unstructured questioning
MediQ's key finding is that unstructured question-asking by LLMs degrades diagnostic accuracy; a structured policy that selects questions based on explicit confidence estimation performs substantially better. Clue implements a structured question policy as follows.[^6][^8][^10]
### 3.2 Information gain over the symptom-condition prior
The ranking of Unknown nodes — and thus the next question asked — is determined by **information gain**: the degree to which knowing the answer to a candidate question reduces uncertainty about the top suspected condition.[^20][^21][^22]

Formally, for a set of candidate conditions \( C \) and a candidate unknown factor \( A \):

\[ IG(C, A) = H(C) - H(C \mid A) \]

where \( H(C) \) is the entropy of the current condition probability distribution and \( H(C \mid A) \) is the expected entropy after observing \( A \). The unknown with the highest \( IG \) becomes the next question.[^21][^22]
### 3.3 Symptom-condition prior: HealthKnowledgeGraph
The prior probability distributions over conditions given symptoms are derived from the open-source **HealthKnowledgeGraph** (clinicalml/HealthKnowledgeGraph), a disease-symptom knowledge graph learned from 273,174 de-identified patient records using a noisy-OR Bayesian network. The noisy-OR model achieves a precision of 0.87 at recall 0.5, outperforming logistic regression and naive Bayes on clinical evaluation. The graph covers 157 diseases and 491 symptoms with associated importance weights, providing Clue with a validated, EMR-derived prior for information-gain computations.[^23][^24]
### 3.4 Composite priority scoring
Beyond information gain, each Unknown node is assigned a composite priority score that accounts for:

1. **Information gain** (primary signal): reduction of uncertainty about the top suspected condition.
2. **Clinical safety weight**: red-flag features (chest pain characteristics, respiratory distress indicators, safety concerns) receive a multiplied priority to ensure they are always surfaced first.
3. **UX recency weight**: questions of the same `factor_type` that were asked within recent turns receive a decayed priority to avoid repetitive questioning.

The resulting `priority` value (0–1) is stored directly on the Unknown node in the graph, allowing the next-question selection function to be a simple, testable sort operation rather than a stateful computation.

***
## 4. Agent Architecture
### 4.1 Orchestration: LangGraph
Clue's agent is implemented as a LangGraph StateGraph — a directed computation graph where each node is a processing step and state flows between them. Each conversation turn executes the following nodes in sequence:[^25][^26]

1. **`retrieve_memory`** — Fetches relevant atomic facts from Mem0 using semantic search over the user's memory store.
2. **`extract_entities`** — LLM tool call to extract Symptom and Factor entities from the user's message.
3. **`update_graph`** — Writes new nodes and edges to the graph database.
4. **`score_conditions`** — Queries the HealthKnowledgeGraph prior to attach candidate Condition nodes.
5. **`update_clues`** — LLM step that recomputes or updates Clue node text and confidence based on current graph state.
6. **`pick_next_question`** — Traverses `CLUE –NEEDS_INFO→ UNKNOWN` edges and ranks by composite priority, emitting the top Unknown as the next question.
7. **`generate_response`** — LLM generates the chat reply using retrieved memory and graph context.
8. **`save_memory`** — Asynchronously persists atomic facts to Mem0.
### 4.2 Long-term memory: Mem0
Clue uses **Mem0** as its long-term memory layer. Mem0 is a scalable memory-centric architecture that dynamically extracts, consolidates, and retrieves salient conversational facts. Empirically, Mem0 achieves a 26% relative improvement in LLM-as-a-Judge accuracy over OpenAI's memory system, 91% lower p95 latency compared to full-context methods, and 90% token savings.[^27][^28][^29]

Each message turn, Clue decomposes the patient's response into atomic facts before storing them — a pattern inspired by MediQ's approach of maintaining a concise, structured patient record rather than raw chat history. Each atomic fact is tagged with a `category` metadata field (`"symptom"`, `"factor"`, `"clue"`, `"condition"`) to enable precise filtered retrieval when the agent computes a new Clue update.[^8][^30]
### 4.3 Graph and vector store: HelixDB
The Clue graph is persisted in **HelixDB**, an open-source graph-vector database that supports native graph traversals, vector search, and keyword search in a single store. Each Clue node also carries a vector embedding, enabling semantic similarity search across past episodes — allowing the agent to recognize recurring patterns across weeks or months rather than treating each episode as independent.[^31][^32][^33]
### 4.4 LLM-based Patient Journey KG construction
Rather than relying on structured forms, Clue uses LLMs to extract and structure clinical entities from free-text chat messages, reflecting the state-of-the-art approach in Patient Journey KG construction. Recent research demonstrates that LLMs like Claude 3.5 achieve perfect structural compliance when constructing patient journey knowledge graphs from unstructured patient-provider conversations, though models differ in semantic accuracy for specific medical entity processing.[^16][^17][^18]

***
## 5. Patient-Visible Graph and Editing
### 5.1 Design principles
Healthcare conversational agents consistently show high usability ratings but suffer from limited description of symptoms and missing verbal interaction. Clue addresses this directly by making the reasoning graph — not just the chat — the primary interface. The patient sees their Clue graph as a radial diagram with the Clue node at the center, connected to Symptom, Factor, Condition, and Unknown nodes.[^34]
### 5.2 Unknown nodes as next-best questions
Gray, animated Unknown nodes serve a dual purpose: they represent open questions in the agent's current model *and* prompt the patient to answer them in the chat. When a patient answers an Unknown node, it is replaced in-place by a populated Symptom or Factor node, and the agent recomputes the Clue's confidence and spawns new Unknown nodes if warranted.

This approach is consistent with the AMIE system's design for conversational diagnostic AI, which formulates questions to acquire missing information and refine the differential diagnosis, only committing to a diagnosis when sufficiently confident.[^35]
### 5.3 Editable graph nodes
All non-agent-generated nodes are editable by the patient:
- **Symptom nodes**: severity, onset, frequency.
- **Factor nodes**: numeric values, timestamps.
- **Condition nodes**: status (confirmed, suspected, ruled out).
- **Clue nodes**: free-text edits, dismiss, or add a note.

This editability turns the knowledge graph into a shared model of the patient's health, not a read-only report — aligning with PCKG research that emphasizes patient agency in knowledge co-construction.[^11][^12][^19]

***
## 6. Evaluation Framework
### 6.1 Diagnostic accuracy
Clue is evaluated for diagnostic accuracy using **SymptomCheck Bench**, an OSCE-style benchmark comprising 400 clinical vignettes, a patient simulator agent, and an evaluator agent that compares the system's top-5 differential diagnoses against ground truth. The benchmark is compatible with GPT, Claude, Mistral, and DeepSeek and limits the agent to 12 questions per case — matching Clue's question-budget philosophy.[^36][^37][^38]
### 6.2 Question-asking quality
Clue's next-best-question policy is separately evaluated on the **MediQ benchmark**, which assesses an agent's ability to ask targeted follow-up questions and abstain from diagnosis when underconfident. The core metric is improvement in diagnostic accuracy attributable to the structured question policy versus naive LLM-prompted questioning.[^6][^8][^9]

Data-gathering quality is assessed following the methodology of Ben-Shabat et al. (2022), which defines recall (pertinent findings retrieved) and precision/efficiency (pertinent findings per question asked) as the primary metrics. Current state-of-the-art chatbot symptom checkers achieve a data-gathering recall of 0.32 overall, with the best reaching 0.51; Clue's longitudinal graph and explicit information-gain policy are designed to substantially exceed these baselines.[^1][^2]
### 6.3 Graph integrity tests
Structural consistency of the Clue graph is verified automatically: every Clue node must have at least one `SUPPORTED_BY` edge; every Unknown node must be reachable via a `NEEDS_INFO` edge; no dangling Condition nodes are permitted. These tests also verify that when a patient answers an Unknown node, the graph correctly transitions from `NEEDS_INFO` to `SUPPORTED_BY` and that Clue confidence updates accordingly.

***
## 7. Open-Source Library: ClueQ
Clue's next-best-question policy and graph schema are being extracted as **ClueQ**, a small, framework-agnostic open-source library. No existing OSS library packages the `next_best_question(graph_state, options) → [UnknownNode]` contract with pluggable symptom-condition priors. ClueQ exports:[^8][^1][^2]

- Typed graph schema (Clue, Symptom, Factor, Condition, Unknown, Episode nodes and edges).
- A pure `nextBestQuestion()` function that sorts Unknown nodes by composite priority.
- A `computePriority()` function accepting a condition prior interface, red-flag rules, and recency weights.
- A `symptom_prior` plug-in interface compatible with HealthKnowledgeGraph, priaid-eHealth/symptomchecker, and custom Bayesian networks.
- A test adapter for SymptomCheck Bench, enabling CI evaluation of the question policy against clinical vignettes.

By publishing ClueQ separately from the product, the goal is to provide a validated, community-maintained question-asking core that other health agents can adopt, reducing the need for every team to independently derive information-gain logic from scratch.

***
## 8. Conclusion
Clue introduces a clue-centric design for conversational symptom tracking that makes reasoning explicit, persistent, and patient-editable. By grounding its question-asking policy in information gain over a structured knowledge graph — rather than relying on unguided LLM prompting — it directly addresses the key failure mode identified in the MediQ benchmark. By maintaining a longitudinal, patient-visible graph rather than resetting each session, it addresses the recall and continuity gaps documented in symptom checker evaluations. The architecture builds entirely on open-source and open-science foundations: HealthKnowledgeGraph for priors, Mem0 for long-term memory, LangGraph for orchestration, HelixDB for graph-vector storage, SymptomCheck Bench and MediQ for evaluation, and Reagraph for visualization — minimizing proprietary lock-in and maximizing scientific accountability.[^6][^8][^1][^2]

---

## References

1. [Assessing data gathering of chatbot based symptom checkers - a clinical vignettes study](https://colab.ws/articles/10.1016/j.ijmedinf.2022.104897) - The burden on healthcare systems is mounting continuously owing to population growth and aging, over...

2. [Assessing data gathering of chatbot based symptom checkers - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9595333/) - The goal of this study was to evaluate the data-gathering function of currently available chatbot sy...

3. [Conversational Agents in Health Care: Scoping Review and ...](https://www.jmir.org/2020/8/e17158/) - The 3 most commonly reported conversational agent applications in the literature were treatment and ...

4. [Conversational agents in healthcare: a systematic review](https://academic.oup.com/jamia/article/25/9/1248/5052181) - The use of conversational agents with unconstrained natural language input capabilities for health-r...

5. [Conversational Agents in Health Care: Expert Interviews to Inform ...](https://pmc.ncbi.nlm.nih.gov/articles/PMC10652195/) - This study aims to perform in-depth, semistructured interviews with multidisciplinary experts in hea...

6. [NeurIPS Poster MediQ: Question-Asking LLMs and a Benchmark for ...](https://neurips.cc/virtual/2024/poster/94856) - In this paper, we propose to change the static paradigm to an interactive one, develop systems that ...

7. [MEDIQ: Question-Asking LLMs for Adaptive and Reliable Clinical ...](https://www.microsoft.com/en-us/research/publication/mediq-question-asking-llms-for-adaptive-and-reliable-clinical-reasoning/) - Overall, our paper introduces a novel problem towards LLM reliability, a novel MEDIQ framework, and ...

8. [MediQ: Question-Asking LLMs and a Benchmark for Reliable ... - arXiv](https://arxiv.org/abs/2406.00922) - We introduce a novel problem towards LLM reliability, an interactive MediQ benchmark and a novel que...

9. [MediQ: Question-Asking LLMs and a Benchmark for Reliable ...](https://proceedings.neurips.cc/paper_files/paper/2024/hash/32b80425554e081204e5988ab1c97e9a-Abstract-Conference.html) - We introduce a novel problem towards LLM reliability, an interactive MEDIQ benchmark and a novel que...

10. [[PDF] MEDIQ: Question-Asking LLMs and a Benchmark for Reliable ...](https://proceedings.neurips.cc/paper_files/paper/2024/file/32b80425554e081204e5988ab1c97e9a-Paper-Conference.pdf) - Over- all, we introduce a novel problem towards LLM reliability, an interactive MEDIQ benchmark and ...

11. [Patient-centric knowledge graphs: a survey of current methods ...](https://pmc.ncbi.nlm.nih.gov/articles/PMC11558794/) - The graph has a particular “spiderweb” layout, where every node in the graph is connected to one cen...

12. [Patient-centric knowledge graphs: a survey of current methods ...](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2024.1388479/full) - Patient-Centric Knowledge Graphs (PCKGs) represent an important shift in healthcare that focuses on ...

13. [Patient-Centric Knowledge Graphs: A Survey of Current ...](https://www.emergentmind.com/papers/2402.12608) - Patient-Centric Knowledge Graphs (PCKGs) represent an important shift in healthcare that focuses on ...

14. [Longitudinal Tracking in Mental Health – EMOTII - ADoH SCIENTIFIC](https://adohscientific.com/longitudinal-tracking-in-mental-health/) - Longitudinal tracking in mental health involves the continuous monitoring and recording of an indivi...

15. [Toward integrated sleep health: multimodal AI in Hang Hao Meng ...](https://www.nature.com/articles/s41746-026-02432-9) - This Perspective introduces 'Hang Hao Meng', an AI-powered sleep health expert agent for comprehensi...

16. [Leveraging LLMs for Patient Journey Knowledge Graph Construction](https://arxiv.org/abs/2503.16533) - This paper presents a methodology for constructing PJKGs using Large Language Models (LLMs) to proce...

17. [Leveraging LLMs for Patient Journey Knowledge Graph Construction](https://arxiv.org/html/2503.16533v1) - This paper presents a methodology for constructing PJKGs using Large Language Models (LLMs) to proce...

18. [Leveraging LLMs for Patient Journey Knowledge Graph Construction](https://pmc.ncbi.nlm.nih.gov/articles/PMC12412408/) - This work advances patient-centric healthcare through actionable knowledge graphs (KGs) that enhance...

19. [Patient-Centric Knowledge Graphs: A Survey of Current ... - arXiv](https://arxiv.org/html/2402.12608v1) - The graph has a particular “spiderweb” layout, where every node in the graph is connected to one cen...

20. [Understanding Information Gain: Choosing the Right Questions](https://dev.to/dev_patel_35864ca1db6093c/understanding-information-gain-choosing-the-right-questions-1mj4) - The algorithm aims to select the feature that provides the most information gain at each step, leadi...

21. [Decision Trees: Information Gain](https://courses.cs.washington.edu/courses/cse446/20wi/Lecture3/03_InformationGain.pdf)

22. [Information gain (decision tree) - Wikipedia](https://en.wikipedia.org/wiki/Information_gain_(decision_tree))

23. [Learning a Health Knowledge Graph from Electronic Medical Records](https://www.nature.com/articles/s41598-017-05778-z) - Demand for clinical decision support systems in medicine and self-diagnostic symptom checkers has su

24. [GitHub - clinicalml/HealthKnowledgeGraph: Health knowledge graph for 157 diseases and 491 symptoms, learned from >270,000 patients' data](https://github.com/clinicalml/HealthKnowledgeGraph) - Health knowledge graph for 157 diseases and 491 symptoms, learned from >270,000 patients' data - cli...

25. [Doctolib: Building an Agentic AI System for Healthcare Support ...](https://www.zenml.io/llmops-database/building-an-agentic-ai-system-for-healthcare-support-using-langgraph) - The agents are orchestrated using LangGraph, a framework from the LangChain ecosystem designed for b...

26. [Building a Multi-Agent Chatbot with LangGraph - Techify Solutions](https://techifysolutions.com/blog/building-a-multi-agent-chatbot-with-langgraph/) - Discover how to create a multi-agent chatbot using LangGraph. Learn to build specialized AI agents f...

27. [Mem0: Building Production-Ready AI Agents with Scalable Long ...](https://huggingface.co/papers/2504.19413) - Mem0, a memory-centric architecture with graph-based memory, enhances long-term conversational coher...

28. [Mem0: Building Production-Ready AI Agents with Scalable Long ...](https://arxiv.org/abs/2504.19413) - We introduce Mem0, a scalable memory-centric architecture that addresses this issue by dynamically e...

29. [AI Memory Research: 26% Accuracy Boost for LLMs | Mem0](https://mem0.ai/research) - Mem0 AI memory research delivers 26% higher accuracy, 91% lower latency, and 90% token savings. Scal...

30. [MediQ: Question-Asking LLMs and a Benchmark for ...](https://arxiv.org/html/2406.00922v3)

31. [HelixDB is an open-source graph-vector database built ... - GitHub](https://github.com/helixdb/helix-db) - HelixDB has a built-in vector search, keyword search, and graph traversals that can be used to power...

32. [Types System | HelixDB/helix-db | DeepWiki](https://deepwiki.com/HelixDB/helix-db/2.4-types-system) - This page documents the core data types and error handling mechanisms in HelixDB. The Types System f...

33. [Schema Definition - HelixDB Docs](https://docs.helix-db.com/documentation/hql/schema/schema-definition) - How to define schemas for nodes, edges, and vectors in HelixDB with type-safe property definitions

34. [OP86 Chatbot-Based Symptom-Checkers: A Systematic Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC11738317/) - Symptom-checkers are digital health applications (DHA) with diagnostic algorithms. These symptom-che...

35. [Towards conversational diagnostic artificial intelligence - Nature](https://www.nature.com/articles/s41586-025-08866-7) - Here we introduce AMIE (Articulate Medical Intelligence Explorer), a large language model (LLM)-base...

36. [Introducing SymptomCheck Bench - MedAsk](https://medask.tech/blogs/introducing-symptomcheck-bench/) - Symptom Checker Agent · Engage in a text-based conversation with the simulated patient. · Ask releva...

37. [Introducing SymptomCheck Bench: An Open-Source Benchmark for ...](https://www.reddit.com/r/OpenSourceeAI/comments/1gk7ibp/introducing_symptomcheck_bench_an_opensource/) - The benchmark has three main components: Patient Simulator: Responds to agent questions based on cli...

38. [medaks/medask-benchmarks - GitHub](https://github.com/medaks/medask-benchmarks) - An OSCE-style benchmark for evaluating diagnostic accuracy of LLM-based medical agents in symptom as...

